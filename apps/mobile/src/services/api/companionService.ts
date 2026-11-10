import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  CompanionSettings,
  UpdateCompanionSettingsDto,
} from '@solace/shared';

export const companionService = {
  /**
   * Fetch companion settings for authenticated user
   */
  async getSettings(): Promise<CompanionSettings> {
    const res = await apiClient.get<ApiResponse<CompanionSettings>>(
      API_ROUTES.COMPANION.SETTINGS,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to retrieve companion settings');
    }
    return res.data.data;
  },

  /**
   * Update companion settings
   */
  async updateSettings(dto: UpdateCompanionSettingsDto): Promise<CompanionSettings> {
    const res = await apiClient.patch<ApiResponse<CompanionSettings>>(
      API_ROUTES.COMPANION.SETTINGS,
      dto,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update companion settings');
    }
    return res.data.data;
  },

  /**
   * Check companion AI status and readiness
   */
  async getStatus(): Promise<{ isOnline: boolean; model: string; latencyMs?: number }> {
    const res = await apiClient.get<
      ApiResponse<{ isOnline: boolean; model: string; latencyMs?: number }>
    >(API_ROUTES.COMPANION.STATUS);
    return res.data.data || { isOnline: false, model: 'unknown' };
  },
};

