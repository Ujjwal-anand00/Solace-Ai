import { MoodCategory } from '@solace/shared';

export interface PrimaryMoodConfig {
  key: MoodCategory;
  label: string;
  emoji: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const PRIMARY_MOODS: PrimaryMoodConfig[] = [
  {
    key: 'ecstatic',
    label: 'Amazing',
    emoji: '😊',
    description: 'Vibrant, joyful & uplifted',
    color: '#D97706',
    bgColor: '#FEF9C3',
    borderColor: '#FDE047',
  },
  {
    key: 'happy',
    label: 'Good',
    emoji: '🙂',
    description: 'Pleasant, content & positive',
    color: '#15803D',
    bgColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  {
    key: 'calm',
    label: 'Okay',
    emoji: '😐',
    description: 'Balanced, steady & reflective',
    color: '#0369A1',
    bgColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  },
  {
    key: 'sad',
    label: 'Low',
    emoji: '😔',
    description: 'Heavy, sorrowful or depleted',
    color: '#7E22CE',
    bgColor: '#F3E8FF',
    borderColor: '#D8B4FE',
  },
  {
    key: 'anxious',
    label: 'Stressed',
    emoji: '😣',
    description: 'Tense, overwhelmed or restless',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
];

export const SECONDARY_EMOTIONS = [
  'Happy',
  'Calm',
  'Grateful',
  'Excited',
  'Anxious',
  'Overwhelmed',
  'Lonely',
  'Frustrated',
  'Sad',
  'Tired',
  'Motivated',
  'Confused',
  'Hopeful',
  'Peaceful',
] as const;

export type SecondaryEmotion = (typeof SECONDARY_EMOTIONS)[number];

export const CONTEXT_TAGS = [
  'Work',
  'Studies',
  'Relationships',
  'Family',
  'Health',
  'Sleep',
  'Personal growth',
  'Other',
] as const;

export type ContextTag = (typeof CONTEXT_TAGS)[number];

export const INTENSITY_LEVELS: Record<number, { label: string; description: string }> = {
  1: { label: 'Barely noticeable', description: 'A quiet, subtle whisper of feeling' },
  2: { label: 'Very gentle', description: 'Faint and softly present' },
  3: { label: 'Mild', description: 'Lightly noticeable in the background' },
  4: { label: 'Moderate-low', description: 'Perceptible and steady' },
  5: { label: 'Moderate', description: 'Balanced presence in your awareness' },
  6: { label: 'Moderate-high', description: 'Clearly influencing your thoughts' },
  7: { label: 'Strong', description: 'Prominent and actively felt' },
  8: { label: 'Very strong', description: 'Dominant emotional presence' },
  9: { label: 'Intense', description: 'Powerful and absorbing your focus' },
  10: { label: 'Peak intensity', description: 'Completely consuming your state' },
};

export interface MoodCheckInDraft {
  mood?: MoodCategory;
  moodIntensity: number;
  emotions: string[];
  note: string;
  tags: string[];
}

