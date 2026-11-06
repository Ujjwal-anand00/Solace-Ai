import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  UserProfile,
  UpdateProfileDto,
  UserSessionInfo,
  DataExportResponse,
  CreateFeedbackDto,
  ChangePasswordDto,
} from '@solace/shared';

export const userService = {
  /**
   * Fetch authenticated user's profile
   */
  async getProfile(): Promise<UserProfile> {
    const res = await apiClient.get<ApiResponse<UserProfile>>(API_ROUTES.USERS.ME);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch user profile');
    }
    return res.data.data;
  },

  /**
   * Update profile information
   */
  async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    const res = await apiClient.patch<ApiResponse<UserProfile>>(API_ROUTES.USERS.ME, data);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update user profile');
    }
    return res.data.data;
  },

  /**
   * Update wellness or accessibility preferences
   */
  async updatePreferences(data: {
    wellnessPreferences?: Record<string, unknown>;
    accessibilityPreferences?: Record<string, unknown>;
    themePreference?: 'light' | 'dark' | 'system';
  }): Promise<UserProfile> {
    const res = await apiClient.patch<ApiResponse<UserProfile>>(
      API_ROUTES.USERS.PREFERENCES,
      data,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update preferences');
    }
    return res.data.data;
  },

  /**
   * Upload or update profile picture avatar
   */
  async uploadAvatar(avatarUrl: string): Promise<UserProfile> {
    const res = await apiClient.post<ApiResponse<UserProfile>>(API_ROUTES.USERS.AVATAR, {
      avatarUrl,
    });
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update avatar');
    }
    return res.data.data;
  },

  /**
   * Remove profile picture avatar
   */
  async removeAvatar(): Promise<UserProfile> {
    const res = await apiClient.delete<ApiResponse<UserProfile>>(API_ROUTES.USERS.AVATAR);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to remove avatar');
    }
    return res.data.data;
  },

  /**
   * Change account password
   */
  async changePassword(data: ChangePasswordDto): Promise<void> {
    await apiClient.post(API_ROUTES.USERS.CHANGE_PASSWORD, data);
  },

  /**
   * List active sessions
   */
  async getSessions(): Promise<UserSessionInfo[]> {
    const res = await apiClient.get<ApiResponse<UserSessionInfo[]>>(
      API_ROUTES.USERS.SESSIONS,
    );
    return res.data.data || [];
  },

  /**
   * Revoke specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(API_ROUTES.USERS.SESSION_DETAIL(sessionId));
  },

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    await apiClient.post(API_ROUTES.USERS.LOGOUT_ALL);
  },

  /**
   * Request full personal data export
   */
  async requestDataExport(): Promise<DataExportResponse> {
    const res = await apiClient.post<ApiResponse<DataExportResponse>>(
      API_ROUTES.USERS.DATA_EXPORT,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to generate data export');
    }
    return res.data.data;
  },

  /**
   * Get data export archive by ID
   */
  async getDataExport(id: string): Promise<DataExportResponse> {
    const res = await apiClient.get<ApiResponse<DataExportResponse>>(
      API_ROUTES.USERS.DATA_EXPORT_DETAIL(id),
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch data export');
    }
    return res.data.data;
  },

  /**
   * Submit app feedback
   */
  async submitFeedback(data: CreateFeedbackDto): Promise<void> {
    await apiClient.post(API_ROUTES.FEEDBACK.BASE, data);
  },

  /**
   * Delete account permanently
   */
  async deleteAccount(confirmation = 'DELETE', password?: string): Promise<void> {
    await apiClient.delete(API_ROUTES.USERS.ACCOUNT, {
      data: { confirmation, password },
    });
  },
};
