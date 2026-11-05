import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodService, MoodListResponse } from '../services/api/moodService';
import {
  CreateMoodDto,
  UpdateMoodDto,
  MoodEntry,
  MoodSummary,
  MoodCalendarDay,
  MoodInsightsResponse,
} from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useMoods = (params?: {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  mood?: string;
  emotion?: string;
}) => {
  return useQuery<MoodListResponse, Error>({
    queryKey: QUERY_KEYS.MOOD.LIST(params),
    queryFn: () => moodService.getMoods(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useMoodSummary = () => {
  return useQuery<MoodSummary, Error>({
    queryKey: QUERY_KEYS.MOOD.SUMMARY,
    queryFn: () => moodService.getMoodSummary(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMoodCalendar = (year?: number, month?: number) => {
  return useQuery<MoodCalendarDay[], Error>({
    queryKey: QUERY_KEYS.MOOD.CALENDAR(year, month),
    queryFn: () => moodService.getMoodCalendar({ year, month }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMoodInsights = (days?: number) => {
  return useQuery<MoodInsightsResponse, Error>({
    queryKey: QUERY_KEYS.MOOD.INSIGHTS(days),
    queryFn: () => moodService.getMoodInsights({ days }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMoodDetail = (id?: string) => {
  return useQuery<MoodEntry, Error>({
    queryKey: QUERY_KEYS.MOOD.DETAIL(id || ''),
    queryFn: () => moodService.getMoodById(id!),
    enabled: Boolean(id),
  });
};

export const useCreateMood = () => {
  const queryClient = useQueryClient();

  return useMutation<MoodEntry, Error, CreateMoodDto>({
    mutationFn: (data: CreateMoodDto) => moodService.createMood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MOOD.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.CURRENT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.HISTORY });
    },
  });
};

export const useUpdateMood = () => {
  const queryClient = useQueryClient();

  return useMutation<MoodEntry, Error, { id: string; data: UpdateMoodDto }>({
    mutationFn: ({ id, data }) => moodService.updateMood(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MOOD.ALL });
      queryClient.setQueryData(QUERY_KEYS.MOOD.DETAIL(data.id), data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.CURRENT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.HISTORY });
    },
  });
};

export const useDeleteMood = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => moodService.deleteMood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MOOD.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.CURRENT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.HISTORY });
    },
  });
};
