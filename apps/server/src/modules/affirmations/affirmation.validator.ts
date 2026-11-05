import { z } from 'zod';

export const affirmationQuerySchema = z.object({
  category: z.string().optional(),
  tag: z.string().optional(),
  language: z.string().optional().default('en'),
});

