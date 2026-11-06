import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { NotificationPreferences } from '@solace/shared';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPresentAlert: true,
  }),
});

export interface ScheduleLocalNotificationParams {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  trigger?: Notifications.NotificationTriggerInput;
  channelId?: string;
}

export class LocalNotificationService {
  private static channelsInitialized = false;

  /**
   * Set up Android notification channels with appropriate priorities and sounds
   */
  public static async setupAndroidChannels(): Promise<void> {
    if (Platform.OS !== 'android' || this.channelsInitialized) return;

    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'General Sanctuary',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#829B83',
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Wellness Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 300, 200, 300],
        lightColor: '#829B83',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('milestones', {
        name: 'Milestones & Celebrations',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 400, 200, 400],
        lightColor: '#FBBF24',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('wellness', {
        name: 'Mindfulness & Breathing',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#829B83',
      });

      this.channelsInitialized = true;
    } catch {
      // Gracefully handle channel creation in unsupported environments
    }
  }

  /**
   * Check current push notification permission status
   */
  public static async getPermissionStatus(): Promise<Notifications.PermissionStatus> {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings.status;
    } catch {
      return Notifications.PermissionStatus.UNDETERMINED;
    }
  }

  /**
   * Request push notification permissions with user consent
   */
  public static async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      return status === Notifications.PermissionStatus.GRANTED;
    } catch {
      return false;
    }
  }

  /**
   * Retrieve the Expo Push Token for remote push notifications
   */
  public static async getExpoPushToken(): Promise<string | null> {
    if (!Device.isDevice && Platform.OS !== 'web') {
      // In simulator/emulator, Expo push tokens are typically not available
      return null;
    }

    try {
      const perm = await this.getPermissionStatus();
      if (perm !== Notifications.PermissionStatus.GRANTED) {
        return null;
      }

      await this.setupAndroidChannels();

      const tokenData = await Notifications.getExpoPushTokenAsync();
      return tokenData.data;
    } catch {
      return null;
    }
  }

  /**
   * Schedule a single local notification
   */
  public static async scheduleNotification(
    params: ScheduleLocalNotificationParams,
  ): Promise<string> {
    await this.setupAndroidChannels();

    return Notifications.scheduleNotificationAsync({
      content: {
        title: params.title,
        body: params.body,
        data: params.data,
        sound: 'default',
        color: '#829B83',
      },
      trigger: params.trigger || null,
    });
  }

  /**
   * Cancel all pending scheduled local notifications
   */
  public static async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {
      // ignore
    }
  }

  /**
   * Sync local device scheduled alarms with user preferences
   * Guarantees reminders trigger on the device even without internet connectivity
   */
  public static async syncLocalNotificationsWithPreferences(
    prefs: NotificationPreferences,
  ): Promise<void> {
    await this.cancelAllScheduledNotifications();

    if (!prefs.masterEnabled) {
      return;
    }

    // 1. Daily Wellness Reminder
    if (prefs.dailyWellness.enabled && prefs.dailyWellness.time) {
      const [hourStr, minStr] = prefs.dailyWellness.time.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);

      if (!isNaN(hour) && !isNaN(minute)) {
        await this.scheduleNotification({
          title: 'Daily Sanctuary Pause 🌿',
          body: 'Take a gentle breath for yourself today. Your wellness matters.',
          data: { deepLink: '/(home)', type: 'daily_wellness' },
          channelId: 'reminders',
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
      }
    }

    // 2. Evening Mood Check-in Reminder
    if (prefs.moodCheckin.enabled && prefs.moodCheckin.time) {
      const [hourStr, minStr] = prefs.moodCheckin.time.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);

      if (!isNaN(hour) && !isNaN(minute)) {
        await this.scheduleNotification({
          title: 'Evening Reflection 🌙',
          body: 'How are you feeling right now? Take a quiet moment to check in.',
          data: { deepLink: '/mood/check-in', type: 'mood_checkin' },
          channelId: 'reminders',
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
      }
    }

    // 3. Afternoon Breathing Pause
    if (prefs.breathingReminders?.enabled && prefs.breathingReminders.time) {
      const [hourStr, minStr] = prefs.breathingReminders.time.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);

      if (!isNaN(hour) && !isNaN(minute)) {
        await this.scheduleNotification({
          title: 'Mindful Breath Pause ✨',
          body: 'Unclench your jaw, soften your shoulders, and take a deep breath.',
          data: { deepLink: '/activities', type: 'breathing' },
          channelId: 'wellness',
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
          },
        });
      }
    }
  }
}
