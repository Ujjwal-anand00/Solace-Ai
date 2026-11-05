import { Request, Response, NextFunction } from 'express';
import { AffirmationService } from './affirmation.service';
import { ApiResponseUtil } from '../../utils';

export class AffirmationController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, tag, language } = req.query;
      const affirmations = await AffirmationService.listAffirmations(
        category as string | undefined,
        tag as string | undefined,
        (language as string) || 'en',
      );
      ApiResponseUtil.success(res, 'Affirmations retrieved successfully', affirmations);
    } catch (err) {
      next(err);
    }
  }

  public static async daily(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, language } = req.query;
      const affirmation = await AffirmationService.getDailyAffirmation(
        category as string | undefined,
        (language as string) || 'en',
      );
      ApiResponseUtil.success(res, 'Daily affirmation retrieved successfully', affirmation);
    } catch (err) {
      next(err);
    }
  }
}
