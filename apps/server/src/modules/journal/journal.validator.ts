import { z } from 'zod';

export const createJournalSchema = z.object({
  title: z
    .string()
    .min(1, 'Journal title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  content: z.string().min(1, 'Journal content is required').trim(),
  category: z
    .enum([
      'free_write',
      'guided_reflection',
      'gratitude',
      'emotional_checkin',
      'mindful_observation',
      'self_discovery',
      'stress_release',
    ])
    .optional()
    .default('free_write'),
  prompt: z.string().max(300, 'Prompt cannot exceed 300 characters').optional(),
  promptId: z.string().trim().optional(),
  moodAssociation: z.string().trim().optional(),
  moodIntensity: z.coerce.number().int().min(1).max(10).optional(),
  emotions: z.array(z.string().trim()).optional().default([]),
  gratitudeItems: z.array(z.string().trim()).optional().default([]),
  tags: z.array(z.string().trim()).optional().default([]),
  isFavorite: z.boolean().optional().default(false),
  isDraft: z.boolean().optional().default(false),
  aiConsentGranted: z.boolean().optional().default(false),
});

export const updateJournalSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  content: z.string().min(1).trim().optional(),
  category: z
    .enum([
      'free_write',
      'guided_reflection',
      'gratitude',
      'emotional_checkin',
      'mindful_observation',
      'self_discovery',
      'stress_release',
    ])
    .optional(),
  prompt: z.string().max(300).optional(),
  promptId: z.string().trim().optional(),
  moodAssociation: z.string().trim().optional(),
  moodIntensity: z.coerce.number().int().min(1).max(10).optional(),
  emotions: z.array(z.string().trim()).optional(),
  gratitudeItems: z.array(z.string().trim()).optional(),
  tags: z.array(z.string().trim()).optional(),
  isFavorite: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  aiConsentGranted: z.boolean().optional(),
});

export const journalQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  isFavorite: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  isDraft: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  tag: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const calendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const requestInsightSchema = z.object({
  consent: z.boolean().refine((val) => val === true, {
    message: 'Explicit consent is required for AI reflection analysis',
  }),
});
