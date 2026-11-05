import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services/api/notificationService';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useUnreadNotificationCount = () => {
  return useQuery<number, Error>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT,
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

