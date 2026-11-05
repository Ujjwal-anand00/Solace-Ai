import { apiClient } from './apiClient';
import { API_ROUTES, ApiResponse, WellnessResource } from '@solace/shared';

export const resourceService = {
  /**
   * Fetch curated wellness and mental health resources
   */
  async getResources(category?: string): Promise<WellnessResource[]> {
    const res = await apiClient.get<ApiResponse<WellnessResource[]>>(API_ROUTES.RESOURCES.BASE, {
      params: category ? { category } : undefined,
    });
    return res.data.data || [];
  },
};

