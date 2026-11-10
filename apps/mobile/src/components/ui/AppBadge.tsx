import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { AppText } from './AppText';
import { AppIcon, IconName } from './AppIcon';

export type BadgeVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'lime'
  | 'red'
  | 'success'
  | 'warning'
  | 'error'
  | 'lavender'
  | 'peach'
  | 'mint'
  | 'butter'
  | 'neutral';

export type BadgeSize = 'sm' | 'md';

export interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconName | LucideIcon;
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  showDot = false,
  style,
  textStyle,
}) => {
  const { colors, radius, isDark } = useTheme();

  const variantStyles = React.useMemo(() => {
    switch (variant) {
      case 'accent':
      case 'lime':
        return {
          bg: colors.accent,
          text: colors.accentText || '#292431',
          dot: colors.accentDark || '#A7CE16',
        };
      case 'secondary':
      case 'red':
        return {
          bg: colors.secondaryLight,
          text: colors.secondary,
          dot: colors.secondary,
        };
      case 'success':
        return {
          bg: colors.successLight,
          text: colors.successText,
          dot: colors.success,
        };
      case 'warning':
        return {
          bg: colors.warningLight,
          text: colors.warningText,
          dot: colors.warning,
        };
      case 'error':
        return {
          bg: colors.errorLight,
          text: colors.errorText,
          dot: colors.error,
        };
      case 'lavender':
        return {
          bg: colors.lavender,
          text: colors.lavenderText,
          dot: colors.lavenderText,
        };
      case 'peach':
        return {
          bg: colors.peach,
          text: colors.peachText,
          dot: colors.peachText,
        };
      case 'mint':
        return {
          bg: colors.mint,
          text: colors.mintText,
          dot: colors.mintText,
        };
      case 'butter':
        return {
          bg: colors.butter,
          text: colors.butterText,
          dot: colors.butterText,
        };
      case 'neutral':
        return {
          bg: colors.surfaceSecondary,
          text: colors.textSecondary,
          dot: colors.textMuted,
        };
      case 'primary':
      default:
        return {
          bg: isDark ? colors.primaryTint : colors.primaryLight,
          text: isDark ? colors.primaryLight : colors.primaryDark,
          dot: colors.primary,
        };
    }
  }, [variant, colors, isDark]);

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.bg,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 2 : 4,
          borderRadius: radius.pill,
        },
        style,
      ]}
    >
      {showDot && (
        <View
          style={[
            styles.dot,
            {
              backgroundColor: variantStyles.dot,
              width: isSmall ? 5 : 6,
              height: isSmall ? 5 : 6,
            },
          ]}
        />
      )}

      {icon && (
        <View style={styles.iconWrapper}>
          <AppIcon name={icon} size={isSmall ? 'xs' : 'sm'} color={variantStyles.text} />
        </View>
      )}

      <AppText
        style={[
          styles.labelText,
          {
            color: variantStyles.text,
            fontSize: isSmall ? 11 : 12,
            fontWeight: '600',
          },
          textStyle,
        ]}
      >
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    borderRadius: 3,
    marginRight: 6,
  },
  iconWrapper: {
    marginRight: 5,
  },
  labelText: {
    letterSpacing: 0.2,
  },
});
