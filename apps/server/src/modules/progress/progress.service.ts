import { Types } from 'mongoose';
import {
  UserProgress,
  ProgressSummary,
  ProgressTrends,
  ProgressTrendPoint,
  ActivityTimelineItem,
  StreakDetails,
  StreakCalendarDay,
  WeeklyWellnessReport,
  MonthlyWellnessReport,
  PaginationMeta,
} from '@solace/shared';
import { ProgressModel } from './progress.model';
import { Mood } from '../mood/mood.model';
import { Journal } from '../journal/journal.model';
import { ActivityCompletionModel } from '../activities/activityCompletion.model';
import { AssessmentModel } from '../assessments/assessment.model';
import { WellnessPlanModel } from '../wellness-plans/wellnessPlan.model';
import { AchievementService } from '../achievements/achievement.service';
import { buildPaginationMeta, parsePagination } from '../../utils';

export class ProgressService {
  /**
   * Helper to format a Date into YYYY-MM-DD for a specified timezone
   */
  public static getLocalDateString(date: Date, timezone = 'UTC'): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return formatter.format(date); // outputs YYYY-MM-DD
    } catch {
      return date.toISOString().split('T')[0];
    }
  }

  /**
   * Get or initialize progress document for user
   */
  public static async getOrCreateProgress(userId: string): Promise<UserProgress> {
    const userObjectId = new Types.ObjectId(userId);
    let progress = await ProgressModel.findOne({ userId: userObjectId });

    if (!progress) {
      progress = await ProgressModel.create({
        userId: userObjectId,
        currentStreak: 0,
        longestStreak: 0,
        totalActivities: 0,
        totalMoodCheckIns: 0,
        totalJournalEntries: 0,
        totalBreathingSessions: 0,
        totalPlanTasksCompleted: 0,
        totalAssessmentsCompleted: 0,
        activeDates: [],
        earnedAchievements: [],
      });
    }

    return progress.toDto();
  }

  /**
   * Record user activity, advancing streaks and updating counters safely
   */
  public static async recordActivity(
    userId: string,
    activityType: 'mood' | 'journal' | 'activity' | 'breathing' | 'plan_task' | 'assessment',
    timezone = 'UTC',
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    let progress = await ProgressModel.findOne({ userId: userObjectId });

    if (!progress) {
      progress = new ProgressModel({
        userId: userObjectId,
        currentStreak: 0,
        longestStreak: 0,
        totalActivities: 0,
        totalMoodCheckIns: 0,
        totalJournalEntries: 0,
        totalBreathingSessions: 0,
        totalPlanTasksCompleted: 0,
        totalAssessmentsCompleted: 0,
        activeDates: [],
        earnedAchievements: [],
      });
    }

    const now = new Date();
    const todayStr = this.getLocalDateString(now, timezone);

    // Calculate calendar day difference
    const activeDatesSet = new Set(progress.activeDates || []);
    const isNewActiveDay = !activeDatesSet.has(todayStr);

    if (isNewActiveDay) {
      activeDatesSet.add(todayStr);
      progress.activeDates = Array.from(activeDatesSet).sort();

      // Check if yesterday was active
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = this.getLocalDateString(yesterday, timezone);

      if (activeDatesSet.has(yesterdayStr)) {
        progress.currentStreak += 1;
      } else {
        progress.currentStreak = 1;
      }

      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak;
      }
    }

    progress.lastActivityDate = now;

    // Increment counters
    if (activityType === 'mood') progress.totalMoodCheckIns += 1;
    if (activityType === 'journal') progress.totalJournalEntries += 1;
    if (activityType === 'activity') progress.totalActivities += 1;
    if (activityType === 'breathing') {
      progress.totalActivities += 1;
      progress.totalBreathingSessions += 1;
    }
    if (activityType === 'plan_task') progress.totalPlanTasksCompleted += 1;
    if (activityType === 'assessment') progress.totalAssessmentsCompleted += 1;

    await progress.save();

    // Idempotently check achievements
    await AchievementService.getUserAchievements(userId);
  }

  /**
   * Recalculate progress metrics and streaks from actual database documents
   */
  public static async recalculateProgress(
    userId: string,
    timezone = 'UTC',
  ): Promise<UserProgress> {
    const userObjectId = new Types.ObjectId(userId);

    const [moods, journals, activities, assessments, plans] = await Promise.all([
      Mood.find({ userId: userObjectId }),
      Journal.find({ userId: userObjectId }),
      ActivityCompletionModel.find({ userId: userObjectId }).populate('activityId'),
      AssessmentModel.find({ userId: userObjectId }),
      WellnessPlanModel.find({ userId: userObjectId }),
    ]);

    // Aggregate unique active dates across all qualifying events
    const activeDatesSet = new Set<string>();

    moods.forEach((m) => activeDatesSet.add(this.getLocalDateString(m.createdAt, timezone)));
    journals.forEach((j) => activeDatesSet.add(this.getLocalDateString(j.createdAt, timezone)));
    activities.forEach((a) =>
      activeDatesSet.add(this.getLocalDateString(a.completedAt || a.createdAt, timezone)),
    );
    assessments.forEach((ass) =>
      activeDatesSet.add(this.getLocalDateString(ass.completedAt || ass.createdAt, timezone)),
    );

    let totalPlanTasksCompleted = 0;
    plans.forEach((p) => {
      p.dailyTasks?.forEach((t) => {
        if (t.completed && t.completedAt) {
          totalPlanTasksCompleted += 1;
          activeDatesSet.add(this.getLocalDateString(new Date(t.completedAt), timezone));
        }
      });
    });

    const sortedDates = Array.from(activeDatesSet).sort();
    const todayStr = this.getLocalDateString(new Date(), timezone);
    const yesterdayStr = this.getLocalDateString(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
      timezone,
    );

    // Calculate contiguous streak ending today or yesterday
    let currentStreak = 0;
    if (sortedDates.includes(todayStr) || sortedDates.includes(yesterdayStr)) {
      const checkDate = new Date();
      if (!sortedDates.includes(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (sortedDates.includes(this.getLocalDateString(checkDate, timezone))) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Calculate historic longest streak across all contiguous date chains
    let longestStreak = currentStreak;
    let tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1] + 'T00:00:00Z');
        const curr = new Date(sortedDates[i] + 'T00:00:00Z');
        const diffDays = Math.round(
          (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24),
        );
        if (diffDays === 1) {
          tempStreak += 1;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    interface PopulatedCompletion {
      _id: { toString(): string };
      activityId?: {
        title?: string;
        category?: string;
        description?: string;
        durationMinutes?: number;
      };
      durationSeconds?: number;
      completedAt?: Date;
    }
    const typedActivities = activities as unknown as PopulatedCompletion[];

    const totalBreathing = typedActivities.filter(
      (a) => a.activityId?.category === 'breathing',
    ).length;

    let progress = await ProgressModel.findOne({ userId: userObjectId });
    if (!progress) {
      progress = new ProgressModel({ userId: userObjectId });
    }

    progress.currentStreak = currentStreak;
    progress.longestStreak = Math.max(progress.longestStreak || 0, longestStreak);
    progress.totalActivities = activities.length;
    progress.totalBreathingSessions = totalBreathing;
    progress.totalMoodCheckIns = moods.length;
    progress.totalJournalEntries = journals.length;
    progress.totalPlanTasksCompleted = totalPlanTasksCompleted;
    progress.totalAssessmentsCompleted = assessments.length;
    progress.activeDates = sortedDates;
    progress.lastActivityDate = sortedDates.length > 0 ? new Date() : undefined;

    await progress.save();
    return progress.toDto();
  }

  /**
   * Get periodic summary metrics (weekly, monthly, all-time)
   */
  public static async getSummary(
    userId: string,
    period: 'week' | 'month' | 'all' = 'week',
    timezone = 'UTC',
  ): Promise<ProgressSummary> {
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    let startDate: Date;
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      startDate = new Date(0); // All time
    }

    const [moods, activities, assessments, plans] = await Promise.all([
      Mood.find({ userId: userObjectId, createdAt: { $gte: startDate } }),
      ActivityCompletionModel.find({
        userId: userObjectId,
        completedAt: { $gte: startDate },
      }),
      AssessmentModel.find({
        userId: userObjectId,
        completedAt: { $gte: startDate },
      }),
      WellnessPlanModel.find({ userId: userObjectId }),
    ]);

    // Active days in period
    const activeDatesSet = new Set<string>();
    moods.forEach((m) => activeDatesSet.add(this.getLocalDateString(m.createdAt, timezone)));
    activities.forEach((a) =>
      activeDatesSet.add(this.getLocalDateString(a.completedAt || a.createdAt, timezone)),
    );
    assessments.forEach((ass) =>
      activeDatesSet.add(this.getLocalDateString(ass.completedAt || ass.createdAt, timezone)),
    );

    let planTasksCompleted = 0;
    plans.forEach((p) => {
      p.dailyTasks?.forEach((t) => {
        if (t.completed && t.completedAt && new Date(t.completedAt) >= startDate) {
          planTasksCompleted += 1;
          activeDatesSet.add(this.getLocalDateString(new Date(t.completedAt), timezone));
        }
      });
    });

    // Mood averages
    const totalIntensity = moods.reduce((sum, m) => sum + (m.moodIntensity || 5), 0);
    const averageMoodIntensity = moods.length > 0 ? Number((totalIntensity / moods.length).toFixed(1)) : 0;

    // Top mood
    const moodCounts: Record<string, number> = {};
    moods.forEach((m) => {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });
    const topMood =
      Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || undefined;

    const breathingMinutes = Math.round(
      activities.reduce((sum, a) => sum + (a.durationCompleted || 0), 0) / 60,
    );

    return {
      period,
      activeDays: activeDatesSet.size,
      moodCheckIns: moods.length,
      averageMoodIntensity,
      topMood,
      activitiesCompleted: activities.length,
      breathingMinutes,
      planTasksCompleted,
      assessmentsCompleted: assessments.length,
    };
  }

  /**
   * Get chart trend data for week or month
   */
  public static async getTrends(
    userId: string,
    period: 'week' | 'month' = 'week',
    timezone = 'UTC',
  ): Promise<ProgressTrends> {
    const userObjectId = new Types.ObjectId(userId);
    const daysCount = period === 'week' ? 7 : 30;
    const now = new Date();

    const points: ProgressTrendPoint[] = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = this.getLocalDateString(targetDate, timezone);

      // Start & end of calendar day in UTC approximate
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const dayName = targetDate.toLocaleDateString('en-US', {
        weekday: period === 'week' ? 'short' : undefined,
        month: period === 'month' ? 'short' : undefined,
        day: period === 'month' ? 'numeric' : undefined,
      });

      const [moods, activities, plans] = await Promise.all([
        Mood.find({
          userId: userObjectId,
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        }),
        ActivityCompletionModel.find({
          userId: userObjectId,
          completedAt: { $gte: startOfDay, $lte: endOfDay },
        }),
        WellnessPlanModel.find({ userId: userObjectId }),
      ]);

      let planTasksCount = 0;
      plans.forEach((p) => {
        p.dailyTasks?.forEach((t) => {
          if (
            t.completed &&
            t.completedAt &&
            new Date(t.completedAt) >= startOfDay &&
            new Date(t.completedAt) <= endOfDay
          ) {
            planTasksCount += 1;
          }
        });
      });

      const avgIntensity =
        moods.length > 0
          ? Number((moods.reduce((s, m) => s + (m.moodIntensity || 5), 0) / moods.length).toFixed(1))
          : null;

      const breathingMins = Math.round(
        activities.reduce((s, a) => s + (a.durationCompleted || 0), 0) / 60,
      );

      points.push({
        date: dateStr,
        label: dayName,
        moodIntensity: avgIntensity,
        activitiesCount: activities.length,
        planTasksCount,
        breathingMinutes: breathingMins,
      });
    }

    return { period, points };
  }

  /**
   * Get unified chronological activity timeline with filtering & pagination
   */
  public static async getActivityTimeline(
    userId: string,
    category?: string,
    rawPage?: unknown,
    rawLimit?: unknown,
  ): Promise<{ data: ActivityTimelineItem[]; meta: PaginationMeta }> {
    const userObjectId = new Types.ObjectId(userId);
    const { page, limit, skip } = parsePagination(rawPage, rawLimit);

    const [moods, completions, journals, assessments, plans] = await Promise.all([
      Mood.find({ userId: userObjectId }).sort({ createdAt: -1 }).limit(100),
      ActivityCompletionModel.find({ userId: userObjectId })
        .populate('activityId')
        .sort({ completedAt: -1 })
        .limit(100),
      Journal.find({ userId: userObjectId }).sort({ createdAt: -1 }).limit(50),
      AssessmentModel.find({ userId: userObjectId }).sort({ completedAt: -1 }).limit(50),
      WellnessPlanModel.find({ userId: userObjectId }),
    ]);

    const items: ActivityTimelineItem[] = [];

    // 1. Mood Check-ins
    moods.forEach((m) => {
      items.push({
        id: `mood-${m._id.toString()}`,
        type: 'mood',
        title: `Mood Check-in: ${m.mood.charAt(0).toUpperCase() + m.mood.slice(1)}`,
        description: m.note || m.emotions?.join(', ') || 'Recorded feelings check-in',
        category: 'mood',
        timestamp: m.createdAt.toISOString(),
        details: {
          intensity: m.moodIntensity,
          emotions: m.emotions,
        },
      });
    });

    // 2. Activities & Breathing
    const typedCompletions = completions as unknown as Array<{
      _id: { toString(): string };
      activityId?: {
        title?: string;
        category?: string;
        description?: string;
        durationMinutes?: number;
        duration?: number;
        difficulty?: string;
      };
      durationSeconds?: number;
      durationCompleted?: number;
      feedback?: string;
      completedAt?: Date;
      createdAt?: Date;
    }>;
    typedCompletions.forEach((c) => {
      const act = c.activityId;
      const isBreathing = act?.category === 'breathing';
      items.push({
        id: `act-${c._id.toString()}`,
        type: isBreathing ? 'breathing' : 'activity',
        title: act?.title || 'Wellness Activity',
        description: act?.description || '',
        category: act?.category || 'activity',
        timestamp: (c.completedAt || c.createdAt || new Date()).toISOString(),
        durationSeconds: c.durationCompleted || act?.duration || 0,
        details: {
          feedback: c.feedback,
          difficulty: act?.difficulty,
        },
      });
    });

    // 3. Journal entries
    journals.forEach((j) => {
      items.push({
        id: `journal-${j._id.toString()}`,
        type: 'journal',
        title: j.title || 'Private Reflection Entry',
        description: j.tags?.length ? `Tags: ${j.tags.join(', ')}` : 'Personal mindful note',
        category: 'journal',
        timestamp: j.createdAt.toISOString(),
        details: {
          tags: j.tags,
        },
      });
    });

    // 4. Assessments
    assessments.forEach((ass) => {
      items.push({
        id: `assessment-${ass._id.toString()}`,
        type: 'assessment',
        title: `Self-Reflection: ${ass.assessmentType.toUpperCase()}`,
        description: `${ass.resultCategory} (Score: ${ass.score}/${ass.maxScore || 12})`,
        category: 'assessment',
        timestamp: (ass.completedAt || ass.createdAt).toISOString(),
        details: {
          score: ass.score,
          resultCategory: ass.resultCategory,
        },
      });
    });

    // 5. Plan tasks
    plans.forEach((p) => {
      p.dailyTasks?.forEach((t) => {
        if (t.completed && t.completedAt) {
          items.push({
            id: `plan-task-${t.id}`,
            type: 'plan_task',
            title: `Plan Task: ${t.title}`,
            description: t.description || `Completed Day ${t.day} practice`,
            category: t.category || 'plan',
            timestamp: new Date(t.completedAt).toISOString(),
            durationSeconds: (t.durationMinutes || 5) * 60,
          });
        }
      });
    });

    // Sort descending by timestamp
    items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // Apply category filter if provided and not 'all'
    const filtered =
      category && category !== 'all'
        ? items.filter((item) => item.type === category || item.category === category)
        : items;

    const total = filtered.length;
    const paginatedItems = filtered.slice(skip, skip + limit);
    const meta = buildPaginationMeta(total, page, limit);

    return {
      data: paginatedItems,
      meta,
    };
  }

  /**
   * Get detailed streak status, calendar dots, and encouraging message
   */
  public static async getStreakDetails(
    userId: string,
    timezone = 'UTC',
  ): Promise<StreakDetails> {
    const userObjectId = new Types.ObjectId(userId);
    let progress = await ProgressModel.findOne({ userId: userObjectId });

    if (!progress) {
      await this.getOrCreateProgress(userId);
      progress = await ProgressModel.findOne({ userId: userObjectId });
    }

    const activeDatesSet = new Set(progress?.activeDates || []);
    const now = new Date();
    const todayStr = this.getLocalDateString(now, timezone);

    // Build 7-day calendar (past 7 days ending today)
    const weeklyCalendar: StreakCalendarDay[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dStr = this.getLocalDateString(d, timezone);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      weeklyCalendar.push({
        date: dStr,
        dayName,
        isActive: activeDatesSet.has(dStr),
        isToday: dStr === todayStr,
      });
    }

    const currentStreak = progress?.currentStreak || 0;
    const longestStreak = progress?.longestStreak || 0;

    let encouragingMessage =
      'Welcome back. You can begin again today with a single conscious breath.';
    if (currentStreak >= 30) {
      encouragingMessage =
        'A month of mindful dedication. Your consistency is a true source of strength.';
    } else if (currentStreak >= 7) {
      encouragingMessage =
        'A full week together. You are building a beautiful, lasting sanctuary of calm.';
    } else if (currentStreak >= 3) {
      encouragingMessage =
        'Three days of care. Small, steady pauses are taking root in your daily rhythm.';
    } else if (currentStreak === 1) {
      encouragingMessage =
        'Your first step today matters. Be proud of taking time for yourself.';
    }

    return {
      currentStreak,
      longestStreak,
      lastActivityDate: progress?.lastActivityDate?.toISOString(),
      activeDaysCount: activeDatesSet.size,
      weeklyCalendar,
      encouragingMessage,
    };
  }

  /**
   * Generate weekly wellness report
   */
  public static async getWeeklyReport(
    userId: string,
    timezone = 'UTC',
  ): Promise<WeeklyWellnessReport> {
    const summary = await this.getSummary(userId, 'week', timezone);
    const now = new Date();
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const hasSufficientData = summary.activeDays >= 2;
    const observations: string[] = [];

    if (!hasSufficientData) {
      observations.push(
        'With only 1 or 0 days recorded this week, there is not yet enough activity data to reflect deep weekly patterns. Continue checking in to discover your natural rhythms.',
      );
    } else {
      observations.push(
        `You dedicated time to your well-being on ${summary.activeDays} out of 7 days this past week.`,
      );
      if (summary.topMood) {
        observations.push(
          `Your most prominent feeling this week was feeling ${summary.topMood}, with an average intensity of ${summary.averageMoodIntensity}/10.`,
        );
      }
      if (summary.breathingMinutes > 0) {
        observations.push(
          `You practiced ${summary.breathingMinutes} minutes of conscious breathing, naturally calming your nervous system.`,
        );
      }
      if (summary.planTasksCompleted > 0) {
        observations.push(
          `You moved forward on your wellness plan by completing ${summary.planTasksCompleted} daily tasks.`,
        );
      }
    }

    return {
      periodStart: start.toISOString(),
      periodEnd: now.toISOString(),
      totalActiveDays: summary.activeDays,
      moodCheckIns: summary.moodCheckIns,
      mostFrequentMood: summary.topMood,
      averageMoodIntensity: summary.averageMoodIntensity,
      completedActivities: summary.activitiesCompleted,
      breathingSessions: summary.activitiesCompleted,
      planTasksCompleted: summary.planTasksCompleted,
      observations,
      hasSufficientData,
    };
  }

  /**
   * Generate monthly wellness report
   */
  public static async getMonthlyReport(
    userId: string,
    timezone = 'UTC',
  ): Promise<MonthlyWellnessReport> {
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [currentMoods, priorMoods, completions, priorCompletions, progress] =
      await Promise.all([
        Mood.find({ userId: userObjectId, createdAt: { $gte: thirtyDaysAgo } }),
        Mood.find({
          userId: userObjectId,
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        }),
        ActivityCompletionModel.find({
          userId: userObjectId,
          completedAt: { $gte: thirtyDaysAgo },
        }).populate('activityId'),
        ActivityCompletionModel.find({
          userId: userObjectId,
          completedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        }),
        ProgressModel.findOne({ userId: userObjectId }),
      ]);

    // Active dates
    const currentActiveDates = new Set<string>();
    currentMoods.forEach((m) =>
      currentActiveDates.add(this.getLocalDateString(m.createdAt, timezone)),
    );
    completions.forEach((c) =>
      currentActiveDates.add(
        this.getLocalDateString(c.completedAt || c.createdAt, timezone),
      ),
    );

    const priorActiveDates = new Set<string>();
    priorMoods.forEach((m) =>
      priorActiveDates.add(this.getLocalDateString(m.createdAt, timezone)),
    );
    priorCompletions.forEach((c) =>
      priorActiveDates.add(
        this.getLocalDateString(c.completedAt || c.createdAt, timezone),
      ),
    );

    const hasSufficientData = currentActiveDates.size >= 4;

    // Mood distribution
    const moodDistribution: Record<string, number> = {};
    currentMoods.forEach((m) => {
      moodDistribution[m.mood] = (moodDistribution[m.mood] || 0) + 1;
    });

    // Most used activities
    const actMap: Record<string, number> = {};
    const populatedCompletions = completions as unknown as Array<{
      activityId?: { title?: string };
    }>;
    populatedCompletions.forEach((c) => {
      const title = c.activityId?.title || 'Mindful Practice';
      actMap[title] = (actMap[title] || 0) + 1;
    });
    const mostUsedActivities = Object.entries(actMap)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const monthName = now.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const activeDaysDiff = currentActiveDates.size - priorActiveDates.size;
    const activitiesDiff = completions.length - priorCompletions.length;

    const observations: string[] = [];
    if (!hasSufficientData) {
      observations.push(
        'You are at the beginning of your monthly journey. With fewer than 4 active days in the past month, continue returning to Solace to unlock meaningful monthly trends.',
      );
    } else {
      observations.push(
        `You were actively present on ${currentActiveDates.size} days this month (${Math.round((currentActiveDates.size / 30) * 100)}% consistency).`,
      );
      if (activeDaysDiff > 0) {
        observations.push(
          `You practiced self-care on ${activeDaysDiff} more days compared to the prior period.`,
        );
      }
      if (mostUsedActivities.length > 0) {
        observations.push(
          `Your go-to comfort practice this month was "${mostUsedActivities[0].title}", practiced ${mostUsedActivities[0].count} times.`,
        );
      }
    }

    return {
      month: monthName,
      totalActiveDays: currentActiveDates.size,
      totalSessions: currentMoods.length + completions.length,
      moodDistribution,
      mostUsedActivities,
      streakPerformance: {
        currentStreak: progress?.currentStreak || 0,
        longestStreak: progress?.longestStreak || 0,
        consistencyRate: Math.round((currentActiveDates.size / 30) * 100),
      },
      achievementsEarned: progress?.earnedAchievements || [],
      comparisonWithPreviousPeriod:
        priorActiveDates.size > 0 ? { activeDaysDiff, activitiesDiff } : undefined,
      observations,
      hasSufficientData,
    };
  }
}
