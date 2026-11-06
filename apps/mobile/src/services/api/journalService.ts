import { apiClient } from './apiClient';
import {
  API_ROUTES,
  JournalEntry,
  CreateJournalDto,
  UpdateJournalDto,
  JournalPrompt,
  JournalStats,
  JournalCalendarDay,
  PaginationMeta,
  PromptCategory,
  ApiResponse,
} from '@solace/shared';

export interface JournalListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isFavorite?: boolean;
  isDraft?: boolean;
  tag?: string;
  startDate?: string;
  endDate?: string;
}

export interface JournalListResponse {
  data: JournalEntry[];
  meta: PaginationMeta;
}

export const journalService = {
  /**
   * Fetch paginated list of journal entries
   */
  getJournals: async (params?: JournalListParams): Promise<JournalListResponse> => {
    const res = await apiClient.get<ApiResponse<JournalEntry[]> & { meta: PaginationMeta }>(
      API_ROUTES.JOURNAL.BASE,
      { params },
    );
    return {
      data: res.data.data || [],
      meta: res.data.meta,
    };
  },

  /**
   * Fetch a single journal entry by ID
   */
  getJournalById: async (id: string): Promise<JournalEntry> => {
    const res = await apiClient.get<ApiResponse<JournalEntry>>(
      API_ROUTES.JOURNAL.DETAIL(id),
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Journal entry not found');
    }
    return res.data.data;
  },

  /**
   * Create a new journal entry
   */
  createJournal: async (payload: CreateJournalDto): Promise<JournalEntry> => {
    const res = await apiClient.post<ApiResponse<JournalEntry>>(
      API_ROUTES.JOURNAL.BASE,
      payload,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to create journal entry');
    }
    return res.data.data;
  },

  /**
   * Update an existing journal entry
   */
  updateJournal: async (id: string, payload: UpdateJournalDto): Promise<JournalEntry> => {
    const res = await apiClient.patch<ApiResponse<JournalEntry>>(
      API_ROUTES.JOURNAL.DETAIL(id),
      payload,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update journal entry');
    }
    return res.data.data;
  },

  /**
   * Delete a journal entry
   */
  deleteJournal: async (id: string): Promise<void> => {
    await apiClient.delete(API_ROUTES.JOURNAL.DETAIL(id));
  },

  /**
   * Toggle favorite state of a journal entry
   */
  toggleFavorite: async (id: string): Promise<JournalEntry> => {
    const res = await apiClient.post<ApiResponse<JournalEntry>>(
      API_ROUTES.JOURNAL.TOGGLE_FAVORITE(id),
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to toggle favorite');
    }
    return res.data.data;
  },

  /**
   * Request AI reflection insight with explicit consent
   */
  requestInsight: async (id: string, consent: boolean): Promise<JournalEntry> => {
    const res = await apiClient.post<ApiResponse<JournalEntry>>(
      API_ROUTES.JOURNAL.REQUEST_INSIGHT(id),
      { consent },
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to generate reflection insight');
    }
    return res.data.data;
  },

  /**
   * Fetch guided journal prompts
   */
  getPrompts: async (category?: PromptCategory): Promise<JournalPrompt[]> => {
    const res = await apiClient.get<ApiResponse<JournalPrompt[]>>(
      API_ROUTES.JOURNAL.PROMPTS,
      { params: { category } },
    );
    return res.data.data || [];
  },

  /**
   * Fetch random prompt
   */
  getRandomPrompt: async (category?: PromptCategory): Promise<JournalPrompt> => {
    const res = await apiClient.get<ApiResponse<JournalPrompt>>(
      `${API_ROUTES.JOURNAL.PROMPTS}/random`,
      { params: { category } },
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to retrieve prompt');
    }
    return res.data.data;
  },

  /**
   * Fetch journal statistics summary
   */
  getStats: async (): Promise<JournalStats> => {
    const res = await apiClient.get<ApiResponse<JournalStats>>(
      API_ROUTES.JOURNAL.STATS,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to fetch journal stats');
    }
    return res.data.data;
  },

  /**
   * Fetch journal calendar entries
   */
  getCalendar: async (year?: number, month?: number): Promise<JournalCalendarDay[]> => {
    const res = await apiClient.get<ApiResponse<JournalCalendarDay[]>>(
      API_ROUTES.JOURNAL.CALENDAR,
      { params: { year, month } },
    );
    return res.data.data || [];
  },
};
