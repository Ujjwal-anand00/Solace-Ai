import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const registerDeviceSchema = z.object({
  token: z.string().min(1, 'Device push token is required'),
  platform: z.enum(['ios', 'android', 'web']),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  appVersion: z.string().optional(),
});

export const updatePreferencesSchema = z.object({
  masterEnabled: z.boolean().optional(),
  dailyWellness: z
    .object({
      enabled: z.boolean().optional(),
      time: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
      days: z.array(z.number().int().min(0).max(6)).optional(),
    })
    .optional(),
  moodCheckin: z
    .object({
      enabled: z.boolean().optional(),
      time: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
    })
    .optional(),
  planReminders: z
    .object({
      enabled: z.boolean().optional(),
      time: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
    })
    .optional(),
  breathingReminders: z
    .object({
      enabled: z.boolean().optional(),
      time: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
      preferredActivityId: z.string().optional(),
    })
    .optional(),
  milestones: z
    .object({
      enabled: z.boolean().optional(),
    })
    .optional(),
  weeklySummary: z
    .object({
      enabled: z.boolean().optional(),
      dayOfWeek: z.number().int().min(0).max(6).optional(),
      time: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
    })
    .optional(),
  quietHours: z
    .object({
      enabled: z.boolean().optional(),
      startTime: z.string().regex(timeRegex, 'Start time must be in HH:mm format').optional(),
      endTime: z.string().regex(timeRegex, 'End time must be in HH:mm format').optional(),
    })
    .optional(),
  timezone: z.string().optional(),
});

export const createReminderSchema = z.object({
  type: z.enum([
    'reminder',
    'daily_wellness',
    'mood_checkin',
    'checkin',
    'plan_task',
    'breathing',
    'streak_alert',
    'achievement',
    'weekly_summary',
    'affirmation',
    'system',
  ]),
  title: z.string().max(100).optional(),
  message: z.string().max(250).optional(),
  time: z.string().regex(timeRegex, 'Time must be in HH:mm format'),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  deepLink: z.string().optional(),
  relatedResourceId: z.string().optional(),
});

export const updateReminderSchema = z.object({
  title: z.string().max(100).optional(),
  message: z.string().max(250).optional(),
  time: z.string().regex(timeRegex, 'Time must be in HH:mm format').optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  deepLink: z.string().optional(),
  relatedResourceId: z.string().optional(),
  isEnabled: z.boolean().optional(),
});

