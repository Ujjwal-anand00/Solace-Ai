/**
 * Journal Categories supported in Solace AI
 */
export type JournalCategory =
  | 'free_write'
  | 'guided_reflection'
  | 'gratitude'
  | 'emotional_checkin'
  | 'mindful_observation'
  | 'self_discovery'
  | 'stress_release';

/**
 * Prompt Categories
 */
export type PromptCategory =
  | 'gratitude'
  | 'reflection'
  | 'emotions'
  | 'growth'
  | 'calm'
  | 'relationships';

/**
 * Journal Prompt Contract
 */
export interface JournalPrompt {
  id: string;
  category: PromptCategory;
  text: string;
  subtext?: string;
  tags?: string[];
}

/**
 * AI Reflection Insight Contract
 */
export interface JournalAiInsight {
  theme: string;
  reflection: string;
  suggestedAction?: string;
  affirmingThought?: string;
  sentimentTone?: 'uplifting' | 'gentle' | 'neutral' | 'introspective';
  createdAt: string;
}

/**
 * Journal Entry Interface
 */
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: JournalCategory;
  prompt?: string;
  promptId?: string;
  moodAssociation?: string;
  moodIntensity?: number;
  emotions?: string[];
  gratitudeItems?: string[];
  tags: string[];
  isFavorite: boolean;
  isDraft: boolean;
  aiConsentGranted: boolean;
  aiInsight?: JournalAiInsight;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload to create a new journal entry
 */
export interface CreateJournalDto {
  title: string;
  content: string;
  category?: JournalCategory;
  prompt?: string;
  promptId?: string;
  moodAssociation?: string;
  moodIntensity?: number;
  emotions?: string[];
  gratitudeItems?: string[];
  tags?: string[];
  isFavorite?: boolean;
  isDraft?: boolean;
  aiConsentGranted?: boolean;
}

/**
 * Payload to update a journal entry
 */
export interface UpdateJournalDto {
  title?: string;
  content?: string;
  category?: JournalCategory;
  prompt?: string;
  promptId?: string;
  moodAssociation?: string;
  moodIntensity?: number;
  emotions?: string[];
  gratitudeItems?: string[];
  tags?: string[];
  isFavorite?: boolean;
  isDraft?: boolean;
  aiConsentGranted?: boolean;
}

/**
 * Request payload to request AI reflection on a journal entry
 */
export interface GenerateJournalInsightDto {
  consent: boolean;
}

/**
 * Calendar Entry Day for Journal
 */
export interface JournalCalendarDay {
  date: string; // YYYY-MM-DD
  count: number;
  entries: Array<{
    id: string;
    title: string;
    category: JournalCategory;
    isFavorite: boolean;
  }>;
}

/**
 * Journal Statistics Summary
 */
export interface JournalStats {
  totalEntries: number;
  totalWords: number;
  favoriteCount: number;
  categoryBreakdown: Record<string, number>;
  activeDaysCount: number;
  currentStreak: number;
  longestStreak: number;
}
