/**
 * Auth Feature Module
 *
 * User authentication, signup, login, session recovery, and biometric auth
 * will be implemented in subsequent steps.
 */
export const AUTH_FEATURE_KEY = 'auth';
export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}
