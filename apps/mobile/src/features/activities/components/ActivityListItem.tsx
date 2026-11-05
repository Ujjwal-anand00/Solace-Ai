import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppHeading, AppText, AppIcon, AppBadge, IconName } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { WellnessActivity } from '@solace/shared';

interface ActivityListItemProps {
  activity: WellnessActivity;
  onPress: (activity: WellnessActivity) => void;
}

export const ActivityListItem: React.FC<ActivityListItemProps> = ({
  activity,
  onPress,
}) => {
  const { colors } = useTheme();

  const getCategoryIcon = (category: string): IconName => {
    switch (category.toLowerCase()) {
      case 'breathing':
        return 'wind';
      case 'mindfulness':
      case 'meditation':
        return 'smile';
      case 'relaxation':
        return 'moon';
      case 'self-care':
        return 'heart';
      case 'affirmation':
        return 'sparkles';
      case 'reflection':
      case 'journaling':
        return 'bookOpen';
      default:
        return 'compass';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#38A169';
      case 'intermediate':
        return '#DD6B20';
      case 'advanced':
        return '#E53E3E';
      default:
        return colors.primaryDark;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => {
        triggerHaptic.selection();
        onPress(activity);
      }}
      activeOpacity={0.75}
    >
      <View style={styles.headerRow}>
        <View style={styles.badgeGroup}>
          <AppBadge
            label={activity.category.toUpperCase()}
            variant="neutral"
            size="sm"
          />
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(activity.difficulty) + '18' },
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(activity.difficulty) },
              ]}
            >
              {activity.difficulty}
            </AppText>
          </View>
        </View>

        <View style={styles.durationPill}>
          <AppIcon name="clock" size={12} color={colors.textSecondary} />
          <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '600' }}>
            {Math.round(activity.duration / 60)} min
          </AppText>
        </View>
      </View>

      <View style={styles.bodyRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceVariant }]}>
          <AppIcon
            name={getCategoryIcon(activity.category)}
            size={18}
            color={colors.primaryDark}
          />
        </View>

        <View style={styles.textWrap}>
          <AppHeading level="h4" numberOfLines={1} style={styles.title}>
            {activity.title}
          </AppHeading>
          <AppText
            variant="bodySmall"
            numberOfLines={2}
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {activity.description}
          </AppText>
        </View>

        <View style={[styles.arrowCircle, { backgroundColor: colors.primaryLight }]}>
          <AppIcon name="arrowRight" size={14} color={colors.primaryDark} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
