import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppHeading, AppText, AppIcon, AppBadge, SolaceMascot } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { WellnessActivity } from '@solace/shared';

interface FeaturedActivityCardProps {
  activity: WellnessActivity;
  onStart: (activity: WellnessActivity) => void;
}

export const FeaturedActivityCard: React.FC<FeaturedActivityCardProps> = ({
  activity,
  onStart,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
        },
      ]}
    >
      <View style={styles.topRow}>
        <AppBadge label="FEATURED PRACTICE" variant="primary" size="sm" />
        <View style={styles.durationPill}>
          <AppIcon name="clock" size={13} color={colors.textSecondary} />
          <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '600' }}>
            {Math.round(activity.duration / 60)} min
          </AppText>
        </View>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.textWrap}>
          <AppHeading level="h3" style={styles.title}>
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

        <View style={styles.mascotWrap}>
          <SolaceMascot
            size={56}
            expression="listening"
            animationState="breathe"
            showGlow={false}
            showCushion={false}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: colors.primaryDark }]}
        onPress={() => {
          triggerHaptic.medium();
          onStart(activity);
        }}
        activeOpacity={0.85}
      >
        <AppText variant="bodyMedium" style={styles.startBtnText}>
          Begin Practice 🌿
        </AppText>
        <AppIcon name="arrowRight" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textWrap: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  mascotWrap: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

