import React, { useEffect } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import { triggerHaptic } from './haptics';

export const ANIMATION_CONFIGS = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  timing: {
    duration: 250,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  gentleFloat: {
    duration: 3000,
    easing: Easing.inOut(Easing.sin),
  },
} as const;

export interface ScalePressableProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  enableHaptics?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * ScalePressable
 * Reusable pressable component with subtle spring scale feedback and optional haptics.
 */
export const ScalePressable: React.FC<ScalePressableProps> = ({
  children,
  style,
  activeScale = 0.96,
  enableHaptics = true,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disabled) {
      scale.value = withSpring(activeScale, ANIMATION_CONFIGS.spring);
      if (enableHaptics) {
        triggerHaptic.light();
      }
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (!disabled) {
      scale.value = withSpring(1, ANIMATION_CONFIGS.spring);
    }
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};

export interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * FadeInView
 * Soft entrance animation for views and cards.
 */
export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  delay = 0,
  duration = 350,
  style,
}) => {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(duration)}
      exiting={FadeOut.duration(200)}
      style={style}
    >
      {children}
    </Animated.View>
  );
};

export interface SlideUpViewProps {
  children: React.ReactNode;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * SlideUpView
 * Upward slide-in entrance for modals and bottom sheets.
 */
export const SlideUpView: React.FC<SlideUpViewProps> = ({ children, duration = 300, style }) => {
  return (
    <Animated.View entering={SlideInDown.duration(duration).springify().damping(18)} style={style}>
      {children}
    </Animated.View>
  );
};

export interface FloatingViewProps {
  children: React.ReactNode;
  floatDistance?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * FloatingView
 * Gentle vertical floating sine animation for wellness emblems and mascots.
 */
export const FloatingView: React.FC<FloatingViewProps> = ({
  children,
  floatDistance = 8,
  style,
}) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-floatDistance, {
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(floatDistance, {
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      true,
    );
  }, [floatDistance, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
};
