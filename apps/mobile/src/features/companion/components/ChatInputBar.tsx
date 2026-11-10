import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  NativeSyntheticEvent,
} from 'react-native';
import { AppIcon, AppText } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface ChatInputBarProps {
  onSendMessage: (text: string) => Promise<boolean | void> | void;
  disabled?: boolean;
  initialText?: string;
}

const MAX_CHARS = 3000;

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  disabled = false,
  initialText = '',
}) => {
  const { colors, isDark } = useTheme();
  const [inputText, setInputText] = useState(initialText);

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || disabled) return;

    triggerHaptic.medium();
    try {
      const result = await onSendMessage(trimmed);
      // Only clear if message was successfully handed off
      if (result !== false) {
        setInputText('');
      }
    } catch {
      // Draft preserved on failure
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<{ key: string; shiftKey?: boolean }>) => {
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = inputText.length;
  const showCount = charCount > 100;
  const canSend = charCount > 0 && !disabled;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
            borderColor: colors.primary,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="Share what is on your mind..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={MAX_CHARS}
          value={inputText}
          onChangeText={setInputText}
          onKeyPress={handleKeyPress}
          editable={!disabled}
          blurOnSubmit={false}
          textAlignVertical="center"
          returnKeyType="default"
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? colors.accent : colors.border },
          ]}
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Send message"
        >
          <AppIcon
            name="send"
            size={16}
            color={canSend ? '#292431' : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {showCount && (
        <View style={styles.counterRow}>
          <AppText variant="caption" style={[styles.counterText, { color: colors.textTertiary }]}>
            {charCount}/{MAX_CHARS}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 36,
    maxHeight: 120,
    paddingTop: 8,
    paddingBottom: 8,
    lineHeight: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    marginBottom: 2,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 4,
    paddingRight: 8,
  },
  counterText: {
    fontSize: 10,
  },
});
