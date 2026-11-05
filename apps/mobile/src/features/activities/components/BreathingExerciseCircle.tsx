import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AppHeading, AppText } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';

export type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2';

interface BreathingExerciseCircleProps {
  phase: BreathPhase;
  phaseDuration: number; // in seconds
  countdown: number;     // seconds remaining in phase
  isActive: boolean;
}

const { width } = Dimensions.get('window');
const BASE_CIRCLE_SIZE = Math.min(width * 0.62, 240);

export const BreathingExerciseCircle: React.FC<BreathingExerciseCircleProps> = ({
  phase,
  phaseDuration,
  countdown,
  isActive,
}) => {
  const { colors } = useTheme();

  // Animation values
  const scale = useSharedValue(1.0);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (!isActive) return;

    const durationMs = phaseDuration * 1000;

    if (phase === 'inhale') {
      scale.value = withTiming(1.48, {
        duration: durationMs,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });
      glowOpacity.value = withTiming(0.85, { duration: durationMs });
    } else if (phase === 'hold1') {
      // Hold with full lungs: keep expanded scale, gentle steady pulse
      scale.value = withTiming(1.48, { duration: durationMs });
      glowOpacity.value = withTiming(0.65, { duration: durationMs });
    } else if (phase === 'exhale') {
      scale.value = withTiming(1.0, {
        duration: durationMs,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      });
      glowOpacity.value = withTiming(0.35, { duration: durationMs });
    } else if (phase === 'hold2') {
      // Hold with empty lungs: stay at base scale
      scale.value = withTiming(1.0, { duration: durationMs });
      glowOpacity.value = withTiming(0.25, { duration: durationMs });
    }
  }, [phase, phaseDuration, isActive, scale, glowOpacity]);

  const animatedCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: scale.value * 1.15 }],
    };
  });

  const getPhaseText = (): { label: string; tip: string } => {
    switch (phase) {
      case 'inhale':
        return { label: 'Inhale', tip: 'Breathe in slowly through your nose' };
      case 'hold1':
        return { label: 'Hold', tip: 'Gently suspend breath with ease' };
      case 'exhale':
        return { label: 'Exhale', tip: 'Release smoothly through your mouth' };
      case 'hold2':
        return { label: 'Rest', tip: 'Rest in the empty stillness' };
    }
  };

  const { label, tip } = getPhaseText();

  return (
    <View style={styles.container}>
      {/* Outer Glowing Ring */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            backgroundColor: colors.primaryLight,
            borderColor: colors.primary,
          },
          animatedGlowStyle,
        ]}
      />

      {/* Main Breathing Orb */}
      <Animated.View
        style={[
          styles.orbCircle,
          {
            backgroundColor: colors.surface,
            borderColor: colors.primaryDark,
            shadowColor: colors.primaryDark,
          },
          animatedCircleStyle,
        ]}
      >
        <View style={styles.contentWrap}>
          <AppHeading level="h2" style={[styles.phaseLabel, { color: colors.primaryDark }]}>
            {label}
          </AppHeading>
          <AppText variant="h1" style={[styles.countdownNumber, { color: colors.textPrimary }]}>
            {countdown}
          </AppText>
        </View>
      </Animated.View>

      {/* Supporting Guidance Text below */}
      <View style={styles.tipWrap}>
        <AppText variant="bodySmall" style={[styles.tipText, { color: colors.textSecondary }]}>
          {tip}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: BASE_CIRCLE_SIZE * 1.8,
    height: BASE_CIRCLE_SIZE * 1.8,
  },
  glowCircle: {
    position: 'absolute',
    width: BASE_CIRCLE_SIZE,
    height: BASE_CIRCLE_SIZE,
    borderRadius: BASE_CIRCLE_SIZE / 2,
    borderWidth: 1.5,
  },
  orbCircle: {
    width: BASE_CIRCLE_SIZE,
    height: BASE_CIRCLE_SIZE,
    borderRadius: BASE_CIRCLE_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  contentWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseLabel: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  countdownNumber: {
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 50,
  },
  tipWrap: {
    position: 'absolute',
    bottom: 12,
    paddingHorizontal: 20,
  },
  tipText: {
    textAlign: 'center',
    fontSize: 13,
    fontStyle: 'italic',
  },
});

