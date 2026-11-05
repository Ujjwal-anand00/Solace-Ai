import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AppHeading, AppText, AppCard, SolaceMascot, PrimaryButton } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface CompanionPreviewCardProps {
  onStartConversation: () => void;
}

export const CompanionPreviewCard: React.FC<CompanionPreviewCardProps> = ({
  onStartConversation,
}) => {
  const { colors, isDark } = useTheme();

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
          backgroundColor: isDark ? colors.surfaceSecondary : '#F0F5F1',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(130, 155, 131, 0.2)',
        },
      ]}
    >
      <View style={styles.contentRow}>
        <View style={styles.textColumn}>
          <AppHeading level={3} style={[styles.title, { color: colors.textPrimary }]}>
            Need someone to talk to?
          </AppHeading>
          <AppText variant="bodySmall" style={[styles.description, { color: colors.textSecondary }]}>
            Your Solace companion is here to listen, without judgment.
          </AppText>

          <View style={styles.buttonWrapper}>
            <PrimaryButton
              title="Start conversation"
              size="sm"
              onPress={handleStart}
              leadingIcon="messageCircle"
            />
          </View>
        </View>

        <Animated.View style={[styles.mascotWrapper, animatedMascotStyle]}>
          <SolaceMascot size={90} expression="happy" animationState="breathe" showGlow={false} />
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
