import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

export type MascotExpression = 'happy' | 'calm' | 'listening' | 'thinking' | 'supportive';
export type MascotAnimationState = 'idle' | 'floating' | 'pulse' | 'wave' | 'breathe';

export interface SolaceMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  expression?: MascotExpression;
  animationState?: MascotAnimationState;
  showGlow?: boolean;
  showCushion?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SolaceMascot: React.FC<SolaceMascotProps> = ({
  size = 'md',
  expression = 'happy',
  animationState = 'floating',
  showGlow = true,
  showCushion = false,
  style,
}) => {
  const { colors } = useTheme();

  const dimension = React.useMemo(() => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 64;
      case 'md':
        return 96;
      case 'lg':
        return 140;
      case 'xl':
        return 190;
      default:
        return 96;
    }
  }, [size]);

  // Shared values for animations
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.7);

  useEffect(() => {
    switch (animationState) {
      case 'breathe':
        // Slow calm 4-second breathing cycle
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.97, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          true,
        );
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
            withTiming(0.9, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
          ),
          -1,
          true,
        );
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.85, { duration: 2500 }),
            withTiming(0.4, { duration: 2500 }),
          ),
          -1,
          true,
        );
        break;

      case 'pulse':
        scale.value = withRepeat(
          withSequence(
            withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.98, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        );
        break;

      case 'wave':
        translateY.value = withRepeat(
          withSequence(
            withTiming(-4, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            withTiming(4, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        );
        rotation.value = withRepeat(
          withSequence(
            withTiming(4, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
            withTiming(-4, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        );
        break;

      case 'floating':
      default:
        translateY.value = withRepeat(
          withSequence(
            withTiming(-6, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
            withTiming(6, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        );
        glowScale.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
            withTiming(0.96, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          ),
          -1,
          true,
        );
        break;
    }
  }, [animationState, translateY, scale, rotation, glowScale, glowOpacity]);

  const animatedMascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  // Render facial expression features
  const renderFacialExpression = () => {
    switch (expression) {
      case 'calm':
        return (
          <G id="face-calm">
            {/* Left Eye: Peaceful curved resting crescent */}
            <Path
              d="M38 52 C42 56 48 56 52 52"
              stroke="#292431"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Eye */}
            <Path
              d="M68 52 C72 56 78 56 82 52"
              stroke="#292431"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Gentle serene smile */}
            <Path
              d="M56 64 C58 66 62 66 64 64"
              stroke="#9678BD"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </G>
        );

      case 'listening':
        return (
          <G id="face-listening">
            {/* Left Eye: Open attentive with catchlight */}
            <Ellipse cx="45" cy="51" rx="4.5" ry="5.5" fill="#292431" />
            <Circle cx="46.5" cy="49" r="1.8" fill="#FFFFFF" />
            {/* Right Eye: Curious slightly larger */}
            <Ellipse cx="75" cy="51" rx="4.5" ry="5.5" fill="#292431" />
            <Circle cx="76.5" cy="49" r="1.8" fill="#FFFFFF" />
            {/* Curious friendly smile */}
            <Path
              d="M55 64 C58 67 62 67 65 64"
              stroke="#9678BD"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </G>
        );

      case 'thinking':
        return (
          <G id="face-thinking">
            {/* Left Eye: Looking up-right */}
            <Ellipse cx="45" cy="50" rx="4.2" ry="5.2" fill="#292431" />
            <Circle cx="46.8" cy="48" r="1.8" fill="#FFFFFF" />
            {/* Right Eye: Looking up-right */}
            <Ellipse cx="75" cy="50" rx="4.2" ry="5.2" fill="#292431" />
            <Circle cx="76.8" cy="48" r="1.8" fill="#FFFFFF" />
            {/* Thinking slight puckered smile */}
            <Path
              d="M56 64 C58 63 62 65 64 63"
              stroke="#9678BD"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tiny thinking sparkle near forehead */}
            <Circle cx="84" cy="38" r="1.8" fill={colors.primary} opacity="0.8" />
          </G>
        );

      case 'supportive':
        return (
          <G id="face-supportive">
            {/* Left Eye: Warm rounded crescent */}
            <Path
              d="M38 52 C42 48 48 48 52 52"
              stroke="#292431"
              strokeWidth="3.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Eye: Warm rounded crescent */}
            <Path
              d="M68 52 C72 48 78 48 82 52"
              stroke="#292431"
              strokeWidth="3.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Warm reassuring smile */}
            <Path
              d="M54 63 C58 68 62 68 66 63"
              stroke="#9678BD"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Tiny comforting heart near cheek/chest */}
            <Path
              d="M58 75 C58 73 55 71 53 73 C51 71 48 73 48 75 C48 78 53 81 53 81 C53 81 58 78 58 75 Z"
              fill={colors.primaryLight}
              opacity="0.9"
            />
          </G>
        );

      case 'happy':
      default:
        return (
          <G id="face-happy">
            {/* Left Eye: Happy upward arc ^ */}
            <Path
              d="M38 53 C42 47 48 47 52 53"
              stroke="#292431"
              strokeWidth="3.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Eye: Happy upward arc ^ */}
            <Path
              d="M68 53 C72 47 78 47 82 53"
              stroke="#292431"
              strokeWidth="3.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sweet joyful smile */}
            <Path
              d="M54 62 C57 67 63 67 66 62"
              stroke="#9678BD"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          </G>
        );
    }
  };

  return (
    <View style={[styles.container, { width: dimension, height: dimension }, style]}>
      {/* Background Soft Glow Aura */}
      {showGlow && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.glowWrapper, animatedGlowStyle]}>
          <Svg width={dimension} height={dimension} viewBox="0 0 120 120">
            <Defs>
              <SvgRadialGradient id="mascotGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.45" />
                <Stop offset="50%" stopColor={colors.accent} stopOpacity="0.2" />
                <Stop offset="85%" stopColor={colors.primaryLight} stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </SvgRadialGradient>
            </Defs>
            <Circle cx="60" cy="58" r="54" fill="url(#mascotGlow)" />
          </Svg>
        </Animated.View>
      )}

      {/* Main Mascot Vector Illustration */}
      <Animated.View style={[styles.mascotBody, animatedMascotStyle]}>
        <Svg width={dimension} height={dimension} viewBox="0 0 120 120" fill="none">
          <Defs>
            {/* Body 3D-shaded pearlescent gradient */}
            <SvgGradient id="bodyGrad" x1="0.2" y1="0" x2="0.8" y2="1">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="65%" stopColor="#F5F9F6" stopOpacity="1" />
              <Stop offset="100%" stopColor="#E2EBE4" stopOpacity="1" />
            </SvgGradient>

            {/* Rosy peach cheeks gradient */}
            <SvgRadialGradient id="blushGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#F5DFD2" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#F5DFD2" stopOpacity="0" />
            </SvgRadialGradient>

            {/* Soft shadow below mascot */}
            <SvgRadialGradient id="shadowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor="#737D75" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#737D75" stopOpacity="0" />
            </SvgRadialGradient>

            {/* Meditating cushion gradient */}
            <SvgGradient id="cushionGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={colors.lavender} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={colors.primaryLight} stopOpacity="0.8" />
            </SvgGradient>
          </Defs>

          {/* Optional Zen Cushion underneath */}
          {showCushion && (
            <G id="cushion">
              <Ellipse cx="60" cy="94" rx="34" ry="10" fill="url(#cushionGrad)" />
              <Ellipse cx="60" cy="92" rx="30" ry="7" fill="#FFFFFF" opacity="0.3" />
            </G>
          )}

          {/* Soft Ground Shadow */}
          <Ellipse cx="60" cy="97" rx="26" ry="5" fill="url(#shadowGrad)" />

          {/* Organic Rounded Body / Head */}
          {/* A soft rounded pebble/cloud spirit shape */}
          <Path
            d="M60 22
               C82 22 96 35 96 55
               C96 75 80 88 60 88
               C40 88 24 75 24 55
               C24 35 38 22 60 22 Z"
            fill="url(#bodyGrad)"
          />

          {/* Top highlight for glossy 3D feel */}
          <Path
            d="M45 28 C55 24 65 24 75 28 C70 32 50 32 45 28 Z"
            fill="#FFFFFF"
            opacity="0.8"
          />

          {/* Left Rosy Cheek */}
          <Circle cx="34" cy="59" r="6" fill="url(#blushGrad)" />

          {/* Right Rosy Cheek */}
          <Circle cx="86" cy="59" r="6" fill="url(#blushGrad)" />

          {/* Facial Expression (Eyes & Smile) */}
          {renderFacialExpression()}

          {/* Cute Zen Resting Hands / Paws */}
          <G id="hands">
            {/* Left resting hand */}
            <Ellipse cx="44" cy="80" rx="7" ry="4.5" fill="#E8F0EA" />
            {/* Right resting hand */}
            <Ellipse cx="76" cy="80" rx="7" ry="4.5" fill="#E8F0EA" />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotBody: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

