import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { AppText } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';

export const TypingIndicator: React.FC = () => {
  const { colors } = useTheme();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(800 - delay),
        ]),
      );
    };

    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, 200);
    const anim3 = createAnimation(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);

  const translateY1 = dot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });
  const translateY2 = dot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });
  const translateY3 = dot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.dotsRow}>
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.primary, transform: [{ translateY: translateY1 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.primary, transform: [{ translateY: translateY2 }] },
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: colors.primary, transform: [{ translateY: translateY3 }] },
          ]}
        />
      </View>
      <AppText variant="caption" style={[styles.text, { color: colors.textSecondary }]}>
        Solace is reflecting...
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
    marginVertical: 6,
    gap: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
