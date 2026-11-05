import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  PersonalizedRecommendation,
} from '@solace/shared';

export const recommendationService = {
  /**
   * Fetch context-aware personalized wellness recommendations
   */
  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendation[]> {
    const res = await apiClient.get<ApiResponse<PersonalizedRecommendation[]>>(
      API_ROUTES.WELLNESS_PLANS.RECOMMENDATIONS,
    );
    return res.data.data || [];
  },
};

