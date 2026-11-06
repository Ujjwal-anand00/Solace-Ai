import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { AchievementService } from './achievement.service';
import { ApiResponseUtil } from '../../utils';

export class AchievementController {
  public static async getAll(
    _req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const achievements = await AchievementService.getAllAchievements();
      ApiResponseUtil.success(res, 'Achievements retrieved successfully', achievements);
    } catch (err) {
      next(err);
    }
  }

  public static async getMine(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userAchievements = await AchievementService.getUserAchievements(
        req.user!.id,
      );
      ApiResponseUtil.success(
        res,
        'User achievements retrieved successfully',
        userAchievements,
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
      const achievement = await AchievementService.getAchievementById(
        req.params.id,
      );
      ApiResponseUtil.success(res, 'Achievement retrieved successfully', achievement);
    } catch (err) {
      next(err);
    }
  }
}

