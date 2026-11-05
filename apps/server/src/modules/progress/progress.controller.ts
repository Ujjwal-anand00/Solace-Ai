import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ProgressService } from './progress.service';
import { ApiResponseUtil } from '../../utils';

export class ProgressController {
  public static async get(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress = await ProgressService.getOrCreateProgress(req.user!.id);
      ApiResponseUtil.success(res, 'User progress retrieved successfully', progress);
    } catch (err) {
      next(err);
    }
  }

  public static async history(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const history = await ProgressService.getHistory(req.user!.id);
      ApiResponseUtil.success(res, 'Progress history retrieved successfully', history);
    } catch (err) {
      next(err);
    }
  }
}

