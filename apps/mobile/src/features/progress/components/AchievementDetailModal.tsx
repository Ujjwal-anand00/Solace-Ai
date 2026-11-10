import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import {
  AppCard,
  AppText,
  AppHeading,
  AppBadge,
  AppButton,
  AppIcon,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { UserAchievement } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface AchievementDetailModalProps {
  achievement: UserAchievement | null;
  visible: boolean;
  onClose: () => void;
}

export const AchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();

  if (!achievement) return null;

  const isUnlocked = achievement.unlocked;
  const progressPct = achievement.progress?.percentage ?? (isUnlocked ? 100 : 0);
  const current = achievement.progress?.current ?? 0;
  const target = achievement.progress?.target ?? 1;

  const handleClose = () => {
    triggerHaptic.light();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <AppCard
          style={[
            styles.modalCard,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          {/* Close button */}
          <TouchableOpacity
            style={[
              styles.closeBtn,
              { backgroundColor: isDark ? colors.surface : '#F3F4F6' },
            ]}
            onPress={handleClose}
          >
            <AppIcon name="x" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Icon Badge */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isUnlocked
                  ? '#FEF3C7'
                  : isDark
                  ? colors.surface
                  : '#F3F4F6',
              },
            ]}
          >
            <AppText style={[styles.iconText, !isUnlocked && styles.lockedIcon]}>
              {achievement.icon || '🏆'}
            </AppText>
          </View>

          {/* Badges */}
          <View style={styles.badgeRow}>
            <AppBadge
              label={achievement.category.toUpperCase()}
              variant="neutral"
              size="sm"
            />
            {isUnlocked ? (
              <AppBadge label="EARNED ✨" variant="lime" size="sm" />
            ) : (
              <AppBadge label="IN PROGRESS" variant="neutral" size="sm" />
            )}
          </View>

          {/* Title & Description */}
          <AppHeading level="h3" style={styles.title}>
            {achievement.title}
          </AppHeading>
          <AppText
            variant="bodyMedium"
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {achievement.description}
          </AppText>

          {/* Criteria info box */}
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: isDark ? colors.surface : '#F0EAF7',
                borderColor: isDark ? colors.border : '#E8DDF5',
              },
            ]}
          >
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Requirement criteria:
            </AppText>
            <AppText
              variant="bodySmall"
              style={[styles.criteriaText, { color: colors.text }]}
            >
              {achievement.criteria}
            </AppText>
          </View>

          {/* Progress / Status */}
          <View style={styles.statusSection}>
            {isUnlocked ? (
              <View style={styles.earnedSection}>
                <AppIcon name="check-circle" size={20} color="#059669" />
                <AppText
                  variant="bodySmall"
                  style={{ color: '#059669', fontWeight: '700' }}
                >
                  Completed & Celebrated!
                  {achievement.unlockedAt
                    ? ` (${new Date(achievement.unlockedAt).toLocaleDateString()})`
                    : ''}
                </AppText>
              </View>
            ) : (
              <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                  <AppText
                    variant="caption"
                    style={{ color: colors.textSecondary }}
                  >
                    Current Progress
                  </AppText>
                  <AppText
                    variant="caption"
                    style={{ color: colors.text, fontWeight: '700' }}
                  >
                    {current} / {target} ({progressPct}%)
                  </AppText>
                </View>
                <View
                  style={[
                    styles.progressBarTrack,
                    { backgroundColor: isDark ? colors.border : '#E5E7EB' },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${Math.min(100, Math.max(0, progressPct))}%`,
                        backgroundColor: colors.accent,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          <AppButton
            title="Close"
            variant="primary"
            size="md"
            fullWidth
            onPress={handleClose}
          />
        </AppCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  iconText: {
    fontSize: 40,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  infoBox: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 4,
  },
  criteriaText: {
    fontWeight: '600',
  },
  statusSection: {
    width: '100%',
    marginBottom: 20,
  },
  earnedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  progressContainer: {
    gap: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
