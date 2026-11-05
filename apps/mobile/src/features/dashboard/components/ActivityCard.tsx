import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AppHeading, AppText, AppCard, AppBadge, AppIcon, IconName } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { WellnessActivity } from '@solace/shared';

interface ActivityCardProps {
  activity: WellnessActivity;
  onPress: (activity: WellnessActivity) => void;
}

const CATEGORY_ICONS: Record<string, IconName> = {
  breathing: 'wind',
  meditation: 'sparkles',
  journaling: 'bookOpen',
  grounding: 'shield',
  affirmation: 'heart',
  movement: 'activity',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  breathing: { bg: '#E0F2FE', text: '#0369A1' },
  meditation: { bg: '#F3E8FF', text: '#7E22CE' },
  journaling: { bg: '#FEF3C7', text: '#B45309' },
  grounding: { bg: '#DCFCE7', text: '#15803D' },
  affirmation: { bg: '#FFE4E6', text: '#BE123C' },
  movement: { bg: '#E2E8F0', text: '#334155' },
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const iconName = CATEGORY_ICONS[activity.category.toLowerCase()] || 'sparkles';
  const categoryStyle = CATEGORY_COLORS[activity.category.toLowerCase()] || {
    bg: '#E9E2F5',
    text: '#536B58',
  };

  const durationMin = Math.round(activity.duration / 60);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  const handlePress = () => {
    triggerHaptic.light();
    onPress(activity);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${activity.title}, ${durationMin} minutes, ${activity.category}`}
      >
        <AppCard
          variant="elevated"
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(130, 155, 131, 0.15)',
            },
          ]}
        >
          {/* Header row: Icon & Duration Badge */}
          <View style={styles.headerRow}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : categoryStyle.bg,
                },
              ]}
            >
              <AppIcon
                name={iconName}
                size={20}
                color={isDark ? colors.primaryLight : categoryStyle.text}
              />
            </View>

            <AppBadge label={`${durationMin} min`} variant="neutral" size="sm" />
          </View>

          {/* Title and Description */}
          <AppHeading
            level="h4"
            numberOfLines={2}
            style={[styles.title, { color: colors.textPrimary }]}
          >
            {activity.title}
          </AppHeading>

          <AppText
            variant="caption"
            numberOfLines={2}
            style={[styles.description, { color: colors.textSecondary }]}
          >
            {activity.description}
          </AppText>

          {/* Footer action */}
          <View style={styles.footerRow}>
            <AppText
              variant="caption"
              style={[styles.categoryTag, { color: colors.primaryDark }]}
            >
              {activity.category.toUpperCase()}
            </AppText>
            <View style={styles.startRow}>
              <AppText variant="caption" style={[styles.startText, { color: colors.primary }]}>
                Start
              </AppText>
              <AppIcon name="chevron-right" size={14} color={colors.primary} />
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 220,
    marginRight: 12,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    height: 190,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  categoryTag: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  startRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startText: {
    fontWeight: '600',
    fontSize: 12,
    marginRight: 2,
  },
});

