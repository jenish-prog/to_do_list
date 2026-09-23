export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  dateTime?: string;
  deadline?: string;
  priority: TaskPriority;
  category?: string;
  tags?: string[];
  reminderMinutesBefore?: number;
  reminderEnabled?: boolean;
  notificationId?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  dateTime?: string;
  deadline?: string;
  priority?: TaskPriority;
  category?: string;
  tags?: string[];
  reminderMinutesBefore?: number;
  reminderEnabled?: boolean;
  notificationId?: string;
  completed?: boolean;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  dateTime?: string;
  deadline?: string;
  priority?: TaskPriority;
  category?: string;
  tags?: string[];
  reminderMinutesBefore?: number;
  reminderEnabled?: boolean;
  notificationId?: string;
  completed?: boolean;
}

export type SortField = 'priority' | 'deadline' | 'dateTime' | 'createdAt' | 'title' | 'completed' | 'urgency';
export type SortOrder = 'asc' | 'desc';

export interface TaskFilter {
  completed?: string; // 'all' | 'true' | 'false'
  priority?: string;
  category?: string;
  search?: string;
  sortBy?: SortField;
  order?: SortOrder;
}
