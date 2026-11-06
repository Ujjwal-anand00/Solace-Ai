import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateJournalDto } from '@solace/shared';

const DRAFT_KEY_PREFIX = '@solace_journal_draft_';

export interface LocalJournalDraft {
  id: string; // e.g. 'new' or a prompt ID or timestamp
  data: CreateJournalDto;
  lastSavedAt: string;
}

export const journalDraftStorage = {
  /**
   * Save draft locally
   */
  saveDraft: async (draftId: string, draft: CreateJournalDto): Promise<void> => {
    try {
      const payload: LocalJournalDraft = {
        id: draftId,
        data: draft,
        lastSavedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        `${DRAFT_KEY_PREFIX}${draftId}`,
        JSON.stringify(payload),
      );
    } catch {
      // ignore local write errors
    }
  },

  /**
   * Load draft by key
   */
  getDraft: async (draftId: string): Promise<LocalJournalDraft | null> => {
    try {
      const raw = await AsyncStorage.getItem(`${DRAFT_KEY_PREFIX}${draftId}`);
      if (!raw) return null;
      return JSON.parse(raw) as LocalJournalDraft;
    } catch {
      return null;
    }
  },

  /**
   * Clear draft
   */
  clearDraft: async (draftId: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(`${DRAFT_KEY_PREFIX}${draftId}`);
    } catch {
      // ignore
    }
  },

  /**
   * List all saved drafts
   */
  listAllDrafts: async (): Promise<LocalJournalDraft[]> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const draftKeys = keys.filter((k) => k.startsWith(DRAFT_KEY_PREFIX));
      if (!draftKeys.length) return [];

      const pairs = await AsyncStorage.multiGet(draftKeys);
      const drafts: LocalJournalDraft[] = [];
      for (const [, val] of pairs) {
        if (val) {
          try {
            drafts.push(JSON.parse(val));
          } catch {
            // ignore malformed
          }
        }
      }
      return drafts.sort(
        (a, b) => new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime(),
      );
    } catch {
      return [];
    }
  },
};

