/**
 * Onboarding Feature Module
 *
 * Multi-step personalized onboarding, preference intake, and value proposition screens
 * will be implemented in subsequent steps.
 */
export const ONBOARDING_FEATURE_KEY = 'onboarding';
export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  step: number;
}
