import { useQuery } from '@tanstack/react-query';
import { achievementService } from '../services/api/achievementService';
import { UserAchievement, Achievement } from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

/**
 * Hook to retrieve user achievements with progress and unlock statuses
 */
export const useUserAchievements = () => {
  return useQuery<UserAchievement[], Error>({
    queryKey: QUERY_KEYS.ACHIEVEMENTS.MINE,
    queryFn: () => achievementService.getMyAchievements(),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to retrieve single achievement definition
 */
export const useAchievementDetail = (id: string) => {
  return useQuery<Achievement, Error>({
    queryKey: QUERY_KEYS.ACHIEVEMENTS.DETAIL(id),
    queryFn: () => achievementService.getAchievementById(id),
    enabled: Boolean(id),
  });
};
