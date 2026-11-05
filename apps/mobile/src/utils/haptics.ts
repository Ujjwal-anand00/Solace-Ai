import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const safeHaptic = async (fn: () => Promise<void>): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await fn();
  } catch {
    // Gracefully ignore haptic feedback errors when hardware or async context is unavailable
  }
};

export const triggerHaptic = {
  selection: (): void => {
    safeHaptic(() => Haptics.selectionAsync()).catch(() => {});
  },
  light: (): void => {
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)).catch(() => {});
  },
  medium: (): void => {
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)).catch(() => {});
  },
  heavy: (): void => {
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)).catch(() => {});
  },
  success: (): void => {
    safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)).catch(() => {});
  },
  warning: (): void => {
    safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)).catch(() => {});
  },
  error: (): void => {
    safeHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)).catch(() => {});
  },
};
