import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService, ActivityHistoryResponse } from '../services/api/activityService';
import {
  WellnessActivity,
  ActivityCompletion,
  CompleteActivityDto,
} from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useActivities = (params?: {
  category?: string;
  difficulty?: string;
  search?: string;
}) => {
  return useQuery<WellnessActivity[], Error>({
    queryKey: QUERY_KEYS.ACTIVITIES.LIST(params),
    queryFn: () => activityService.getActivities(params),
    staleTime: 1000 * 60 * 10, // 10 minutes cache for activities
  });
};

export const useActivityDetail = (id?: string) => {
  return useQuery<WellnessActivity, Error>({
    queryKey: QUERY_KEYS.ACTIVITIES.DETAIL(id || ''),
    queryFn: () => activityService.getActivityById(id!),
    enabled: Boolean(id),
  });
};

export const useCompleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<ActivityCompletion, Error, { id: string; dto: CompleteActivityDto }>({
    mutationFn: ({ id, dto }) => activityService.completeActivity(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVITIES.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.CURRENT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.HISTORY });
    },
  });
};

export const useActivityHistory = (page = 1, limit = 20) => {
  return useQuery<ActivityHistoryResponse, Error>({
    queryKey: QUERY_KEYS.ACTIVITIES.HISTORY(page),
    queryFn: () => activityService.getCompletedHistory({ page, limit }),
    staleTime: 1000 * 60 * 2,
  });
};

