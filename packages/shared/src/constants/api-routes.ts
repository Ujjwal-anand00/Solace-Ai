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
    HISTORY: '/api/v1/progress/history',
  },
  RESOURCES: {
    BASE: '/api/v1/resources',
  },
  WELLNESS_PLANS: {
    BASE: '/api/v1/wellness-plans',
    CURRENT: '/api/v1/wellness-plans/current',
  },
  NOTIFICATIONS: {
    BASE: '/api/v1/notifications',
    UNREAD_COUNT: '/api/v1/notifications/unread-count',
  },
  COMPANION: {
    CHAT: '/api/v1/companion/chat',
    HISTORY: '/api/v1/companion/history',
  },
} as const;
