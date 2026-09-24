import type * as NotificationsType from 'expo-notifications';
import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import type { TimetableSlot, Subject, Task } from '../types/campus';

// Dynamically and safely require expo-notifications to prevent runtime crashes in Expo Go
let Notifications: typeof NotificationsType | null = null;
try {
  Notifications = require('expo-notifications');
} catch (err) {
  console.warn('[Notifications] Notice: expo-notifications module could not be loaded in this environment:', err);
}

// Helper accessors for enums/constants that safely degrade if Notifications is unavailable
const getTriggerWeekly = () => Notifications?.SchedulableTriggerInputTypes?.WEEKLY ?? ('weekly' as any);
const getTriggerDate = () => Notifications?.SchedulableTriggerInputTypes?.DATE ?? ('date' as any);
const getImportanceMax = () => Notifications?.AndroidImportance?.MAX ?? 7;
const getImportanceHigh = () => Notifications?.AndroidImportance?.HIGH ?? 6;
const getImportanceDefault = () => Notifications?.AndroidImportance?.DEFAULT ?? 5;

// Safe foreground notification presentation behavior
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        priority: Notifications?.AndroidNotificationPriority?.HIGH ?? ('high' as any),
      }),
    });
  } catch (err) {
    console.warn('[Notifications] Failed to set notification handler:', err);
  }
}

/**
 * Request notification permissions and register Android notification channels
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web' || !Notifications) {
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return null;
    }

    // Set up Android notification channels with high importance and distinct vibrations
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('colio_lectures', {
        name: 'Lecture Reminders (10-Min Alerts)',
        importance: getImportanceMax(),
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('colio_tasks', {
        name: 'Assignment & Task Deadlines',
        importance: getImportanceHigh(),
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#F59E0B',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('colio_attendance', {
        name: '75% Attendance Safeguard',
        importance: getImportanceMax(),
        vibrationPattern: [0, 300, 100, 300],
        lightColor: '#EF4444',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('colio_briefing', {
        name: 'Morning Routine Schedule Brief',
        importance: getImportanceDefault(),
        vibrationPattern: [0, 150, 150, 150],
        lightColor: '#38BDF8',
      });

      await Notifications.setNotificationChannelAsync('colio_alerts', {
        name: 'General Campus Alerts',
        importance: getImportanceHigh(),
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#38BDF8',
      });
    }

    // In Expo Go (SDK 53+), remote push tokens were removed.
    // Local notifications (lecture alarms, safeguard alerts, briefings) continue to work natively!
    if (isRunningInExpoGo()) {
      return null;
    }

    // Safe retrieval of device token (in standalone APK or Custom Dev Build)
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'b44055ef-1089-4e40-a56e-a130791f8d4e',
      });
      return tokenData?.data || null;
    } catch {
      return null;
    }
  } catch (err) {
    console.warn('[Notifications] Registration error:', err);
    return null;
  }
}

/**
 * 1. Schedule a lecture reminder (5, 10, or 15 mins before class starts)
 */
export async function scheduleLectureReminder(
  subjectName: string,
  room: string,
  startTimeStr: string, // e.g. "09:30" or "8:30"
  dayOfWeek: number, // 1 = Monday, ..., 6 = Saturday
  leadMinutes: number = 10
): Promise<string | null> {
  if (Platform.OS === 'web' || !Notifications?.scheduleNotificationAsync) return null;

  try {
    const [hours, minutes] = (startTimeStr || '09:00').split(':').map((val) => parseInt(val, 10) || 0);
    let triggerMinutes = minutes - leadMinutes;
    let triggerHours = hours;

    if (triggerMinutes < 0) {
      triggerMinutes += 60;
      triggerHours = triggerHours > 0 ? triggerHours - 1 : 23;
    }

    // Expo weekday convention: 1 = Sunday, 2 = Monday, ..., 7 = Saturday
    const expoWeekday = dayOfWeek >= 7 ? 1 : dayOfWeek + 1;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming Lecture: ${subjectName} ⏰`,
        body: `Class starts in ${leadMinutes} mins at ${room || 'Assigned Room'}. Don't forget to mark attendance!`,
        sound: 'default',
        data: { channelId: 'colio_lectures' },
      },
      trigger: {
        type: getTriggerWeekly(),
        weekday: expoWeekday,
        hour: triggerHours,
        minute: triggerMinutes,
        channelId: 'colio_lectures',
      },
    });

    return id;
  } catch (error) {
    console.warn('[Notifications] Failed to schedule lecture reminder:', error);
    return null;
  }
}

/**
 * 2. Schedule a Task / Assignment Deadline Reminder
 * Triggers on the evening before (8:00 PM)
 */
export async function scheduleTaskDeadlineReminder(
  task: Task,
  subjectName?: string
): Promise<string | null> {
  if (Platform.OS === 'web' || !Notifications?.scheduleNotificationAsync || task.completed) return null;

  try {
    // If dueDate is a valid YYYY-MM-DD
    let targetDate = new Date();
    if (task.dueDate === 'Today') {
      targetDate.setHours(17, 0, 0, 0); // 5:00 PM today
    } else if (task.dueDate === 'Tomorrow') {
      targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(17, 0, 0, 0);
    } else {
      const parsed = new Date(task.dueDate);
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
        targetDate.setHours(17, 0, 0, 0);
      }
    }

    // Schedule 2 hours before 5 PM (at 3 PM)
    const reminderTime = new Date(targetDate.getTime() - 2 * 60 * 60 * 1000);
    if (reminderTime.getTime() <= Date.now()) {
      return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Assignment Due Today 📝: ${task.title}`,
        body: `${subjectName ? `[${subjectName}] ` : ''}Due at 5:00 PM. Make sure to finalize and submit!`,
        sound: 'default',
        data: { channelId: 'colio_tasks', taskId: task.id },
      },
      trigger: {
        type: getTriggerDate(),
        date: reminderTime,
      },
    });

    return id;
  } catch (error) {
    console.warn('[Notifications] Failed to schedule task reminder:', error);
    return null;
  }
}

/**
 * 3. 75% Attendance Safeguard Warning Alert
 * Triggers immediately when a subject drops below criteria or enters danger zone
 */
export async function triggerAttendanceSafeguardAlert(
  subjectName: string,
  currentPercent: number,
  targetPercent: number = 75,
  classesNeeded: number = 2
) {
  if (Platform.OS === 'web' || !Notifications?.scheduleNotificationAsync) {
    if (typeof alert !== 'undefined') {
      alert(`⚠️ Attendance Alert: ${subjectName} is at ${currentPercent}%. Attend next ${classesNeeded} classes to restore ${targetPercent}%.`);
    }
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⚠️ 75% Attendance Safeguard: ${subjectName}`,
        body: `Your attendance is currently ${currentPercent}% (below ${targetPercent}% target). You must attend the next ${classesNeeded} lectures to recover.`,
        sound: 'default',
        data: { channelId: 'colio_attendance' },
      },
      trigger: null, // Immediate warning
    });
  } catch (error) {
    console.warn('[Notifications] Safeguard alert failed:', error);
  }
}

/**
 * 4. Schedule Daily Morning Routine Briefing (8:00 AM Mon–Sat)
 * Summarizes the day's class count and first class timing
 */
export async function scheduleDailyMorningBriefing(
  slots: TimetableSlot[],
  subjects: Subject[],
  enabled: boolean
): Promise<void> {
  if (Platform.OS === 'web' || !Notifications?.scheduleNotificationAsync || !enabled || !slots || slots.length === 0) return;

  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
  const days = [1, 2, 3, 4, 5, 6]; // Mon to Sat

  for (const dayNum of days) {
    const daySlots = slots
      .filter((s) => s.dayOfWeek === dayNum)
      .sort((a, b) => (a.period || 0) - (b.period || 0));

    if (daySlots.length === 0) continue;

    const firstSlot = daySlots[0];
    const firstSubject = subjectMap.get(firstSlot.subjectId) || firstSlot.subjectId;
    const expoWeekday = dayNum >= 7 ? 1 : dayNum + 1;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Colio Morning Routine 🌅`,
          body: `Good morning! You have ${daySlots.length} classes today. First class: ${firstSubject} at ${firstSlot.startTime} in ${firstSlot.room || 'Assigned Room'}.`,
          sound: 'default',
          data: { channelId: 'colio_briefing' },
        },
        trigger: {
          type: getTriggerWeekly(),
          weekday: expoWeekday,
          hour: 8,
          minute: 0,
          channelId: 'colio_briefing',
        },
      });
    } catch {
      // Ignore individual day error
    }
  }
}

/**
 * Master Sync: Bulk schedules all active lecture reminders + morning briefings
 */
export async function syncAllTimetableReminders(
  slots: TimetableSlot[],
  subjects: Subject[],
  enabled: boolean,
  leadMinutes: number = 10,
  morningBriefingEnabled: boolean = true
): Promise<number> {
  if (Platform.OS === 'web' || !Notifications?.cancelAllScheduledNotificationsAsync) return 0;

  try {
    // Clear previously scheduled alarms to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!enabled || !slots || slots.length === 0) {
      return 0;
    }

    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
    let scheduledCount = 0;

    for (const slot of slots) {
      if (slot.dayOfWeek && slot.startTime) {
        const subjectName = subjectMap.get(slot.subjectId) || slot.subjectId;
        await scheduleLectureReminder(
          subjectName,
          slot.room || 'Assigned Room',
          slot.startTime,
          slot.dayOfWeek,
          leadMinutes
        );
        scheduledCount++;
      }
    }

    if (morningBriefingEnabled) {
      await scheduleDailyMorningBriefing(slots, subjects, true);
    }

    return scheduledCount;
  } catch (error) {
    console.warn('[Notifications] Failed to sync timetable alarms:', error);
    return 0;
  }
}

/**
 * Trigger an immediate test notification to verify Android delivery
 */
export async function sendInstantTestNotification(title?: string, body?: string) {
  if (Platform.OS === 'web' || !Notifications?.scheduleNotificationAsync) {
    if (typeof alert !== 'undefined') {
      alert(title || 'Colio Notification: Test Alert');
    }
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title || 'Colio 🎓',
        body: body || 'Your notifications and Firestore sync are active!',
        sound: 'default',
        data: { channelId: 'colio_alerts' },
      },
      trigger: null,
    });
  } catch (err) {
    console.warn('[Notifications] Test alert failed:', err);
  }
}
