import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  MoodEntry,
  CreateMoodDto,
  UpdateMoodDto,
  MoodSummary,
  PaginationMeta,
} from '@solace/shared';

export interface MoodListResponse {
  data: MoodEntry[];
  meta: PaginationMeta;
}

export const moodService = {
  /**
   * Fetch paginated mood check-in records for authenticated user
   */
  async getMoods(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<MoodListResponse> {
    const res = await apiClient.get<ApiResponse<MoodEntry[]> & { meta: PaginationMeta }>(
      API_ROUTES.MOOD.BASE,
      { params },
    );
    return {
      data: res.data.data || [],
      meta: res.data.meta,
    };
  },

  /**
   * Fetch a single mood check-in entry by ID
   */
  async getMoodById(id: string): Promise<MoodEntry> {
    const res = await apiClient.get<ApiResponse<MoodEntry>>(`${API_ROUTES.MOOD.BASE}/${id}`);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Mood entry not found');
    }
    return res.data.data;
  },

  /**
   * Create a new mood check-in
   */
  async createMood(data: CreateMoodDto): Promise<MoodEntry> {
    const res = await apiClient.post<ApiResponse<MoodEntry>>(API_ROUTES.MOOD.BASE, data);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to record mood');
    }
    return res.data.data;
  },

  /**
   * Update an existing mood check-in
   */
  async updateMood(id: string, data: UpdateMoodDto): Promise<MoodEntry> {
    const res = await apiClient.patch<ApiResponse<MoodEntry>>(`${API_ROUTES.MOOD.BASE}/${id}`, data);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update mood');
    }
    return res.data.data;
  },

  /**
   * Delete a mood entry
   */
  async deleteMood(id: string): Promise<void> {
    await apiClient.delete(`${API_ROUTES.MOOD.BASE}/${id}`);
  },

  /**
   * Get 30-day aggregated mood statistics and trends
   */
  async getMoodSummary(): Promise<MoodSummary> {
    const res = await apiClient.get<ApiResponse<MoodSummary>>(API_ROUTES.MOOD.SUMMARY);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch mood summary');
    }
    return res.data.data;
  },
};

