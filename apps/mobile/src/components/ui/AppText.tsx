import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { TypographyVariant, FONT_WEIGHTS } from '../../theme/typography';

export interface AppTextProps extends TextProps {
  children?: React.ReactNode;
  variant?: TypographyVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: keyof typeof FONT_WEIGHTS;
  style?: StyleProp<TextStyle>;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = 'bodyMedium',
  color,
  align = 'left',
  weight,
  style,
  ...rest
}) => {
  const { colors, typography } = useTheme();

  const token = typography[variant] || typography.bodyMedium;

  const resolvedColor = React.useMemo(() => {
    if (!color) {
      if (variant === 'caption') return colors.textMuted;
      if (variant === 'label') return colors.textSecondary;
      return colors.textPrimary;
    }
    if (color in colors) {
      return (colors as Record<string, string>)[color];
    }
    return color;
  }, [color, variant, colors]);

  const resolvedWeight = weight ? FONT_WEIGHTS[weight] : token.fontWeight;

  return (
    <Text
      style={[
        {
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          fontWeight: resolvedWeight,
          letterSpacing: token.letterSpacing,
          fontFamily: token.fontFamily,
          color: resolvedColor,
          textAlign: align,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export interface AppHeadingProps extends AppTextProps {
  level?: 1 | 2 | 3 | 4 | 'h1' | 'h2' | 'h3' | 'h4' | 'displayLarge' | 'displayMedium';
}

/**
 * AppHeading
 * Specialized heading variant wrapper.
 */
export const AppHeading: React.FC<AppHeadingProps> = ({
  level = 1,
  children,
  variant,
  ...rest
}) => {
  const resolvedVariant: TypographyVariant = React.useMemo(() => {
    if (variant) return variant;
    if (level === 'displayLarge') return 'displayLarge';
    if (level === 'displayMedium') return 'displayMedium';
    if (level === 2 || level === 'h2') return 'h2';
    if (level === 3 || level === 'h3' || level === 4 || level === 'h4') return 'h3';
    return 'h1';
  }, [level, variant]);

  return (
    <AppText variant={resolvedVariant} accessibilityRole="header" {...rest}>
      {children}
    </AppText>
  );
};

export interface AppLabelProps extends AppTextProps {
  required?: boolean;
}

/**
 * AppLabel
 * Field label or UI caption with optional required star.
 */
export const AppLabel: React.FC<AppLabelProps> = ({ children, required, style, ...rest }) => {
  const { colors } = useTheme();

  return (
    <AppText variant="label" style={[styles.labelRow, style]} {...rest}>
      {children}
      {required && <Text style={{ color: colors.error }}> *</Text>}
    </AppText>
  );
};

const styles = StyleSheet.create({
  labelRow: {
    marginBottom: 6,
  },
});
