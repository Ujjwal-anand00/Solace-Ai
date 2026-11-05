import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

export interface SoftGradientBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'subtle' | 'warm' | 'calm' | 'surface';
}

/**
 * SoftGradientBackground
 * Very subtle gradient that gently blends natural tones without distraction.
 */
export const SoftGradientBackground: React.FC<SoftGradientBackgroundProps> = ({
  children,
  style,
  variant = 'subtle',
}) => {
  const { colors, isDark } = useTheme();

  const gradientColors: [string, string, ...string[]] = React.useMemo(() => {
    if (isDark) {
      switch (variant) {
        case 'warm':
          return [colors.background, colors.surface, '#251E19'];
        case 'calm':
          return [colors.background, colors.surface, '#1A2A20'];
        case 'surface':
          return [colors.surface, colors.surfaceSecondary];
        case 'subtle':
        default:
          return [colors.background, colors.surface, colors.background];
      }
    } else {
      switch (variant) {
        case 'warm':
          return ['#FAF7F0', '#F5EFE6', '#F8F6EF'];
        case 'calm':
          return ['#F8F9F4', '#EFF4F0', '#F8F6EF'];
        case 'surface':
          return [colors.surface, colors.surfaceSecondary];
        case 'subtle':
        default:
          return ['#FAF9F5', '#F5F3EB', '#F8F6EF'];
      }
    }
  }, [colors, isDark, variant]);

  // Expo SDK 58 / React 19 JSX type bridge for LinearGradient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GradientComponent = LinearGradient as React.ComponentType<any>;

  return (
    <GradientComponent
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </GradientComponent>
  );
};

export interface DecorativeBlobProps {
  size?: number;
  color?: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * DecorativeBlob
 * Soft, low-opacity organic background accent.
 */
export const DecorativeBlob: React.FC<DecorativeBlobProps> = ({
  size = 180,
  color,
  top,
  bottom,
  left,
  right,
  opacity = 0.35,
  style,
}) => {
  const { colors } = useTheme();
  const blobColor = color || colors.mint;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: blobColor,
          opacity,
          top,
          bottom,
          left,
          right,
        },
        style,
      ]}
    />
  );
};

export interface SubtleGlowProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * SubtleGlow
 * Radiant ambient glow behind featured cards or wellness illustrations.
 */
export const SubtleGlow: React.FC<SubtleGlowProps> = ({ size = 140, color, style }) => {
  const { colors, isDark } = useTheme();
  const glowColor = color || (isDark ? colors.primaryTint : colors.primaryLight);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.glow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: glowColor,
          opacity: isDark ? 0.25 : 0.45,
        },
        style,
      ]}
    />
  );
};

export interface OrganicBackgroundProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * OrganicBackground
 * Container with warm neutral surface and gentle ambient floating blobs.
 */
export const OrganicBackground: React.FC<OrganicBackgroundProps> = ({ children, style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }, style]}>
      <DecorativeBlob top={-40} right={-40} size={220} color={colors.lavender} opacity={0.3} />
      <DecorativeBlob bottom={60} left={-60} size={240} color={colors.peach} opacity={0.25} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    alignSelf: 'center',
    transform: [{ scale: 1.2 }],
  },
});
