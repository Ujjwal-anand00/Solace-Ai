import { create } from 'zustand';
import { appStorage } from '../services/storage/asyncStorage';

export type ThemeMode = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'solace_theme_preference';

interface ThemeState {
  themeMode: ThemeMode;
  isHydrated: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  hydrateTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: 'system',
  isHydrated: false,

  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    try {
      await appStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // storage failure graceful fallback
    }
  },

  hydrateTheme: async () => {
    try {
      const saved = await appStorage.getItem<ThemeMode>(THEME_STORAGE_KEY);
      if (saved && (saved === 'system' || saved === 'light' || saved === 'dark')) {
        set({ themeMode: saved, isHydrated: true });
        return;
      }
    } catch {
      // ignore
    }
    set({ isHydrated: true });
  },
}));
