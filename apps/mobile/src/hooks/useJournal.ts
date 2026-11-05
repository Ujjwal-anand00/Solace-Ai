import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journalService, JournalListResponse } from '../services/api/journalService';
import { CreateJournalDto, UpdateJournalDto, JournalEntry } from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useJournals = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  isFavorite?: boolean;
  tag?: string;
}) => {
  return useQuery<JournalListResponse, Error>({
    queryKey: QUERY_KEYS.JOURNAL.LIST(params),
    queryFn: () => journalService.getJournals(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useJournalDetail = (id?: string) => {
  return useQuery<JournalEntry, Error>({
    queryKey: QUERY_KEYS.JOURNAL.DETAIL(id || ''),
    queryFn: () => journalService.getJournalById(id!),
    enabled: Boolean(id),
  });
};

export const useCreateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation<JournalEntry, Error, CreateJournalDto>({
    mutationFn: (data: CreateJournalDto) => journalService.createJournal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.CURRENT });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.HISTORY });
    },
  });
};

export const useUpdateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation<JournalEntry, Error, { id: string; data: UpdateJournalDto }>({
    mutationFn: ({ id, data }) => journalService.updateJournal(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.ALL });
      queryClient.setQueryData(QUERY_KEYS.JOURNAL.DETAIL(data.id), data);
    },
  });
};

export const useDeleteJournal = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id: string) => journalService.deleteJournal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.ALL });
    },
  });
};
