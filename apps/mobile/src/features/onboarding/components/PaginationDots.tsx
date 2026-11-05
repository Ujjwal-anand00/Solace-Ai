import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';

export interface PaginationDotsProps {
  total: number;
  activeIndex: number;
  style?: StyleProp<ViewStyle>;
}

interface SingleDotProps {
  isActive: boolean;
  activeColor: string;
  inactiveColor: string;
}

const SingleDot: React.FC<SingleDotProps> = ({ isActive, activeColor, inactiveColor }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(isActive ? 24 : 8, { damping: 15, stiffness: 180 }),
      backgroundColor: isActive ? activeColor : inactiveColor,
      opacity: withSpring(isActive ? 1 : 0.4),
    };
  }, [isActive, activeColor, inactiveColor]);

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  total,
  activeIndex,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <SingleDot
          key={i}
          isActive={i === activeIndex}
          activeColor={colors.primary}
          inactiveColor={colors.textMuted}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

