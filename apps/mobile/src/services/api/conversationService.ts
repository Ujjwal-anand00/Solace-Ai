import { apiClient } from './apiClient';
import {
  API_ROUTES,
  ApiResponse,
  Conversation,
  ChatMessage,
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  SendMessageResponse,
  PaginationMeta,
} from '@solace/shared';

export interface ConversationListResponse {
  data: Conversation[];
  meta: PaginationMeta;
}

export interface MessageListResponse {
  data: ChatMessage[];
  meta: PaginationMeta;
}

export const conversationService = {
  /**
   * Fetch user's conversations
   */
  async getConversations(page = 1, limit = 20): Promise<ConversationListResponse> {
    const res = await apiClient.get<ApiResponse<Conversation[]> & { meta: PaginationMeta }>(
      API_ROUTES.CONVERSATIONS.BASE,
      { params: { page, limit } },
    );
    return {
      data: res.data.data || [],
      meta: res.data.meta,
    };
  },

  /**
   * Fetch conversation details by ID
   */
  async getConversationById(id: string): Promise<Conversation> {
    const res = await apiClient.get<ApiResponse<Conversation>>(
      `${API_ROUTES.CONVERSATIONS.BASE}/${id}`,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Conversation not found');
    }
    return res.data.data;
  },

  /**
   * Create a new conversation
   */
  async createConversation(
    dto: CreateConversationDto,
  ): Promise<{
    conversation: Conversation;
    userMessage?: ChatMessage;
    assistantMessage?: ChatMessage;
  }> {
    const res = await apiClient.post<
      ApiResponse<{
        conversation: Conversation;
        userMessage?: ChatMessage;
        assistantMessage?: ChatMessage;
      }>
    >(API_ROUTES.CONVERSATIONS.BASE, dto);

    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to create conversation');
    }
    return res.data.data;
  },

  /**
   * Update conversation title or status
   */
  async updateConversation(id: string, dto: UpdateConversationDto): Promise<Conversation> {
    const res = await apiClient.patch<ApiResponse<Conversation>>(
      `${API_ROUTES.CONVERSATIONS.BASE}/${id}`,
      dto,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to update conversation');
    }
    return res.data.data;
  },

  /**
   * Delete conversation and all its messages
   */
  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`${API_ROUTES.CONVERSATIONS.BASE}/${id}`);
  },

  /**
   * Fetch messages for a conversation
   */
  async getMessages(conversationId: string, page = 1, limit = 50): Promise<MessageListResponse> {
    const res = await apiClient.get<ApiResponse<ChatMessage[]> & { meta: PaginationMeta }>(
      API_ROUTES.CONVERSATIONS.MESSAGES(conversationId),
      { params: { page, limit } },
    );
    return {
      data: res.data.data || [],
      meta: res.data.meta,
    };
  },

  /**
   * Send a user message and receive AI response
   */
  async sendMessage(conversationId: string, dto: SendMessageDto): Promise<SendMessageResponse> {
    const res = await apiClient.post<ApiResponse<SendMessageResponse>>(
      API_ROUTES.CONVERSATIONS.MESSAGES(conversationId),
      dto,
    );
    if (!res.data.data) {
      throw new Error(res.data.message || 'Failed to send message');
    }
    return res.data.data;
  },
};

