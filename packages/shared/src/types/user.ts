/**
 * User Notification Preferences
 */
export interface UserNotificationPreferences {
  dailyCheckIn: boolean;
  mindfulBreaths: boolean;
  affirmations: boolean;
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
  wellnessGoals: string[];
  onboardingCompleted: boolean;
  isEmailVerified: boolean;
  notificationPreferences: UserNotificationPreferences;
  themePreference: 'light' | 'dark' | 'system';
  createdAt: string;
  updatedAt: string;
}

/**
 * User Preferences
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
  voiceCompanionEnabled: boolean;
}
