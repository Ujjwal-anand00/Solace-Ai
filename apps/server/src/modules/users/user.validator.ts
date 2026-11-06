import { z } from 'zod';

export const updateMeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80).trim().optional(),
  preferredName: z.string().max(50).trim().optional(),
  avatarUrl: z.string().url('Avatar must be a valid URL').or(z.literal('')).optional(),
  dateOfBirth: z.string().optional(),
  bio: z.string().max(300).trim().optional(),
  timezone: z.string().trim().optional(),
  language: z.enum(['en', 'hi', 'pa']).optional(),
  wellnessGoals: z.array(z.string().trim()).optional(),
  themePreference: z.enum(['light', 'dark', 'system']).optional(),
});

export const updatePreferencesSchema = z.object({
  wellnessPreferences: z
    .object({
      goals: z.array(z.string().trim()).optional(),
      preferredActivityDurationMinutes: z.number().int().min(1).max(60).optional(),
      preferredCategories: z.array(z.string().trim()).optional(),
      preferredDailyTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
      reminderDays: z.array(z.number().int().min(0).max(6)).optional(),
    })
    .optional(),
  accessibilityPreferences: z
    .object({
      reduceMotion: z.boolean().optional(),
      highContrast: z.boolean().optional(),
      hapticFeedback: z.boolean().optional(),
      fontScale: z.number().min(0.8).max(1.5).optional(),
    })
    .optional(),
  themePreference: z.enum(['light', 'dark', 'system']).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'New password must contain at least one special character'),
});

export const feedbackSchema = z.object({
  category: z.enum(['bug', 'feature', 'content', 'general']).default('general'),
  message: z.string().min(3, 'Message must be at least 3 characters').max(2000).trim(),
  rating: z.number().int().min(1).max(5).optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Please type DELETE to confirm account deletion' }),
  }),
});

