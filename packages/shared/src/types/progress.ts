/**
 * User Progress, Streaks, Analytics, and Reports types
 */

export type ProgressPeriod = 'week' | 'month' | 'all';

export interface UserProgress {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalActivities: number;
  totalMoodCheckIns: number;
  totalJournalEntries: number;
  totalBreathingSessions: number;
  totalPlanTasksCompleted: number;
  totalAssessmentsCompleted: number;
  activeDaysCount: number;
  earnedAchievements: string[];
  lastActivityDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressHistoryItem {
  date: string; // YYYY-MM-DD
  activitiesCompleted: number;
  moodLogged: boolean;
  journalWritten: boolean;
  breathingMinutes: number;
}

export interface ProgressSummary {
  period: ProgressPeriod;
  activeDays: number;
  moodCheckIns: number;
  averageMoodIntensity: number;
  topMood?: string;
  activitiesCompleted: number;
  breathingMinutes: number;
  planTasksCompleted: number;
  assessmentsCompleted: number;
}

export interface ProgressTrendPoint {
  date: string;
  label: string; // e.g. "Mon", "Tue" or "Nov 1"
  moodIntensity: number | null;
  activitiesCount: number;
  planTasksCount: number;
  breathingMinutes: number;
}

export interface ProgressTrends {
  period: 'week' | 'month';
  points: ProgressTrendPoint[];
}

export type TimelineActivityType =
  | 'mood'
  | 'breathing'
  | 'activity'
  | 'journal'
  | 'plan_task'
  | 'assessment';

export interface ActivityTimelineItem {
  id: string;
  type: TimelineActivityType;
  title: string;
  description?: string;
  category: string;
  timestamp: string;
  durationSeconds?: number;
  details?: Record<string, unknown>;
}

export interface StreakCalendarDay {
  date: string; // YYYY-MM-DD
  dayName: string; // e.g. "Mon"
  isActive: boolean;
  isToday: boolean;
}

export interface StreakDetails {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  activeDaysCount: number;
  weeklyCalendar: StreakCalendarDay[];
  encouragingMessage: string;
}

export interface WeeklyWellnessReport {
  periodStart: string;
  periodEnd: string;
  totalActiveDays: number;
  moodCheckIns: number;
  mostFrequentMood?: string;
  averageMoodIntensity: number;
  completedActivities: number;
  breathingSessions: number;
  planTasksCompleted: number;
  observations: string[];
  hasSufficientData: boolean;
}

export interface MonthlyWellnessReport {
  month: string;
  totalActiveDays: number;
  totalSessions: number;
  moodDistribution: Record<string, number>;
  mostUsedActivities: Array<{ title: string; count: number }>;
  streakPerformance: {
    currentStreak: number;
    longestStreak: number;
    consistencyRate: number; // 0 to 100 percentage of month
  };
  achievementsEarned: string[];
  comparisonWithPreviousPeriod?: {
    activeDaysDiff: number;
    activitiesDiff: number;
  };
  observations: string[];
  hasSufficientData: boolean;
}
