import { apiClient } from './apiClient';
import { API_ROUTES, ApiResponse, Achievement, UserAchievement } from '@solace/shared';

export const achievementService = {
  /**
   * Fetch all system achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const res = await apiClient.get<ApiResponse<Achievement[]>>(
      API_ROUTES.ACHIEVEMENTS.BASE,
    );
    return res.data.data || [];
  },

  /**
   * Fetch user's achievements with earned status and progress
   */
  async getMyAchievements(): Promise<UserAchievement[]> {
    const res = await apiClient.get<ApiResponse<UserAchievement[]>>(
      API_ROUTES.ACHIEVEMENTS.MINE,
    );
    return res.data.data || [];
  },

  /**
   * Fetch single achievement by ID
   */
  async getAchievementById(id: string): Promise<Achievement> {
    const res = await apiClient.get<ApiResponse<Achievement>>(
      API_ROUTES.ACHIEVEMENTS.DETAIL(id),
    );
    return res.data.data!;
  },
};

