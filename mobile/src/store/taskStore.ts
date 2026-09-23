import { create } from 'zustand';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilter } from '../types/task';
import { taskService } from '../services/api';
import { scheduleTaskReminder, cancelTaskReminder } from '../services/notificationService';

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  isLoading: boolean; // alias for compatibility
  isRefreshing: boolean;
  error: string | null;
  filters: TaskFilter;

  setFilters: (
    updater: TaskFilter | ((prev: TaskFilter) => TaskFilter)
  ) => void;

  fetchTasks: (silent?: boolean) => Promise<void>;
  addTask: (payload: CreateTaskPayload) => Promise<boolean>;
  createTask: (payload: CreateTaskPayload) => Promise<boolean>; // alias
  completeTask: (id: string) => Promise<boolean>;
  toggleTaskStatus: (id: string) => Promise<boolean>; // alias
  deleteTask: (id: string) => Promise<boolean>;
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<boolean>;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  isLoading: false,
  isRefreshing: false,
  error: null,
  filters: {
    completed: 'all',
    priority: 'all',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
  },

  setFilters: (updater) => {
    set((state) => {
      const nextFilters =
        typeof updater === 'function' ? updater(state.filters) : updater;
      return { filters: nextFilters };
    });
  },

  fetchTasks: async (silent = false) => {
    if (!silent) {
      set({ loading: true, isLoading: true, error: null });
    } else {
      set({ isRefreshing: true, error: null });
    }

    try {
      const response = await taskService.getTasks(get().filters);
      if (response.success && response.tasks) {
        set({ tasks: response.tasks });
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to fetch tasks.';
      set({ error: message });
    } finally {
      set({ loading: false, isLoading: false, isRefreshing: false });
    }
  },

  addTask: async (payload: CreateTaskPayload): Promise<boolean> => {
    set({ loading: true, isLoading: true, error: null });
    try {
      const response = await taskService.createTask(payload);
      if (response.success && response.task) {
        const newTask = response.task;
        set((state) => ({
          tasks: [newTask, ...state.tasks],
          loading: false,
          isLoading: false,
        }));

        // Schedule notification if reminder enabled
        if (newTask.reminderEnabled && (newTask.dateTime || newTask.deadline)) {
          await scheduleTaskReminder({
            taskId: newTask._id,
            title: newTask.title,
            taskDateTime: newTask.dateTime || newTask.deadline || '',
            reminderMinutesBefore: newTask.reminderMinutesBefore,
            category: newTask.category,
          });
        }

        return true;
      }
      set({ loading: false, isLoading: false });
      return false;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to create task.';
      set({ error: message, loading: false, isLoading: false });
      return false;
    }
  },

  createTask: async (payload: CreateTaskPayload) => {
    return get().addTask(payload);
  },

  completeTask: async (id: string): Promise<boolean> => {
    // Optimistic local update
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task._id === id ? { ...task, completed: !task.completed } : task
      ),
    }));

    try {
      const response = await taskService.toggleTaskStatus(id);
      if (response.success && response.task) {
        const updated = response.task;
        set((state) => ({
          tasks: state.tasks.map((item) =>
            item._id === id ? updated : item
          ),
        }));

        // If task completed, cancel reminder. If uncompleted, re-schedule
        if (updated.completed) {
          await cancelTaskReminder(id);
        } else if (updated.reminderEnabled && (updated.dateTime || updated.deadline)) {
          await scheduleTaskReminder({
            taskId: updated._id,
            title: updated.title,
            taskDateTime: updated.dateTime || updated.deadline || '',
            reminderMinutesBefore: updated.reminderMinutesBefore,
            category: updated.category,
          });
        }

        return true;
      }
      return false;
    } catch (err: any) {
      // Revert with background refetch on failure
      await get().fetchTasks(true);
      const message =
        err.response?.data?.message || err.message || 'Failed to toggle task.';
      set({ error: message });
      return false;
    }
  },

  toggleTaskStatus: async (id: string) => {
    return get().completeTask(id);
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<boolean> => {
    set({ loading: true, isLoading: true, error: null });
    try {
      const response = await taskService.updateTask(id, payload);
      if (response.success && response.task) {
        const updated = response.task;
        set((state) => ({
          tasks: state.tasks.map((item) =>
            item._id === id ? updated : item
          ),
          loading: false,
          isLoading: false,
        }));

        // Sync reminder state
        if (updated.completed || !updated.reminderEnabled) {
          await cancelTaskReminder(id);
        } else if (updated.reminderEnabled && (updated.dateTime || updated.deadline)) {
          await scheduleTaskReminder({
            taskId: updated._id,
            title: updated.title,
            taskDateTime: updated.dateTime || updated.deadline || '',
            reminderMinutesBefore: updated.reminderMinutesBefore,
            category: updated.category,
          });
        }

        return true;
      }
      set({ loading: false, isLoading: false });
      return false;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to update task.';
      set({ error: message, loading: false, isLoading: false });
      return false;
    }
  },

  deleteTask: async (id: string): Promise<boolean> => {
    set({ loading: true, isLoading: true, error: null });
    try {
      const response = await taskService.deleteTask(id);
      if (response.success) {
        set((state) => ({
          tasks: state.tasks.filter((item) => item._id !== id),
          loading: false,
          isLoading: false,
        }));

        // Cancel scheduled reminder for deleted task
        await cancelTaskReminder(id);

        return true;
      }
      set({ loading: false, isLoading: false });
      return false;
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Failed to delete task.';
      set({ error: message, loading: false, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));

// Provide compatibility alias for useTasks
export const useTasks = useTaskStore;

// Optional pass-through provider so existing wraps don't break
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return children as React.ReactElement;
};
