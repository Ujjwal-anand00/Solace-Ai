import { authService } from './authService';
import { UserProfile, UpdateProfileDto } from '@solace/shared';

/**
 * User Service - Reuses the canonical /api/v1/auth/me endpoints without duplication
 */
export const userService = {
  /**
   * Get authenticated user's full profile
   */
  async getProfile(): Promise<UserProfile> {
    return authService.getMe();
  },

  /**
   * Update profile fields (name, goals, notifications, theme)
   */
  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    return authService.updateMe(data);
  },

  /**
   * Permanently delete user account and invalidate session
   */
  async deleteAccount(): Promise<void> {
    return authService.deleteMe();
  },
};
