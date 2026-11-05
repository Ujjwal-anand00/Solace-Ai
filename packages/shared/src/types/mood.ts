/**
 * Core mood categories supported by Solace AI
 */
export type MoodCategory =
  | 'ecstatic'
  | 'happy'
  | 'calm'
  | 'neutral'
  | 'anxious'
  | 'sad'
  | 'exhausted'
  | 'frustrated';

/**
 * Full Mood Entry Contract
 */
export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodCategory | string;
  moodIntensity: number; // 1 to 10
  emotions: string[];
  note?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Backwards compatibility alias
 */
export type MoodEntryContract = MoodEntry;

/**
 * Payload to create a new mood check-in
 */
export interface CreateMoodDto {
  mood: MoodCategory | string;
  moodIntensity: number;
  emotions?: string[];
  note?: string;
  tags?: string[];
}

/**
 * Payload to update an existing mood check-in
 */
export interface UpdateMoodDto {
  mood?: MoodCategory | string;
  moodIntensity?: number;
  emotions?: string[];
  note?: string;
  tags?: string[];
}

/**
 * Aggregated summary statistics for mood history
 */
export interface MoodSummary {
  totalEntries: number;
  averageIntensity: number;
  dominantMood: string;
  topEmotions: Array<{ emotion: string; count: number }>;
  recentTrend: Array<{ date: string; averageIntensity: number; count: number }>;
  moodDistribution?: Record<string, number>;
  checkInStreak?: number;
}

/**
 * Calendar day item representing mood records on a date
 */
export interface MoodCalendarDay {
  date: string; // YYYY-MM-DD
  hasCheckIn: boolean;
  count: number;
  dominantMood?: string;
  averageIntensity?: number;
  entries: MoodEntry[];
}

/**
 * Single rule-based supportive mood insight
 */
export interface MoodInsightItem {
  id: string;
  type: 'consistency' | 'trend' | 'emotion' | 'tag' | 'encouragement';
  title: string;
  description: string;
  icon?: string;
}

/**
 * Response for mood insights including optional safety guidance
 */
export interface MoodInsightsResponse {
  insights: MoodInsightItem[];
  safetySupport?: {
    recommended: boolean;
    message: string;
    resources: Array<{ name: string; contact: string; description: string }>;
  };
}
