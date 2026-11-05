/**
 * Wellness exercise category types
 */
export type WellnessCategory =
  | 'breathing'
  | 'meditation'
  | 'journaling'
  | 'grounding'
  | 'affirmation'
  | 'movement';

export type ActivityDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Wellness Activity definition
 */
export interface WellnessActivity {
  id: string;
  title: string;
  description: string;
  category: WellnessCategory | string;
  duration: number; // in seconds
  difficulty: ActivityDifficulty;
  instructions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Exercise summary outline (backwards compatibility)
 */
export interface WellnessExerciseSummary {
  id: string;
  title: string;
  category: WellnessCategory;
  durationMinutes: number;
  description: string;
}

/**
 * User activity completion record
 */
export interface ActivityCompletion {
  id: string;
  userId: string;
  activityId: string;
  activity?: WellnessActivity;
  durationCompleted: number; // seconds
  completedAt: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for recording activity completion
 */
export interface CompleteActivityDto {
  durationCompleted: number;
  feedback?: string;
}

/**
 * Daily / Curated Affirmation
 */
export interface Affirmation {
  id: string;
  text: string;
  category: string;
  tags: string[];
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
