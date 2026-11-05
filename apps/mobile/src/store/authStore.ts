import { create } from 'zustand';
import { UserProfile, LoginDto, RegisterDto, UpdateProfileDto } from '@solace/shared';
import { authService } from '../services/api/authService';
import { secureStorage } from '../services/storage/secureStore';
import { useOnboardingStore } from './onboardingStore';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isRestoringSession: boolean;
  error: string | null;

  restoreSession: () => Promise<void>;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: Omit<RegisterDto, 'wellnessGoals'>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (dto: UpdateProfileDto) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isRestoringSession: true,
  error: null,

  clearError: () => set({ error: null }),

  restoreSession: async () => {
    set({ isRestoringSession: true });
    try {
      const accessToken = await secureStorage.getItem(secureStorage.keys.ACCESS_TOKEN);
      const refreshToken = await secureStorage.getItem(secureStorage.keys.REFRESH_TOKEN);

      if (!accessToken && !refreshToken) {
        set({ user: null, isAuthenticated: false, isRestoringSession: false });
        return;
      }

      // Try fetching current profile with existing access token
      try {
        const user = await authService.getMe();
        set({ user, isAuthenticated: true, isRestoringSession: false });
        return;
      } catch {
        // If access token expired and refresh token is available, attempt refresh
        if (refreshToken) {
          try {
            const refreshRes = await authService.refresh({ refreshToken });
            await secureStorage.setItem(
              secureStorage.keys.ACCESS_TOKEN,
              refreshRes.tokens.accessToken,
            );
            await secureStorage.setItem(
              secureStorage.keys.REFRESH_TOKEN,
              refreshRes.tokens.refreshToken,
            );
            set({ user: refreshRes.user, isAuthenticated: true, isRestoringSession: false });
            return;
          } catch {
            // Refresh failed - tokens invalid or revoked
          }
        }
      }

      // Clear invalidated tokens
      await secureStorage.deleteItem(secureStorage.keys.ACCESS_TOKEN);
      await secureStorage.deleteItem(secureStorage.keys.REFRESH_TOKEN);
      set({ user: null, isAuthenticated: false, isRestoringSession: false });
    } catch {
      set({ user: null, isAuthenticated: false, isRestoringSession: false });
    }
  },

  login: async (dto: LoginDto) => {
    set({ isLoading: true, error: null });
    try {
      const authRes = await authService.login(dto);

      await secureStorage.setItem(secureStorage.keys.ACCESS_TOKEN, authRes.tokens.accessToken);
      await secureStorage.setItem(secureStorage.keys.REFRESH_TOKEN, authRes.tokens.refreshToken);

      set({
        user: authRes.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Unable to sign in. Please verify your email and password.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (dto: Omit<RegisterDto, 'wellnessGoals'>) => {
    set({ isLoading: true, error: null });
    try {
      // Transfer wellness goals selected during onboarding into registration payload
      const onboardingGoals = useOnboardingStore.getState().selectedWellnessGoals || [];

      const authRes = await authService.register({
        ...dto,
        wellnessGoals: onboardingGoals,
        onboardingCompleted: true,
      });

      await secureStorage.setItem(secureStorage.keys.ACCESS_TOKEN, authRes.tokens.accessToken);
      await secureStorage.setItem(secureStorage.keys.REFRESH_TOKEN, authRes.tokens.refreshToken);

      set({
        user: authRes.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Unable to create account. Please try again.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = await secureStorage.getItem(secureStorage.keys.REFRESH_TOKEN);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      await secureStorage.deleteItem(secureStorage.keys.ACCESS_TOKEN);
      await secureStorage.deleteItem(secureStorage.keys.REFRESH_TOKEN);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  updateProfile: async (dto: UpdateProfileDto) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await authService.updateMe(dto);
      set({ user: updatedUser, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Unable to update profile.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.deleteMe();
      await secureStorage.deleteItem(secureStorage.keys.ACCESS_TOKEN);
      await secureStorage.deleteItem(secureStorage.keys.REFRESH_TOKEN);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error).message ||
        'Unable to delete account.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));
