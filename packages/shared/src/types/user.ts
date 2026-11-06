/**
 * User Notification Preferences
 */
export interface UserNotificationPreferences {
  dailyCheckIn: boolean;
  mindfulBreaths: boolean;
  affirmations: boolean;
}

/**
 * User Wellness Routine & Preferences
 */
export interface UserWellnessPreferences {
  goals: string[];
  preferredActivityDurationMinutes: number; // 5, 10, 15, 20
  preferredCategories: string[];
  preferredDailyTime: string; // "08:00", "20:00"
  reminderDays: number[]; // 0=Sun..6=Sat
}

/**
 * User Accessibility Preferences
 */
export interface UserAccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  hapticFeedback: boolean;
  fontScale: number; // 1.0, 1.15, 1.3
}

/**
 * Core User Profile representation
 */
export interface UserProfile {
  id: string;
  name: string;
  preferredName?: string;
  email: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  bio?: string;
  timezone?: string;
  language?: 'en' | 'hi' | 'pa';
  wellnessGoals: string[];
  wellnessPreferences?: UserWellnessPreferences;
  accessibilityPreferences?: UserAccessibilityPreferences;
  onboardingCompleted: boolean;
  isEmailVerified: boolean;
  notificationPreferences: UserNotificationPreferences;
  themePreference: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}

/**
 * User Preferences contract
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
  voiceCompanionEnabled: boolean;
  wellnessPreferences: UserWellnessPreferences;
  accessibilityPreferences: UserAccessibilityPreferences;
}

/**
 * User Session summary for security dashboard
 */
export interface UserSessionInfo {
  id: string;
  userAgent?: string;
  ipAddress?: string;
  isCurrent: boolean;
  createdAt: string;
  expiresAt: string;
}

/**
 * Data export metadata
 */
export interface DataExportResponse {
  exportId: string;
  status: 'ready' | 'pending';
  generatedAt: string;
  expiresAt: string;
  downloadUrl?: string;
  data?: Record<string, unknown>;
}

/**
 * User Feedback submission DTO
 */
export interface CreateFeedbackDto {
  category: 'bug' | 'feature' | 'content' | 'general';
  message: string;
  rating?: number; // 1-5
}

/**
 * Password change DTO
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
