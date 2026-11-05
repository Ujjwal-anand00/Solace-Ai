import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  JournalEntry,
  CreateJournalDto,
  UpdateJournalDto,
  PaginationMeta,
} from '@solace/shared';

export interface JournalListResponse {
  data: JournalEntry[];
  meta: PaginationMeta;
}

export const journalService = {
  /**
   * Fetch paginated journal entries
   */
  async getJournals(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isFavorite?: boolean;
    tag?: string;
  }): Promise<JournalListResponse> {
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
  async getJournalById(id: string): Promise<JournalEntry> {
    const res = await apiClient.get<ApiResponse<JournalEntry>>(`${API_ROUTES.JOURNAL.BASE}/${id}`);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Journal entry not found');
    }
    return res.data.data;
  },

  /**
   * Create a new private journal entry
   */
  async createJournal(data: CreateJournalDto): Promise<JournalEntry> {
    const res = await apiClient.post<ApiResponse<JournalEntry>>(API_ROUTES.JOURNAL.BASE, data);
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to save journal entry');
    }
    return res.data.data;
  },

  /**
   * Update an existing journal entry
   */
  async updateJournal(id: string, data: UpdateJournalDto): Promise<JournalEntry> {
    const res = await apiClient.patch<ApiResponse<JournalEntry>>(
      `${API_ROUTES.JOURNAL.BASE}/${id}`,
      data,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update journal entry');
    }
    return res.data.data;
  },

  /**
   * Delete a journal entry
   */
  async deleteJournal(id: string): Promise<void> {
    await apiClient.delete(`${API_ROUTES.JOURNAL.BASE}/${id}`);
  },
};
