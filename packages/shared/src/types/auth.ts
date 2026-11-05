import { UserProfile, UserNotificationPreferences } from './user';

/**
 * Auth token payload structure (encoded within JWT access token)
 */
export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Authentication session tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
}

/**
 * Full Auth Response with Profile and Session Tokens
 */
export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

/**
 * Registration Request DTO
 */
export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  wellnessGoals?: string[];
  onboardingCompleted?: boolean;
  notificationPreferences?: Partial<UserNotificationPreferences>;
}

/**
 * Login Request DTO
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Refresh Token Request DTO
 */
export interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * Forgot Password Request DTO
 */
export interface ForgotPasswordDto {
  email: string;
}

/**
 * Reset Password Request DTO
 */
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

/**
 * Update Profile Request DTO
 */
export interface UpdateProfileDto {
  name?: string;
  preferredName?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  wellnessGoals?: string[];
  notificationPreferences?: Partial<UserNotificationPreferences>;
  themePreference?: 'light' | 'dark' | 'system';
}
