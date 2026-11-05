import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Share } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { AppHeading, AppText, AppCard, AppBadge, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { Affirmation } from '@solace/shared';

interface DailyAffirmationCardProps {
  affirmation?: Affirmation | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const DailyAffirmationCard: React.FC<DailyAffirmationCardProps> = ({
  affirmation,
  isLoading,
  onRefresh,
}) => {
  const { colors, isDark } = useTheme();
  const [isFavorite, setIsFavorite] = useState(false);

  // Animation values for refresh transition
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleRefresh = () => {
    triggerHaptic.light();

    // Subtle fade-and-slide transition
    opacity.value = withSequence(
      withTiming(0, { duration: 150 }),
      withTiming(1, { duration: 250 }),
    );
    translateY.value = withSequence(
      withTiming(-6, { duration: 150 }),
      withTiming(0, { duration: 250 }),
    );

    onRefresh?.();
  };

  const handleToggleFavorite = () => {
    triggerHaptic.medium();
    setIsFavorite((prev) => !prev);
  };

  const handleShare = async () => {
    if (!affirmation) return;
    triggerHaptic.light();
    try {
      await Share.share({
        message: `"${affirmation.text}"\n\n— Daily Affirmation from Solace AI 🌿`,
      });
    } catch {
      // User cancelled or share failed
    }
  };

  const defaultAffirmationText =
    'You are allowed to take up space, take your time, and move at your own gentle pace.';

  const categoryLabel = affirmation?.category
    ? affirmation.category.charAt(0).toUpperCase() + affirmation.category.slice(1)
    : 'Self-Care';

  return (
    <AppCard
      variant="elevated"
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : '#FAF7F2',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(233, 226, 245, 0.6)',
        },
      ]}
    >
      {/* Category and Actions row */}
      <View style={styles.topRow}>
        <AppBadge
          variant="lavender"
          size="sm"
          label={categoryLabel}
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E9E2F5',
          }}
        />

        <View style={styles.actionsGroup}>
          {/* Favorite Action */}
          <TouchableOpacity
            onPress={handleToggleFavorite}
            style={styles.actionButton}
            activeOpacity={0.7}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
          >
            <AppIcon
              name="heart"
              size={18}
              color={isFavorite ? '#E11D48' : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Share Action */}
          <TouchableOpacity
            onPress={handleShare}
            style={styles.actionButton}
            activeOpacity={0.7}
            accessibilityLabel="Share affirmation"
            accessibilityRole="button"
          >
            <AppIcon name="share-2" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Refresh Action */}
          <TouchableOpacity
            onPress={handleRefresh}
            style={styles.actionButton}
            activeOpacity={0.7}
            disabled={isLoading}
            accessibilityLabel="Refresh daily affirmation"
            accessibilityRole="button"
          >
            <AppIcon name="refresh-cw" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Affirmation Text */}
      <Animated.View style={[styles.textWrapper, textAnimatedStyle]}>
        <AppText style={[styles.quoteMark, { color: colors.primaryLight }]}>“</AppText>
        <AppHeading
          level="h3"
          style={[styles.affirmationText, { color: colors.textPrimary }]}
        >
          {affirmation?.text || defaultAffirmationText}
        </AppHeading>
      </Animated.View>

      <View style={styles.footerRow}>
        <AppText variant="caption" style={{ color: colors.textSecondary }}>
          Daily Solace Affirmation
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  textWrapper: {
    position: 'relative',
    marginVertical: 4,
  },
  quoteMark: {
    fontSize: 36,
    lineHeight: 36,
    fontFamily: 'serif',
    position: 'absolute',
    top: -12,
    left: -6,
    opacity: 0.5,
  },
  affirmationText: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 25,
    paddingLeft: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});

