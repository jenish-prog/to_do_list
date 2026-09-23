/**
 * Returns dynamic greeting based on current local hour (e.g. "Good morning, Jenish")
 */
export const getGreeting = (name?: string): string => {
  const hour = new Date().getHours();
  const displayName = name ? name.split(' ')[0] : 'there';

  if (hour < 12) {
    return `Good morning, ${displayName}`;
  } else if (hour < 17) {
    return `Good afternoon, ${displayName}`;
  } else {
    return `Good evening, ${displayName}`;
  }
};

/**
 * Returns formatted header date: "Tuesday, September 22"
 */
export const getFormattedHeaderDate = (d: Date = new Date()): string => {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats a date string into readable text (e.g. "Sep 22, 2026")
 */
export const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString?: string | Date): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  return `${formatDate(date)} at ${date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
};

/**
 * Formats date and time into input display style (e.g. "22 Sep, 2026   04:00 PM")
 */
export const formatInputDateTime = (dateString?: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return `${day} ${month}, ${year}   ${time}`;
};

/**
 * Checks if a date falls on today
 */
export const isToday = (dateString?: string | Date): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
};

/**
 * Checks if a date is in the future beyond today
 */
export const isUpcoming = (dateString?: string | Date): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return date.getTime() > todayEnd.getTime();
};

/**
 * Formats date and time for card badges: "Today 6:00 PM" or "Tomorrow 4:00 PM" or "Sep 23 6:00 PM"
 */
export const formatDisplayDeadline = (dateString?: string | Date): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const dateIsToday = isToday(date);

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (dateIsToday) {
    return `Today ${timeStr}`;
  } else if (isTomorrow) {
    return `Tomorrow ${timeStr}`;
  } else {
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day} ${timeStr}`;
  }
};

/**
 * Checks if a task's deadline has passed
 */
export const isOverdue = (deadline?: string | Date, completed?: boolean): boolean => {
  if (!deadline || completed === true) return false;
  const due = new Date(deadline).getTime();
  const now = new Date().getTime();
  return due < now;
};

/**
 * Returns a relative friendly string (e.g. "Today", "Tomorrow", "In 3 days", "Overdue")
 */
export const getRelativeDueDate = (dueDate?: string | Date): { text: string; isUrgent: boolean } => {
  if (!dueDate) return { text: 'No deadline', isUrgent: false };
  const due = new Date(dueDate);
  const now = new Date();

  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)}d`, isUrgent: true };
  }
  if (diffDays === 0) {
    return { text: 'Due today', isUrgent: true };
  }
  if (diffDays === 1) {
    return { text: 'Due tomorrow', isUrgent: false };
  }
  if (diffDays <= 7) {
    return { text: `Due in ${diffDays}d`, isUrgent: false };
  }

  return { text: formatDate(due), isUrgent: false };
};
