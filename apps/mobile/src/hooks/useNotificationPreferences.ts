import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/api/notificationService';
import { QUERY_KEYS } from '../constants/queryKeys';
import { NotificationPreferences, UpdateNotificationPreferencesDto } from '@solace/shared';
import { LocalNotificationService } from '../services/notifications/localNotificationService';

/**
 * Hook to retrieve user notification preferences
 */
export const useNotificationPreferences = () => {
  return useQuery<NotificationPreferences, Error>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.PREFERENCES,
    queryFn: () => notificationService.getPreferences(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Mutation to update user notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateNotificationPreferencesDto) =>
      notificationService.updatePreferences(data),
    onSuccess: (updatedPrefs) => {
      queryClient.setQueryData(QUERY_KEYS.NOTIFICATIONS.PREFERENCES, updatedPrefs);
      // Synchronize local scheduled alarms with the updated preferences
      LocalNotificationService.syncLocalNotificationsWithPreferences(updatedPrefs).catch(() => {});
    },
  });
};

