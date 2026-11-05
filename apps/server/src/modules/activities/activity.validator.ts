import { z } from 'zod';

export const completeActivitySchema = z.object({
  durationCompleted: z.coerce
    .number()
    .int('Duration must be an integer')
    .min(1, 'Duration must be at least 1 second'),
  feedback: z.string().max(500, 'Feedback cannot exceed 500 characters').optional(),
});

export const activityQuerySchema = z.object({
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

