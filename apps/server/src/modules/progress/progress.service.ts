import { Types } from 'mongoose';
import { ProgressModel } from './progress.model';
import { UserProgress, ProgressHistoryItem } from '@solace/shared';
import { Mood } from '../mood/mood.model';
import { Journal } from '../journal/journal.model';
import { ActivityCompletionModel } from '../activities/activityCompletion.model';

export class ProgressService {
  /**
   * Get or initialize progress document for user
   */
  public static async getOrCreateProgress(userId: string): Promise<UserProgress> {
    let progress = await ProgressModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!progress) {
      progress = await ProgressModel.create({
        userId: new Types.ObjectId(userId),
        currentStreak: 0,
        longestStreak: 0,
        totalActivities: 0,
        totalMoodCheckIns: 0,
        totalJournalEntries: 0,
        totalBreathingSessions: 0,
        earnedAchievements: [],
      });
    }

    return progress.toDto();
  }

  /**
   * Record user activity and update streaks and counters
   */
  public static async recordActivity(
    userId: string,
    activityType: 'mood' | 'journal' | 'activity' | 'breathing',
  ): Promise<void> {
    let progress = await ProgressModel.findOne({ userId: new Types.ObjectId(userId) });

    if (!progress) {
      progress = new ProgressModel({
        userId: new Types.ObjectId(userId),
        currentStreak: 0,
        longestStreak: 0,
        totalActivities: 0,
        totalMoodCheckIns: 0,
        totalJournalEntries: 0,
        totalBreathingSessions: 0,
        earnedAchievements: [],
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate streak
    if (progress.lastActivityDate) {
      const lastDate = new Date(
        progress.lastActivityDate.getFullYear(),
        progress.lastActivityDate.getMonth(),
        progress.lastActivityDate.getDate(),
      );

      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

      if (diffDays === 1) {
        // Active yesterday -> advance streak
        progress.currentStreak += 1;
      } else if (diffDays > 1) {
        // Missed at least one day -> reset streak to 1
        progress.currentStreak = 1;
      }
      // If diffDays === 0, already active today, retain current streak
    } else {
      progress.currentStreak = 1;
    }

    if (progress.currentStreak > progress.longestStreak) {
      progress.longestStreak = progress.currentStreak;
    }

    progress.lastActivityDate = now;

    // Increment specific counters
    if (activityType === 'mood') progress.totalMoodCheckIns += 1;
    if (activityType === 'journal') progress.totalJournalEntries += 1;
    if (activityType === 'activity') progress.totalActivities += 1;
    if (activityType === 'breathing') {
      progress.totalActivities += 1;
      progress.totalBreathingSessions += 1;
    }

    // Check achievement unlock criteria
    const achievements = new Set(progress.earnedAchievements);
    if (progress.totalMoodCheckIns >= 1) achievements.add('first_checkin');
    if (progress.totalJournalEntries >= 1) achievements.add('first_journal');
    if (progress.totalActivities >= 1) achievements.add('first_activity');
    if (progress.totalBreathingSessions >= 1) achievements.add('first_breathing');
    if (progress.currentStreak >= 3) achievements.add('streak_3_days');
    if (progress.currentStreak >= 7) achievements.add('streak_7_days');

    progress.earnedAchievements = Array.from(achievements);
    await progress.save();
  }

  /**
   * Get past 14-day activity history
   */
  public static async getHistory(userId: string): Promise<ProgressHistoryItem[]> {
    const userObjectId = new Types.ObjectId(userId);
    const days: ProgressHistoryItem[] = [];

    const now = new Date();
    // Build past 14 days array
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const dateStr = date.toISOString().split('T')[0];

      const [moodCount, journalCount, activities] = await Promise.all([
        Mood.countDocuments({
          userId: userObjectId,
          createdAt: { $gte: date, $lt: nextDate },
        }),
        Journal.countDocuments({
          userId: userObjectId,
          createdAt: { $gte: date, $lt: nextDate },
        }),
        ActivityCompletionModel.find({
          userId: userObjectId,
          completedAt: { $gte: date, $lt: nextDate },
        }),
      ]);

      days.push({
        date: dateStr,
        activitiesCompleted: activities.length,
        moodLogged: moodCount > 0,
        journalWritten: journalCount > 0,
        breathingMinutes: Math.round(
          activities.reduce((sum, act) => sum + (act.durationCompleted || 0), 0) / 60,
        ),
      });
    }

    return days;
  }
}
