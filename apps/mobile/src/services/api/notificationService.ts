import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  SolaceNotification,
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
  DeviceRegistrationDto,
  UserDevice,
  ScheduledReminder,
  CreateReminderDto,
  UpdateReminderDto,
  PaginationMeta,
} from '@solace/shared';

export const notificationService = {
  /**
   * Get count of unread notifications for authenticated user
   */
  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
        API_ROUTES.NOTIFICATIONS.UNREAD_COUNT,
      );
      return res.data.data?.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  /**
   * Get paginated notifications inbox
   */
  async getNotifications(
    page = 1,
    limit = 20,
    type?: string,
    status?: string,
  ): Promise<{ data: SolaceNotification[]; meta: PaginationMeta }> {
    const res = await apiClient.get<
      ApiResponse<SolaceNotification[]> & { meta: PaginationMeta }
    >(API_ROUTES.NOTIFICATIONS.BASE, {
      params: { page, limit, type, status },
    });
    return {
      data: res.data.data || [],
      meta: res.data.meta!,
    };
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<SolaceNotification> {
    const res = await apiClient.patch<ApiResponse<SolaceNotification>>(
      API_ROUTES.NOTIFICATIONS.READ(id),
    );
    return res.data.data!;
  },

  /**
   * Mark all unread notifications as read
   */
  async markAllAsRead(): Promise<number> {
    const res = await apiClient.patch<ApiResponse<{ updatedCount: number }>>(
      API_ROUTES.NOTIFICATIONS.READ_ALL,
    );
    return res.data.data?.updatedCount || 0;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(API_ROUTES.NOTIFICATIONS.DETAIL(id));
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const res = await apiClient.get<ApiResponse<NotificationPreferences>>(
      API_ROUTES.NOTIFICATIONS.PREFERENCES,
    );
    return res.data.data!;
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(
    data: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferences> {
    const res = await apiClient.patch<ApiResponse<NotificationPreferences>>(
      API_ROUTES.NOTIFICATIONS.PREFERENCES,
      data,
    );
    return res.data.data!;
  },

  /**
   * Register a push notification device token
   */
  async registerDevice(data: DeviceRegistrationDto): Promise<UserDevice> {
    const res = await apiClient.post<ApiResponse<UserDevice>>(
      API_ROUTES.NOTIFICATIONS.DEVICES_REGISTER,
      data,
    );
    return res.data.data!;
  },

  /**
   * Remove a registered device
   */
  async removeDevice(id: string): Promise<void> {
    await apiClient.delete(API_ROUTES.NOTIFICATIONS.DEVICES_REMOVE(id));
  },

  /**
   * Get scheduled reminders
   */
  async getReminders(): Promise<ScheduledReminder[]> {
    const res = await apiClient.get<ApiResponse<ScheduledReminder[]>>(
      API_ROUTES.NOTIFICATIONS.REMINDERS,
    );
    return res.data.data || [];
  },

  /**
   * Create a scheduled reminder
   */
  async createReminder(data: CreateReminderDto): Promise<ScheduledReminder> {
    const res = await apiClient.post<ApiResponse<ScheduledReminder>>(
      API_ROUTES.NOTIFICATIONS.REMINDERS,
      data,
    );
    return res.data.data!;
  },

  /**
   * Update a scheduled reminder
   */
  async updateReminder(
    id: string,
    data: UpdateReminderDto,
  ): Promise<ScheduledReminder> {
    const res = await apiClient.patch<ApiResponse<ScheduledReminder>>(
      API_ROUTES.NOTIFICATIONS.REMINDER_DETAIL(id),
      data,
    );
    return res.data.data!;
  },

  /**
   * Delete a scheduled reminder
   */
  async deleteReminder(id: string): Promise<void> {
    await apiClient.delete(API_ROUTES.NOTIFICATIONS.REMINDER_DETAIL(id));
  },
};
