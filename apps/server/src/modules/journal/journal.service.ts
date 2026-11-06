import { Types } from 'mongoose';
import { Journal, IJournalDocument } from './journal.model';
import {
  CreateJournalDto,
  UpdateJournalDto,
  JournalEntry,
  PaginationMeta,
  JournalCalendarDay,
  JournalStats,
  JournalCategory,
} from '@solace/shared';
import { AppError, assertOwnership, buildPaginationMeta, parsePagination } from '../../utils';
import { ProgressService } from '../progress/progress.service';
import { JournalInsightService } from './journalInsight.service';

export class JournalService {
  /**
   * Create a new private journal entry
   */
  public static async createJournal(
    userId: string,
    data: CreateJournalDto,
  ): Promise<JournalEntry> {
    const doc = await Journal.create({
      userId: new Types.ObjectId(userId),
      title: data.title,
      content: data.content,
      category: data.category || 'free_write',
      prompt: data.prompt,
      promptId: data.promptId,
      moodAssociation: data.moodAssociation,
      moodIntensity: data.moodIntensity,
      emotions: data.emotions || [],
      gratitudeItems: data.gratitudeItems || [],
      tags: data.tags || [],
      isFavorite: data.isFavorite || false,
      isDraft: data.isDraft || false,
      aiConsentGranted: data.aiConsentGranted || false,
    });

    if (!data.isDraft) {
      await ProgressService.recordActivity(userId, 'journal');
    }

    return doc.toDto();
  }

  /**
   * Get paginated journal entries for the user
   */
  public static async getJournals(
    userId: string,
    rawPage?: unknown,
    rawLimit?: unknown,
    search?: string,
    category?: string,
    isFavorite?: boolean,
    isDraft?: boolean,
    tag?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ data: JournalEntry[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(rawPage, rawLimit);
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };

    if (category) {
      filter.category = category;
    }

    if (isFavorite !== undefined) {
      filter.isFavorite = isFavorite;
    }

    if (isDraft !== undefined) {
      filter.isDraft = isDraft;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [search.trim().toLowerCase()] } },
      ];
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
      Journal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Journal.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);
    return {
      data: entries.map((doc: IJournalDocument) => doc.toDto()),
      meta,
    };
  }

  /**
   * Get a single journal entry by ID (strictly isolated to owner)
   */
  public static async getJournalById(id: string, userId: string): Promise<JournalEntry> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid journal entry ID format');
    }

    const doc = await Journal.findById(id);
    if (!doc) {
      throw AppError.notFound('Journal entry not found');
    }

    assertOwnership(doc.userId, userId, 'journal entry');
    return doc.toDto();
  }

  /**
   * Update a journal entry (strictly isolated to owner)
   */
  public static async updateJournal(
    id: string,
    userId: string,
    data: UpdateJournalDto,
  ): Promise<JournalEntry> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid journal entry ID format');
    }

    const doc = await Journal.findById(id);
    if (!doc) {
      throw AppError.notFound('Journal entry not found');
    }

    assertOwnership(doc.userId, userId, 'journal entry');

    if (data.title !== undefined) doc.title = data.title;
    if (data.content !== undefined) doc.content = data.content;
    if (data.category !== undefined) doc.category = data.category;
    if (data.prompt !== undefined) doc.prompt = data.prompt;
    if (data.promptId !== undefined) doc.promptId = data.promptId;
    if (data.moodAssociation !== undefined) doc.moodAssociation = data.moodAssociation;
    if (data.moodIntensity !== undefined) doc.moodIntensity = data.moodIntensity;
    if (data.emotions !== undefined) doc.emotions = data.emotions;
    if (data.gratitudeItems !== undefined) doc.gratitudeItems = data.gratitudeItems;
    if (data.tags !== undefined) doc.tags = data.tags;
    if (data.isFavorite !== undefined) doc.isFavorite = data.isFavorite;
    if (data.isDraft !== undefined) doc.isDraft = data.isDraft;
    if (data.aiConsentGranted !== undefined) doc.aiConsentGranted = data.aiConsentGranted;

    await doc.save();
    return doc.toDto();
  }

  /**
   * Delete a journal entry (strictly isolated to owner)
   */
  public static async deleteJournal(id: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid journal entry ID format');
    }

    const doc = await Journal.findById(id);
    if (!doc) {
      throw AppError.notFound('Journal entry not found');
    }

    assertOwnership(doc.userId, userId, 'journal entry');
    await Journal.findByIdAndDelete(id);
  }

  /**
   * Toggle favorite flag for an entry
   */
  public static async toggleFavorite(id: string, userId: string): Promise<JournalEntry> {
    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid journal entry ID format');
    }

    const doc = await Journal.findById(id);
    if (!doc) {
      throw AppError.notFound('Journal entry not found');
    }

    assertOwnership(doc.userId, userId, 'journal entry');
    doc.isFavorite = !doc.isFavorite;
    await doc.save();
    return doc.toDto();
  }

  /**
   * Request AI reflection insights with explicit user consent
   */
  public static async requestInsight(
    id: string,
    userId: string,
    consent: boolean,
  ): Promise<JournalEntry> {
    if (!consent) {
      throw AppError.badRequest('Explicit consent is required to request AI reflections');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('Invalid journal entry ID format');
    }

    const doc = await Journal.findById(id);
    if (!doc) {
      throw AppError.notFound('Journal entry not found');
    }

    assertOwnership(doc.userId, userId, 'journal entry');

    // Generate insight via Gemini
    const insight = await JournalInsightService.generateReflectionInsight(
      doc.title,
      doc.content,
      doc.category,
      doc.moodAssociation,
    );

    doc.aiConsentGranted = true;
    doc.aiInsight = {
      theme: insight.theme,
      reflection: insight.reflection,
      suggestedAction: insight.suggestedAction,
      affirmingThought: insight.affirmingThought,
      sentimentTone: insight.sentimentTone,
      createdAt: new Date(insight.createdAt),
    };

    await doc.save();
    return doc.toDto();
  }

  /**
   * Get calendar data for a specified month/year
   */
  public static async getCalendar(
    userId: string,
    rawYear?: number,
    rawMonth?: number,
  ): Promise<JournalCalendarDay[]> {
    const now = new Date();
    const year = rawYear || now.getFullYear();
    const month = rawMonth || now.getMonth() + 1; // 1-12

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const daysInMonth = new Date(year, month, 0).getDate();

    const entries = await Journal.find({
      userId: new Types.ObjectId(userId),
      isDraft: false,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: 1 });

    const grouped = new Map<string, IJournalDocument[]>();
    entries.forEach((doc) => {
      const dateKey = doc.createdAt.toISOString().split('T')[0];
      const list = grouped.get(dateKey) || [];
      list.push(doc);
      grouped.set(dateKey, list);
    });

    const days: JournalCalendarDay[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEntries = grouped.get(dateStr) || [];

      days.push({
        date: dateStr,
        count: dayEntries.length,
        entries: dayEntries.map((e) => ({
          id: e._id.toString(),
          title: e.title,
          category: e.category as JournalCategory,
          isFavorite: e.isFavorite,
        })),
      });
    }

    return days;
  }

  /**
   * Get journal statistics summary
   */
  public static async getStats(userId: string): Promise<JournalStats> {
    const userObjectId = new Types.ObjectId(userId);
    const entries = await Journal.find({
      userId: userObjectId,
      isDraft: false,
    }).sort({ createdAt: -1 });

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalWords: 0,
        favoriteCount: 0,
        categoryBreakdown: {},
        activeDaysCount: 0,
        currentStreak: 0,
        longestStreak: 0,
      };
    }

    let totalWords = 0;
    let favoriteCount = 0;
    const categoryBreakdown: Record<string, number> = {};
    const uniqueDays = new Set<string>();

    entries.forEach((e) => {
      const words = e.content.trim().split(/\s+/).filter(Boolean).length;
      totalWords += words;
      if (e.isFavorite) favoriteCount++;
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + 1;
      uniqueDays.add(e.createdAt.toISOString().split('T')[0]);
    });

    // Calculate streak based on active writing days
    const sortedDays = Array.from(uniqueDays).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;

    if (sortedDays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (sortedDays[0] === today || sortedDays[0] === yesterday) {
        currentStreak = 1;
        let lastDate = new Date(sortedDays[0]);

        for (let i = 1; i < sortedDays.length; i++) {
          const currentDate = new Date(sortedDays[i]);
          const diffDays = Math.round(
            (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (diffDays === 1) {
            currentStreak++;
            lastDate = currentDate;
          } else {
            break;
          }
        }
      }

      // Longest streak
      let tempStreak = 1;
      longestStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }
    }

    return {
      totalEntries: entries.length,
      totalWords,
      favoriteCount,
      categoryBreakdown,
      activeDaysCount: uniqueDays.size,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
    };
  }
}
