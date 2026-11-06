import { Request, Response, NextFunction } from 'express';
import { ResourceService } from './resource.service';
import {
  resourceQuerySchema,
  updateProgressSchema,
  createResourceAdminSchema,
  updateResourceAdminSchema,
} from './resource.validator';
import { ApiResponseUtil } from '../../utils';

export class ResourceController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = resourceQuerySchema.parse(req.query);
      const result = await ResourceService.listResources(validated, req.user?.id);
      ApiResponseUtil.paginated(
        res,
        'Wellness resources retrieved successfully',
        result.resources,
        {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1,
        },
      );
    } catch (err) {
      next(err);
    }
  }

  public static async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const featured = await ResourceService.getFeatured(req.user?.id);
      ApiResponseUtil.success(res, 'Featured wellness resources retrieved', featured);
    } catch (err) {
      next(err);
    }
  }

  public static async getRecommended(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const featured = await ResourceService.getFeatured();
        ApiResponseUtil.success(res, 'Recommended wellness resources retrieved', featured);
        return;
      }
      const recommended = await ResourceService.getRecommended(userId);
      ApiResponseUtil.success(res, 'Personalized wellness recommendations retrieved', recommended);
    } catch (err) {
      next(err);
    }
  }

  public static async getCategories(
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const categories = await ResourceService.getCategories();
      ApiResponseUtil.success(res, 'Educational resource categories retrieved', categories);
    } catch (err) {
      next(err);
    }
  }

  public static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || (req.query.search as string) || '';
      const filter = resourceQuerySchema.parse(req.query);
      const result = await ResourceService.searchResources(query, filter, req.user?.id);
      ApiResponseUtil.success(res, 'Search completed successfully', {
        resources: result.resources,
        total: result.total,
        query: result.query,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resource = await ResourceService.getResourceById(req.params.id, req.user?.id);
      ApiResponseUtil.success(res, 'Wellness resource details retrieved', resource);
    } catch (err) {
      next(err);
    }
  }

  public static async toggleFavorite(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await ResourceService.toggleFavorite(userId, req.params.id);
      const msg = result.isBookmarked
        ? 'Resource bookmarked to your favorites'
        : 'Resource removed from your favorites';
      ApiResponseUtil.success(res, msg, result);
    } catch (err) {
      next(err);
    }
  }

  public static async getFavorites(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const favorites = await ResourceService.getFavorites(userId);
      ApiResponseUtil.success(res, 'Favorite resources retrieved successfully', favorites);
    } catch (err) {
      next(err);
    }
  }

  public static async getProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const progress = await ResourceService.getUserProgress(userId);
      ApiResponseUtil.success(res, 'Reading progress retrieved successfully', progress);
    } catch (err) {
      next(err);
    }
  }

  public static async updateProgress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = req.user!.id;
      const { progressPercent } = updateProgressSchema.parse(req.body);
      const progress = await ResourceService.updateProgress(userId, req.params.id, progressPercent);
      ApiResponseUtil.success(res, 'Reading progress updated', progress);
    } catch (err) {
      next(err);
    }
  }

  public static async complete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const progress = await ResourceService.completeResource(userId, req.params.id);
      ApiResponseUtil.success(res, 'Resource marked as completed', progress);
    } catch (err) {
      next(err);
    }
  }

  // --- Admin Controllers ---

  public static async adminCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createResourceAdminSchema.parse(req.body);
      const resource = await ResourceService.createResource(validated);
      ApiResponseUtil.success(res, 'Resource created successfully', resource, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async adminUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = updateResourceAdminSchema.parse(req.body);
      const resource = await ResourceService.updateResource(req.params.id, validated);
      ApiResponseUtil.success(res, 'Resource updated successfully', resource);
    } catch (err) {
      next(err);
    }
  }

  public static async adminDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ResourceService.deleteResource(req.params.id);
      ApiResponseUtil.success(res, 'Resource deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  public static async adminPublish(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isPublished = String(req.body.isPublished) !== 'false';
      const resource = await ResourceService.setPublishStatus(req.params.id, isPublished);
      ApiResponseUtil.success(res, `Resource ${isPublished ? 'published' : 'unpublished'}`, resource);
    } catch (err) {
      next(err);
    }
  }

  public static async adminFeature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isFeatured = String(req.body.isFeatured) !== 'false';
      const resource = await ResourceService.setFeatureStatus(req.params.id, isFeatured);
      ApiResponseUtil.success(res, `Resource ${isFeatured ? 'featured' : 'unfeatured'}`, resource);
    } catch (err) {
      next(err);
    }
  }

  public static async adminSeed(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await ResourceService.ensureSeeded();
      ApiResponseUtil.success(res, 'Initial educational resources seeded successfully');
    } catch (err) {
      next(err);
    }
  }
}
