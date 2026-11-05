/**
 * User Progress and Streak tracking
 */
export interface UserProgress {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalActivities: number;
  totalMoodCheckIns: number;
  totalJournalEntries: number;
  totalBreathingSessions: number;
  earnedAchievements: string[];
  lastActivityDate?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Daily Progress History Item
 */
export interface ProgressHistoryItem {
  date: string; // YYYY-MM-DD
  activitiesCompleted: number;
  moodLogged: boolean;
  journalWritten: boolean;
  breathingMinutes: number;
}
