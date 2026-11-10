/**
 * Mobile Environment Configuration
 */
export const ENV = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://solace-ai-687q.onrender.com',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
  APP_NAME: 'Solace AI',
  APP_VERSION: '1.0.0',
} as const;
