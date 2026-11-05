import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  AppCard,
  AppText,
  AppHeading,
  AppBadge,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { UserAchievement } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface AchievementCardProps {
  achievement: UserAchievement;
  onPress: (achievement: UserAchievement) => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onPress,
}) => {
  const { colors, isDark } = useTheme();

  const isUnlocked = achievement.unlocked;
  const progressPct = achievement.progress?.percentage ?? (isUnlocked ? 100 : 0);
  const current = achievement.progress?.current ?? 0;
  const target = achievement.progress?.target ?? 1;

  const handlePress = () => {
    triggerHaptic.light();
    onPress(achievement);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={styles.touchable}
    >
      <AppCard
        style={[
          styles.card,
          {
            backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
            borderColor: isUnlocked ? '#829B83' : colors.border,
            opacity: isUnlocked ? 1 : 0.85,
          },
        ]}
      >
        <View style={styles.cardHeader}>
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

          <View style={styles.headerBadges}>
            <AppBadge
              label={achievement.category.toUpperCase()}
              variant="neutral"
              size="sm"
            />
            {isUnlocked ? (
              <AppBadge label="EARNED ✨" variant="primary" size="sm" />
            ) : (
              <AppBadge label="LOCKED" variant="neutral" size="sm" />
            )}
          </View>
        </View>

        <View style={styles.content}>
          <AppHeading level="h4" style={styles.title}>
            {achievement.title}
          </AppHeading>
          <AppText
            variant="caption"
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {achievement.description}
          </AppText>
        </View>

        {/* Progress or Earned Status */}
        <View style={styles.footer}>
          {isUnlocked ? (
            <AppText variant="caption" style={{ color: '#059669', fontWeight: '600' }}>
              Completed
              {achievement.unlockedAt
                ? ` • ${new Date(achievement.unlockedAt).toLocaleDateString()}`
                : ''}
            </AppText>
          ) : (
            <View style={styles.progressContainer}>
              <View style={styles.progressLabelRow}>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Progress
                </AppText>
                <AppText
                  variant="caption"
                  style={{ color: colors.text, fontWeight: '600' }}
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
                      backgroundColor: '#829B83',
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  lockedIcon: {
    opacity: 0.4,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  content: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    marginTop: 2,
  },
  progressContainer: {
    gap: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
