/**
 * Core mood categories supported by Solace AI
 */
export type MoodCategory =
  'ecstatic' | 'happy' | 'calm' | 'neutral' | 'anxious' | 'sad' | 'exhausted' | 'frustrated';

/**
 * Basic Mood Entry Contract
 */
export interface MoodEntryContract {
  id: string;
  userId: string;
  category: MoodCategory;
  score: number; // 1 to 10
  tags: string[];
  note?: string;
  createdAt: string;
}
