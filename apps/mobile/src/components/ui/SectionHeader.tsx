import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppHeading, AppText } from './AppText';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleColumn}>
        <AppHeading level={3} style={styles.title}>
          {title}
        </AppHeading>
        {subtitle && (
          <AppText variant="caption" color="textSecondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
        )}
      </View>

      {actionText && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={actionText}
        >
          <AppText variant="label" style={[styles.actionText, { color: colors.primary }]}>
            {actionText}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 8,
  },
  titleColumn: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 2,
  },
  actionText: {
    fontWeight: '600',
  },
});
