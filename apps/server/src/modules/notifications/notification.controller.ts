import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { NotificationService } from './notification.service';
import { ApiResponseUtil } from '../../utils';

export class NotificationController {
  public static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await NotificationService.getUnreadCount(req.user!.id);
      ApiResponseUtil.success(res, 'Unread notifications count retrieved', { unreadCount: count });
    } catch (err) {
      next(err);
    }
  }
}

