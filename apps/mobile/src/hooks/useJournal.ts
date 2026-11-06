import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants/queryKeys';
import {
  journalService,
  JournalListParams,
} from '../services/api/journalService';
import {
  CreateJournalDto,
  UpdateJournalDto,
  PromptCategory,
} from '@solace/shared';

/**
 * Hook to fetch paginated journal entries
 */
export const useJournals = (params?: JournalListParams) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOURNAL.LIST(params as Record<string, unknown>),
    queryFn: () => journalService.getJournals(params),
  });
};

/**
 * Hook to fetch single journal entry by ID
 */
export const useJournalDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOURNAL.DETAIL(id),
    queryFn: () => journalService.getJournalById(id),
    enabled: Boolean(id) && enabled,
  });
};

/**
 * Hook to create a new journal entry
 */
export const useCreateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJournalDto) => journalService.createJournal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.OVERVIEW });
    },
  });
};

/**
 * Hook to update an existing journal entry
 */
export const useUpdateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateJournalDto }) =>
      journalService.updateJournal(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.DETAIL(data.id) });
    },
  });
};

/**
 * Hook to delete a journal entry
 */
export const useDeleteJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => journalService.deleteJournal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROGRESS.OVERVIEW });
    },
  });
};

/**
 * Hook to toggle favorite state
 */
export const useToggleJournalFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => journalService.toggleFavorite(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.DETAIL(data.id) });
    },
  });
};

/**
 * Hook to request AI reflection insight
 */
export const useRequestJournalInsight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, consent }: { id: string; consent: boolean }) =>
      journalService.requestInsight(id, consent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.ALL });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL.DETAIL(data.id) });
    },
  });
};

/**
 * Hook to fetch guided prompts
 */
export const useJournalPrompts = (category?: PromptCategory) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOURNAL.PROMPTS(category),
    queryFn: () => journalService.getPrompts(category),
  });
};

/**
 * Hook to fetch random prompt
 */
export const useRandomJournalPrompt = (category?: PromptCategory) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOURNAL.RANDOM_PROMPT(category),
    queryFn: () => journalService.getRandomPrompt(category),
  });
};

/**
 * Hook to fetch journal stats
 */
export const useJournalStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.JOURNAL.STATS,
    queryFn: () => journalService.getStats(),
  });
};

/**
 * Hook to fetch journal calendar
 */
export const useJournalCalendar = (year?: number, month?: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.JOURNAL.CALENDAR(year, month),
    queryFn: () => journalService.getCalendar(year, month),
  });
};
