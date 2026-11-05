import { useQuery } from '@tanstack/react-query';
import { wellnessPlanService } from '../services/api/wellnessPlanService';
import { WellnessPlan } from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useCurrentWellnessPlan = () => {
  return useQuery<WellnessPlan | null, Error>({
    queryKey: QUERY_KEYS.WELLNESS_PLANS.CURRENT,
    queryFn: () => wellnessPlanService.getCurrentPlan(),
    staleTime: 1000 * 60 * 5,
  });
};

