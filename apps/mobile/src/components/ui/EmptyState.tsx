import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppText, AppHeading } from './AppText';
import { AppButton } from './AppButton';
import { AppIcon, IconName } from './AppIcon';

export interface EmptyStateProps {
  icon?: IconName | LucideIcon;
  title: string;
  description?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'feather',
  title,
  description,
  actionTitle,
  onActionPress,
  style,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark ? colors.surfaceSecondary : colors.mint,
          },
        ]}
      >
        <AppIcon name={icon} size="xl" color={isDark ? colors.primaryLight : colors.primaryDark} />
      </View>

      <AppHeading level={3} align="center" style={styles.title}>
        {title}
      </AppHeading>

      {description && (
        <AppText
          variant="bodyMedium"
          align="center"
          color="textSecondary"
          style={styles.description}
        >
          {description}
        </AppText>
      )}

      {actionTitle && onActionPress && (
        <AppButton
          title={actionTitle}
          onPress={onActionPress}
          variant="secondary"
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
    paddingVertical: 40,
  },
  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    maxWidth: 280,
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButton: {
    minWidth: 140,
  },
});
