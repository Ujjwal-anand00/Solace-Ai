import { z } from 'zod';

export const generateWellnessPlanSchema = z.object({
  focusAreas: z.array(z.string()).min(1, 'At least one focus area is required'),
  durationDays: z.union([z.literal(7), z.literal(14), z.literal(30)]),
  dailyMinutes: z.union([
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(20),
    z.literal(30),
  ]),
  preferredActivities: z.array(z.string()).optional(),
});

export type GenerateWellnessPlanInput = z.infer<typeof generateWellnessPlanSchema>;

export const createWellnessPlanSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().min(5, 'Description is required'),
  durationDays: z.number().int().min(1).max(60).default(7),
  focusAreas: z.array(z.string()).default([]),
  goals: z.array(z.string()).optional(),
  dailyTasks: z
    .array(
      z.object({
        id: z.string().optional(),
        day: z.number().int().min(1),
        title: z.string().min(2, 'Task title is required'),
        description: z.string().optional().default(''),
        category: z.string().default('mindfulness'),
        durationMinutes: z.number().int().min(1).max(120).default(5),
      }),
    )
    .min(1, 'Daily tasks cannot be empty'),
  replaceActive: z.boolean().optional().default(false),
  isAiGenerated: z.boolean().optional().default(true),
});

export type CreateWellnessPlanInput = z.infer<typeof createWellnessPlanSchema>;

export const updateWellnessPlanSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().min(5).optional(),
});

export const completeTaskSchema = z.object({
  completed: z.boolean().optional().default(true),
});

