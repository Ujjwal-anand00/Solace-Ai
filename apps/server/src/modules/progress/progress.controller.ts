import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ProgressService } from './progress.service';
import { ApiResponseUtil } from '../../utils';

export class ProgressController {
  private static extractTimezone(req: AuthenticatedRequest): string {
    const tz = (req.query.timezone as string) || (req.headers['x-timezone'] as string);
    if (tz && typeof tz === 'string' && tz.trim().length > 0) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz.trim() });
        return tz.trim();
      } catch {
        // invalid timezone name -> fallback to UTC
      }
    }
    return 'UTC';
  }

  public static async getOverview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const progress = await ProgressService.getOrCreateProgress(req.user!.id);
      ApiResponseUtil.success(res, 'User progress retrieved successfully', progress);
    } catch (err) {
      next(err);
    }
  }

  public static async getSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const period = (req.query.period as 'week' | 'month' | 'all') || 'week';
      const timezone = ProgressController.extractTimezone(req);
      const summary = await ProgressService.getSummary(req.user!.id, period, timezone);
      ApiResponseUtil.success(res, 'Progress summary retrieved successfully', summary);
    } catch (err) {
      next(err);
    }
  }

  public static async getTrends(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const period = (req.query.period as 'week' | 'month') || 'week';
      const timezone = ProgressController.extractTimezone(req);
      const trends = await ProgressService.getTrends(req.user!.id, period, timezone);
      ApiResponseUtil.success(res, 'Progress trends retrieved successfully', trends);
    } catch (err) {
      next(err);
    }
  }

  public static async getHistory(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const category = req.query.category as string | undefined;
      const { data, meta } = await ProgressService.getActivityTimeline(
        req.user!.id,
        category,
        req.query.page,
        req.query.limit,
      );
      ApiResponseUtil.paginated(res, 'Activity history retrieved successfully', data, meta);
    } catch (err) {
      next(err);
    }
  }

  public static async getStreak(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const timezone = ProgressController.extractTimezone(req);
      const streak = await ProgressService.getStreakDetails(req.user!.id, timezone);
      ApiResponseUtil.success(res, 'Streak details retrieved successfully', streak);
    } catch (err) {
      next(err);
    }
  }

  public static async getWeeklyReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const timezone = ProgressController.extractTimezone(req);
      const report = await ProgressService.getWeeklyReport(req.user!.id, timezone);
      ApiResponseUtil.success(res, 'Weekly wellness report retrieved successfully', report);
    } catch (err) {
      next(err);
    }
  }

  public static async getMonthlyReport(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const timezone = ProgressController.extractTimezone(req);
      const report = await ProgressService.getMonthlyReport(req.user!.id, timezone);
      ApiResponseUtil.success(res, 'Monthly wellness report retrieved successfully', report);
    } catch (err) {
      next(err);
    }
  }
}
