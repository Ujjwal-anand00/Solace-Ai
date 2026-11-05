import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { MoodService } from './mood.service';
import { ApiResponseUtil } from '../../utils';

export class MoodController {
  public static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await MoodService.createMood(req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Mood logged successfully', entry, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, startDate, endDate } = req.query;
      const result = await MoodService.getMoods(
        req.user!.id,
        page,
        limit,
        startDate as string | undefined,
        endDate as string | undefined,
      );
      ApiResponseUtil.paginated(res, 'Mood entries retrieved successfully', result.data, result.meta);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await MoodService.getMoodById(req.params.id, req.user!.id);
      ApiResponseUtil.success(res, 'Mood entry retrieved', entry);
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entry = await MoodService.updateMood(req.params.id, req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Mood entry updated', entry);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await MoodService.deleteMood(req.params.id, req.user!.id);
      ApiResponseUtil.success(res, 'Mood entry deleted successfully', null);
    } catch (err) {
      next(err);
    }
  }

  public static async summary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await MoodService.getSummary(req.user!.id);
      ApiResponseUtil.success(res, 'Mood summary calculated successfully', stats);
    } catch (err) {
      next(err);
    }
  }
}
