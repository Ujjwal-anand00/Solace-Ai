export type ConversationStatus = 'active' | 'archived' | 'closed';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  status: ConversationStatus;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CompanionSettings {
  userId: string;
  enablePersonalization: boolean;
  journalPersonalizationConsent: boolean;
  preferredTone: 'gentle' | 'balanced' | 'direct';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanionSettingsDto {
  enablePersonalization?: boolean;
  journalPersonalizationConsent?: boolean;
  preferredTone?: 'gentle' | 'balanced' | 'direct';
}

export interface CreateConversationDto {
  title?: string;
  initialMessage?: string;
}

export interface UpdateConversationDto {
  title?: string;
  status?: ConversationStatus;
}

export interface SendMessageDto {
  content: string;
}

export interface SendMessageResponse {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  safetyAlert?: {
    isCrisis: boolean;
    message: string;
    helplines: Array<{ name: string; contact: string }>;
  };
}
