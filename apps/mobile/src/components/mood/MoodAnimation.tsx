import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { MoodKey } from './moodConfig';

interface UseMoodAnimationOptions {
  mood: MoodKey;
  isSelected?: boolean;
  isInteractive?: boolean;
}

export function useMoodAnimation({
  mood,
  isSelected = false,
  isInteractive = true,
}: UseMoodAnimationOptions) {
  const [reduceMotion, setReduceMotion] = useState(false);

  // Shared animated values
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const selectScale = useSharedValue(1);
  const shadowScale = useSharedValue(1);

  // Check user's accessibility reduced motion setting
  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (isMounted) setReduceMotion(enabled);
    });

    const listener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (isMounted) setReduceMotion(enabled);
      }
    );

    return () => {
      isMounted = false;
      listener?.remove();
    };
  }, []);

  // Update selected scale with spring
  useEffect(() => {
    if (reduceMotion) {
      selectScale.value = isSelected ? 1.08 : 1;
      return;
    }
    selectScale.value = withSpring(isSelected ? 1.12 : 1, {
      damping: 12,
      stiffness: 220,
      mass: 0.8,
    });
  }, [isSelected, reduceMotion, selectScale]);

  // Start appropriate mood loop animation
  useEffect(() => {
    if (reduceMotion || !isInteractive) {
      translateY.value = 0;
      translateX.value = 0;
      rotation.value = 0;
      scale.value = 1;
      shadowScale.value = 1;
      return;
    }

    // Cancel existing
    cancelAnimation(translateY);
    cancelAnimation(translateX);
    cancelAnimation(rotation);
    cancelAnimation(scale);
    cancelAnimation(shadowScale);

    switch (mood) {
      case 'ecstatic': // AMAZING: Joyful float + celebration bounce
        translateY.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: isSelected ? 700 : 900, easing: Easing.inOut(Easing.quad) }),
            withTiming(2, { duration: isSelected ? 700 : 900, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          true
        );
        rotation.value = withRepeat(
          withSequence(
            withTiming(isSelected ? -3.5 : -2, { duration: 800, easing: Easing.inOut(Easing.sin) }),
            withTiming(isSelected ? 3.5 : 2, { duration: 800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        shadowScale.value = withRepeat(
          withSequence(
            withTiming(0.85, { duration: 800, easing: Easing.inOut(Easing.quad) }),
            withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          true
        );
        break;

      case 'happy': // GOOD: Relaxed breathing + soft float
        translateY.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
            withTiming(1, { duration: 1300, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.025, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.985, { duration: 1500, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        shadowScale.value = withRepeat(
          withSequence(
            withTiming(0.92, { duration: 1300, easing: Easing.inOut(Easing.sin) }),
            withTiming(1.05, { duration: 1300, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        break;

      case 'calm': // OKAY: Steady, calm rhythmic breathing
        scale.value = withRepeat(
          withSequence(
            withTiming(1.015, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.99, { duration: 1800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        translateY.value = withRepeat(
          withSequence(
            withTiming(-1.5, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.5, { duration: 1800, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        break;

      case 'sad': // LOW: Gentle slow drift, sleepy soft slump
        translateY.value = withRepeat(
          withSequence(
            withTiming(2.5, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
            withTiming(-1, { duration: 1600, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          true
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(0.98, { duration: 1700, easing: Easing.inOut(Easing.sin) }),
            withTiming(1.01, { duration: 1700, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          true
        );
        break;

      case 'anxious': // STRESSED: Subtle nervous jitter/wobble + shallow breathing
        translateX.value = withRepeat(
          withSequence(
            withTiming(isSelected ? -1.8 : -1.2, { duration: 120, easing: Easing.linear }),
            withTiming(isSelected ? 1.8 : 1.2, { duration: 120, easing: Easing.linear }),
            withTiming(0, { duration: 100, easing: Easing.linear })
          ),
          -1,
          true
        );
        rotation.value = withRepeat(
          withSequence(
            withTiming(-1.5, { duration: 240, easing: Easing.linear }),
            withTiming(1.5, { duration: 240, easing: Easing.linear })
          ),
          -1,
          true
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.02, { duration: 600, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.97, { duration: 600, easing: Easing.inOut(Easing.quad) })
          ),
          -1,
          true
        );
        break;
    }

    return () => {
      cancelAnimation(translateY);
      cancelAnimation(translateX);
      cancelAnimation(rotation);
      cancelAnimation(scale);
      cancelAnimation(shadowScale);
    };
  }, [mood, isSelected, reduceMotion, isInteractive]);

  const animatedCharacterStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value * selectScale.value },
      ],
    };
  });

  const animatedShadowStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scaleX: shadowScale.value * selectScale.value },
        { scaleY: shadowScale.value },
      ],
      opacity: selectScale.value * 0.45,
    };
  });

  return {
    animatedCharacterStyle,
    animatedShadowStyle,
    selectScale,
    reduceMotion,
  };
}
