import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService, ConversationListResponse, MessageListResponse } from '../services/api/conversationService';
import {
  Conversation,
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  SendMessageResponse,
} from '@solace/shared';
import { QUERY_KEYS } from '../constants/queryKeys';

export const useConversations = (page = 1, limit = 20) => {
  return useQuery<ConversationListResponse, Error>({
    queryKey: QUERY_KEYS.CONVERSATIONS.LIST(page),
    queryFn: () => conversationService.getConversations(page, limit),
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useConversation = (id?: string) => {
  return useQuery<Conversation, Error>({
    queryKey: QUERY_KEYS.CONVERSATIONS.DETAIL(id || ''),
    queryFn: () => conversationService.getConversationById(id!),
    enabled: Boolean(id),
  });
};

export const useConversationMessages = (conversationId?: string, page = 1, limit = 50) => {
  return useQuery<MessageListResponse, Error>({
    queryKey: QUERY_KEYS.CONVERSATIONS.MESSAGES(conversationId || ''),
    queryFn: () => conversationService.getMessages(conversationId!, page, limit),
    enabled: Boolean(conversationId),
    staleTime: 1000 * 10, // 10 seconds
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<{
    conversation: Conversation;
  }, Error, CreateConversationDto>({
    mutationFn: (dto) => conversationService.createConversation(dto),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS.ALL });
      if (data.conversation?.id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CONVERSATIONS.MESSAGES(data.conversation.id),
        });
      }
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<Conversation, Error, { id: string; dto: UpdateConversationDto }>({
    mutationFn: ({ id, dto }) => conversationService.updateConversation(id, dto),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS.ALL });
      queryClient.setQueryData(QUERY_KEYS.CONVERSATIONS.DETAIL(updated.id), updated);
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => conversationService.deleteConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS.ALL });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.CONVERSATIONS.DETAIL(id) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.CONVERSATIONS.MESSAGES(id) });
    },
  });
};

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, Error, SendMessageDto>({
    mutationFn: (dto) => conversationService.sendMessage(conversationId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONVERSATIONS.MESSAGES(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONVERSATIONS.ALL,
      });
    },
  });
};

export const useRegenerateMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation<SendMessageResponse, Error, void>({
    mutationFn: () => conversationService.regenerateMessage(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONVERSATIONS.MESSAGES(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CONVERSATIONS.ALL,
      });
    },
  });
};

