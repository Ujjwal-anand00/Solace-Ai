/**
 * Journal Entry Interface
 */
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  prompt?: string;
  moodAssociation?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload to create a new journal entry
 */
export interface CreateJournalDto {
  title: string;
  content: string;
  prompt?: string;
  moodAssociation?: string;
  tags?: string[];
  isFavorite?: boolean;
}

/**
 * Payload to update a journal entry
 */
export interface UpdateJournalDto {
  title?: string;
  content?: string;
  prompt?: string;
  moodAssociation?: string;
  tags?: string[];
  isFavorite?: boolean;
}

