/**
 * Mobile Environment Configuration
 */
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
  APP_NAME: 'Solace AI',
  APP_VERSION: '1.0.0',
} as const;
