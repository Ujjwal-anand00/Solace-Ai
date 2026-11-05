import { Types } from 'mongoose';
import { Mood, IMoodDocument } from './mood.model';
import { CreateMoodDto, UpdateMoodDto, MoodEntry, MoodSummary, PaginationMeta } from '@solace/shared';
import { AppError, assertOwnership, buildPaginationMeta, parsePagination } from '../../utils';
import { ProgressService } from '../progress/progress.service';

export class MoodService {
  /**
   * Log a new mood entry
   */
  public static async createMood(userId: string, data: CreateMoodDto): Promise<MoodEntry> {
    const moodDoc = await Mood.create({
      userId: new Types.ObjectId(userId),
      mood: data.mood.toLowerCase(),
      moodIntensity: data.moodIntensity,
      emotions: data.emotions || [],
      note: data.note,
      tags: data.tags || [],
    });

    // Asynchronously update streak and counters
    await ProgressService.recordActivity(userId, 'mood');

    return moodDoc.toDto();
  }

  /**
   * Get user mood entries with pagination and optional date filtering
   */
  public static async getMoods(
    userId: string,
    rawPage?: unknown,
    rawLimit?: unknown,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: MoodEntry[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(rawPage, rawLimit);
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) (filter.createdAt as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.createdAt as Record<string, unknown>).$lte = new Date(endDate);
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

    if (data.mood !== undefined) doc.mood = data.mood.toLowerCase();
    if (data.moodIntensity !== undefined) doc.moodIntensity = data.moodIntensity;
    if (data.emotions !== undefined) doc.emotions = data.emotions;
    if (data.note !== undefined) doc.note = data.note;
    if (data.tags !== undefined) doc.tags = data.tags;

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

    const entries = await Mood.find({
      userId: userObjectId,
      createdAt: { $gte: thirtyDaysAgo },
    }).sort({ createdAt: -1 });

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageIntensity: 0,
        dominantMood: 'none',
        topEmotions: [],
        recentTrend: [],
      };
    }

    // Average intensity
    const totalIntensity = entries.reduce((sum, e) => sum + e.moodIntensity, 0);
    const averageIntensity = Math.round((totalIntensity / entries.length) * 10) / 10;

    // Mood frequency
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
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
    };
  }
}
