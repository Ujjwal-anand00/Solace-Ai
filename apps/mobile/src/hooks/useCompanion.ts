import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companionService } from '../services/api/companionService';
import { CompanionSettings, UpdateCompanionSettingsDto } from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useCompanionSettings = () => {
  return useQuery<CompanionSettings, Error>({
    queryKey: QUERY_KEYS.COMPANION.SETTINGS,
    queryFn: () => companionService.getSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateCompanionSettings = () => {
  const queryClient = useQueryClient();

  return useMutation<CompanionSettings, Error, UpdateCompanionSettingsDto>({
    mutationFn: (dto) => companionService.updateSettings(dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(QUERY_KEYS.COMPANION.SETTINGS, updated);
    },
  });
};
