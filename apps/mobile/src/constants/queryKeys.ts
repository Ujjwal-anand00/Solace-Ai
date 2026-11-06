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
    ALL: ['progress'] as const,
    CURRENT: ['progress', 'current'] as const,
    OVERVIEW: ['progress', 'overview'] as const,
    SUMMARY: (period?: string) => ['progress', 'summary', period || 'week'] as const,
    TRENDS: (period?: string) => ['progress', 'trends', period || 'week'] as const,
    TIMELINE: (category?: string, page?: number) =>
      ['progress', 'timeline', category || 'all', page || 1] as const,
    STREAK: ['progress', 'streak'] as const,
    HISTORY: ['progress', 'history'] as const,
    REPORT_WEEKLY: ['progress', 'report', 'weekly'] as const,
    REPORT_MONTHLY: ['progress', 'report', 'monthly'] as const,
  },
  ACHIEVEMENTS: {
    ALL: ['achievements'] as const,
    MINE: ['achievements', 'mine'] as const,
    DETAIL: (id: string) => ['achievements', 'detail', id] as const,
  },
  USER: {
    PROFILE: ['user', 'profile'] as const,
  },
  RESOURCES: {
    ALL: ['resources'] as const,
    LIST: (category?: string) => ['resources', 'list', category || 'all'] as const,
  },
  WELLNESS_PLANS: {
    ALL: ['wellness-plans'] as const,
    CURRENT: ['wellness-plans', 'current'] as const,
    LIST: (page?: number) => ['wellness-plans', 'list', page || 1] as const,
    DETAIL: (id: string) => ['wellness-plans', 'detail', id] as const,
    RECOMMENDATIONS: ['wellness-plans', 'recommendations'] as const,
  },
  NOTIFICATIONS: {
    ALL: ['notifications'] as const,
    INBOX: (page?: number, limit?: number, type?: string, status?: string) =>
      ['notifications', 'inbox', page || 1, limit || 20, type || 'all', status || 'all'] as const,
    UNREAD_COUNT: ['notifications', 'unread-count'] as const,
    PREFERENCES: ['notifications', 'preferences'] as const,
    REMINDERS: ['notifications', 'reminders'] as const,
  },
  ASSESSMENTS: {
    ALL: ['assessments'] as const,
    TYPES: ['assessments', 'types'] as const,
    TYPE_DETAIL: (type: string) => ['assessments', 'types', type] as const,
    HISTORY: (page?: number) => ['assessments', 'history', page || 1] as const,
    LATEST: (type: string) => ['assessments', 'latest', type] as const,
    DETAIL: (id: string) => ['assessments', 'detail', id] as const,
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
  JOURNAL: {
    ALL: ['journal'] as const,
    LIST: (filters?: Record<string, unknown>) => ['journal', 'list', filters || {}] as const,
    DETAIL: (id: string) => ['journal', 'detail', id] as const,
    PROMPTS: (category?: string) => ['journal', 'prompts', category || 'all'] as const,
    RANDOM_PROMPT: (category?: string) => ['journal', 'prompt', 'random', category || 'all'] as const,
    STATS: ['journal', 'stats'] as const,
    CALENDAR: (year?: number, month?: number) => ['journal', 'calendar', year, month] as const,
  },
} as const;
