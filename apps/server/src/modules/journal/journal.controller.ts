import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { JournalService } from './journal.service';
import { JournalPromptService } from './journalPrompt.service';
import { ApiResponseUtil } from '../../utils';
import { PromptCategory } from '@solace/shared';

export class JournalController {
  public static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const entry = await JournalService.createJournal(req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Journal entry created successfully', entry, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        page,
        limit,
        search,
        category,
        isFavorite,
        isDraft,
        tag,
        startDate,
        endDate,
      } = req.query;

      const parsedFavorite =
        String(isFavorite) === 'true'
          ? true
          : String(isFavorite) === 'false'
            ? false
            : undefined;

      const parsedDraft =
        String(isDraft) === 'true'
          ? true
          : String(isDraft) === 'false'
            ? false
            : undefined;

      const result = await JournalService.getJournals(
        req.user!.id,
        page,
        limit,
        search as string | undefined,
        category as string | undefined,
        parsedFavorite,
        parsedDraft,
        tag as string | undefined,
        startDate as string | undefined,
        endDate as string | undefined,
      );
      ApiResponseUtil.paginated(
        res,
        'Journal entries retrieved successfully',
        result.data,
        result.meta,
      );
    } catch (err) {
      next(err);
    }
  }

  public static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const entry = await JournalService.getJournalById(req.params.id, req.user!.id);
      ApiResponseUtil.success(res, 'Journal entry retrieved', entry);
    } catch (err) {
      next(err);
    }
  }

  public static async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const entry = await JournalService.updateJournal(req.params.id, req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Journal entry updated successfully', entry);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await JournalService.deleteJournal(req.params.id, req.user!.id);
      ApiResponseUtil.success(res, 'Journal entry deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }

  public static async toggleFavorite(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const entry = await JournalService.toggleFavorite(req.params.id, req.user!.id);
      ApiResponseUtil.success(res, 'Journal favorite updated successfully', entry);
    } catch (err) {
      next(err);
    }
  }

  public static async requestInsight(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { consent } = req.body;
      const entry = await JournalService.requestInsight(req.params.id, req.user!.id, consent);
      ApiResponseUtil.success(res, 'Reflection insight generated successfully', entry);
    } catch (err) {
      next(err);
    }
  }

  public static async getPrompts(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { category } = req.query;
      const prompts = await JournalPromptService.getPrompts(category as PromptCategory | undefined);
      ApiResponseUtil.success(res, 'Journal prompts retrieved successfully', prompts);
    } catch (err) {
      next(err);
    }
  }

  public static async getRandomPrompt(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { category } = req.query;
      const prompt = await JournalPromptService.getRandomPrompt(
        category as PromptCategory | undefined,
      );
      ApiResponseUtil.success(res, 'Random prompt retrieved successfully', prompt);
    } catch (err) {
      next(err);
    }
  }

  public static async getCalendar(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { year, month } = req.query;
      const calendar = await JournalService.getCalendar(
        req.user!.id,
        year ? Number(year) : undefined,
        month ? Number(month) : undefined,
      );
      ApiResponseUtil.success(res, 'Journal calendar retrieved successfully', calendar);
    } catch (err) {
      next(err);
    }
  }

  public static async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const stats = await JournalService.getStats(req.user!.id);
      ApiResponseUtil.success(res, 'Journal stats calculated successfully', stats);
    } catch (err) {
      next(err);
    }
  }
}
