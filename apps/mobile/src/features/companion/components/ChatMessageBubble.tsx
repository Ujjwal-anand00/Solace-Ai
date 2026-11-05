import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ChatMessage } from '@solace/shared';
import { AppText, AppIcon, SolaceMascot } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  onRegenerate,
  isLastAssistant = false,
}) => {
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = () => {
    triggerHaptic.selection();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(message.content).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metadata = message.metadata as Record<string, unknown> | undefined;
  const safetyAlert = metadata?.safetyAlert as { isCrisis?: boolean } | undefined;
  const isCrisis = Boolean(metadata?.isCrisis || safetyAlert?.isCrisis);

  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
      {!isUser && (
        <View style={styles.assistantHeaderRow}>
          <View style={styles.assistantAvatar}>
            <SolaceMascot
              size={26}
              expression="listening"
              animationState="breathe"
              showGlow={false}
              showCushion={false}
            />
          </View>
          <AppText variant="caption" style={[styles.senderName, { color: colors.textSecondary }]}>
            Solace
          </AppText>
          <AppText variant="caption" style={[styles.timeText, { color: colors.textTertiary }]}>
            {formatTime(message.createdAt)}
          </AppText>
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primaryDark }]
            : [styles.assistantBubble, { backgroundColor: colors.surface, borderColor: colors.border }],
          isCrisis && styles.crisisBubble,
        ]}
      >
        <AppText
          variant="bodyMedium"
          style={[
            styles.messageText,
            { color: isUser ? '#FFFFFF' : colors.textPrimary },
          ]}
          selectable
        >
          {message.content}
        </AppText>

        {isCrisis && (
          <View style={[styles.crisisCard, { backgroundColor: '#FFF5F5', borderColor: '#FEB2B2' }]}>
            <View style={styles.crisisTitleRow}>
              <AppIcon name="alertCircle" size={16} color="#E53E3E" />
              <AppText variant="bodySmall" style={styles.crisisHeading}>
                Immediate Crisis Support
              </AppText>
            </View>
            <View style={styles.helplineButtons}>
              <TouchableOpacity
                style={[styles.helplineBtn, { backgroundColor: '#E53E3E' }]}
                onPress={() => {
                  triggerHaptic.medium();
                  Linking.openURL('tel:988').catch(() => {});
                }}
              >
                <AppIcon name="phone" size={14} color="#FFFFFF" />
                <AppText variant="caption" style={styles.helplineBtnText}>
                  Call 988 Lifeline
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.helplineBtn, { backgroundColor: '#C53030' }]}
                onPress={() => {
                  triggerHaptic.medium();
                  Linking.openURL('sms:741741').catch(() => {});
                }}
              >
                <AppIcon name="messageCircle" size={14} color="#FFFFFF" />
                <AppText variant="caption" style={styles.helplineBtnText}>
                  Text HOME to 741741
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Bubble Footer & Actions */}
      <View style={[styles.footerRow, isUser ? styles.userFooter : styles.assistantFooter]}>
        {isUser && (
          <AppText variant="caption" style={[styles.timeText, { color: colors.textTertiary }]}>
            {formatTime(message.createdAt)}
          </AppText>
        )}

        {!isUser && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              onPress={handleCopy}
              style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant }]}
              accessibilityLabel="Copy message"
            >
              <AppIcon
                name={copied ? 'check' : 'copy'}
                size={13}
                color={copied ? '#48BB78' : colors.textSecondary}
              />
              <AppText variant="caption" style={{ color: colors.textSecondary, fontSize: 11 }}>
                {copied ? 'Copied' : 'Copy'}
              </AppText>
            </TouchableOpacity>

            {isLastAssistant && onRegenerate && (
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic.selection();
                  onRegenerate();
                }}
                style={[styles.actionBtn, { backgroundColor: colors.surfaceVariant }]}
                accessibilityLabel="Regenerate response"
              >
                <AppIcon name="refreshCw" size={13} color={colors.textSecondary} />
                <AppText variant="caption" style={{ color: colors.textSecondary, fontSize: 11 }}>
                  Regenerate
                </AppText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  assistantWrapper: {
    alignSelf: 'flex-start',
  },
  assistantHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    paddingLeft: 4,
  },
  assistantAvatar: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senderName: {
    fontWeight: '600',
    fontSize: 12,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  crisisBubble: {
    borderColor: '#FC8181',
    borderWidth: 1.5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  crisisCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  crisisTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  crisisHeading: {
    color: '#C53030',
    fontWeight: '700',
    fontSize: 13,
  },
  helplineButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  helplineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  helplineBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  userFooter: {
    justifyContent: 'flex-end',
    paddingRight: 4,
  },
  assistantFooter: {
    justifyContent: 'flex-start',
    paddingLeft: 4,
  },
  timeText: {
    fontSize: 11,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
});
