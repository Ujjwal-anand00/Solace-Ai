import { z } from 'zod';

export const updateCompanionSettingsSchema = z.object({
  enablePersonalization: z.boolean().optional(),
  journalPersonalizationConsent: z.boolean().optional(),
  preferredTone: z.enum(['gentle', 'balanced', 'direct']).optional(),
});

