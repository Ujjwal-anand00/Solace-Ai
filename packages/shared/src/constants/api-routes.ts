/**
 * Standard API Route Paths
 */
export const API_ROUTES = {
  BASE_V1: '/api/v1',
  HEALTH: '/api/v1/health',
  HEALTH_READY: '/api/v1/health/ready',
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    ME: '/api/v1/auth/me',
  },
  MOOD: {
    BASE: '/api/v1/mood',
    SUMMARY: '/api/v1/mood/summary',
    CALENDAR: '/api/v1/mood/calendar',
    INSIGHTS: '/api/v1/mood/insights',
  },
  JOURNAL: {
    BASE: '/api/v1/journal',
    PROMPTS: '/api/v1/journal/prompts',
    STATS: '/api/v1/journal/stats',
    CALENDAR: '/api/v1/journal/calendar',
    DETAIL: (id: string) => `/api/v1/journal/${id}`,
    TOGGLE_FAVORITE: (id: string) => `/api/v1/journal/${id}/favorite`,
    REQUEST_INSIGHT: (id: string) => `/api/v1/journal/${id}/insight`,
  },
  ACTIVITIES: {
    BASE: '/api/v1/activities',
    COMPLETED_HISTORY: '/api/v1/activities/completed/history',
  },
  AFFIRMATIONS: {
    BASE: '/api/v1/affirmations',
    DAILY: '/api/v1/affirmations/daily',
  },
  PROGRESS: {
    BASE: '/api/v1/progress',
    OVERVIEW: '/api/v1/progress/overview',
    SUMMARY: '/api/v1/progress/summary',
    TRENDS: '/api/v1/progress/trends',
    HISTORY: '/api/v1/progress/history',
    STREAK: '/api/v1/progress/streak',
    REPORTS_WEEKLY: '/api/v1/progress/reports/weekly',
    REPORTS_MONTHLY: '/api/v1/progress/reports/monthly',
  },
  ACHIEVEMENTS: {
    BASE: '/api/v1/achievements',
    MINE: '/api/v1/achievements/mine',
    DETAIL: (id: string) => `/api/v1/achievements/${id}`,
  },
  RESOURCES: {
    BASE: '/api/v1/resources',
  },
  ASSESSMENTS: {
    BASE: '/api/v1/assessments',
    TYPES: '/api/v1/assessments/types',
    TYPE_DETAIL: (type: string) => `/api/v1/assessments/types/${type}`,
    HISTORY: '/api/v1/assessments/history',
    LATEST: (type: string) => `/api/v1/assessments/${type}/latest`,
    DETAIL: (id: string) => `/api/v1/assessments/${id}`,
    SUBMIT: (type: string) => `/api/v1/assessments/${type}/submit`,
  },
  WELLNESS_PLANS: {
    BASE: '/api/v1/wellness-plans',
    CURRENT: '/api/v1/wellness-plans/current',
    GENERATE: '/api/v1/wellness-plans/generate',
    RECOMMENDATIONS: '/api/v1/wellness-plans/recommendations',
    DETAIL: (id: string) => `/api/v1/wellness-plans/${id}`,
    COMPLETE_TASK: (id: string, taskId: string) =>
      `/api/v1/wellness-plans/${id}/tasks/${taskId}/complete`,
    SKIP_TASK: (id: string, taskId: string) =>
      `/api/v1/wellness-plans/${id}/tasks/${taskId}/skip`,
    PAUSE: (id: string) => `/api/v1/wellness-plans/${id}/pause`,
    RESUME: (id: string) => `/api/v1/wellness-plans/${id}/resume`,
  },
  NOTIFICATIONS: {
    BASE: '/api/v1/notifications',
    UNREAD_COUNT: '/api/v1/notifications/unread-count',
    READ: (id: string) => `/api/v1/notifications/${id}/read`,
    READ_ALL: '/api/v1/notifications/read-all',
    DETAIL: (id: string) => `/api/v1/notifications/${id}`,
    DEVICES_REGISTER: '/api/v1/notifications/devices/register',
    DEVICES_REMOVE: (id: string) => `/api/v1/notifications/devices/${id}`,
    PREFERENCES: '/api/v1/notifications/preferences',
    REMINDERS: '/api/v1/notifications/reminders',
    REMINDER_DETAIL: (id: string) => `/api/v1/notifications/reminders/${id}`,
  },
  COMPANION: {
    SETTINGS: '/api/v1/companion/settings',
    CHAT: '/api/v1/companion/chat',
    HISTORY: '/api/v1/companion/history',
  },
  CONVERSATIONS: {
    BASE: '/api/v1/conversations',
    MESSAGES: (id: string) => `/api/v1/conversations/${id}/messages`,
    STREAM: (id: string) => `/api/v1/conversations/${id}/messages/stream`,
  },
} as const;
