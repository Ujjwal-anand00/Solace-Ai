import { useQuery } from '@tanstack/react-query';
import { affirmationService } from '../services/api/affirmationService';
import { Affirmation } from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useAffirmations = (params?: {
  category?: string;
  tag?: string;
  language?: string;
}) => {
  return useQuery<Affirmation[], Error>({
    queryKey: QUERY_KEYS.AFFIRMATIONS.LIST(params),
    queryFn: () => affirmationService.getAffirmations(params),
    staleTime: 1000 * 60 * 15,
  });
};

export const useDailyAffirmation = (category?: string, language = 'en') => {
  return useQuery<Affirmation | null, Error>({
    queryKey: QUERY_KEYS.AFFIRMATIONS.DAILY(category),
    queryFn: () => affirmationService.getDailyAffirmation({ category, language }),
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
};
