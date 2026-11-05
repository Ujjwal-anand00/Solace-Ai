import React from 'react';
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
import { useTheme } from '../../../hooks/useTheme';
import { SolaceMascot } from '../../../components/ui/SolaceMascot';

export interface IllustrationProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * WelcomeIllustration
 * Serene wellness dawn scene with rolling organic hills, glowing sun, and central Solace mascot.
 */
export const WelcomeIllustration: React.FC<IllustrationProps> = ({ size = 260, style }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.center, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        <Defs>
          {/* Dawn Sky Glow */}
          <SvgRadialGradient id="dawnGlow" cx="50%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.peach} stopOpacity={isDark ? '0.3' : '0.65'} />
            <Stop offset="55%" stopColor={colors.lavender} stopOpacity={isDark ? '0.2' : '0.45'} />
            <Stop offset="90%" stopColor={colors.mint} stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </SvgRadialGradient>

          {/* Hill 1 Gradient */}
          <SvgGradient id="hillGrad1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.primaryLight} stopOpacity="0.75" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.85" />
          </SvgGradient>

          {/* Hill 2 Gradient */}
          <SvgGradient id="hillGrad2" x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.mint} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={colors.primaryLight} stopOpacity="0.8" />
          </SvgGradient>

          {/* Sun Disc */}
          <SvgGradient id="sunDisc" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFF9E6" stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.peach} stopOpacity="0.8" />
          </SvgGradient>
        </Defs>

        {/* Ambient Glow */}
        <Circle cx="150" cy="130" r="120" fill="url(#dawnGlow)" />

        {/* Rising Gentle Sun Disc */}
        <Circle cx="150" cy="120" r="42" fill="url(#sunDisc)" />

        {/* Floating ethereal rings */}
        <Circle
          cx="150"
          cy="120"
          r="64"
          stroke={colors.peach}
          strokeWidth="1.5"
          strokeDasharray="4,6"
          opacity="0.6"
        />
        <Circle
          cx="150"
          cy="120"
          r="86"
          stroke={colors.lavender}
          strokeWidth="1.2"
          opacity="0.5"
        />

        {/* Distant soft hill */}
        <Path
          d="M0 240 Q75 190 150 215 T300 230 L300 300 L0 300 Z"
          fill="url(#hillGrad1)"
          opacity="0.5"
        />

        {/* Foreground rolling hill */}
        <Path
          d="M0 260 Q100 210 200 240 T300 260 L300 300 L0 300 Z"
          fill="url(#hillGrad2)"
          opacity="0.85"
        />

        {/* Floating Zen Sparkles & Leaves */}
        <Circle cx="70" cy="100" r="3.5" fill={colors.primaryLight} opacity="0.8" />
        <Circle cx="230" cy="85" r="4" fill={colors.peach} opacity="0.9" />
        <Circle cx="245" cy="160" r="3" fill={colors.lavender} opacity="0.85" />
        <Circle cx="55" cy="180" r="2.5" fill={colors.primary} opacity="0.6" />

        {/* Little floating wellness leaf */}
        <Path
          d="M72 135 C78 128 88 130 86 140 C80 144 72 142 72 135 Z"
          fill={colors.primary}
          opacity="0.75"
        />
        <Path
          d="M225 125 C230 118 240 120 238 130 C232 134 225 132 225 125 Z"
          fill={colors.primaryLight}
          opacity="0.75"
        />
      </Svg>

      {/* Mascot centered gracefully on the scene */}
      <View style={styles.mascotOverlay}>
        <SolaceMascot size={110} expression="happy" animationState="floating" showCushion />
      </View>
    </View>
  );
};

/**
 * MoodIllustration (Slide 01)
 * "Understand how you feel."
 * Emotion spectrum aura with gentle mood rings and feeling badges.
 */
export const MoodIllustration: React.FC<IllustrationProps> = ({ size = 260, style }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.center, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        <Defs>
          <SvgRadialGradient id="moodAura" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.mint} stopOpacity={isDark ? '0.4' : '0.7'} />
            <Stop offset="45%" stopColor={colors.lavender} stopOpacity={isDark ? '0.3' : '0.5'} />
            <Stop offset="80%" stopColor={colors.peach} stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </SvgRadialGradient>

          <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
            <Stop offset="50%" stopColor={colors.lavender} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={colors.peach} stopOpacity="0.8" />
          </SvgGradient>
        </Defs>

        {/* Ambient Mood Cloud */}
        <Circle cx="150" cy="150" r="125" fill="url(#moodAura)" />

        {/* Harmonic emotion orbital rings */}
        <Circle
          cx="150"
          cy="150"
          r="95"
          stroke="url(#ringGrad)"
          strokeWidth="2.5"
          strokeDasharray="6,8"
          opacity="0.7"
        />
        <Circle
          cx="150"
          cy="150"
          r="75"
          stroke={colors.primaryLight}
          strokeWidth="2"
          opacity="0.8"
        />
        <Circle
          cx="150"
          cy="150"
          r="55"
          stroke={colors.mint}
          strokeWidth="3"
          opacity="0.9"
        />

        {/* Mood Badge Orbiters */}
        {/* Calm Orb (Sage) */}
        <G transform="translate(60, 90)">
          <Circle cx="16" cy="16" r="20" fill={colors.surface} />
          <Circle cx="16" cy="16" r="19" fill={colors.mint} opacity="0.7" />
          <Path
            d="M9 16 C12 20 18 20 23 16"
            stroke={colors.primaryDark}
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </G>

        {/* Joy Orb (Peach) */}
        <G transform="translate(205, 80)">
          <Circle cx="16" cy="16" r="22" fill={colors.surface} />
          <Circle cx="16" cy="16" r="21" fill={colors.peach} opacity="0.75" />
          <Circle cx="16" cy="16" r="10" fill="#FFFFFF" opacity="0.5" />
          <Path
            d="M10 14 C13 18 19 18 22 14"
            stroke="#9C523B"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </G>

        {/* Reflective Orb (Lavender) */}
        <G transform="translate(195, 195)">
          <Circle cx="16" cy="16" r="20" fill={colors.surface} />
          <Circle cx="16" cy="16" r="19" fill={colors.lavender} opacity="0.8" />
          {/* Gentle crescent moon */}
          <Path
            d="M18 11 C15 13 14 17 16 20 C18 22 21 22 22 21 C20 22 17 21 15 19 C13 16 14 13 16 11 Z"
            fill="#645084"
          />
        </G>

        {/* Peaceful Dewdrop (Mint) */}
        <G transform="translate(75, 200)">
          <Circle cx="16" cy="16" r="18" fill={colors.surface} />
          <Circle cx="16" cy="16" r="17" fill={colors.mint} opacity="0.85" />
          {/* Tiny gentle heart */}
          <Path
            d="M16 20 C16 19 14 17 12 18 C10 17 8 18 8 20 C8 22 12 25 12 25 C12 25 16 22 16 20 Z"
            fill={colors.primary}
          />
        </G>
      </Svg>

      {/* Mascot in serene calm emotion */}
      <View style={styles.mascotOverlay}>
        <SolaceMascot size={105} expression="calm" animationState="breathe" />
      </View>
    </View>
  );
};

/**
 * CompanionIllustration (Slide 02)
 * "Meet your AI companion."
 * Solace Mascot with friendly speech bubble, listening ear, and warm empathy aura.
 */
export const CompanionIllustration: React.FC<IllustrationProps> = ({ size = 260, style }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.center, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        <Defs>
          <SvgRadialGradient id="companionGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.lavender} stopOpacity={isDark ? '0.35' : '0.65'} />
            <Stop offset="50%" stopColor={colors.mint} stopOpacity="0.4" />
            <Stop offset="85%" stopColor={colors.peach} stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </SvgRadialGradient>

          <SvgGradient id="bubbleGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#F5F8F5" stopOpacity="0.95" />
          </SvgGradient>
        </Defs>

        {/* Ambient Glow */}
        <Circle cx="150" cy="150" r="125" fill="url(#companionGlow)" />

        {/* Speech Bubble: "I'm here for you." with heart */}
        <G transform="translate(145, 55)">
          <Path
            d="M10 20 C10 9 20 0 32 0 L88 0 C100 0 110 9 110 20 L110 40 C110 51 100 60 88 60 L35 60 L20 74 L24 60 L20 60 C9 60 10 51 10 40 Z"
            fill="url(#bubbleGrad)"
            stroke={colors.border}
            strokeWidth="1.5"
          />
          {/* Three warm empathy dots */}
          <Circle cx="45" cy="30" r="4" fill={colors.primary} />
          <Circle cx="60" cy="30" r="4" fill={colors.primaryLight} />
          <Circle cx="75" cy="30" r="4" fill={colors.lavender} />
        </G>

        {/* Empathy Sparkles */}
        <Circle cx="70" cy="110" r="4" fill={colors.primaryLight} opacity="0.8" />
        <Circle cx="85" cy="180" r="3.5" fill={colors.peach} opacity="0.85" />
        <Circle cx="230" cy="165" r="4.5" fill={colors.mint} opacity="0.9" />

        {/* Ground Soft Oval */}
        <Ellipse cx="150" cy="245" rx="70" ry="12" fill={colors.primaryLight} opacity="0.25" />
      </Svg>

      {/* Mascot in friendly listening / supportive pose */}
      <View style={styles.mascotOverlay}>
        <SolaceMascot size={115} expression="listening" animationState="wave" />
      </View>
    </View>
  );
};

/**
 * GrowthIllustration (Slide 03)
 * "Grow at your own pace."
 * Balanced stones with flourishing lotus blossom, sunlight, and mindfulness growth.
 */
export const GrowthIllustration: React.FC<IllustrationProps> = ({ size = 260, style }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.center, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        <Defs>
          <SvgRadialGradient id="growthGlow" cx="50%" cy="40%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.mint} stopOpacity={isDark ? '0.4' : '0.7'} />
            <Stop offset="50%" stopColor={colors.peach} stopOpacity="0.4" />
            <Stop offset="85%" stopColor={colors.lavender} stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </SvgRadialGradient>

          {/* Balanced Zen Stones Gradients */}
          <SvgGradient id="stoneGrad1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#829B83" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#536B58" stopOpacity="1" />
          </SvgGradient>
          <SvgGradient id="stoneGrad2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#AFC5B0" stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#829B83" stopOpacity="1" />
          </SvgGradient>
          <SvgGradient id="stoneGrad3" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#DCE9DD" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#AFC5B0" stopOpacity="1" />
          </SvgGradient>

          {/* Sprout Leaf Gradient */}
          <SvgGradient id="sproutGrad" x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0%" stopColor="#536B58" stopOpacity="1" />
            <Stop offset="100%" stopColor="#AFC5B0" stopOpacity="1" />
          </SvgGradient>
        </Defs>

        {/* Ambient Sunlight */}
        <Circle cx="150" cy="130" r="120" fill="url(#growthGlow)" />

        {/* Concentric growth mindfulness circles */}
        <Circle
          cx="150"
          cy="140"
          r="80"
          stroke={colors.primaryLight}
          strokeWidth="1.5"
          strokeDasharray="4,6"
          opacity="0.6"
        />
        <Circle
          cx="150"
          cy="140"
          r="105"
          stroke={colors.mint}
          strokeWidth="1.2"
          opacity="0.5"
        />

        {/* Ground Base */}
        <Ellipse cx="150" cy="255" rx="90" ry="14" fill={colors.primaryLight} opacity="0.2" />

        {/* Bottom Zen Stone (Large) */}
        <Ellipse cx="150" cy="240" rx="60" ry="16" fill="url(#stoneGrad1)" />
        <Ellipse cx="150" cy="237" rx="55" ry="11" fill="#FFFFFF" opacity="0.2" />

        {/* Middle Zen Stone */}
        <Ellipse cx="150" cy="216" rx="44" ry="13" fill="url(#stoneGrad2)" />
        <Ellipse cx="150" cy="214" rx="40" ry="9" fill="#FFFFFF" opacity="0.25" />

        {/* Top Zen Stone */}
        <Ellipse cx="150" cy="196" rx="30" ry="10" fill="url(#stoneGrad3)" />
        <Ellipse cx="150" cy="194" rx="26" ry="7" fill="#FFFFFF" opacity="0.3" />

        {/* Flourishing Sprout on top stone */}
        <Path
          d="M150 192 C150 178 145 168 138 160 C138 174 144 186 150 192 Z"
          fill="url(#sproutGrad)"
        />
        <Path
          d="M150 192 C150 176 156 166 164 158 C163 172 157 186 150 192 Z"
          fill="url(#sproutGrad)"
        />

        {/* Lotus Bloom center highlight */}
        <Circle cx="150" cy="162" r="5" fill={colors.peach} opacity="0.95" />

        {/* Gentle fluttering butterfly / leaves */}
        <Path
          d="M90 120 C95 110 108 114 104 125 C98 128 92 126 90 120 Z"
          fill={colors.lavender}
          opacity="0.85"
        />
        <Path
          d="M210 110 C215 100 228 104 224 115 C218 118 212 116 210 110 Z"
          fill={colors.peach}
          opacity="0.85"
        />

        {/* Floating growth dewdrops */}
        <Circle cx="80" cy="170" r="3.5" fill={colors.primaryLight} opacity="0.8" />
        <Circle cx="225" cy="160" r="4" fill={colors.mint} opacity="0.9" />
      </Svg>

      {/* Mascot hovering happily above the growth stone */}
      <View style={[styles.mascotOverlay, { top: -20 }]}>
        <SolaceMascot size={90} expression="supportive" animationState="floating" />
      </View>
    </View>
  );
};

/**
 * CelebrationIllustration
 * For the final Onboarding Completion screen.
 * Joyful mascot with golden radiance, celestial sparkles, and celebration petals.
 */
export const CelebrationIllustration: React.FC<IllustrationProps> = ({ size = 260, style }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.center, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        <Defs>
          <SvgRadialGradient id="celebGlow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={colors.peach} stopOpacity={isDark ? '0.45' : '0.8'} />
            <Stop offset="40%" stopColor={colors.lavender} stopOpacity={isDark ? '0.35' : '0.6'} />
            <Stop offset="75%" stopColor={colors.mint} stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </SvgRadialGradient>

          <SvgGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFF9E6" stopOpacity="1" />
            <Stop offset="100%" stopColor={colors.butter} stopOpacity="0.9" />
          </SvgGradient>
        </Defs>

        {/* Large Celebration Aura */}
        <Circle cx="150" cy="150" r="130" fill="url(#celebGlow)" />

        {/* Radiating Celestial Rings */}
        <Circle
          cx="150"
          cy="150"
          r="105"
          stroke={colors.peach}
          strokeWidth="1.8"
          strokeDasharray="5,7"
          opacity="0.8"
        />
        <Circle
          cx="150"
          cy="150"
          r="80"
          stroke={colors.lavender}
          strokeWidth="1.5"
          opacity="0.75"
        />

        {/* Celebration Starbursts */}
        {/* Star Top-Left */}
        <G transform="translate(60, 65)">
          <Path
            d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z"
            fill="url(#starGrad)"
          />
        </G>

        {/* Star Top-Right */}
        <G transform="translate(215, 60)">
          <Path
            d="M10 0 L12 7 L20 10 L12 13 L10 20 L8 13 L0 10 L8 7 Z"
            fill="url(#starGrad)"
          />
        </G>

        {/* Star Bottom-Left */}
        <G transform="translate(65, 205)">
          <Path
            d="M10 0 L12 7 L20 10 L12 13 L10 20 L8 13 L0 10 L8 7 Z"
            fill={colors.lavender}
          />
        </G>

        {/* Star Bottom-Right */}
        <G transform="translate(220, 200)">
          <Path
            d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z"
            fill={colors.mint}
          />
        </G>

        {/* Soft Confetti Petals */}
        <Circle cx="95" cy="115" r="4.5" fill={colors.peach} opacity="0.9" />
        <Circle cx="205" cy="120" r="4" fill={colors.primaryLight} opacity="0.9" />
        <Circle cx="110" cy="195" r="3.5" fill={colors.mint} opacity="0.85" />
        <Circle cx="195" cy="185" r="4" fill={colors.lavender} opacity="0.85" />
      </Svg>

      {/* Mascot in ultimate joyful / supportive pose */}
      <View style={styles.mascotOverlay}>
        <SolaceMascot size={125} expression="happy" animationState="pulse" showCushion />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mascotOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
