import { BreathingPattern } from '@solace/shared';

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    subtitle: '4 • 4 • 4 • 4',
    description: 'Sama Vritti equal square breathing to quickly regain focus, lower acute stress, and steady the nervous system.',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    benefits: ['Centering', 'Focus & Clarity', 'Nervous system balance'],
  },
  {
    id: 'relaxing',
    name: 'Relaxing Breathing',
    subtitle: '4 • 6',
    description: 'A soothing rhythm with an elongated exhale to activate your body’s parasympathetic "rest and digest" mode.',
    inhale: 4,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    benefits: ['Stress reduction', 'Heart rate calming', 'Gentle ease'],
  },
  {
    id: 'equal',
    name: 'Equal Breathing',
    subtitle: '4 • 4',
    description: 'Balanced symmetrical breathing that creates steady internal harmony without breath holding.',
    inhale: 4,
    hold1: 0,
    exhale: 4,
    hold2: 0,
    benefits: ['Beginner friendly', 'No breath holding', 'Harmonizing'],
  },
  {
    id: 'extended-exhale',
    name: 'Extended Exhale',
    subtitle: '4 • 8',
    description: 'Doubles the exhale to release muscular and mental tension, perfect for winding down in the evening.',
    inhale: 4,
    hold1: 0,
    exhale: 8,
    hold2: 0,
    benefits: ['Deep relaxation', 'Sleep preparation', 'Vagus nerve stimulation'],
  },
  {
    id: '4-7-8',
    name: '4-7-8 Relaxing Breath',
    subtitle: '4 • 7 • 8',
    description: 'A traditional tranquilizer rhythm that gently slows respiratory rate and eases anxious thoughts.',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    benefits: ['Natural tranquilizer', 'Anxiety relief', 'Sleep onset'],
  },
];

export const SESSION_DURATIONS = [
  { label: '1 min', seconds: 60, desc: 'Quick Reset' },
  { label: '2 min', seconds: 120, desc: 'Calming Reset' },
  { label: '3 min', seconds: 180, desc: 'Standard Session' },
  { label: '5 min', seconds: 300, desc: 'Deep Immersion' },
];

