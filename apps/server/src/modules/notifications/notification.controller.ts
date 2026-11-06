import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { NotificationService } from './notification.service';
import { ApiResponseUtil } from '../../utils';
import {
  registerDeviceSchema,
  updatePreferencesSchema,
  createReminderSchema,
  updateReminderSchema,
} from './notification.validator';

export class NotificationController {
  // --- Preferences ---
  public static async getPreferences(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const preferences = await NotificationService.getPreferences(req.user!.id);
      ApiResponseUtil.success(res, 'Notification preferences retrieved', preferences);
    } catch (err) {
      next(err);
    }
  }

  public static async updatePreferences(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = updatePreferencesSchema.parse(req.body);
      const preferences = await NotificationService.updatePreferences(req.user!.id, validated);
      ApiResponseUtil.success(res, 'Notification preferences updated', preferences);
    } catch (err) {
      next(err);
    }
  }

  // --- Devices ---
  public static async registerDevice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = registerDeviceSchema.parse(req.body);
      const device = await NotificationService.registerDevice(req.user!.id, validated);
      ApiResponseUtil.success(res, 'Device registered successfully', device, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async removeDevice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await NotificationService.removeDevice(req.user!.id, req.params.id);
      ApiResponseUtil.success(res, 'Device removed successfully');
    } catch (err) {
      next(err);
    }
  }

  // --- Inbox & Notifications ---
  public static async getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page, limit, type, status } = req.query;
      const result = await NotificationService.getNotifications(
        req.user!.id,
        page,
        limit,
        typeof type === 'string' ? type : undefined,
        typeof status === 'string' ? status : undefined,
      );
      ApiResponseUtil.paginated(res, 'Notifications retrieved', result.data, result.meta);
    } catch (err) {
      next(err);
    }
  }

  public static async getUnreadCount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const count = await NotificationService.getUnreadCount(req.user!.id);
      ApiResponseUtil.success(res, 'Unread notifications count retrieved', { unreadCount: count });
    } catch (err) {
      next(err);
    }
  }

  public static async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const notification = await NotificationService.markAsRead(req.user!.id, req.params.id);
      ApiResponseUtil.success(res, 'Notification marked as read', notification);
    } catch (err) {
      next(err);
    }
  }

  public static async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const updatedCount = await NotificationService.markAllAsRead(req.user!.id);
      ApiResponseUtil.success(res, 'All notifications marked as read', { updatedCount });
    } catch (err) {
      next(err);
    }
  }

  public static async deleteNotification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await NotificationService.deleteNotification(req.user!.id, req.params.id);
      ApiResponseUtil.success(res, 'Notification deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  // --- Reminders ---
  public static async getReminders(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const reminders = await NotificationService.getReminders(req.user!.id);
      ApiResponseUtil.success(res, 'Reminders retrieved successfully', reminders);
    } catch (err) {
      next(err);
    }
  }

  public static async createReminder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = createReminderSchema.parse(req.body);
      const reminder = await NotificationService.createReminder(req.user!.id, validated);
      ApiResponseUtil.success(res, 'Reminder created successfully', reminder, 201);
    } catch (err) {
      next(err);
    }
  }

  public static async updateReminder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const validated = updateReminderSchema.parse(req.body);
      const reminder = await NotificationService.updateReminder(req.user!.id, req.params.id, validated);
      ApiResponseUtil.success(res, 'Reminder updated successfully', reminder);
    } catch (err) {
      next(err);
    }
  }

  public static async deleteReminder(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await NotificationService.deleteReminder(req.user!.id, req.params.id);
      ApiResponseUtil.success(res, 'Reminder deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
