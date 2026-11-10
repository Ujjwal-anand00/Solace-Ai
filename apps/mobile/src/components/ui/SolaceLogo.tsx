import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { AppHeading, AppText } from './AppText';

export interface SolaceLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'emblem' | 'full' | 'stacked' | 'horizontal';
  showTagline?: boolean;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

export const SolaceLogo: React.FC<SolaceLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = false,
  style,
  color,
}) => {
  const { colors } = useTheme();

  const dimension = React.useMemo(() => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 32;
      case 'md':
        return 48;
      case 'lg':
        return 72;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  }, [size]);

  const primaryColor = color || colors.primary;
  const darkColor = colors.primaryDark;
  const limeColor = colors.accent;
  const redColor = colors.secondary;

  // The modern emblem: 3 harmonic curved droplets meeting at center with glowing brand spark
  const emblem = (
    <Svg width={dimension} height={dimension} viewBox="0 0 100 100" fill="none">
      <Defs>
        <SvgGradient id="leafGrad1" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={primaryColor} stopOpacity="0.95" />
          <Stop offset="100%" stopColor={darkColor} stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="leafGrad2" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0%" stopColor={limeColor} stopOpacity="0.9" />
          <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.95" />
        </SvgGradient>
        <SvgGradient id="leafGrad3" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={redColor} stopOpacity="0.9" />
          <Stop offset="100%" stopColor={primaryColor} stopOpacity="0.85" />
        </SvgGradient>
      </Defs>

      {/* Top Petal (Lavender Brand Identity) */}
      <Path
        d="M50 16 C50 16 68 28 64 48 C60 62 50 64 50 64 C50 64 40 62 36 48 C32 28 50 16 50 16 Z"
        fill="url(#leafGrad1)"
      />

      {/* Bottom Right Petal (Neon Lime Energy) */}
      <Path
        d="M78 68 C78 68 62 82 48 74 C36 67 42 56 42 56 C42 56 50 52 64 54 C80 56 78 68 78 68 Z"
        fill="url(#leafGrad2)"
      />

      {/* Bottom Left Petal (Bold Red Heart / Pulse) */}
      <Path
        d="M22 68 C22 68 38 82 52 74 C64 67 58 56 58 56 C58 56 50 52 36 54 C20 56 22 68 22 68 Z"
        fill="url(#leafGrad3)"
      />

      {/* Center glowing pearl of harmony */}
      <Circle cx="50" cy="56" r="6" fill="#FFFFFF" opacity="0.95" />
      <Circle cx="50" cy="56" r="3" fill={limeColor} />
    </Svg>
  );

  if (variant === 'emblem') {
    return <View style={[styles.emblemOnly, style]}>{emblem}</View>;
  }

  const isStacked = variant === 'stacked';

  return (
    <View style={[isStacked ? styles.stacked : styles.horizontal, style]}>
      {emblem}

      <View style={[styles.textBlock, isStacked && styles.textBlockStacked]}>
        <AppHeading
          level={size === 'xl' ? 1 : size === 'lg' ? 2 : 3}
          align={isStacked ? 'center' : 'left'}
          style={styles.brandTitle}
        >
          SOLACE <AppText style={styles.aiBadge}>AI</AppText>
        </AppHeading>

        {showTagline && (
          <AppText
            variant="bodySmall"
            color="textSecondary"
            align={isStacked ? 'center' : 'left'}
            style={styles.tagline}
          >
            Your personal space to feel, heal and grow.
          </AppText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emblemOnly: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stacked: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  textBlock: {
    justifyContent: 'center',
  },
  textBlockStacked: {
    alignItems: 'center',
  },
  brandTitle: {
    letterSpacing: 2,
    fontWeight: '700',
  },
  aiBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9678BD',
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 4,
  },
});
