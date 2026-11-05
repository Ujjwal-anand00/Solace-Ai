import { apiClient } from './apiClient';
import { API_ROUTES, ApiResponse, WellnessPlan } from '@solace/shared';

export const wellnessPlanService = {
  /**
   * Get user's current active wellness plan
   */
  async getCurrentPlan(): Promise<WellnessPlan | null> {
    const res = await apiClient.get<ApiResponse<WellnessPlan | null>>(
      API_ROUTES.WELLNESS_PLANS.CURRENT,
    );
    return res.data.data || null;
  },
};

