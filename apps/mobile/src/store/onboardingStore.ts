import { create } from 'zustand';
import { appStorage } from '../services/storage/asyncStorage';

export type NotificationPreference = 'enabled' | 'skipped' | 'denied' | 'undetermined';

export interface OnboardingData {
  hasCompletedOnboarding: boolean;
  selectedWellnessGoals: string[];
  notificationPreference: NotificationPreference;
  onboardingVersion: number;
  completedAt: string | null;
}

const ONBOARDING_STORAGE_KEY = 'solace_onboarding_state';
const CURRENT_ONBOARDING_VERSION = 1;

interface OnboardingState extends OnboardingData {
  isHydrated: boolean;
  setWellnessGoals: (goals: string[]) => Promise<void>;
  toggleWellnessGoal: (goalId: string) => void;
  setNotificationPreference: (pref: NotificationPreference) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  hydrateOnboarding: () => Promise<void>;
}

const DEFAULT_STATE: OnboardingData = {
  hasCompletedOnboarding: false,
  selectedWellnessGoals: [],
  notificationPreference: 'undetermined',
  onboardingVersion: CURRENT_ONBOARDING_VERSION,
  completedAt: null,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...DEFAULT_STATE,
  isHydrated: false,

  setWellnessGoals: async (goals: string[]) => {
    set({ selectedWellnessGoals: goals });
    try {
      const current = await appStorage.getItem<OnboardingData>(ONBOARDING_STORAGE_KEY);
      await appStorage.setItem(ONBOARDING_STORAGE_KEY, {
        ...(current || DEFAULT_STATE),
        selectedWellnessGoals: goals,
      });
    } catch {
      // Storage error gracefully caught
    }
  },

  toggleWellnessGoal: (goalId: string) => {
    const current = get().selectedWellnessGoals;
    const exists = current.includes(goalId);
    const updated = exists ? current.filter((id) => id !== goalId) : [...current, goalId];
    get().setWellnessGoals(updated);
  },

  setNotificationPreference: async (pref: NotificationPreference) => {
    set({ notificationPreference: pref });
    try {
      const current = await appStorage.getItem<OnboardingData>(ONBOARDING_STORAGE_KEY);
      await appStorage.setItem(ONBOARDING_STORAGE_KEY, {
        ...(current || DEFAULT_STATE),
        notificationPreference: pref,
      });
    } catch {
      // Storage error gracefully caught
    }
  },

  completeOnboarding: async () => {
    const now = new Date().toISOString();
    const updated: OnboardingData = {
      hasCompletedOnboarding: true,
      selectedWellnessGoals: get().selectedWellnessGoals,
      notificationPreference: get().notificationPreference,
      onboardingVersion: CURRENT_ONBOARDING_VERSION,
      completedAt: now,
    };
    set(updated);
    try {
      await appStorage.setItem(ONBOARDING_STORAGE_KEY, updated);
    } catch {
      // Storage error gracefully caught
    }
  },

  resetOnboarding: async () => {
    set({
      ...DEFAULT_STATE,
      isHydrated: true,
    });
    try {
      await appStorage.removeItem(ONBOARDING_STORAGE_KEY);
    } catch {
      // Storage error gracefully caught
    }
  },

  hydrateOnboarding: async () => {
    try {
      const saved = await appStorage.getItem<OnboardingData>(ONBOARDING_STORAGE_KEY);
      if (saved && typeof saved.hasCompletedOnboarding === 'boolean') {
        set({
          hasCompletedOnboarding: saved.hasCompletedOnboarding,
          selectedWellnessGoals: Array.isArray(saved.selectedWellnessGoals)
            ? saved.selectedWellnessGoals
            : [],
          notificationPreference: saved.notificationPreference || 'undetermined',
          onboardingVersion: saved.onboardingVersion || CURRENT_ONBOARDING_VERSION,
          completedAt: saved.completedAt || null,
          isHydrated: true,
        });
        return;
      }
    } catch {
      // Storage read fallback
    }
    set({ isHydrated: true });
  },
}));

