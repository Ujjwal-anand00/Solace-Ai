import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppHeading, AppText, AppIcon, SolaceMascot } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface CompanionHeaderProps {
  onOpenHistory: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  isOnline?: boolean;
}

export const CompanionHeader: React.FC<CompanionHeaderProps> = ({
  onOpenHistory,
  onNewChat,
  onOpenSettings,
  isOnline = true,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.leftRow}>
        <View style={styles.mascotSmall}>
          <SolaceMascot
            size={40}
            expression="listening"
            animationState="breathe"
            showGlow={false}
            showCushion={false}
          />
        </View>
        <View style={styles.titleColumn}>
          <View style={styles.titleRow}>
            <AppHeading level="h4" style={styles.titleText}>
              Solace
            </AppHeading>
            <View style={styles.statusPill}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? colors.accent : colors.textMuted },
                ]}
              />
              <AppText variant="caption" style={[styles.statusText, { color: colors.textSecondary }]}>
                {isOnline ? 'Ready' : 'Offline'}
              </AppText>
            </View>
          </View>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            AI Wellness Companion
          </AppText>
        </View>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.selection();
            onNewChat();
          }}
          style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
          accessibilityLabel="New conversation"
        >
          <AppIcon name="plus" size={18} color={colors.primaryDark} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic.selection();
            onOpenHistory();
          }}
          style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
          accessibilityLabel="Conversation history"
        >
          <AppIcon name="history" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic.selection();
            onOpenSettings();
          }}
          style={[styles.iconButton, { backgroundColor: colors.surfaceVariant }]}
          accessibilityLabel="Companion settings"
        >
          <AppIcon name="settings" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mascotSmall: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleColumn: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 22,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

