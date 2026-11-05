import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  AuthResponse,
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateProfileDto,
  UserProfile,
} from '@solace/shared';

export const authService = {
  /**
   * Register a new account
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(API_ROUTES.AUTH.REGISTER, data);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Registration failed');
    }
    return res.data.data;
  },

  /**
   * Log into an existing account
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(API_ROUTES.AUTH.LOGIN, data);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Sign in failed');
    }
    return res.data.data;
  },

  /**
   * Refresh session tokens
   */
  async refresh(data: RefreshTokenDto): Promise<AuthResponse> {
    const res = await apiClient.post<ApiResponse<AuthResponse>>(API_ROUTES.AUTH.REFRESH, data);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Refresh failed');
    }
    return res.data.data;
  },

  /**
   * Logout and invalidate session
   */
  async logout(refreshToken?: string): Promise<void> {
    try {
      await apiClient.post(API_ROUTES.AUTH.LOGOUT, { refreshToken });
    } catch {
      // Ignore network errors during logout
    }
  },

  /**
   * Request password reset instructions
   */
  async forgotPassword(data: ForgotPasswordDto): Promise<string> {
    const res = await apiClient.post<ApiResponse<null>>(API_ROUTES.AUTH.FORGOT_PASSWORD, data);
    return res.data.message || 'Reset instructions sent.';
  },

  /**
   * Complete password reset with code/token
   */
  async resetPassword(data: ResetPasswordDto): Promise<string> {
    const res = await apiClient.post<ApiResponse<null>>(API_ROUTES.AUTH.RESET_PASSWORD, data);
    return res.data.message || 'Password reset successfully.';
  },

  /**
   * Fetch authenticated user's profile
   */
  async getMe(): Promise<UserProfile> {
    const res = await apiClient.get<ApiResponse<UserProfile>>(API_ROUTES.AUTH.ME);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch user profile');
    }
    return res.data.data;
  },

  /**
   * Update authenticated user's profile
   */
  async updateMe(data: UpdateProfileDto): Promise<UserProfile> {
    const res = await apiClient.patch<ApiResponse<UserProfile>>(API_ROUTES.AUTH.ME, data);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update user profile');
    }
    return res.data.data;
  },

  /**
   * Delete account permanently
   */
  async deleteMe(): Promise<void> {
    await apiClient.delete(API_ROUTES.AUTH.ME);
  },
};
