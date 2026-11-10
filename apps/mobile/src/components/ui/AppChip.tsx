import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { ScalePressable } from '../../utils/animations';
import { AppText } from './AppText';
import { AppIcon, IconName } from './AppIcon';

export interface AppChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName | LucideIcon;
  disabled?: boolean;
  count?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export const AppChip: React.FC<AppChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  disabled = false,
  count,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const { colors, radius, isDark } = useTheme();

  const backgroundColor = selected
    ? colors.accent
    : isDark
      ? colors.surfaceSecondary
      : colors.surface;

  const textColor = selected ? (colors.accentText || '#292431') : colors.textPrimary;

  const borderColor = selected ? (colors.accentDark || '#A7CE16') : isDark ? colors.border : colors.border;

  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={accessibilityLabel || label}
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor,
          borderRadius: radius.pill,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      {icon && (
        <View style={styles.iconWrapper}>
          <AppIcon name={icon} size="xs" color={textColor} />
        </View>
      )}

      <AppText
        style={[
          styles.labelText,
          {
            color: textColor,
            fontWeight: selected ? '600' : '500',
          },
          textStyle,
        ]}
      >
        {label}
      </AppText>

      {typeof count === 'number' && (
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: selected ? 'rgba(255, 255, 255, 0.25)' : colors.surfaceSecondary,
            },
          ]}
        >
          <AppText
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: textColor,
            }}
          >
            {count}
          </AppText>
        </View>
      )}
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  iconWrapper: {
    marginRight: 6,
  },
  labelText: {
    fontSize: 13,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
});
