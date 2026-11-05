import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

export interface AppProgressBarProps {
  /**
   * Progress value between 0 and 1 (e.g. 0.65) or between 0 and 100
   */
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
}

export const AppProgressBar: React.FC<AppProgressBarProps> = ({
  progress,
  height = 8,
  color,
  backgroundColor,
  style,
  animated = true,
}) => {
  const { colors, radius, isDark } = useTheme();

  // Normalize progress to 0-1
  const normalized = Math.min(Math.max(progress > 1 ? progress / 100 : progress, 0), 1);

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(normalized, {
        duration: 400,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      animatedProgress.value = normalized;
    }
  }, [normalized, animated, animatedProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  const resolvedBarColor = color || colors.primary;
  const resolvedTrackColor =
    backgroundColor || (isDark ? colors.surfaceSecondary : colors.surfaceSecondary);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: resolvedTrackColor,
          borderRadius: radius.pill,
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(normalized * 100),
      }}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: resolvedBarColor,
            borderRadius: radius.pill,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
