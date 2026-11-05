/**
 * Breathing exercises are modeled as first-class WellnessActivity records
 * with category: 'breathing'.
 */
export const BREATHING_PATTERNS = {
  BOX_BREATHING: {
    inhale: 4,
    holdInhale: 4,
    exhale: 4,
    holdExhale: 4,
  },
  RELAX_4_7_8: {
    inhale: 4,
    holdInhale: 7,
    exhale: 8,
    holdExhale: 0,
  },
  COHERENT_5_5: {
    inhale: 5,
    holdInhale: 0,
    exhale: 5,
    holdExhale: 0,
  },
} as const;

