import React from 'react';
import { View, ActivityIndicator, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppText } from './AppText';

export interface LoadingIndicatorProps {
  size?: 'small' | 'large' | number;
  message?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'large',
  message,
  color,
  style,
}) => {
  const { colors } = useTheme();
  const indicatorColor = color || colors.primary;

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={message || 'Loading'}
    >
      <ActivityIndicator size={typeof size === 'number' ? 'large' : size} color={indicatorColor} />
      {message && (
        <AppText variant="bodySmall" style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
});
