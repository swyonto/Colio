import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

/**
 * Request notification permissions and register the Android channel
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
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
      console.log('[Notifications] Permission not granted.');
      return null;
    }

    // Set up Android notification channels with high importance and vibration
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('colio_lectures', {
        name: 'Lecture Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('colio_alerts', {
        name: 'Campus & Academic Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#38BDF8',
      });
    }

    // Return the device push token if needed for backend/FCM targeting
    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null);
    return tokenData?.data || null;
  } catch (err) {
    console.warn('[Notifications] Registration error:', err);
    return null;
  }
}

/**
 * Schedule a local notification reminder for an upcoming lecture
 */
export async function scheduleLectureReminder(
  subjectName: string,
  room: string,
  startTimeStr: string, // e.g. "09:30"
  dayOfWeek: number // 1 = Monday, 6 = Saturday
): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const [hours, minutes] = startTimeStr.split(':').map(Number);
    let triggerMinutes = minutes - 10;
    let triggerHours = hours;

    if (triggerMinutes < 0) {
      triggerMinutes += 60;
      triggerHours -= 1;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming Lecture: ${subjectName}`,
        body: `Class starts in 10 minutes at ${room || 'Assigned Room'}. Don't forget to mark attendance!`,
        sound: 'default',
        channelId: 'colio_lectures',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: dayOfWeek === 7 ? 1 : dayOfWeek + 1, // Expo uses 1 = Sunday
        hour: triggerHours,
        minute: triggerMinutes,
      },
    });

    return id;
  } catch (error) {
    console.warn('[Notifications] Failed to schedule lecture reminder:', error);
    return null;
  }
}

/**
 * Trigger an immediate test notification to verify Android delivery
 */
export async function sendInstantTestNotification(title?: string, body?: string) {
  if (Platform.OS === 'web') {
    alert(title || 'Colio Notification: Test Alert');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title || 'Colio Campus OS 🎓',
      body: body || 'Your notifications and Firestore sync are active!',
      sound: 'default',
      channelId: 'colio_alerts',
    },
    trigger: null, // Send immediately
  });
}
