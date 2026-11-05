/**
 * Centralized React Query Keys
 */
export const QUERY_KEYS = {
  MOOD: {
    ALL: ['moods'] as const,
    LIST: (filters?: Record<string, unknown>) => ['moods', 'list', filters || {}] as const,
    DETAIL: (id: string) => ['moods', 'detail', id] as const,
    SUMMARY: ['moods', 'summary'] as const,
    CALENDAR: (year?: number, month?: number) => ['moods', 'calendar', year, month] as const,
    INSIGHTS: (days?: number) => ['moods', 'insights', days || 30] as const,
  },
  JOURNAL: {
    ALL: ['journals'] as const,
    LIST: (filters?: Record<string, unknown>) => ['journals', 'list', filters || {}] as const,
    DETAIL: (id: string) => ['journals', 'detail', id] as const,
  },
  ACTIVITIES: {
    ALL: ['activities'] as const,
    LIST: (filters?: Record<string, unknown>) => ['activities', 'list', filters || {}] as const,
    DETAIL: (id: string) => ['activities', 'detail', id] as const,
    HISTORY: (page?: number) => ['activities', 'history', page || 1] as const,
  },
  AFFIRMATIONS: {
    ALL: ['affirmations'] as const,
    LIST: (filters?: Record<string, unknown>) => ['affirmations', 'list', filters || {}] as const,
    DAILY: (category?: string) => ['affirmations', 'daily', category || 'all'] as const,
  },
  PROGRESS: {
    CURRENT: ['progress', 'current'] as const,
    HISTORY: ['progress', 'history'] as const,
  },
  USER: {
    PROFILE: ['user', 'profile'] as const,
  },
  RESOURCES: {
    ALL: ['resources'] as const,
    LIST: (category?: string) => ['resources', 'list', category || 'all'] as const,
  },
  WELLNESS_PLANS: {
    CURRENT: ['wellness-plans', 'current'] as const,
  },
  NOTIFICATIONS: {
    UNREAD_COUNT: ['notifications', 'unread-count'] as const,
  },
  CONVERSATIONS: {
    ALL: ['conversations'] as const,
    LIST: (page?: number) => ['conversations', 'list', page || 1] as const,
    DETAIL: (id: string) => ['conversations', 'detail', id] as const,
    MESSAGES: (id: string) => ['conversations', id, 'messages'] as const,
  },
  COMPANION: {
    SETTINGS: ['companion', 'settings'] as const,
  },
} as const;
