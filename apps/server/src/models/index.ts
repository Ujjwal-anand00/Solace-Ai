/**
 * Solace AI Models Entry Point
 *
 * Mongoose schemas (User, Session, MoodLog, JournalEntry, WellnessPlan)
 * will be defined here in subsequent feature implementation steps.
 */
export const MODELS = {
  USER: 'User',
  MOOD_ENTRY: 'MoodEntry',
  JOURNAL: 'Journal',
  CHAT_SESSION: 'ChatSession',
  CHAT_MESSAGE: 'ChatMessage',
} as const;
