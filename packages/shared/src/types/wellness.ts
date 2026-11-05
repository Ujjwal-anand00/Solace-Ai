/**
 * Wellness exercise category types
 */
export type WellnessCategory =
  'breathing' | 'meditation' | 'journaling' | 'grounding' | 'affirmation';

/**
 * Exercise summary outline
 */
export interface WellnessExerciseSummary {
  id: string;
  title: string;
  category: WellnessCategory;
  durationMinutes: number;
  description: string;
}
