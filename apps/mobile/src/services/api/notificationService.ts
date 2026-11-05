import { apiClient } from './apiClient';
import { API_ROUTES, ApiResponse } from '@solace/shared';

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
};

