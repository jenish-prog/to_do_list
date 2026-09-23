import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilter } from '../types/task';

// Your Mac's local network IP for physical device testing with Expo Go
// (If testing on an iOS Simulator, localhost works; on Android Emulator, 10.0.2.2 works)
const DEV_LAN_IP = '192.168.0.118';
const USE_LAN_IP_FOR_PHYSICAL_DEVICE = true;

// Production API (Render). Override at build time with:
//   EXPO_PUBLIC_API_URL=https://task-manager-backend-2cs4.onrender.com/api eas build ...
const PROD_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://task-manager-backend-2cs4.onrender.com/api';

const DEV_BASE_URL = USE_LAN_IP_FOR_PHYSICAL_DEVICE
  ? `http://${DEV_LAN_IP}:5001/api`
  : Platform.select({
      android: 'http://10.0.2.2:5001/api',
      ios: 'http://localhost:5001/api',
      default: 'http://localhost:5001/api',
    });

// In dev (Expo Go) keep LAN/emulator URLs; in release builds use Render.
const BASE_URL = __DEV__ ? DEV_BASE_URL : PROD_URL;

const TOKEN_KEY = '@task_manager_auth_token';
const USER_KEY = '@task_manager_auth_user';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Render free tier cold-starts can take 20-50s after idle — allow time to wake.
  timeout: 60000,
});

const inMemoryStorage = new Map<string, string>();

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
    } catch {
      // Fall back to in-memory store
    }
    return inMemoryStorage.get(key) || null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    inMemoryStorage.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // In-memory store already updated
    }
  },
  removeItem: async (key: string): Promise<void> => {
    inMemoryStorage.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // In-memory store already updated
    }
  },
};

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await safeStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching auth token from storage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: retry once on network/timeout errors with no server
// response (covers Render cold starts), then surface a friendly message.
const MAX_RETRIES = 2;
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config: any = error.config;
    const isNetworkError = !error.response;
    if (config && isNetworkError && (config.__retryCount || 0) < MAX_RETRIES) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000 * config.__retryCount));
      return apiClient(config);
    }
    if (isNetworkError) {
      error.message =
        'Cannot reach the server. It may be waking up — please wait a few seconds and try again.';
    }
    return Promise.reject(error);
  }
);

// Token helper methods
export const tokenStorage = {
  saveToken: async (token: string): Promise<void> => {
    await safeStorage.setItem(TOKEN_KEY, token);
  },
  getToken: async (): Promise<string | null> => {
    return safeStorage.getItem(TOKEN_KEY);
  },
  removeToken: async (): Promise<void> => {
    await safeStorage.removeItem(TOKEN_KEY);
  },
  saveUser: async (user: User): Promise<void> => {
    await safeStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: async (): Promise<User | null> => {
    const data = await safeStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  removeUser: async (): Promise<void> => {
    await safeStorage.removeItem(USER_KEY);
  },
  clearAuth: async (): Promise<void> => {
    await Promise.all([
      safeStorage.removeItem(TOKEN_KEY),
      safeStorage.removeItem(USER_KEY),
    ]);
  },
};

const ONBOARDING_KEY = '@taskly_has_completed_onboarding';
const FOCUS_AREA_KEY = '@taskly_user_focus_area';
const AVATAR_KEY = '@taskly_user_avatar';

// Onboarding persistence helper
export const onboardingStorage = {
  hasCompleted: async (): Promise<boolean> => {
    const val = await safeStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  },
  setCompleted: async (completed = true): Promise<void> => {
    await safeStorage.setItem(ONBOARDING_KEY, completed ? 'true' : 'false');
  },
  getFocusArea: async (): Promise<string | null> => {
    return safeStorage.getItem(FOCUS_AREA_KEY);
  },
  setFocusArea: async (area: string): Promise<void> => {
    await safeStorage.setItem(FOCUS_AREA_KEY, area);
  },
  getAvatar: async (): Promise<string | null> => {
    return safeStorage.getItem(AVATAR_KEY);
  },
  setAvatar: async (avatar: string): Promise<void> => {
    await safeStorage.setItem(AVATAR_KEY, avatar);
  },
};

// Auth API Services
export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return response.data;
  },
};

// Task API Services
export const taskService = {
  getTasks: async (filters?: TaskFilter): Promise<{ success: boolean; count: number; tasks: Task[] }> => {
    const params: any = {};
    if (filters?.completed && filters.completed !== 'all') params.completed = filters.completed;
    if (filters?.priority && filters.priority !== 'all') params.priority = filters.priority;
    if (filters?.search) params.search = filters.search;
    if (filters?.sortBy) params.sortBy = filters.sortBy;
    if (filters?.order) params.order = filters.order;

    const response = await apiClient.get<{ success: boolean; count: number; tasks: Task[] }>('/tasks', {
      params,
    });
    return response.data;
  },

  getTaskById: async (id: string): Promise<{ success: boolean; task: Task }> => {
    const response = await apiClient.get<{ success: boolean; task: Task }>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (payload: CreateTaskPayload): Promise<{ success: boolean; message: string; task: Task }> => {
    const response = await apiClient.post<{ success: boolean; message: string; task: Task }>('/tasks', payload);
    return response.data;
  },

  updateTask: async (
    id: string,
    payload: UpdateTaskPayload
  ): Promise<{ success: boolean; message: string; task: Task }> => {
    const response = await apiClient.put<{ success: boolean; message: string; task: Task }>(`/tasks/${id}`, payload);
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return response.data;
  },

  toggleTaskStatus: async (id: string): Promise<{ success: boolean; message: string; task: Task }> => {
    const response = await apiClient.patch<{ success: boolean; message: string; task: Task }>(
      `/tasks/${id}/complete`
    );
    return response.data;
  },
};
