import { z } from 'zod';

export const createJournalSchema = z.object({
  title: z.string().min(1, 'Journal title is required').max(200, 'Title cannot exceed 200 characters').trim(),
  content: z.string().min(1, 'Journal content is required').trim(),
  prompt: z.string().max(300, 'Prompt cannot exceed 300 characters').optional(),
  moodAssociation: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional().default([]),
  isFavorite: z.boolean().optional().default(false),
});

export const updateJournalSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  content: z.string().min(1).trim().optional(),
  prompt: z.string().max(300).optional(),
  moodAssociation: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  isFavorite: z.boolean().optional(),
});

export const journalQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  isFavorite: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  tag: z.string().optional(),
});

