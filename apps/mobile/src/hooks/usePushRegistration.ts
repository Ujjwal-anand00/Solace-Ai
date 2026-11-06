import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { LocalNotificationService } from '../services/notifications/localNotificationService';
import { notificationService } from '../services/api/notificationService';
import { DevicePlatform } from '@solace/shared';

export const usePushRegistration = (isAuthenticated: boolean) => {
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Check permissions and register push token with backend
    const registerPush = async () => {
      try {
        const token = await LocalNotificationService.getExpoPushToken();
        if (token) {
          const platform = (Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web') as DevicePlatform;
          await notificationService.registerDevice({
            token,
            platform,
            appVersion: '1.0.0',
          });
        }
      } catch {
        // Silently handle registration errors in simulator/offline
      }
    };

    registerPush();

    // 2. Cold-start notification response check (app opened from closed state)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response?.notification?.request?.content?.data?.deepLink) {
        const link = response.notification.request.content.data.deepLink as string;
        try {
          router.push(link as Href);
        } catch {
          router.push('/(home)');
        }
      }
    });

    // 3. Foreground notification received listener
    notificationListener.current = Notifications.addNotificationReceivedListener((_notification) => {
      // Optional foreground badge / alert handling
    });

    // 4. Notification interaction (tap) listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.deepLink && typeof data.deepLink === 'string') {
        try {
          router.push(data.deepLink as Href);
        } catch {
          router.push('/(home)');
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, router]);
};
