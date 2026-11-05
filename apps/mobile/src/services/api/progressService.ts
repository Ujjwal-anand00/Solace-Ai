import { apiClient } from './apiClient';
import { API_ROUTES, ApiResponse, UserProgress, ProgressHistoryItem } from '@solace/shared';

export const progressService = {
  /**
   * Fetch current user's progress and streak metrics
   */
  async getProgress(): Promise<UserProgress> {
    const res = await apiClient.get<ApiResponse<UserProgress>>(API_ROUTES.PROGRESS.BASE);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch progress');
    }
    return res.data.data;
  },

  /**
   * Fetch 14-day history of activities, check-ins, and journals
   */
  async getProgressHistory(): Promise<ProgressHistoryItem[]> {
    const res = await apiClient.get<ApiResponse<ProgressHistoryItem[]>>(
      API_ROUTES.PROGRESS.HISTORY,
    );
    return res.data.data || [];
  },
};
