import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/api/notificationService';
import { QUERY_KEYS } from '../constants/queryKeys';
import { ScheduledReminder, CreateReminderDto, UpdateReminderDto } from '@solace/shared';

export const useReminders = () => {
  return useQuery<ScheduledReminder[], Error>({
    queryKey: QUERY_KEYS.NOTIFICATIONS.REMINDERS,
    queryFn: () => notificationService.getReminders(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReminderDto) => notificationService.createReminder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.REMINDERS });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReminderDto }) =>
      notificationService.updateReminder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.REMINDERS });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS.REMINDERS });
    },
  });
};

