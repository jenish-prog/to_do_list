import { Task, TaskPriority } from '../types/task';

const PRIORITY_SCORES: Record<TaskPriority, number> = {
  high: 50,
  medium: 30,
  low: 10,
};

/**
 * Calculates a dynamic Urgency Score (0 - 100+) by combining
 * the task's priority weight and deadline proximity.
 *
 * Examples:
 * - High priority + deadline today     => 50 + 50 = 100
 * - High priority + deadline tomorrow  => 50 + 35 = 85
 * - Medium priority + deadline today   => 30 + 50 = 80
 * - Low priority + deadline next week  => 10 + 15 = 25
 */
export const calculateUrgencyScore = (task: Task): number => {
  if (task.completed) return 0;

  const priorityScore = PRIORITY_SCORES[task.priority] || 20;

  if (!task.deadline) {
    return priorityScore;
  }

  const now = Date.now();
  const deadlineTime = new Date(task.deadline).getTime();
  const diffMs = deadlineTime - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  let deadlineScore = 0;

  if (diffHours < 0) {
    // Overdue tasks receive max urgency score plus a bonus
    deadlineScore = 55;
  } else if (diffHours <= 2) {
    // Due in 2 hours or less
    deadlineScore = 50;
  } else if (diffHours <= 24) {
    // Due today
    deadlineScore = 50;
  } else if (diffHours <= 48) {
    // Due tomorrow
    deadlineScore = 35;
  } else if (diffHours <= 72) {
    // Due in 3 days
    deadlineScore = 25;
  } else if (diffHours <= 168) {
    // Due in next week (up to 7 days)
    deadlineScore = 15;
  } else {
    // Due later
    deadlineScore = 5;
  }

  return priorityScore + deadlineScore;
};

/**
 * Returns a human-friendly deadline tag like "Due in 2h", "Due today", "Due tomorrow"
 */
export const getUrgencyDueLabel = (task: Task): string => {
  if (!task.deadline) return 'No deadline';

  const now = Date.now();
  const deadlineTime = new Date(task.deadline).getTime();
  const diffMs = deadlineTime - now;
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 0) {
    const daysAgo = Math.abs(diffDays);
    return daysAgo <= 1 ? 'Overdue' : `Overdue ${daysAgo}d`;
  }

  if (diffHours <= 2) {
    return diffHours <= 0 ? 'Due now' : `Due in ${diffHours}h`;
  }

  if (diffHours <= 24) {
    return 'Due today';
  }

  if (diffDays === 1 || (diffHours > 24 && diffHours <= 48)) {
    return 'Due tomorrow';
  }

  if (diffDays <= 7) {
    return `Due in ${diffDays}d`;
  }

  const d = new Date(task.deadline);
  return `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
};

/**
 * Sorts uncompleted tasks by Urgency Score in descending order.
 */
export const getRecommendedNextTasks = (tasks: Task[], limit: number = 3): Task[] => {
  return tasks
    .filter((t) => !t.completed)
    .map((task) => ({ task, score: calculateUrgencyScore(task) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.task);
};
