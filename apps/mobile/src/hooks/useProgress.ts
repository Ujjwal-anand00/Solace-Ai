import { useQuery } from '@tanstack/react-query';
import { progressService } from '../services/api/progressService';
import { UserProgress, ProgressHistoryItem } from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useProgress = () => {
  return useQuery<UserProgress, Error>({
    queryKey: QUERY_KEYS.PROGRESS.CURRENT,
    queryFn: () => progressService.getProgress(),
    staleTime: 1000 * 60 * 2,
  });
};

export const useProgressHistory = () => {
  return useQuery<ProgressHistoryItem[], Error>({
    queryKey: QUERY_KEYS.PROGRESS.HISTORY,
    queryFn: () => progressService.getProgressHistory(),
    staleTime: 1000 * 60 * 2,
  });
};
