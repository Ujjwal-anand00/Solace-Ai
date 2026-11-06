import { z } from 'zod';

export const resourceQuerySchema = z.object({
  category: z.string().trim().optional(),
  search: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  language: z.string().trim().optional(),
  contentType: z.enum(['article', 'audio', 'guide', 'helpline', 'exercise']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const updateProgressSchema = z.object({
  progressPercent: z.number().min(0).max(100),
});

export const createResourceAdminSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  slug: z.string().min(3).max(200).trim().optional(),
  description: z.string().min(10).max(1000).trim(),
  category: z.string().min(2).trim(),
  contentType: z.enum(['article', 'audio', 'guide', 'helpline', 'exercise']).default('guide'),
  contentUrl: z.string().optional().default(''),
  language: z.enum(['en', 'hi', 'pa']).default('en'),
  author: z.string().optional().default('Solace Wellness Team'),
  readingMinutes: z.number().int().min(1).max(60).default(4),
  coverImage: z.string().optional().default(''),
  tags: z.array(z.string().trim()).optional().default([]),
  blocks: z
    .array(
      z.object({
        type: z.enum([
          'heading',
          'paragraph',
          'bullet_list',
          'numbered_list',
          'callout',
          'quote',
          'step',
        ]),
        text: z.string().optional(),
        items: z.array(z.string()).optional(),
        calloutType: z.enum(['tip', 'note', 'reflection', 'warning']).optional(),
      }),
    )
    .optional()
    .default([]),
  relatedActivityIds: z.array(z.string()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true),
});

export const updateResourceAdminSchema = createResourceAdminSchema.partial();
