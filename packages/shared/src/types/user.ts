/**
 * Core User Profile representation
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
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
