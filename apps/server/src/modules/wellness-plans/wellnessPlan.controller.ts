import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { WellnessPlanService } from './wellnessPlan.service';
import { RecommendationService } from './recommendation.service';
import {
  generateWellnessPlanSchema,
  createWellnessPlanSchema,
  updateWellnessPlanSchema,
  completeTaskSchema,
} from './wellnessPlan.validator';
import { ApiResponseUtil } from '../../utils';

export class WellnessPlanController {
  public static async getCurrent(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const plan = await WellnessPlanService.getCurrentPlan(req.user!.id);
      ApiResponseUtil.success(res, 'Current wellness plan retrieved', plan);
    } catch (err) {
      next(err);
    }
  }

  public static async generatePreview(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = generateWellnessPlanSchema.parse(req.body);
      const preview = await WellnessPlanService.generatePreview(
        req.user!.id,
        validated,
      );
      ApiResponseUtil.success(res, 'Wellness plan preview generated', preview);
    } catch (err) {
      next(err);
    }
  }

  public static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = createWellnessPlanSchema.parse(req.body);
      const plan = await WellnessPlanService.createAndActivatePlan(
        req.user!.id,
        validated,
      );
      ApiResponseUtil.success(res, 'Wellness plan activated successfully', plan, 201);
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
      const { data, meta } = await WellnessPlanService.listPlans(
        req.user!.id,
        req.query.page,
        req.query.limit,
      );
      ApiResponseUtil.paginated(res, 'Wellness plans retrieved', data, meta);
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
      const plan = await WellnessPlanService.getPlanById(
        req.user!.id,
        req.params.id,
      );
      ApiResponseUtil.success(res, 'Wellness plan retrieved', plan);
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
      const validated = updateWellnessPlanSchema.parse(req.body);
      const updated = await WellnessPlanService.updatePlan(
        req.user!.id,
        req.params.id,
        validated,
      );
      ApiResponseUtil.success(res, 'Wellness plan updated', updated);
    } catch (err) {
      next(err);
    }
  }

  public static async completeTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = completeTaskSchema.parse(req.body || {});
      const plan = await WellnessPlanService.completeTask(
        req.user!.id,
        req.params.id,
        req.params.taskId,
        validated.completed,
      );
      ApiResponseUtil.success(res, 'Task completion updated', plan);
    } catch (err) {
      next(err);
    }
  }

  public static async skipTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const plan = await WellnessPlanService.skipTask(
        req.user!.id,
        req.params.id,
        req.params.taskId,
      );
      ApiResponseUtil.success(res, 'Task marked as skipped', plan);
    } catch (err) {
      next(err);
    }
  }

  public static async pause(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const plan = await WellnessPlanService.pausePlan(
        req.user!.id,
        req.params.id,
      );
      ApiResponseUtil.success(res, 'Wellness plan paused', plan);
    } catch (err) {
      next(err);
    }
  }

  public static async resume(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const plan = await WellnessPlanService.resumePlan(
        req.user!.id,
        req.params.id,
      );
      ApiResponseUtil.success(res, 'Wellness plan resumed', plan);
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
      await WellnessPlanService.deletePlan(req.user!.id, req.params.id);
      ApiResponseUtil.success(res, 'Wellness plan deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  public static async getRecommendations(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const recommendations =
        await RecommendationService.getPersonalizedRecommendations(
          req.user!.id,
        );
      ApiResponseUtil.success(
        res,
        'Personalized recommendations retrieved',
        recommendations,
      );
    } catch (err) {
      next(err);
    }
  }
}
