import { Request, Response, NextFunction } from 'express';
import { ResourceService } from './resource.service';
import { ApiResponseUtil } from '../../utils';

export class ResourceController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category } = req.query;
      const resources = await ResourceService.listResources(category as string | undefined);
      ApiResponseUtil.success(res, 'Wellness resources retrieved successfully', resources);
    } catch (err) {
      next(err);
    }
  }
}

