export type MoodKey = 'ecstatic' | 'happy' | 'calm' | 'sad' | 'anxious';

export interface MoodCharacterConfig {
  key: MoodKey;
  id: string;
  label: string;
  description: string;
  emotionalState: string;
  primaryColor: string;
  surfaceColor: string;
  accentColor: string;
  glowColor: string;
  accessibleLabel: string;
}

export const MOOD_CONFIGS: Record<MoodKey, MoodCharacterConfig> = {
  ecstatic: {
    key: 'ecstatic',
    id: 'amazing',
    label: 'Amazing',
    description: 'Vibrant, joyful & uplifted',
    emotionalState: 'Very happy, energetic and confident',
    primaryColor: '#9678BD',
    surfaceColor: '#F5ECFF',
    accentColor: '#D4FF3F', // Neon Lime
    glowColor: 'rgba(212, 255, 63, 0.45)',
    accessibleLabel: 'Amazing mood, feeling very joyful and energized',
  },
  happy: {
    key: 'happy',
    id: 'good',
    label: 'Good',
    description: 'Comfortable, positive & content',
    emotionalState: 'Relaxed, positive and peaceful',
    primaryColor: '#6B8E70',
    surfaceColor: '#EAF7EE',
    accentColor: '#D4FF3F', // Neon Lime accent
    glowColor: 'rgba(203, 179, 232, 0.45)',
    accessibleLabel: 'Good mood, feeling comfortable and positive',
  },
  calm: {
    key: 'calm',
    id: 'okay',
    label: 'Okay',
    description: 'Neutral, steady & reflective',
    emotionalState: 'Balanced and grounded, neither high nor low',
    primaryColor: '#7A7289',
    surfaceColor: '#F0EAF7',
    accentColor: '#CBB3E8', // Lavender
    glowColor: 'rgba(203, 179, 232, 0.35)',
    accessibleLabel: 'Okay mood, feeling balanced and neutral',
  },
  sad: {
    key: 'sad',
    id: 'low',
    label: 'Low',
    description: 'Tired, quiet or depleted',
    emotionalState: 'Low energy, quiet and needing comfort',
    primaryColor: '#68607A',
    surfaceColor: '#EDE8F5',
    accentColor: '#CBB3E8', // Soft lavender
    glowColor: 'rgba(150, 120, 189, 0.35)',
    accessibleLabel: 'Low mood, feeling tired or emotionally depleted',
  },
  anxious: {
    key: 'anxious',
    id: 'stressed',
    label: 'Stressed',
    description: 'Tense, overwhelmed or restless',
    emotionalState: 'Overwhelmed or under pressure, seeking calm',
    primaryColor: '#E34234', // Bold Red
    surfaceColor: '#FDF0EE',
    accentColor: '#E34234',
    glowColor: 'rgba(227, 66, 52, 0.35)',
    accessibleLabel: 'Stressed mood, feeling tense or anxious',
  },
};

export const MOOD_LIST: MoodCharacterConfig[] = [
  MOOD_CONFIGS.ecstatic,
  MOOD_CONFIGS.happy,
  MOOD_CONFIGS.calm,
  MOOD_CONFIGS.sad,
  MOOD_CONFIGS.anxious,
];

export const normalizeMoodKey = (raw: string | undefined | null): MoodKey => {
  if (!raw) return 'calm';
  const lower = raw.toLowerCase().trim();
  if (lower === 'amazing' || lower === 'ecstatic') return 'ecstatic';
  if (lower === 'good' || lower === 'happy') return 'happy';
  if (lower === 'okay' || lower === 'calm' || lower === 'neutral') return 'calm';
  if (lower === 'low' || lower === 'sad' || lower === 'down') return 'sad';
  if (lower === 'stressed' || lower === 'anxious' || lower === 'tense') return 'anxious';
  return 'calm';
};
