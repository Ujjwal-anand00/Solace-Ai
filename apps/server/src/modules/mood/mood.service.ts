import { Types } from 'mongoose';
import { Mood, IMoodDocument } from './mood.model';
import {
  CreateMoodDto,
  UpdateMoodDto,
  MoodEntry,
  MoodSummary,
  MoodCalendarDay,
  MoodInsightsResponse,
  MoodInsightItem,
  PaginationMeta,
} from '@solace/shared';
import { AppError, assertOwnership, buildPaginationMeta, parsePagination } from '../../utils';
import { ProgressService } from '../progress/progress.service';

const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'harm myself',
  'want to die',
  'dont want to live',
  "don't want to live",
  'better off dead',
];

export class MoodService {
  /**
   * Log a new mood entry
   */
  public static async createMood(userId: string, data: CreateMoodDto): Promise<MoodEntry> {
    const moodDoc = await Mood.create({
      userId: new Types.ObjectId(userId),
      mood: data.mood.toLowerCase().trim(),
      moodIntensity: data.moodIntensity,
      emotions: (data.emotions || []).map((e) => e.trim().toLowerCase()),
      note: data.note?.trim(),
      tags: (data.tags || []).map((t) => t.trim().toLowerCase()),
    });

    // Asynchronously update streak and counters
    await ProgressService.recordActivity(userId, 'mood');

    return moodDoc.toDto();
  }

  /**
   * Get user mood entries with pagination and optional filtering
   */
  public static async getMoods(
    userId: string,
    rawPage?: unknown,
    rawLimit?: unknown,
    startDate?: string,
    endDate?: string,
    mood?: string,
    emotion?: string,
  ): Promise<{ data: MoodEntry[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(rawPage, rawLimit);
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };

    if (mood) {
      filter.mood = mood.toLowerCase().trim();
    }

    if (emotion) {
      filter.emotions = { $in: [emotion.toLowerCase().trim()] };
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        if (endDate.length <= 10) {
          end.setHours(23, 59, 59, 999);
        }
        (filter.createdAt as Record<string, unknown>).$lte = end;
      }
    }

    const [entries, total] = await Promise.all([
      Mood.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Mood.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);
    return {
      data: entries.map((doc: IMoodDocument) => doc.toDto()),
      meta,
    };
  }

  /**
   * Get a single mood entry by ID (with ownership check)
   */
  public static async getMoodById(id: string, userId: string): Promise<MoodEntry> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid mood entry ID format');
    }

    const doc = await Mood.findById(id);
    if (!doc) {
      throw AppError.notFound('Mood entry not found');
    }

    assertOwnership(doc.userId, userId, 'mood entry');
    return doc.toDto();
  }

  /**
   * Update an existing mood entry (with ownership check)
   */
  public static async updateMood(id: string, userId: string, data: UpdateMoodDto): Promise<MoodEntry> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid mood entry ID format');
    }

    const doc = await Mood.findById(id);
    if (!doc) {
      throw AppError.notFound('Mood entry not found');
    }

    assertOwnership(doc.userId, userId, 'mood entry');

    if (data.mood !== undefined) doc.mood = data.mood.toLowerCase().trim();
    if (data.moodIntensity !== undefined) doc.moodIntensity = data.moodIntensity;
    if (data.emotions !== undefined) {
      doc.emotions = data.emotions.map((e) => e.trim().toLowerCase());
    }
    if (data.note !== undefined) doc.note = data.note.trim();
    if (data.tags !== undefined) {
      doc.tags = data.tags.map((t) => t.trim().toLowerCase());
    }

    await doc.save();
    return doc.toDto();
  }

  /**
   * Delete a mood entry (with ownership check)
   */
  public static async deleteMood(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid mood entry ID format');
    }

    const doc = await Mood.findById(id);
    if (!doc) {
      throw AppError.notFound('Mood entry not found');
    }

    assertOwnership(doc.userId, userId, 'mood entry');
    await Mood.findByIdAndDelete(id);
  }

  /**
   * Calculate summary statistics for user's mood entries
   */
  public static async getSummary(userId: string): Promise<MoodSummary> {
    const userObjectId = new Types.ObjectId(userId);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [entries, progress] = await Promise.all([
      Mood.find({
        userId: userObjectId,
        createdAt: { $gte: thirtyDaysAgo },
      }).sort({ createdAt: -1 }),
      ProgressService.getOrCreateProgress(userId),
    ]);

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageIntensity: 0,
        dominantMood: 'none',
        topEmotions: [],
        recentTrend: [],
        moodDistribution: {},
        checkInStreak: progress.currentStreak || 0,
      };
    }

    // Average intensity
    const totalIntensity = entries.reduce((sum, e) => sum + e.moodIntensity, 0);
    const averageIntensity = Math.round((totalIntensity / entries.length) * 10) / 10;

    // Mood frequency and distribution
    const moodCounts: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};

    entries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      (e.emotions || []).forEach((em) => {
        emotionCounts[em] = (emotionCounts[em] || 0) + 1;
      });
    });

    let dominantMood = 'neutral';
    let maxCount = 0;
    for (const [m, count] of Object.entries(moodCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantMood = m;
      }
    }

    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    // 7-day trend
    const recentTrend: Array<{ date: string; averageIntensity: number; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayEntries = entries.filter((e) => e.createdAt.toISOString().split('T')[0] === dateStr);
      const dayIntensity = dayEntries.length
        ? Math.round((dayEntries.reduce((s, e) => s + e.moodIntensity, 0) / dayEntries.length) * 10) / 10
        : 0;

      recentTrend.push({
        date: dateStr,
        averageIntensity: dayIntensity,
        count: dayEntries.length,
      });
    }

    return {
      totalEntries: entries.length,
      averageIntensity,
      dominantMood,
      topEmotions,
      recentTrend,
      moodDistribution: moodCounts,
      checkInStreak: progress.currentStreak || 0,
    };
  }

  /**
   * Get calendar data for a specified month/year
   */
  public static async getCalendar(
    userId: string,
    rawYear?: number,
    rawMonth?: number,
  ): Promise<MoodCalendarDay[]> {
    const now = new Date();
    const year = rawYear || now.getFullYear();
    const month = rawMonth || now.getMonth() + 1; // 1-12

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const daysInMonth = new Date(year, month, 0).getDate();

    const entries = await Mood.find({
      userId: new Types.ObjectId(userId),
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: 1 });

    // Group by YYYY-MM-DD
    const grouped = new Map<string, IMoodDocument[]>();
    entries.forEach((doc) => {
      const dateKey = doc.createdAt.toISOString().split('T')[0];
      const list = grouped.get(dateKey) || [];
      list.push(doc);
      grouped.set(dateKey, list);
    });

    const days: MoodCalendarDay[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = grouped.get(dateStr) || [];

      if (dayEntries.length === 0) {
        days.push({
          date: dateStr,
          hasCheckIn: false,
          count: 0,
          entries: [],
        });
      } else {
        const totalInt = dayEntries.reduce((acc, curr) => acc + curr.moodIntensity, 0);
        const avgInt = Math.round((totalInt / dayEntries.length) * 10) / 10;

        // Dominant mood of day
        const moodTally: Record<string, number> = {};
        dayEntries.forEach((e) => {
          moodTally[e.mood] = (moodTally[e.mood] || 0) + 1;
        });
        let topMood = dayEntries[0].mood;
        let topCount = 0;
        for (const [m, c] of Object.entries(moodTally)) {
          if (c > topCount) {
            topCount = c;
            topMood = m;
          }
        }

        days.push({
          date: dateStr,
          hasCheckIn: true,
          count: dayEntries.length,
          dominantMood: topMood,
          averageIntensity: avgInt,
          entries: dayEntries.map((e) => e.toDto()),
        });
      }
    }

    return days;
  }

  /**
   * Generate transparent, supportive, rule-based insights
   */
  public static async getInsights(userId: string, days = 30): Promise<MoodInsightsResponse> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const entries = await Mood.find({
      userId: new Types.ObjectId(userId),
      createdAt: { $gte: cutoff },
    }).sort({ createdAt: -1 });

    const insights: MoodInsightItem[] = [];

    // Crisis keywords detection in reflection notes
    let crisisDetected = false;
    for (const entry of entries) {
      if (entry.note) {
        const lowerNote = entry.note.toLowerCase();
        if (CRISIS_KEYWORDS.some((kw) => lowerNote.includes(kw))) {
          crisisDetected = true;
          break;
        }
      }
    }

    if (entries.length === 0) {
      insights.push({
        id: 'no_data',
        type: 'encouragement',
        title: 'Begin Your Sanctuary Journey',
        description:
          'Taking 30 seconds to acknowledge your inner state is a gentle act of self-care. Your emotional patterns will appear here as you check in.',
        icon: 'sparkles',
      });
    } else {
      // 1. Consistency insight
      const weekEntries = entries.filter((e) => {
        const diff = (Date.now() - e.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      });

      if (weekEntries.length >= 3) {
        insights.push({
          id: 'consistency_high',
          type: 'consistency',
          title: 'Strong Mindfulness Rhythm',
          description: `You've checked in ${weekEntries.length} times this week. Pausing to notice how you feel builds lasting emotional clarity.`,
          icon: 'calendar',
        });
      } else if (weekEntries.length > 0) {
        insights.push({
          id: 'consistency_gentle',
          type: 'consistency',
          title: 'Gentle Awareness',
          description: `You've recorded ${weekEntries.length} check-in${weekEntries.length === 1 ? '' : 's'} this week. Every pause to check in with yourself matters.`,
          icon: 'calendar',
        });
      }

      // 2. Dominant mood theme
      const moodCounts: Record<string, number> = {};
      entries.forEach((e) => {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      });

      let dominantMood = entries[0].mood;
      let highestMoodCount = 0;
      for (const [m, count] of Object.entries(moodCounts)) {
        if (count > highestMoodCount) {
          highestMoodCount = count;
          dominantMood = m;
        }
      }

      insights.push({
        id: 'dominant_theme',
        type: 'trend',
        title: 'Predominant Emotional Theme',
        description: `Over the past ${days} days, "${dominantMood.toUpperCase()}" was your most frequently logged mood (${highestMoodCount} times).`,
        icon: 'smile',
      });

      // 3. Top emotions observation
      const emotionCounts: Record<string, number> = {};
      entries.forEach((e) => {
        (e.emotions || []).forEach((em) => {
          emotionCounts[em] = (emotionCounts[em] || 0) + 1;
        });
      });

      const topEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);

      if (topEmotions.length > 0) {
        const emotionNames = topEmotions.map(([em]) => `"${em}"`).join(' and ');
        insights.push({
          id: 'emotion_nuance',
          type: 'emotion',
          title: 'Emotional Nuance',
          description: `You frequently named ${emotionNames} when diving deeper into your feelings.`,
          icon: 'heart',
        });
      }

      // 4. Context tags observation
      const tagCounts: Record<string, number> = {};
      entries.forEach((e) => {
        (e.tags || []).forEach((t) => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      });

      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);

      if (topTags.length > 0) {
        const tagNames = topTags.map(([t]) => `"${t}"`).join(' and ');
        insights.push({
          id: 'context_tags',
          type: 'tag',
          title: 'Life Themes',
          description: `${tagNames} appeared as recurring contexts in your reflections.`,
          icon: 'bookOpen',
        });
      }

      // 5. Mindful reminder
      insights.push({
        id: 'mindful_reminder',
        type: 'encouragement',
        title: 'Non-Judgmental Space',
        description:
          'Emotions are natural messengers. Whether light or heavy, acknowledging them without criticism is the foundation of emotional wellness.',
        icon: 'feather',
      });
    }

    const response: MoodInsightsResponse = {
      insights,
    };

    if (crisisDetected) {
      response.safetySupport = {
        recommended: true,
        message:
          'We noticed words reflecting significant distress. Solace AI is a self-care companion, not crisis healthcare. If you are going through a difficult time, compassionate human support is available immediately.',
        resources: [
          {
            name: '988 Suicide & Crisis Lifeline (US & Canada)',
            contact: 'Call or Text 988',
            description: 'Free, confidential, available 24/7/365.',
          },
          {
            name: 'Crisis Text Line',
            contact: 'Text HOME to 741741',
            description: 'Free 24/7 crisis support via SMS.',
          },
          {
            name: 'International Helpline Directory',
            contact: 'findahelpline.com',
            description: 'Free, confidential crisis helplines in over 130 countries.',
          },
        ],
      };
    }

    return response;
  }
}
