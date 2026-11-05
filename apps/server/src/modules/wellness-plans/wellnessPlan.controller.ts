import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { WellnessPlanService } from './wellnessPlan.service';
import { ApiResponseUtil } from '../../utils';

export class WellnessPlanController {
  public static async getCurrent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const plan = await WellnessPlanService.getCurrentPlan(req.user!.id);
      ApiResponseUtil.success(res, 'Current wellness plan retrieved', plan);
    } catch (err) {
      next(err);
    }
  }
}

