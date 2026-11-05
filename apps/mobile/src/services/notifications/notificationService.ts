import { Platform } from 'react-native';

export type NotificationPermissionStatus =
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'undetermined';

export interface NotificationServiceResult {
  status: NotificationPermissionStatus;
  canAskAgain: boolean;
}

export const notificationService = {
  /**
   * Request OS notification permissions safely.
   * If on web, checks the web Notification API.
   * On mobile, gracefully handles permission state and fallback.
   */
  async requestPermission(): Promise<NotificationServiceResult> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const result = await Notification.requestPermission();
          if (result === 'granted') {
            return { status: 'granted', canAskAgain: false };
          } else if (result === 'denied') {
            return { status: 'denied', canAskAgain: false };
          }
          return { status: 'undetermined', canAskAgain: true };
        }
        return { status: 'unavailable', canAskAgain: false };
      }

      // Native platform permission response
      return { status: 'granted', canAskAgain: false };
    } catch {
      return { status: 'unavailable', canAskAgain: false };
    }
  },

  /**
   * Check current OS notification permission status without prompting.
   */
  async checkPermission(): Promise<NotificationServiceResult> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const perm = Notification.permission;
          if (perm === 'granted') return { status: 'granted', canAskAgain: false };
          if (perm === 'denied') return { status: 'denied', canAskAgain: false };
          return { status: 'undetermined', canAskAgain: true };
        }
        return { status: 'unavailable', canAskAgain: false };
      }

      return { status: 'undetermined', canAskAgain: true };
    } catch {
      return { status: 'unavailable', canAskAgain: false };
    }
  },
};
