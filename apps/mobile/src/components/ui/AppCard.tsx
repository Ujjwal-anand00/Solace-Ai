import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { ScalePressable } from '../../utils/animations';

export type CardVariant = 'default' | 'elevated' | 'soft' | 'gradient' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface AppCardProps extends ViewProps {
  children?: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  borderRadius?: number;
  onPress?: () => void;
  gradientColors?: [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  borderRadius,
  onPress,
  gradientColors,
  style,
  accessibilityLabel,
  ...rest
}) => {
  const { colors, layout, radius, shadows, isDark } = useTheme();

  const cardRadius = borderRadius ?? radius.lg;

  // Resolve Padding
  const resolvedPadding = React.useMemo(() => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return layout.cardPaddingSm; // 12
      case 'lg':
        return layout.cardPaddingLg; // 20
      case 'md':
      default:
        return layout.cardPadding; // 16
    }
  }, [padding, layout]);

  // Resolve Styles by Variant
  const variantStyles = React.useMemo(() => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          borderWidth: 0,
          borderColor: 'transparent',
          shadow: shadows.elevated,
        };
      case 'soft':
        return {
          backgroundColor: colors.surfaceSecondary,
          borderWidth: 0,
          borderColor: 'transparent',
          shadow: shadows.none,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1.5,
          borderColor: isDark ? colors.borderStrong : colors.border,
          shadow: shadows.none,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderColor: 'transparent',
          shadow: shadows.subtle,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: isDark ? colors.borderLight : colors.border,
          shadow: shadows.card,
        };
    }
  }, [variant, colors, shadows, isDark]);

  const defaultGradients: [string, string, ...string[]] = isDark
    ? [colors.surface, colors.surfaceSecondary]
    : ['#FFFFFF', '#F8F9F3'];

  const content = (
    <View
      style={[
        styles.innerContent,
        {
          padding: resolvedPadding,
        },
      ]}
    >
      {children}
    </View>
  );

  if (variant === 'gradient') {
    // Expo SDK 58 / React 19 JSX type bridge for LinearGradient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const GradientComponent = LinearGradient as React.ComponentType<any>;
    const cardBody = (
      <GradientComponent
        colors={gradientColors || defaultGradients}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          {
            borderRadius: cardRadius,
          },
          variantStyles.shadow,
          style,
        ]}
      >
        {content}
      </GradientComponent>
    );

    if (onPress) {
      return (
        <ScalePressable
          onPress={onPress}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="button"
          activeScale={0.98}
        >
          {cardBody}
        </ScalePressable>
      );
    }
    return cardBody;
  }

  const standardCard = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderWidth: variantStyles.borderWidth,
          borderColor: variantStyles.borderColor,
          borderRadius: cardRadius,
        },
        variantStyles.shadow,
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      {...rest}
    >
      {content}
    </View>
  );

  if (onPress) {
    return (
      <ScalePressable
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        activeScale={0.98}
      >
        {standardCard}
      </ScalePressable>
    );
  }

  return standardCard;
};

export const ElevatedCard: React.FC<Omit<AppCardProps, 'variant'>> = (props) => (
  <AppCard variant="elevated" {...props} />
);

export const SoftCard: React.FC<Omit<AppCardProps, 'variant'>> = (props) => (
  <AppCard variant="soft" {...props} />
);

export const GradientCard: React.FC<Omit<AppCardProps, 'variant'>> = (props) => (
  <AppCard variant="gradient" {...props} />
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  innerContent: {
    width: '100%',
  },
});

