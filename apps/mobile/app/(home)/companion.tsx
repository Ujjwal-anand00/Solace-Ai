import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  LayoutChangeEvent,
  Keyboard,
  KeyboardEvent,
  Platform,
  TouchableOpacity,
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
  useRegenerateMessage,
} from '../../src/hooks/useConversations';
import { useCompanionStatus } from '../../src/hooks/useCompanion';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { AppText, AppIcon } from '../../src/components/ui';
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
  const [chatError, setChatError] = useState<string | null>(null);

  // Queries & Mutations
  const { data: status } = useCompanionStatus();
  const isOnline = status?.isOnline !== false;

  const { data: conversationsData } = useConversations();
  const {
    data: messagesData,
  } = useConversationMessages(activeConversationId || undefined);

  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage(activeConversationId || '');
  const regenerateMutation = useRegenerateMessage(activeConversationId || '');

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

  // Adaptive Keyboard Handling & Diagnostic Measurement
  const animatedBottomPadding = useRef(new Animated.Value(0)).current;
  const isKeyboardVisibleRef = useRef<boolean>(false);
  const closedHeightRef = useRef<number>(0);
  const currentHeightRef = useRef<number>(0);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    currentHeightRef.current = height;
    if (!isKeyboardVisibleRef.current && height > 0) {
      closedHeightRef.current = height;
    }
    console.log('[CompanionKeyboardDebug] Container onLayout:', {
      currentHeight: height,
      closedHeight: closedHeightRef.current,
      isKeyboardVisible: isKeyboardVisibleRef.current,
      windowHeight: Dimensions.get('window').height,
      screenHeight: Dimensions.get('screen').height,
    });
  };

  // Keyboard show & hide event handling with adaptive offset calculation
  useEffect(() => {
    const showEventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEventName = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onKeyboardShow = (e: KeyboardEvent) => {
      isKeyboardVisibleRef.current = true;
      const kHeight = e.endCoordinates?.height || 0;
      const screenY = e.endCoordinates?.screenY;
      const windowHeight = Dimensions.get('window').height;

      // Check if Android Activity / Window natively shrunk
      const nativeShrank =
        closedHeightRef.current > 0 &&
        currentHeightRef.current > 0 &&
        closedHeightRef.current - currentHeightRef.current >= kHeight - 20;

      let targetPadding = 0;
      if (nativeShrank) {
        // Native window already shrunk: 0 additional padding needed
        targetPadding = 0;
      } else {
        // Native window did NOT resize (Expo Go / edge-to-edge / adjustPan):
        // Pad by the keyboard height
        targetPadding = kHeight;
      }

      console.log('[CompanionKeyboardDebug] Keyboard Opened:', {
        platform: Platform.OS,
        keyboardHeight: kHeight,
        screenY,
        windowHeight,
        closedHeight: closedHeightRef.current,
        currentHeight: currentHeightRef.current,
        nativeShrank,
        targetPadding,
      });

      Animated.timing(animatedBottomPadding, {
        toValue: targetPadding,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 150,
        useNativeDriver: false,
      }).start();

      if (messages.length > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }
    };

    const onKeyboardHide = (e: KeyboardEvent) => {
      isKeyboardVisibleRef.current = false;
      console.log('[CompanionKeyboardDebug] Keyboard Dismissed:', {
        platform: Platform.OS,
        duration: e?.duration,
      });

      Animated.timing(animatedBottomPadding, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e?.duration || 200) : 150,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEventName, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEventName, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [messages.length]);

  // Handle sending a message
  const handleSendMessage = async (text: string): Promise<boolean> => {
    if (!text.trim() || isGenerating) return false;

    setIsGenerating(true);
    setChatError(null);

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
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to connect to Solace companion.';
      setChatError(msg);
      return false; // Tells ChatInputBar to keep the text draft!
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle regenerating the last assistant response
  const handleRegenerate = async () => {
    if (!activeConversationId || isGenerating || messages.length === 0) return;

    setIsGenerating(true);
    setChatError(null);
    try {
      await regenerateMutation.mutateAsync();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Unable to regenerate response.';
      setChatError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setChatError(null);
  };

  const renderMessageItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isLastAssistant =
      item.role === 'assistant' && index === messages.length - 1;

    return (
      <ChatMessageBubble
        message={item}
        onRegenerate={handleRegenerate}
        onRetry={handleRegenerate}
        isLastAssistant={isLastAssistant}
      />
    );
  };

  const showWelcome = !activeConversationId || messages.length === 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Animated.View
        style={[
          styles.chatContainer,
          { paddingBottom: animatedBottomPadding },
        ]}
        onLayout={handleContainerLayout}
      >
        <CompanionHeader
          onOpenHistory={() => setShowHistoryModal(true)}
          onNewChat={handleStartNewChat}
          onOpenSettings={() => setShowSettingsModal(true)}
          isOnline={isOnline}
        />

        {chatError && (
          <View style={[styles.errorBanner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <AppIcon name="alertCircle" size={16} color="#DC2626" />
            <AppText variant="caption" style={styles.errorBannerText}>
              {chatError}
            </AppText>
            <TouchableOpacity
              onPress={handleRegenerate}
              style={styles.retryChip}
              activeOpacity={0.7}
            >
              <AppText variant="caption" style={styles.retryChipText}>
                Retry
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setChatError(null)}
              style={styles.dismissBtn}
              activeOpacity={0.7}
            >
              <AppIcon name="x" size={14} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}

        {showWelcome ? (
          <WelcomeStarters
            userName={userName}
            onSelectStarter={handleSendMessage}
          />
        ) : (
          <FlatList
            ref={flatListRef}
            style={styles.messagesList}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            contentContainerStyle={styles.messagesListContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isGenerating ? <TypingIndicator /> : undefined}
          />
        )}

        <ChatInputBar
          onSendMessage={handleSendMessage}
          disabled={isGenerating}
        />
      </Animated.View>

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
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '500',
  },
  retryChip: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  retryChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  dismissBtn: {
    padding: 2,
  },
});
