import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  WellnessActivity,
  ActivityCompletion,
  CompleteActivityDto,
  PaginationMeta,
} from '@solace/shared';

export interface ActivityHistoryResponse {
  data: ActivityCompletion[];
  meta: PaginationMeta;
}

export const activityService = {
  /**
   * Fetch all active activities with optional category, difficulty, or search filter
   */
  async getActivities(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
  }): Promise<WellnessActivity[]> {
    const res = await apiClient.get<ApiResponse<WellnessActivity[]>>(API_ROUTES.ACTIVITIES.BASE, {
      params,
    });
    return res.data.data || [];
  },

  /**
   * Fetch a single activity by ID
   */
  async getActivityById(id: string): Promise<WellnessActivity> {
    const res = await apiClient.get<ApiResponse<WellnessActivity>>(
      `${API_ROUTES.ACTIVITIES.BASE}/${id}`,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Activity not found');
    }
    return res.data.data;
  },

  /**
   * Record completion of an activity
   */
  async completeActivity(id: string, dto: CompleteActivityDto): Promise<ActivityCompletion> {
    const res = await apiClient.post<ApiResponse<ActivityCompletion>>(
      `${API_ROUTES.ACTIVITIES.BASE}/${id}/complete`,
      dto,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to complete activity');
    }
    return res.data.data;
  },

  /**
   * Fetch paginated history of completed activities for authenticated user
   */
  async getCompletedHistory(params?: {
    page?: number;
    limit?: number;
  }): Promise<ActivityHistoryResponse> {
    const res = await apiClient.get<ApiResponse<ActivityCompletion[]> & { meta: PaginationMeta }>(
      API_ROUTES.ACTIVITIES.COMPLETED_HISTORY,
      { params },
    );
    return {
      data: res.data.data || [],
      meta: res.data.meta,
    };
  },
};

