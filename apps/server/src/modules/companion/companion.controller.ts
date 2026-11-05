import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { CompanionService } from './companion.service';
import { ApiResponseUtil } from '../../utils';

export class CompanionController {
  public static async getSettings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const settings = await CompanionService.getSettings(req.user!.id);
      ApiResponseUtil.success(res, 'Companion settings retrieved successfully', settings);
    } catch (err) {
      next(err);
    }
  }

  public static async updateSettings(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const settings = await CompanionService.updateSettings(req.user!.id, req.body);
      ApiResponseUtil.success(res, 'Companion settings updated successfully', settings);
    } catch (err) {
      next(err);
    }
  }
}

