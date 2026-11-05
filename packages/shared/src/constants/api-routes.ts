/**
 * Standard API Route Paths
 */
export const API_ROUTES = {
  BASE_V1: '/api/v1',
  HEALTH: '/api/v1/health',
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    ME: '/api/v1/auth/me',
  },
  COMPANION: {
    CHAT: '/api/v1/companion/chat',
    HISTORY: '/api/v1/companion/history',
  },
  MOOD: {
    BASE: '/api/v1/mood',
    LOG: '/api/v1/mood/log',
    STATS: '/api/v1/mood/stats',
  },
  WELLNESS: {
    EXERCISES: '/api/v1/wellness/exercises',
  },
} as const;
