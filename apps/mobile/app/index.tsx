import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../src/hooks/useTheme';
import { SolaceLogo } from '../src/components/ui/SolaceLogo';
import { AppText } from '../src/components/ui/AppText';
import { useOnboardingStore } from '../src/store/onboardingStore';
import { useAuthStore } from '../src/store/authStore';
import { triggerHaptic } from '../src/utils/haptics';

export default function SplashScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { hasCompletedOnboarding, hydrateOnboarding, isHydrated } = useOnboardingStore();
  const { isAuthenticated, isRestoringSession, restoreSession } = useAuthStore();

  const [isAnimationDone, setIsAnimationDone] = useState(false);

  // Reanimated values for splash entrance
  const logoScale = useSharedValue(0.75);
  const logoOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const tagtranslateY = useSharedValue(12);
  const decorativeScale = useSharedValue(0.8);
  const decorativeOpacity = useSharedValue(0);

  // 1. Hydrate onboarding state and restore auth session on launch
  useEffect(() => {
    hydrateOnboarding();
    restoreSession();
  }, [hydrateOnboarding, restoreSession]);

  // 2. Run elegant splash animation sequence
  useEffect(() => {
    // Gentle scale & fade-in for the central logo
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    logoScale.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.back(1.2)),
    });

    // Decorative floating aura circles
    decorativeOpacity.value = withDelay(
      300,
      withTiming(0.65, { duration: 900, easing: Easing.inOut(Easing.sin) }),
    );
    decorativeScale.value = withDelay(
      300,
      withSequence(
        withTiming(1.08, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
    );

    // Staggered fade in for tagline
    taglineOpacity.value = withDelay(
      600,
      withTiming(1, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );
    tagtranslateY.value = withDelay(
      600,
      withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      }),
    );

    // After animation holds gently, mark animation as finished
    const timer = setTimeout(() => {
      triggerHaptic.light();
      setIsAnimationDone(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, [decorativeOpacity, decorativeScale, logoOpacity, logoScale, taglineOpacity, tagtranslateY]);

  // 3. When animation, storage hydration, and session restoration complete, navigate
  useEffect(() => {
    if (isAnimationDone && isHydrated && !isRestoringSession) {
      if (isAuthenticated) {
        // Authenticated user -> navigate directly to home
        router.replace('/(home)');
      } else if (hasCompletedOnboarding) {
        // Returning user -> skip onboarding, navigate to auth landing
        router.replace('/(auth)');
      } else {
        // First-time user -> navigate to welcome screen
        router.replace('/(onboarding)/welcome');
      }
    }
  }, [
    isAnimationDone,
    isHydrated,
    isRestoringSession,
    isAuthenticated,
    hasCompletedOnboarding,
    router,
  ]);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const animatedTaglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: tagtranslateY.value }],
  }));

  const animatedDecorativeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: decorativeScale.value }],
    opacity: decorativeOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Soft floating decorative background rings */}
      <Animated.View style={[styles.decorativeRing, animatedDecorativeStyle]}>
        <View
          style={[
            styles.outerHalo,
            {
              borderColor: isDark ? 'rgba(130, 155, 131, 0.2)' : colors.lavender,
            },
          ]}
        />
        <View
          style={[
            styles.innerHalo,
            {
              borderColor: isDark ? 'rgba(220, 233, 221, 0.15)' : colors.mint,
            },
          ]}
        />
      </Animated.View>

      {/* Central Solace Logo with scale and fade */}
      <Animated.View style={[styles.logoWrapper, animatedLogoStyle]}>
        <SolaceLogo size="xl" variant="stacked" />
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineWrapper, animatedTaglineStyle]}>
        <AppText
          variant="bodyMedium"
          color="textSecondary"
          align="center"
          style={styles.taglineText}
        >
          Your personal space to feel, heal and grow.
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  decorativeRing: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerHalo: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    position: 'absolute',
  },
  innerHalo: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.2,
    position: 'absolute',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  taglineWrapper: {
    marginTop: 20,
    maxWidth: 260,
    zIndex: 2,
  },
  taglineText: {
    letterSpacing: 0.3,
    lineHeight: 22,
  },
});
