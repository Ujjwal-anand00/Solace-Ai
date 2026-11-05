import { Types } from 'mongoose';
import { Journal, IJournalDocument } from './journal.model';
import { CreateJournalDto, UpdateJournalDto, JournalEntry, PaginationMeta } from '@solace/shared';
import { AppError, assertOwnership, buildPaginationMeta, parsePagination } from '../../utils';
import { ProgressService } from '../progress/progress.service';

export class JournalService {
  /**
   * Create a new private journal entry
   */
  public static async createJournal(userId: string, data: CreateJournalDto): Promise<JournalEntry> {
    const doc = await Journal.create({
      userId: new Types.ObjectId(userId),
      title: data.title,
      content: data.content,
      prompt: data.prompt,
      moodAssociation: data.moodAssociation,
      tags: data.tags || [],
      isFavorite: data.isFavorite || false,
    });

    await ProgressService.recordActivity(userId, 'journal');
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
    isFavorite?: boolean,
    tag?: string,
  ): Promise<{ data: JournalEntry[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(rawPage, rawLimit);
    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };

    if (isFavorite !== undefined) {
      filter.isFavorite = isFavorite;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
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
    if (data.prompt !== undefined) doc.prompt = data.prompt;
    if (data.moodAssociation !== undefined) doc.moodAssociation = data.moodAssociation;
    if (data.tags !== undefined) doc.tags = data.tags;
    if (data.isFavorite !== undefined) doc.isFavorite = data.isFavorite;

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
}
