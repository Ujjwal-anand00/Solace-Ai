import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = {
  selection: async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
  },
  light: async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },
  medium: async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },
  heavy: async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },
  success: async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },
  warning: async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },
  error: async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },
};
