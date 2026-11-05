import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppText, AppHeading } from './AppText';
import { AppButton } from './AppButton';
import { AppIcon } from './AppIcon';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  retryTitle?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected issue. Please try again.',
  retryTitle = 'Try Again',
  onRetry,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.errorLight,
          },
        ]}
      >
        <AppIcon name="alertCircle" size="xl" color={colors.error} />
      </View>

      <AppHeading level={3} align="center" style={styles.title}>
        {title}
      </AppHeading>

      <AppText variant="bodyMedium" align="center" color="textSecondary" style={styles.message}>
        {message}
      </AppText>

      {onRetry && (
        <AppButton
          title={retryTitle}
          onPress={onRetry}
          leadingIcon="refreshCw"
          variant="outline"
          size="md"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    marginBottom: 8,
  },
  message: {
    maxWidth: 290,
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    minWidth: 140,
  },
});
