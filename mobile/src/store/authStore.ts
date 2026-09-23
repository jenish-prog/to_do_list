import { create } from 'zustand';
import { User, LoginPayload, RegisterPayload } from '../types/auth';
import { authService, tokenStorage, onboardingStorage } from '../services/api';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  hasCompletedOnboarding: boolean;
  focusArea: string | null;
  avatar: string | null;
  error: string | null;

  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setFocusArea: (area: string) => Promise<void>;
  setAvatar: (avatar: string) => Promise<void>;
  updateUserName: (name: string) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitializing: true,
  hasCompletedOnboarding: false,
  focusArea: null,
  avatar: 'male',
  error: null,

  checkAuthStatus: async () => {
    try {
      const [storedToken, storedUser, completed, focus, storedAvatar] = await Promise.all([
        tokenStorage.getToken(),
        tokenStorage.getUser(),
        onboardingStorage.hasCompleted(),
        onboardingStorage.getFocusArea(),
        onboardingStorage.getAvatar(),
      ]);

      set({
        hasCompletedOnboarding: completed,
        focusArea: focus,
        avatar: storedAvatar || 'male',
      });

      if (storedToken && storedUser) {
        set({ token: storedToken, user: storedUser });

        // Silently refresh user profile
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            set({ user: res.user });
            await tokenStorage.saveUser(res.user);
          }
        } catch (profileErr) {
          console.warn('Session expired or invalid, clearing auth:', profileErr);
          await tokenStorage.clearAuth();
          set({ token: null, user: null });
        }
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
    } finally {
      set({ isInitializing: false });
    }
  },

  completeOnboarding: async () => {
    await onboardingStorage.setCompleted(true);
    set({ hasCompletedOnboarding: true });
  },

  setFocusArea: async (area: string) => {
    await onboardingStorage.setFocusArea(area);
    set({ focusArea: area });
  },

  setAvatar: async (avatar: string) => {
    await onboardingStorage.setAvatar(avatar);
    set({ avatar });
    const current = get().user;
    if (current) {
      const updated = { ...current, avatar };
      set({ user: updated });
      await tokenStorage.saveUser(updated);
    }
  },

  updateUserName: (name: string) => {
    const current = get().user;
    if (current) {
      const updated = { ...current, name };
      set({ user: updated });
      tokenStorage.saveUser(updated);
    }
  },

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.login(payload);
      if (res.success && res.token && res.user) {
        set({ token: res.token, user: res.user, isLoading: false });
        await tokenStorage.saveToken(res.token);
        await tokenStorage.saveUser(res.user);
        return true;
      } else {
        set({
          error: res.message || 'Login failed. Please check your credentials.',
          isLoading: false,
        });
        return false;
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'An error occurred during login.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.register(payload);
      if (res.success && res.token && res.user) {
        set({ token: res.token, user: res.user, isLoading: false });
        await tokenStorage.saveToken(res.token);
        await tokenStorage.saveUser(res.user);
        return true;
      } else {
        set({
          error: res.message || 'Registration failed.',
          isLoading: false,
        });
        return false;
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'An error occurred during registration.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await tokenStorage.clearAuth();
    } finally {
      set({ token: null, user: null, error: null });
    }
  },

  clearError: () => set({ error: null }),
}));

// Provide compatibility alias for useAuth
export const useAuth = useAuthStore;

// Optional lightweight pass-through provider so existing wraps don't break
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return children as React.ReactElement;
};
