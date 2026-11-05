import { create } from 'zustand';

interface AppState {
  isInitialized: boolean;
  isLoading: boolean;
  themeMode: 'light' | 'dark' | 'system';
  setInitialized: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  isLoading: false,
  themeMode: 'system',
  setInitialized: (value) => set({ isInitialized: value }),
  setLoading: (value) => set({ isLoading: value }),
  setThemeMode: (mode) => set({ themeMode: mode }),
}));
