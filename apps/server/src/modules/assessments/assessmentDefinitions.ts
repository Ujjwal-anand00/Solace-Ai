import { AssessmentTypeMetadata } from '@solace/shared';

export const STANDARD_OPTIONS = [
  { value: 0, label: 'Rarely or never', description: 'Hardly noticeable in your week' },
  { value: 1, label: 'Occasionally', description: '1-2 days this past week' },
  { value: 2, label: 'Frequently', description: '3-5 days this past week' },
  { value: 3, label: 'Almost daily', description: 'A daily or near-daily presence' },
];

export const ASSESSMENT_DEFINITIONS: Record<string, AssessmentTypeMetadata> = {
  stress: {
    id: 'stress',
    title: 'Stress Check-in',
    subtitle: 'Everyday Tension & Balance',
    description:
      'Reflect on your perceived stress, difficulty winding down, and everyday demands to find grounded balance.',
    estimatedMinutes: 2,
    icon: 'activity',
    category: 'stress',
    questionsVersion: '1.0',
    questionCount: 4,
    disclaimer:
      'This self-check is strictly for informational and self-reflection purposes. It does not constitute a clinical diagnosis or medical evaluation.',
    questions: [
      {
        id: 'stress-q1',
        text: 'How often have you felt high tension or pressure during your daily routine?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'stress-q2',
        text: 'How often have you found it difficult to unwind or quiet your mind when resting?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'stress-q3',
        text: 'How often have you felt overwhelmed by the volume of tasks or thoughts you are holding?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'stress-q4',
        text: 'How often have you felt challenged in managing your everyday responsibilities with ease?',
        options: STANDARD_OPTIONS,
      },
    ],
  },
  sleep: {
    id: 'sleep',
    title: 'Sleep Reflection',
    subtitle: 'Nighttime Ease & Restfulness',
    description:
      'Check in on your sleep patterns, ease of unwinding before bed, and how refreshed you feel each morning.',
    estimatedMinutes: 2,
    icon: 'moon',
    category: 'sleep',
    questionsVersion: '1.0',
    questionCount: 4,
    disclaimer:
      'This self-check is strictly for informational and self-reflection purposes. It does not constitute a clinical diagnosis or medical evaluation.',
    questions: [
      {
        id: 'sleep-q1',
        text: 'How often do you find it hard to unwind and disconnect from screens or work before bed?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'sleep-q2',
        text: 'How often have you had trouble letting go of swirling thoughts right before falling asleep?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'sleep-q3',
        text: 'How often has your sleep felt light, interrupted, or unrefreshing during the night?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'sleep-q4',
        text: 'How often do you wake up feeling drained or needing extra time to feel fully alert?',
        options: STANDARD_OPTIONS,
      },
    ],
  },
  energy: {
    id: 'energy',
    title: 'Energy Check-in',
    subtitle: 'Daily Vitality & Renewal',
    description:
      'Explore your natural energy flow, motivation, and feelings of physical or mental fatigue throughout the day.',
    estimatedMinutes: 2,
    icon: 'sun',
    category: 'energy',
    questionsVersion: '1.0',
    questionCount: 4,
    disclaimer:
      'This self-check is strictly for informational and self-reflection purposes. It does not constitute a clinical diagnosis or medical evaluation.',
    questions: [
      {
        id: 'energy-q1',
        text: 'How often have you experienced sharp afternoon slumps or mid-day exhaustion?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'energy-q2',
        text: 'How often have you struggled to find natural enthusiasm or motivation for your tasks?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'energy-q3',
        text: 'How often have you felt persistent tiredness even after taking regular breaks?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'energy-q4',
        text: 'How often have simple everyday routines or self-care felt like heavy effort to maintain?',
        options: STANDARD_OPTIONS,
      },
    ],
  },
  'emotional-wellbeing': {
    id: 'emotional-wellbeing',
    title: 'Emotional Well-being',
    subtitle: 'Balance, Connection & Care',
    description:
      'Reflect on your emotional harmony, ability to express your feelings, and sense of meaningful connection.',
    estimatedMinutes: 2,
    icon: 'heart',
    category: 'emotional-wellbeing',
    questionsVersion: '1.0',
    questionCount: 4,
    disclaimer:
      'This self-check is strictly for informational and self-reflection purposes. It does not constitute a clinical diagnosis or medical evaluation.',
    questions: [
      {
        id: 'emo-q1',
        text: 'How often have you felt emotionally unsettled or reactive to unexpected disruptions?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'emo-q2',
        text: 'How often have you found it difficult to acknowledge, honor, or express what you feel?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'emo-q3',
        text: 'How often have you felt distant, isolated, or disconnected from those around you?',
        options: STANDARD_OPTIONS,
      },
      {
        id: 'emo-q4',
        text: 'How often have critical self-judgments or worries taken center stage over gentle acceptance?',
        options: STANDARD_OPTIONS,
      },
    ],
  },
};

export interface InterpretationResult {
  resultCategory: string;
  interpretation: string;
  suggestedActivities: string[];
  recommendedNextSteps: string[];
}

export function evaluateAssessmentScore(
  _type: string,
  score: number,
): InterpretationResult {
  // Score range: 0 to 12
  if (score <= 3) {
    return {
      resultCategory: 'Grounded & Balanced',
      interpretation:
        'Your responses reflect a steady foundation and balanced everyday rhythm. Continuing your small mindful moments will help preserve this calm space.',
      suggestedActivities: [
        'morning-gratitude-reflection',
        'loving-kindness-meditation',
        'equal-breathing',
      ],
      recommendedNextSteps: [
        'Savor your current sense of ease and maintain your gentle daily pauses.',
        'Acknowledge what is working well in your routine with morning gratitude.',
      ],
    };
  } else if (score <= 6) {
    return {
      resultCategory: 'Mild Everyday Tension',
      interpretation:
        'Your responses suggest you are navigating some everyday pressures. Carving out brief moments to unwind can restore your sense of spaciousness.',
      suggestedActivities: [
        'relaxing-breathing',
        'sensory-grounding-54321',
        'restorative-tea-ritual',
      ],
      recommendedNextSteps: [
        'Try a 3-minute relaxing breathing exercise (4-6) to gently settle your nervous system.',
        'Take a 5-minute digital reset between your demanding tasks.',
      ],
    };
  } else if (score <= 9) {
    return {
      resultCategory: 'Elevated Demands',
      interpretation:
        'Your responses suggest that taking a little time to unwind and lighten your mental load could be especially supportive this week.',
      suggestedActivities: [
        'box-breathing',
        'progressive-muscle-relaxation',
        'extended-exhale',
      ],
      recommendedNextSteps: [
        'Give yourself permission to pause non-essential demands today.',
        'Practice a 4-minute box breathing session whenever tension starts to build.',
        'Wind down 30 minutes earlier with a gentle body scan.',
      ],
    };
  } else {
    return {
      resultCategory: 'High Everyday Load',
      interpretation:
        'Your responses indicate you are carrying a full emotional and energetic load right now. Prioritizing gentle self-compassion and soothing pauses can help you recharge.',
      suggestedActivities: [
        'body-scan-sleep',
        'evening-reflection-compassion',
        '4-7-8-breathing',
      ],
      recommendedNextSteps: [
        'Allow yourself to slow down without guilt; you do not have to carry everything all at once.',
        'Engage in a comforting evening reflection or soothing 4-7-8 breath before rest.',
        'Reach out to someone you trust or a supportive professional if you feel in need of extra care.',
      ],
    };
  }
}
