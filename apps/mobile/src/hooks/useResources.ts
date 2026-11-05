import { useQuery } from '@tanstack/react-query';
import { resourceService } from '../services/api/resourceService';
import { WellnessResource } from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useResources = (category?: string) => {
  return useQuery<WellnessResource[], Error>({
    queryKey: QUERY_KEYS.RESOURCES.LIST(category),
    queryFn: () => resourceService.getResources(category),
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

