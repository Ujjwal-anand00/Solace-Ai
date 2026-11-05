import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { ScalePressable } from '../../utils/animations';
import { AppText } from './AppText';
import { AppIcon, IconName } from './AppIcon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title?: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leadingIcon?: IconName | LucideIcon;
  trailingIcon?: IconName | LucideIcon;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
  children,
}) => {
  const { colors, layout, radius, shadows, isDark } = useTheme();

  const isInteractive = !disabled && !loading;

  // Resolve Height & Padding by Size
  const sizeStyles = React.useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          height: layout.buttonHeightSm, // 36
          paddingHorizontal: 14,
          borderRadius: radius.sm,
          fontSize: 13,
          iconSize: 'xs' as const,
        };
      case 'lg':
        return {
          height: layout.buttonHeightLg, // 54
          paddingHorizontal: 24,
          borderRadius: radius.md,
          fontSize: 16,
          iconSize: 'md' as const,
        };
      case 'md':
      default:
        return {
          height: layout.buttonHeightMd, // 46
          paddingHorizontal: 18,
          borderRadius: radius.md,
          fontSize: 15,
          iconSize: 'sm' as const,
        };
    }
  }, [size, layout, radius]);

  // Resolve Colors & Background by Variant
  const variantStyles = React.useMemo(() => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.surfaceSecondary,
          textColor: colors.textPrimary,
          borderColor: 'transparent',
          borderWidth: 0,
          shadow: shadows.subtle,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: isDark ? colors.primaryLight : colors.primaryDark,
          borderColor: isDark ? colors.borderStrong : colors.border,
          borderWidth: 1.5,
          shadow: shadows.none,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: colors.textSecondary,
          borderColor: 'transparent',
          borderWidth: 0,
          shadow: shadows.none,
        };
      case 'icon':
        return {
          backgroundColor: colors.surfaceSecondary,
          textColor: colors.textPrimary,
          borderColor: 'transparent',
          borderWidth: 0,
          shadow: shadows.none,
        };
      case 'primary':
      default:
        return {
          backgroundColor: colors.primary,
          textColor: '#FFFFFF',
          borderColor: 'transparent',
          borderWidth: 0,
          shadow: isInteractive ? shadows.glowPrimary : shadows.none,
        };
    }
  }, [variant, colors, shadows, isInteractive, isDark]);

  return (
    <ScalePressable
      onPress={onPress}
      disabled={!isInteractive}
      enableHaptics={isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={[
        styles.base,
        {
          height: variant === 'icon' ? sizeStyles.height : sizeStyles.height,
          width: variant === 'icon' ? sizeStyles.height : fullWidth ? '100%' : undefined,
          paddingHorizontal: variant === 'icon' ? 0 : sizeStyles.paddingHorizontal,
          borderRadius: variant === 'icon' ? radius.full : sizeStyles.borderRadius,
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth,
          opacity: disabled ? 0.45 : 1,
        },
        variantStyles.shadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variantStyles.textColor} style={styles.loader} />
      ) : (
        <View style={styles.contentRow}>
          {leadingIcon && (
            <View style={title || children ? styles.leadingIconWrapper : undefined}>
              <AppIcon
                name={leadingIcon}
                size={sizeStyles.iconSize}
                color={variantStyles.textColor}
              />
            </View>
          )}

          {title ? (
            <AppText
              variant="button"
              style={[
                styles.buttonText,
                {
                  color: variantStyles.textColor,
                  fontSize: sizeStyles.fontSize,
                },
                textStyle,
              ]}
            >
              {title}
            </AppText>
          ) : (
            children
          )}

          {trailingIcon && (
            <View style={styles.trailingIconWrapper}>
              <AppIcon
                name={trailingIcon}
                size={sizeStyles.iconSize}
                color={variantStyles.textColor}
              />
            </View>
          )}
        </View>
      )}
    </ScalePressable>
  );
};

export const PrimaryButton: React.FC<Omit<AppButtonProps, 'variant'>> = (props) => (
  <AppButton variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<AppButtonProps, 'variant'>> = (props) => (
  <AppButton variant="secondary" {...props} />
);

export const OutlineButton: React.FC<Omit<AppButtonProps, 'variant'>> = (props) => (
  <AppButton variant="outline" {...props} />
);

export const GhostButton: React.FC<Omit<AppButtonProps, 'variant'>> = (props) => (
  <AppButton variant="ghost" {...props} />
);

export interface IconButtonProps extends Omit<AppButtonProps, 'variant' | 'title' | 'children'> {
  icon: IconName | LucideIcon;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, ...props }) => (
  <AppButton variant="icon" leadingIcon={icon} {...props} />
);

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leadingIconWrapper: {
    marginRight: 8,
  },
  trailingIconWrapper: {
    marginLeft: 8,
  },
  loader: {
    paddingVertical: 2,
  },
});
