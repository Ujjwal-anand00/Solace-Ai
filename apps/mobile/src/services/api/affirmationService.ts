import { apiClient } from './apiClient';
import { API_ROUTES, ApiResponse, Affirmation } from '@solace/shared';

export const affirmationService = {
  /**
   * Fetch list of active affirmations
   */
  async getAffirmations(params?: {
    category?: string;
    tag?: string;
    language?: string;
  }): Promise<Affirmation[]> {
    const res = await apiClient.get<ApiResponse<Affirmation[]>>(API_ROUTES.AFFIRMATIONS.BASE, {
      params,
    });
    return res.data.data || [];
  },

  /**
   * Fetch today's deterministic daily affirmation
   */
  async getDailyAffirmation(params?: {
    category?: string;
    language?: string;
  }): Promise<Affirmation | null> {
    const res = await apiClient.get<ApiResponse<Affirmation | null>>(
      API_ROUTES.AFFIRMATIONS.DAILY,
      { params },
    );
    return res.data.data || null;
  },
};

