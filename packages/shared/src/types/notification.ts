/**
 * Notification, Reminder, Device, and Preferences types
 */

export type NotificationType =
  | 'reminder'
  | 'daily_wellness'
  | 'mood_checkin'
  | 'checkin'
  | 'plan_task'
  | 'breathing'
  | 'streak_alert'
  | 'achievement'
  | 'weekly_summary'
  | 'affirmation'
  | 'system';

export type NotificationStatus = 'pending' | 'sent' | 'read' | 'failed' | 'cancelled';

export interface SolaceNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  scheduledAt?: string;
  sentAt?: string;
  status: NotificationStatus;
  relatedResourceId?: string;
  deepLink?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationQuietHours {
  enabled: boolean;
  startTime: string; // HH:mm 24-hr format (e.g. "22:00")
  endTime: string; // HH:mm 24-hr format (e.g. "08:00")
}

export interface NotificationPreferences {
  userId: string;
  masterEnabled: boolean;
  dailyWellness: {
    enabled: boolean;
    time: string; // "09:00"
    days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  };
  moodCheckin: {
    enabled: boolean;
    time: string; // "20:00"
  };
  planReminders: {
    enabled: boolean;
    time?: string;
  };
  breathingReminders: {
    enabled: boolean;
    time?: string;
    preferredActivityId?: string;
  };
  milestones: {
    enabled: boolean;
  };
  weeklySummary: {
    enabled: boolean;
    dayOfWeek: number; // 0=Sun
    time: string; // "18:00"
  };
  quietHours: NotificationQuietHours;
  timezone: string;
  updatedAt: string;
}

export type UpdateNotificationPreferencesDto = Partial<{
  masterEnabled: boolean;
  dailyWellness: Partial<NotificationPreferences['dailyWellness']>;
  moodCheckin: Partial<NotificationPreferences['moodCheckin']>;
  planReminders: Partial<NotificationPreferences['planReminders']>;
  breathingReminders: Partial<NotificationPreferences['breathingReminders']>;
  milestones: Partial<NotificationPreferences['milestones']>;
  weeklySummary: Partial<NotificationPreferences['weeklySummary']>;
  quietHours: Partial<NotificationQuietHours>;
  timezone: string;
}>;

export type DevicePlatform = 'ios' | 'android' | 'web';

export interface DeviceRegistrationDto {
  token: string;
  platform: DevicePlatform;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
}

export interface UserDevice {
  id: string;
  userId: string;
  token: string;
  platform: DevicePlatform;
  deviceId?: string;
  deviceName?: string;
  appVersion?: string;
  isActive: boolean;
  lastRegisteredAt: string;
  createdAt: string;
}

export interface ScheduledReminder {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string; // "HH:mm"
  daysOfWeek: number[]; // 0-6
  deepLink?: string;
  relatedResourceId?: string;
  isEnabled: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderDto {
  type: NotificationType;
  title?: string;
  message?: string;
  time: string; // "HH:mm"
  daysOfWeek?: number[];
  deepLink?: string;
  relatedResourceId?: string;
}

export interface UpdateReminderDto {
  title?: string;
  message?: string;
  time?: string;
  daysOfWeek?: number[];
  deepLink?: string;
  relatedResourceId?: string;
  isEnabled?: boolean;
}

export interface PushDeliveryTicket {
  ticketId?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded' | string };
}
