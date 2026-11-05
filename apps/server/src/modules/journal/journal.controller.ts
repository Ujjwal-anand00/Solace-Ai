import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { JournalService } from './journal.service';
import { ApiResponseUtil } from '../../utils';

export class JournalController {
  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await JournalService.createJournal(req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Journal entry created successfully', entry, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, search, isFavorite, tag } = req.query;
      const parsedFavorite =
        isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined;

      const result = await JournalService.getJournals(
        req.user!.id,
        page,
        limit,
        search as string | undefined,
        parsedFavorite,
        tag as string | undefined,
      );
      ApiResponseUtil.paginated(res, 'Journal entries retrieved successfully', result.data, result.meta);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await JournalService.getJournalById(req.params.id, req.user!.id);
      ApiResponseUtil.success(res, 'Journal entry retrieved', entry);
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await JournalService.updateJournal(req.params.id, req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Journal entry updated successfully', entry);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await JournalService.deleteJournal(req.params.id, req.user!.id);
      ApiResponseUtil.success(res, 'Journal entry deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }
}
