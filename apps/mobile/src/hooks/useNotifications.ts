import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/api/notificationService';
import { QUERY_KEYS } from '../constants/queryKeys';
import { SolaceNotification, PaginationMeta } from '@solace/shared';

/**
 * Hook to retrieve unread notification count
 */
export const useUnreadNotificationCount = () => {
  return useQuery<number, Error>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.UNREAD_COUNT,
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Hook to retrieve paginated notification inbox
 */
export const useNotificationsInbox = (
  page = 1,
  limit = 20,
  type?: string,
  status?: string,
) => {
  return useQuery<{ data: SolaceNotification[]; meta: PaginationMeta }, Error>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.INBOX(page, limit, type, status),
    queryFn: () => notificationService.getNotifications(page, limit, type, status),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Mutation to mark a single notification as read
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });
};

/**
 * Mutation to mark all notifications as read
 */
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });
};

/**
 * Mutation to delete a notification
 */
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.ALL });
    },
  });
};
