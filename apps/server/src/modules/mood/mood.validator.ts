import { z } from 'zod';

export const createMoodSchema = z.object({
  mood: z.string().min(1, 'Mood name is required').trim(),
  moodIntensity: z.coerce
    .number()
    .int('Intensity must be an integer')
    .min(1, 'Intensity must be between 1 and 10')
    .max(10, 'Intensity must be between 1 and 10'),
  emotions: z.array(z.string().trim()).optional().default([]),
  note: z.string().max(1000, 'Note cannot exceed 1000 characters').optional(),
  tags: z.array(z.string().trim()).optional().default([]),
});

export const updateMoodSchema = z.object({
  mood: z.string().min(1).trim().optional(),
  moodIntensity: z.coerce.number().int().min(1).max(10).optional(),
  emotions: z.array(z.string().trim()).optional(),
  note: z.string().max(1000).optional(),
  tags: z.array(z.string().trim()).optional(),
});

export const moodQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mood: z.string().trim().optional(),
  emotion: z.string().trim().optional(),
});

export const calendarQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export const insightsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional().default(30),
});
