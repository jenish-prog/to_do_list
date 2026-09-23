import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_MAP_KEY = '@app_task_notification_map';

// Configure foreground notification behavior safely
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('Could not initialize notification handler:', e);
}

/**
 * Ensures Android channel is configured with high priority and sound
 */
export const setupNotificationChannel = async (): Promise<void> => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('task-reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFFFFF',
        sound: 'default',
      });
    }
  } catch (e) {
    console.warn('Could not setup Android notification channel:', e);
  }
};

/**
 * Checks current notification permission status
 */
export const getNotificationPermissionStatus = async (): Promise<Notifications.PermissionStatus> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (e) {
    console.warn('Could not check notification permissions:', e);
    return Notifications.PermissionStatus.UNDETERMINED;
  }
};

/**
 * Requests notification permission if not yet granted
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    await setupNotificationChannel();
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Could not request notification permissions:', e);
    return false;
  }
};

// Internal map helpers
const getNotificationMap = async (): Promise<Record<string, string>> => {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveNotificationMap = async (map: Record<string, string>): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_MAP_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving notification map:', e);
  }
};

/**
 * Cancels any scheduled notification for a given task ID
 */
export const cancelTaskReminder = async (taskId: string): Promise<void> => {
  try {
    const map = await getNotificationMap();
    const notificationId = map[taskId];
    if (notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      delete map[taskId];
      await saveNotificationMap(map);
    }
  } catch (error) {
    console.warn('Could not cancel notification for task:', taskId, error);
  }
};

export interface ScheduleReminderParams {
  taskId: string;
  title: string;
  taskDateTime: string | Date; // Scheduled date/time or deadline
  reminderMinutesBefore?: number; // 0, 5, 10, 15, 30, 60, 1440, etc.
  category?: string;
}

/**
 * Schedules a local notification reminder for a task
 * Returns the notification identifier if successfully scheduled, or null
 */
export const scheduleTaskReminder = async ({
  taskId,
  title,
  taskDateTime,
  reminderMinutesBefore = 0,
  category,
}: ScheduleReminderParams): Promise<string | null> => {
  try {
    const targetDate = new Date(taskDateTime);
    if (isNaN(targetDate.getTime())) {
      return null;
    }

    // Compute trigger time = targetDate - reminderMinutesBefore
    const triggerTimestamp = targetDate.getTime() - reminderMinutesBefore * 60 * 1000;
    const now = Date.now();

    // Do not schedule if time is already in the past
    if (triggerTimestamp <= now) {
      return null;
    }

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    // Cancel existing reminder if any
    await cancelTaskReminder(taskId);

    // Format human-friendly timing text for body
    let timingLabel = 'Now';
    if (reminderMinutesBefore === 0) {
      timingLabel = 'Due now';
    } else if (reminderMinutesBefore === 5) {
      timingLabel = 'Due in 5 minutes';
    } else if (reminderMinutesBefore === 10) {
      timingLabel = 'Due in 10 minutes';
    } else if (reminderMinutesBefore === 15) {
      timingLabel = 'Due in 15 minutes';
    } else if (reminderMinutesBefore === 30) {
      timingLabel = 'Due in 30 minutes';
    } else if (reminderMinutesBefore === 60) {
      timingLabel = 'Due in 1 hour';
    } else if (reminderMinutesBefore === 1440) {
      timingLabel = 'Due tomorrow';
    } else {
      timingLabel = `Due in ${reminderMinutesBefore} minutes`;
    }

    const categoryBadge = category ? `[${category}] ` : '';

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${categoryBadge}Task Reminder`,
        body: `${title} · ${timingLabel}`,
        data: { taskId },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(triggerTimestamp),
        channelId: 'task-reminders',
      },
    });

    const map = await getNotificationMap();
    map[taskId] = notificationId;
    await saveNotificationMap(map);

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule task reminder:', error);
    return null;
  }
};

/**
 * Sends an immediate test notification to verify device sound and banner
 */
export const sendTestNotification = async (): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return false;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Taskly Reminder Active',
        body: 'Your task notification system is configured and working perfectly!',
        sound: 'default',
      },
      trigger: {
        channelId: 'task-reminders',
      } as any, // deliver immediately with channel
    });
    return true;
  } catch (error) {
    console.error('Failed to send test notification:', error);
    return false;
  }
};
