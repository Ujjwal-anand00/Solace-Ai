import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CompanionHeader,
  WelcomeStarters,
  ChatMessageBubble,
  ChatInputBar,
  TypingIndicator,
  CompanionSettingsModal,
  ConversationHistoryModal,
} from '../../src/features/companion';
import {
  useConversations,
  useConversationMessages,
  useCreateConversation,
  useSendMessage,
} from '../../src/hooks/useConversations';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { ChatMessage } from '@solace/shared';

export default function CompanionScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const userName = user?.preferredName || user?.name || 'Friend';

  // Active conversation state
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Queries & Mutations
  const { data: conversationsData } = useConversations();
  const {
    data: messagesData,
  } = useConversationMessages(activeConversationId || undefined);

  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage(activeConversationId || '');

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  // Auto-select latest conversation on initial load if none selected
  useEffect(() => {
    if (!activeConversationId && conversationsData?.data && conversationsData.data.length > 0) {
      setActiveConversationId(conversationsData.data[0].id);
    }
  }, [conversationsData, activeConversationId]);

  // Messages list
  const messages = messagesData?.data || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages.length, isGenerating]);

  // Handle sending a message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      if (!activeConversationId) {
        // Create new conversation with initial message
        const result = await createConversationMutation.mutateAsync({
          initialMessage: text,
        });
        if (result.conversation?.id) {
          setActiveConversationId(result.conversation.id);
        }
      } else {
        // Send message to existing conversation
        await sendMessageMutation.mutateAsync({ content: text });
      }
    } catch {
      // Error handled by mutation
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle regenerating the last assistant response
  const handleRegenerate = async () => {
    if (!activeConversationId || isGenerating || messages.length === 0) return;

    // Find the last user message
    const reversed = [...messages].reverse();
    const lastUserMsg = reversed.find((m) => m.role === 'user');
    if (!lastUserMsg) return;

    setIsGenerating(true);
    try {
      await sendMessageMutation.mutateAsync({ content: lastUserMsg.content });
    } catch {
      // Handled
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartNewChat = () => {
    setActiveConversationId(null);
  };

  const renderMessageItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isLastAssistant =
      item.role === 'assistant' && index === messages.length - 1;

    return (
      <ChatMessageBubble
        message={item}
        onRegenerate={handleRegenerate}
        isLastAssistant={isLastAssistant}
      />
    );
  };

  const showWelcome = !activeConversationId || messages.length === 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <CompanionHeader
        onOpenHistory={() => setShowHistoryModal(true)}
        onNewChat={handleStartNewChat}
        onOpenSettings={() => setShowSettingsModal(true)}
        isOnline={true}
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {showWelcome ? (
          <WelcomeStarters
            userName={userName}
            onSelectStarter={handleSendMessage}
          />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={isGenerating ? <TypingIndicator /> : undefined}
          />
        )}

        <ChatInputBar
          onSendMessage={handleSendMessage}
          disabled={isGenerating}
        />
      </KeyboardAvoidingView>

      {/* Modals */}
      <ConversationHistoryModal
        visible={showHistoryModal}
        activeConversationId={activeConversationId || undefined}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewConversation={handleStartNewChat}
        onClose={() => setShowHistoryModal(false)}
      />

      <CompanionSettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});
