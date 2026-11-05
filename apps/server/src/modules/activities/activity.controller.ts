import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ActivityService } from './activity.service';
import { ApiResponseUtil } from '../../utils';

export class ActivityController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, difficulty, search } = req.query;
      const activities = await ActivityService.listActivities(
        category as string | undefined,
        difficulty as string | undefined,
        search as string | undefined,
      );
      ApiResponseUtil.success(res, 'Activities retrieved successfully', activities);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await ActivityService.getActivityById(req.params.id);
      ApiResponseUtil.success(res, 'Activity details retrieved', activity);
    } catch (err) {
      next(err);
    }
  }

  public static async complete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const completion = await ActivityService.completeActivity(
        req.params.id,
        req.user!.id,
        req.body,
      );
      ApiResponseUtil.success(res, 'Activity completed successfully! Progress updated.', completion, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async completedHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await ActivityService.getCompletedHistory(req.user!.id, page, limit);
      ApiResponseUtil.paginated(res, 'Completed activities history retrieved', result.data, result.meta);
    } catch (err) {
      next(err);
    }
  }
}

