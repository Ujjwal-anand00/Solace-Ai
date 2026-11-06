import { Types } from 'mongoose';
import {
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
  DeviceRegistrationDto,
  UserDevice,
  SolaceNotification,
  ScheduledReminder,
  CreateReminderDto,
  UpdateReminderDto,
  PaginationMeta,
  NotificationType,
} from '@solace/shared';
import { NotificationModel, INotificationDocument } from './notification.model';
import { DeviceModel } from './device.model';
import { NotificationPreferencesModel } from './notification-preferences.model';
import { ReminderModel } from './reminder.model';
import { AppError, assertOwnership, buildPaginationMeta, parsePagination } from '../../utils';
import { NotificationDeliveryService } from './notification.delivery.service';
import { logger } from '../../utils/logger';

export class NotificationService {
  /**
   * Retrieve user notification preferences or generate default settings
   */
  public static async getPreferences(userId: string): Promise<NotificationPreferences> {
    const userObjectId = new Types.ObjectId(userId);
    let prefs = await NotificationPreferencesModel.findOne({ userId: userObjectId });

    if (!prefs) {
      prefs = await NotificationPreferencesModel.create({
        userId: userObjectId,
        masterEnabled: true,
        dailyWellness: {
          enabled: true,
          time: '09:00',
          days: [0, 1, 2, 3, 4, 5, 6],
        },
        moodCheckin: {
          enabled: true,
          time: '20:00',
        },
        planReminders: {
          enabled: true,
          time: '10:00',
        },
        breathingReminders: {
          enabled: true,
          time: '14:00',
        },
        milestones: {
          enabled: true,
        },
        weeklySummary: {
          enabled: true,
          dayOfWeek: 0,
          time: '18:00',
        },
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
        },
        timezone: 'UTC',
      });
    }

    return prefs.toDto();
  }

  /**
   * Update notification preferences
   */
  public static async updatePreferences(
    userId: string,
    data: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> {
    const userObjectId = new Types.ObjectId(userId);

    let prefs = await NotificationPreferencesModel.findOne({ userId: userObjectId });
    if (!prefs) {
      prefs = new NotificationPreferencesModel({ userId: userObjectId });
    }

    if (data.masterEnabled !== undefined) prefs.masterEnabled = data.masterEnabled;
    if (data.timezone !== undefined) prefs.timezone = data.timezone;

    if (data.dailyWellness) {
      prefs.dailyWellness = {
        ...prefs.dailyWellness,
        ...data.dailyWellness,
      };
    }

    if (data.moodCheckin) {
      prefs.moodCheckin = {
        ...prefs.moodCheckin,
        ...data.moodCheckin,
      };
    }

    if (data.planReminders) {
      prefs.planReminders = {
        ...prefs.planReminders,
        ...data.planReminders,
      };
    }

    if (data.breathingReminders) {
      prefs.breathingReminders = {
        ...prefs.breathingReminders,
        ...data.breathingReminders,
      };
    }

    if (data.milestones) {
      prefs.milestones = {
        ...prefs.milestones,
        ...data.milestones,
      };
    }

    if (data.weeklySummary) {
      prefs.weeklySummary = {
        ...prefs.weeklySummary,
        ...data.weeklySummary,
      };
    }

    if (data.quietHours) {
      prefs.quietHours = {
        ...prefs.quietHours,
        ...data.quietHours,
      };
    }

    await prefs.save();
    return prefs.toDto();
  }

  /**
   * Register or refresh a push notification device token
   */
  public static async registerDevice(
    userId: string,
    data: DeviceRegistrationDto,
  ): Promise<UserDevice> {
    const userObjectId = new Types.ObjectId(userId);

    const device = await DeviceModel.findOneAndUpdate(
      { userId: userObjectId, token: data.token.trim() },
      {
        $set: {
          platform: data.platform,
          deviceId: data.deviceId?.trim(),
          deviceName: data.deviceName?.trim(),
          appVersion: data.appVersion?.trim(),
          isActive: true,
          lastRegisteredAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return device.toDto();
  }

  /**
   * Remove a registered device token
   */
  public static async removeDevice(userId: string, idOrToken: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);

    if (Types.ObjectId.isValid(idOrToken)) {
      await DeviceModel.deleteOne({ _id: new Types.ObjectId(idOrToken), userId: userObjectId });
    } else {
      await DeviceModel.deleteOne({ token: idOrToken, userId: userObjectId });
    }
  }

  /**
   * List active devices for a user
   */
  public static async getUserDevices(userId: string): Promise<UserDevice[]> {
    const devices = await DeviceModel.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });
    return devices.map((d) => d.toDto());
  }

  /**
   * Retrieve paginated notification inbox
   */
  public static async getNotifications(
    userId: string,
    rawPage?: unknown,
    rawLimit?: unknown,
    type?: string,
    status?: string,
  ): Promise<{ data: SolaceNotification[]; meta: PaginationMeta }> {
    const { page, limit, skip } = parsePagination(rawPage, rawLimit);
    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    const [entries, total] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      NotificationModel.countDocuments(filter),
    ]);

    const meta = buildPaginationMeta(total, page, limit);
    return {
      data: entries.map((e: INotificationDocument) => e.toDto()),
      meta,
    };
  }

  /**
   * Get unread notification count
   */
  public static async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      status: { $in: ['pending', 'sent'] },
    });
  }

  /**
   * Mark a specific notification as read
   */
  public static async markAsRead(userId: string, notificationId: string): Promise<SolaceNotification> {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw AppError.badRequest('Invalid notification ID format');
    }

    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw AppError.notFound('Notification not found');
    }

    assertOwnership(notification.userId.toString(), userId, 'Notification');

    notification.status = 'read';
    await notification.save();
    return notification.toDto();
  }

  /**
   * Mark all unread notifications as read
   */
  public static async markAllAsRead(userId: string): Promise<number> {
    const res = await NotificationModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        status: { $in: ['pending', 'sent'] },
      },
      {
        $set: { status: 'read' },
      },
    );
    return res.modifiedCount;
  }

  /**
   * Delete a notification from inbox
   */
  public static async deleteNotification(userId: string, notificationId: string): Promise<void> {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw AppError.badRequest('Invalid notification ID format');
    }

    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw AppError.notFound('Notification not found');
    }

    assertOwnership(notification.userId.toString(), userId, 'Notification');

    await NotificationModel.findByIdAndDelete(notificationId);
  }

  /**
   * List scheduled reminders for a user
   */
  public static async getReminders(userId: string): Promise<ScheduledReminder[]> {
    const reminders = await ReminderModel.find({
      userId: new Types.ObjectId(userId),
    }).sort({ time: 1 });
    return reminders.map((r) => r.toDto());
  }

  /**
   * Create a new scheduled reminder
   */
  public static async createReminder(
    userId: string,
    data: CreateReminderDto,
  ): Promise<ScheduledReminder> {
    const userObjectId = new Types.ObjectId(userId);

    // Prevent duplicate reminders with the same type and time
    const existing = await ReminderModel.findOne({
      userId: userObjectId,
      type: data.type,
      time: data.time,
    });
    if (existing) {
      throw AppError.conflict('A reminder of this type is already scheduled for this time');
    }

    const defaultTitleMap: Record<NotificationType, string> = {
      daily_wellness: 'Mindful Moment',
      mood_checkin: 'Mood Check-in',
      checkin: 'Emotional Check-in',
      plan_task: 'Wellness Plan',
      breathing: 'Breath Pause',
      streak_alert: 'Milestone Celebrated',
      achievement: 'Achievement Unlocked',
      weekly_summary: 'Weekly Wellness Rhythm',
      reminder: 'Sanctuary Reminder',
      affirmation: 'Daily Affirmation',
      system: 'Solace Update',
    };

    const defaultMessageMap: Record<NotificationType, string> = {
      daily_wellness: 'Take a moment for yourself today. Your wellness journey matters.',
      mood_checkin: 'How are you feeling right now? Take a gentle moment to check in.',
      checkin: 'A safe space to honor your feelings today.',
      plan_task: 'A gentle reminder of your daily wellness practice.',
      breathing: 'A brief pause to breathe and ground yourself.',
      streak_alert: 'Every step you take towards calm is worth honoring.',
      achievement: 'You have nurtured a new milestone in your wellness journey.',
      weekly_summary: 'Your weekly reflection is ready in Solace AI.',
      reminder: 'A quiet pause awaits you in your sanctuary.',
      affirmation: 'A gentle thought to accompany your day.',
      system: 'A message from Solace AI.',
    };

    const reminder = await ReminderModel.create({
      userId: userObjectId,
      type: data.type,
      title: data.title?.trim() || defaultTitleMap[data.type] || 'Sanctuary Reminder',
      message: data.message?.trim() || defaultMessageMap[data.type] || 'A quiet pause awaits you.',
      time: data.time,
      daysOfWeek: data.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
      deepLink: data.deepLink,
      relatedResourceId: data.relatedResourceId,
      isEnabled: true,
    });

    return reminder.toDto();
  }

  /**
   * Update an existing scheduled reminder
   */
  public static async updateReminder(
    userId: string,
    reminderId: string,
    data: UpdateReminderDto,
  ): Promise<ScheduledReminder> {
    if (!Types.ObjectId.isValid(reminderId)) {
      throw AppError.badRequest('Invalid reminder ID format');
    }

    const reminder = await ReminderModel.findById(reminderId);
    if (!reminder) {
      throw AppError.notFound('Reminder not found');
    }

    assertOwnership(reminder.userId.toString(), userId, 'Reminder');

    if (data.title !== undefined) reminder.title = data.title.trim();
    if (data.message !== undefined) reminder.message = data.message.trim();
    if (data.time !== undefined) reminder.time = data.time;
    if (data.daysOfWeek !== undefined) reminder.daysOfWeek = data.daysOfWeek;
    if (data.deepLink !== undefined) reminder.deepLink = data.deepLink;
    if (data.relatedResourceId !== undefined) reminder.relatedResourceId = data.relatedResourceId;
    if (data.isEnabled !== undefined) reminder.isEnabled = data.isEnabled;

    await reminder.save();
    return reminder.toDto();
  }

  /**
   * Delete a reminder
   */
  public static async deleteReminder(userId: string, reminderId: string): Promise<void> {
    if (!Types.ObjectId.isValid(reminderId)) {
      throw AppError.badRequest('Invalid reminder ID format');
    }

    const reminder = await ReminderModel.findById(reminderId);
    if (!reminder) {
      throw AppError.notFound('Reminder not found');
    }

    assertOwnership(reminder.userId.toString(), userId, 'Reminder');

    await ReminderModel.findByIdAndDelete(reminderId);
  }

  /**
   * Create and dispatch a notification if user preferences allow it
   */
  public static async createNotification(options: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    channelId?: string;
    deepLink?: string;
    relatedResourceId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<SolaceNotification | null> {
    const prefs = await NotificationPreferencesModel.findOne({
      userId: new Types.ObjectId(options.userId),
    });

    if (prefs) {
      if (!prefs.masterEnabled) {
        return null;
      }
      if (options.type === 'daily_wellness' && !prefs.dailyWellness?.enabled) return null;
      if (
        (options.type === 'mood_checkin' || options.type === 'checkin') &&
        !prefs.moodCheckin?.enabled
      )
        return null;
      if (options.type === 'plan_task' && !prefs.planReminders?.enabled) return null;
      if (options.type === 'breathing' && !prefs.breathingReminders?.enabled) return null;
      if (
        (options.type === 'streak_alert' || options.type === 'achievement') &&
        !prefs.milestones?.enabled
      )
        return null;
      if (options.type === 'weekly_summary' && !prefs.weeklySummary?.enabled) return null;
    }

    return this.dispatchNotification(
      options.userId,
      options.type,
      options.title,
      options.message,
      options.deepLink,
      options.relatedResourceId,
      options.metadata,
    );
  }

  /**
   * Dispatch a notification to user's inbox and active push devices
   */
  public static async dispatchNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    deepLink?: string,
    relatedResourceId?: string,
    metadata?: Record<string, unknown>,
  ): Promise<SolaceNotification> {
    const userObjectId = new Types.ObjectId(userId);

    // 1. Create inbox notification entry
    const notification = await NotificationModel.create({
      userId: userObjectId,
      type,
      title,
      message,
      status: 'sent',
      sentAt: new Date(),
      deepLink,
      relatedResourceId,
      metadata,
    });

    // 2. Query active registered devices
    const devices = await DeviceModel.find({
      userId: userObjectId,
      isActive: true,
    });

    if (devices.length > 0) {
      const payloads = devices.map((d) => ({
        to: d.token,
        title,
        body: message,
        data: {
          notificationId: notification._id.toString(),
          type,
          deepLink: deepLink || '/(home)',
          relatedResourceId,
        },
        sound: 'default' as const,
        priority: 'high' as const,
        channelId: type === 'mood_checkin' ? 'reminders' : 'default',
      }));

      // Non-blocking push delivery
      NotificationDeliveryService.sendPushBatch(payloads).catch((err) => {
        logger.error('Error dispatching push notifications:', err);
      });
    }

    return notification.toDto();
  }
}
