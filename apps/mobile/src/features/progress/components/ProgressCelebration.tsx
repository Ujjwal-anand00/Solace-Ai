import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import {
  AppCard,
  AppText,
  AppHeading,
  AppButton,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface ProgressCelebrationProps {
  visible: boolean;
  title: string;
  description: string;
  badgeLabel?: string;
  onClose: () => void;
}

export const ProgressCelebration: React.FC<ProgressCelebrationProps> = ({
  visible,
  title,
  description,
  badgeLabel = 'MILESTONE ACHIEVED',
  onClose,
}) => {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (visible) {
      triggerHaptic.notification();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <AppCard
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.confettiRow}>
            <AppText style={styles.confettiEmoji}>✨</AppText>
            <AppText style={styles.starEmoji}>🌟</AppText>
            <AppText style={styles.confettiEmoji}>🎉</AppText>
          </View>

          <View style={styles.badgeWrapper}>
            <AppText variant="caption" style={styles.badgeText}>
              {badgeLabel}
            </AppText>
          </View>

          <AppHeading level="h2" style={styles.title}>
            {title}
          </AppHeading>

          <AppText
            variant="bodyMedium"
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {description}
          </AppText>

          <AppButton
            title="Continue Mindfully"
            variant="primary"
            size="md"
            fullWidth
            onPress={() => {
              triggerHaptic.light();
              onClose();
            }}
          />
        </AppCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    alignItems: 'center',
  },
  confettiRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  confettiEmoji: {
    fontSize: 32,
  },
  starEmoji: {
    fontSize: 48,
  },
  badgeWrapper: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    color: '#15803D',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
});
