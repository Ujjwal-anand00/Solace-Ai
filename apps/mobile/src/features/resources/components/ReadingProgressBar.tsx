import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

interface ReadingProgressBarProps {
  progressPercent: number; // 0 to 100
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ progressPercent }) => {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(100, progressPercent));

  return (
    <View style={[styles.container, { backgroundColor: colors.borderLight }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: colors.primary,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 3,
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});

