export * from './themeStore';
export * from './onboardingStore';

import { create } from 'zustand';

interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  setInitialized: (value: boolean) => void;
  setLoading: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  isLoading: false,
  setInitialized: (value) => set({ isInitialized: value }),
  setLoading: (value) => set({ isLoading: value }),
}));
