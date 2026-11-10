import { MoodCategory } from '@solace/shared';

export interface PrimaryMoodConfig {
  key: MoodCategory;
  label: string;
  emoji?: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const PRIMARY_MOODS: PrimaryMoodConfig[] = [
  {
    key: 'ecstatic',
    label: 'Amazing',
    description: 'Vibrant, joyful & uplifted',
    color: '#9678BD',
    bgColor: '#F5ECFF',
    borderColor: '#CBB3E8',
  },
  {
    key: 'happy',
    label: 'Good',
    description: 'Pleasant, content & positive',
    color: '#6B8E70',
    bgColor: '#EAF7EE',
    borderColor: '#D4FF3F',
  },
  {
    key: 'calm',
    label: 'Okay',
    description: 'Balanced, steady & reflective',
    color: '#7A7289',
    bgColor: '#F0EAF7',
    borderColor: '#CBB3E8',
  },
  {
    key: 'sad',
    label: 'Low',
    description: 'Heavy, sorrowful or depleted',
    color: '#68607A',
    bgColor: '#EDE8F5',
    borderColor: '#CBB3E8',
  },
  {
    key: 'anxious',
    label: 'Stressed',
    description: 'Tense, overwhelmed or restless',
    color: '#E34234',
    bgColor: '#FDF0EE',
    borderColor: '#F8D8D4',
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

