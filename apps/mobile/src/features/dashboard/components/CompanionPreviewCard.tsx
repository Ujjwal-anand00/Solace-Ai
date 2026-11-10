import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AppHeading, AppText, AppCard, SolaceMascot, AccentButton } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useCompanionStatus } from '../../../hooks/useCompanion';
import { triggerHaptic } from '../../../utils/haptics';

interface CompanionPreviewCardProps {
  onStartConversation: () => void;
}

export const CompanionPreviewCard: React.FC<CompanionPreviewCardProps> = ({
  onStartConversation,
}) => {
  const { colors, isDark } = useTheme();
  const { data: status } = useCompanionStatus();
  const isOnline = status?.isOnline !== false;

  // Subtle breathing animation for companion mascot
  const breathScale = useSharedValue(1);
  const breathOpacity = useSharedValue(0.9);

  useEffect(() => {
    breathScale.value = withRepeat(
      withTiming(1.05, {
        duration: 3500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
    breathOpacity.value = withRepeat(
      withTiming(1, {
        duration: 3500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [breathScale, breathOpacity]);

  const animatedMascotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale.value }],
    opacity: breathOpacity.value,
  }));

  const handleStart = () => {
    triggerHaptic.medium();
    onStartConversation();
  };

  return (
    <AppCard
      variant="elevated"
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : '#F0EAF7',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(203, 179, 232, 0.5)',
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.textColumn}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? colors.accent : '#F59E0B' },
              ]}
            />
            <AppText variant="caption" style={[styles.statusText, { color: colors.textSecondary }]}>
              {isOnline ? 'Online & Ready to Listen' : 'Connecting...'}
            </AppText>
          </View>

          <AppHeading level={3} style={[styles.title, { color: colors.textPrimary }]}>
            Need someone to talk to?
          </AppHeading>
          <AppText variant="bodySmall" style={[styles.description, { color: colors.textSecondary }]}>
            Your Solace companion is here to listen, reflect, and support you without judgment.
          </AppText>

          <View style={styles.buttonWrapper}>
            <AccentButton
              title="Start conversation"
              size="sm"
              onPress={handleStart}
              leadingIcon="messageCircle"
            />
          </View>
        </View>

        <Animated.View style={[styles.mascotWrapper, animatedMascotStyle]}>
          <SolaceMascot size={84} expression="happy" animationState="breathe" showGlow={false} />
        </Animated.View>
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
    padding: 18,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textColumn: {
    flex: 1,
    paddingRight: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  buttonWrapper: {
    alignSelf: 'flex-start',
  },
  mascotWrapper: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
