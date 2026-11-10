import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  G,
} from 'react-native-svg';
import { MoodKey, normalizeMoodKey } from './moodConfig';
import { useMoodAnimation } from './MoodAnimation';

export interface MoodCharacterProps {
  mood: MoodKey | string;
  size?: number;
  isSelected?: boolean;
  isInteractive?: boolean;
  showShadow?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const MoodCharacter: React.FC<MoodCharacterProps> = ({
  mood,
  size = 64,
  isSelected = false,
  isInteractive = true,
  showShadow = true,
  style,
}) => {
  const resolvedMood = normalizeMoodKey(mood);
  const { animatedCharacterStyle, animatedShadowStyle } = useMoodAnimation({
    mood: resolvedMood,
    isSelected,
    isInteractive,
  });

  const shadowHeight = Math.max(6, Math.round(size * 0.12));
  const characterHeight = size - (showShadow ? shadowHeight : 0);

  const renderCharacterSvg = () => {
    switch (resolvedMood) {
      case 'ecstatic': // AMAZING: Joyful arms up, beaming smile, neon lime sparkles
        return (
          <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
            <Defs>
              <RadialGradient id="amzAura" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#D4FF3F" stopOpacity="0.45" />
                <Stop offset="70%" stopColor="#CBB3E8" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="amzClay" x1="0.2" y1="0.1" x2="0.8" y2="0.95">
                <Stop offset="0%" stopColor="#FAF2FF" />
                <Stop offset="40%" stopColor="#E3CEF7" />
                <Stop offset="85%" stopColor="#C4A6E8" />
                <Stop offset="100%" stopColor="#9678BD" />
              </LinearGradient>
              <LinearGradient id="amzArm" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#E3CEF7" />
                <Stop offset="100%" stopColor="#B393DB" />
              </LinearGradient>
              <LinearGradient id="amzSpark" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#FAFFC7" />
                <Stop offset="100%" stopColor="#D4FF3F" />
              </LinearGradient>
            </Defs>

            {/* Glowing Aura when selected or active */}
            <Circle cx="50" cy="50" r="44" fill="url(#amzAura)" opacity={isSelected ? 1 : 0.65} />

            {/* Raised celebratory arms */}
            <Path
              d="M22 56 C14 46 12 34 20 30 C25 28 28 36 26 48 Z"
              fill="url(#amzArm)"
            />
            <Path
              d="M78 56 C86 46 88 34 80 30 C75 28 72 36 74 48 Z"
              fill="url(#amzArm)"
            />

            {/* Main Rounded Clay Pebble Body */}
            <Path
              d="M24 48 C24 28 35 18 50 18 C65 18 76 28 76 48 C76 68 66 82 50 82 C34 82 24 68 24 48 Z"
              fill="url(#amzClay)"
            />

            {/* Soft 3D Clay Highlight Sheen */}
            <Ellipse
              cx="38"
              cy="28"
              rx="12"
              ry="6"
              transform="rotate(-25 38 28)"
              fill="#FFFFFF"
              opacity="0.45"
            />

            {/* Floating Celebration Sparkles (Neon Lime) */}
            <Path
              d="M50 8 L52 14 L58 16 L52 18 L50 24 L48 18 L42 16 L48 14 Z"
              fill="url(#amzSpark)"
            />
            <Circle cx="22" cy="18" r="2.5" fill="#D4FF3F" opacity="0.9" />
            <Circle cx="78" cy="18" r="2.5" fill="#D4FF3F" opacity="0.9" />

            {/* Cheerful Blushing Cheeks */}
            <Circle cx="32" cy="53" r="5" fill="#FF85A2" opacity="0.4" />
            <Circle cx="68" cy="53" r="5" fill="#FF85A2" opacity="0.4" />

            {/* Beaming Joyful Eyes (Closed Joy Arcs) */}
            <Path
              d="M33 44 C36 38 43 38 46 44"
              stroke="#292431"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <Path
              d="M54 44 C57 38 64 38 67 44"
              stroke="#292431"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Open Beaming Smile with Cute Rosy Tongue */}
            <G>
              <Path
                d="M39 52 Q50 67 61 52 Q50 53 39 52 Z"
                fill="#292431"
              />
              <Path
                d="M44 60 C46 64 54 64 56 60 C53 58 47 58 44 60 Z"
                fill="#FF85A2"
              />
            </G>
          </Svg>
        );

      case 'happy': // GOOD: Relaxed, cozy content smile, gentle calm posture
        return (
          <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
            <Defs>
              <RadialGradient id="goodAura" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#CBB3E8" stopOpacity="0.4" />
                <Stop offset="75%" stopColor="#D4FF3F" stopOpacity="0.15" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="goodClay" x1="0.15" y1="0.1" x2="0.85" y2="0.95">
                <Stop offset="0%" stopColor="#F8FBF7" />
                <Stop offset="35%" stopColor="#E3F4E7" />
                <Stop offset="75%" stopColor="#C9E6D0" />
                <Stop offset="100%" stopColor="#9BBFA3" />
              </LinearGradient>
              <LinearGradient id="goodLeaf" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#D4FF3F" />
                <Stop offset="100%" stopColor="#9BBFA3" />
              </LinearGradient>
            </Defs>

            {/* Soft Ambient Glow */}
            <Circle cx="50" cy="50" r="43" fill="url(#goodAura)" opacity={isSelected ? 1 : 0.5} />

            {/* Plump Relaxed Clay Body */}
            <Path
              d="M23 49 C23 30 34 20 50 20 C66 20 77 30 77 49 C77 68 67 81 50 81 C33 81 23 68 23 49 Z"
              fill="url(#goodClay)"
            />

            {/* 3D Specular Highlight */}
            <Ellipse
              cx="37"
              cy="30"
              rx="11"
              ry="5.5"
              transform="rotate(-25 37 30)"
              fill="#FFFFFF"
              opacity="0.48"
            />

            {/* Floating Serene Leaf Accent */}
            <Path
              d="M50 10 C54 13 56 18 50 20 C44 18 46 13 50 10 Z"
              fill="url(#goodLeaf)"
              opacity="0.9"
            />

            {/* Soft Content Blushing Cheeks */}
            <Circle cx="31" cy="53" r="5" fill="#FFAAA6" opacity="0.45" />
            <Circle cx="69" cy="53" r="5" fill="#FFAAA6" opacity="0.45" />

            {/* Relaxed Smiling Eyes (Curved happy lines) */}
            <Path
              d="M34 45 C37 40 43 40 46 45"
              stroke="#292431"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <Path
              d="M54 45 C57 40 63 40 66 45"
              stroke="#292431"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Gentle Warm Smile */}
            <Path
              d="M42 55 Q50 63 58 55"
              stroke="#292431"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'calm': // OKAY: Steady, balanced neutral, serene open eyes, peaceful mouth
        return (
          <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
            <Defs>
              <RadialGradient id="calmAura" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#CBB3E8" stopOpacity="0.4" />
                <Stop offset="80%" stopColor="#F0EAF7" stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="calmClay" x1="0.15" y1="0.1" x2="0.85" y2="0.95">
                <Stop offset="0%" stopColor="#FDFCFF" />
                <Stop offset="35%" stopColor="#ECE6F7" />
                <Stop offset="75%" stopColor="#D5C7ED" />
                <Stop offset="100%" stopColor="#B39FCE" />
              </LinearGradient>
            </Defs>

            {/* Balanced Ambient Glow */}
            <Circle cx="50" cy="50" r="43" fill="url(#calmAura)" opacity={isSelected ? 1 : 0.5} />

            {/* Smooth Symmetric Pebble Body */}
            <Path
              d="M24 49 C24 30 35 21 50 21 C65 21 76 30 76 49 C76 68 65 80 50 80 C35 80 24 68 24 49 Z"
              fill="url(#calmClay)"
            />

            {/* 3D Specular Highlight */}
            <Ellipse
              cx="38"
              cy="31"
              rx="10"
              ry="5"
              transform="rotate(-25 38 31)"
              fill="#FFFFFF"
              opacity="0.45"
            />

            {/* Subtle Ethereal Balance Ring above */}
            <Ellipse
              cx="50"
              cy="16"
              rx="12"
              ry="3"
              stroke="#CBB3E8"
              strokeWidth="1.5"
              strokeDasharray="2,3"
              opacity="0.75"
            />

            {/* Soft Subtle Blush */}
            <Circle cx="32" cy="53" r="4" fill="#CBB3E8" opacity="0.4" />
            <Circle cx="68" cy="53" r="4" fill="#CBB3E8" opacity="0.4" />

            {/* Calm Natural Open Eyes */}
            <Circle cx="39" cy="44" r="3.6" fill="#292431" />
            <Circle cx="40.5" cy="42.5" r="1.2" fill="#FFFFFF" />

            <Circle cx="61" cy="44" r="3.6" fill="#292431" />
            <Circle cx="62.5" cy="42.5" r="1.2" fill="#FFFFFF" />

            {/* Steady, Neutral Calm Mouth */}
            <Path
              d="M44 55 Q50 56 56 55"
              stroke="#292431"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'sad': // LOW: Gentle drooping eyes, comforting sleepy posture, tender
        return (
          <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
            <Defs>
              <RadialGradient id="lowAura" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#CBB3E8" stopOpacity="0.35" />
                <Stop offset="75%" stopColor="#A39BA9" stopOpacity="0.15" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="lowClay" x1="0.15" y1="0.1" x2="0.85" y2="0.95">
                <Stop offset="0%" stopColor="#F7F5FC" />
                <Stop offset="40%" stopColor="#E2DDF0" />
                <Stop offset="80%" stopColor="#C7BEDC" />
                <Stop offset="100%" stopColor="#A499BF" />
              </LinearGradient>
            </Defs>

            {/* Gentle Twilight Glow */}
            <Circle cx="50" cy="50" r="43" fill="url(#lowAura)" opacity={isSelected ? 1 : 0.5} />

            {/* Soft Comforting Slumped Pebble Body */}
            <Path
              d="M24 51 C24 33 34 23 50 23 C66 23 76 33 76 51 C76 70 65 82 50 82 C35 82 24 70 24 51 Z"
              fill="url(#lowClay)"
            />

            {/* Soft Muted 3D Specular Highlight */}
            <Ellipse
              cx="38"
              cy="33"
              rx="9"
              ry="4.5"
              transform="rotate(-25 38 33)"
              fill="#FFFFFF"
              opacity="0.38"
            />

            {/* Tender Rosy Cheeks for emotional warmth */}
            <Circle cx="31" cy="54" r="4.5" fill="#E8B4C8" opacity="0.45" />
            <Circle cx="69" cy="54" r="4.5" fill="#E8B4C8" opacity="0.45" />

            {/* Drooping, Sleepy Comforting Eyes */}
            <Path
              d="M34 44 C37 47 43 46 46 42"
              stroke="#292431"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <Path
              d="M54 42 C57 46 63 47 66 44"
              stroke="#292431"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Gentle Soft Downward Mouth (Comforting, not scary) */}
            <Path
              d="M44 58 Q50 54 56 58"
              stroke="#292431"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </Svg>
        );

      case 'anxious': // STRESSED: Worried eyebrows, wide eyes, gentle wavy mouth, coral highlights
        return (
          <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
            <Defs>
              <RadialGradient id="strAura" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#E34234" stopOpacity="0.28" />
                <Stop offset="70%" stopColor="#CBB3E8" stopOpacity="0.2" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
              <LinearGradient id="strClay" x1="0.15" y1="0.1" x2="0.85" y2="0.95">
                <Stop offset="0%" stopColor="#FFF7F7" />
                <Stop offset="35%" stopColor="#F5E4E6" />
                <Stop offset="75%" stopColor="#E2C2C7" />
                <Stop offset="100%" stopColor="#C49A9F" />
              </LinearGradient>
              <LinearGradient id="dropGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor="#CBB3E8" />
              </LinearGradient>
            </Defs>

            {/* Anxious Radiance Glow */}
            <Circle cx="50" cy="50" r="43" fill="url(#strAura)" opacity={isSelected ? 1 : 0.6} />

            {/* Tense Rounded Clay Body */}
            <Path
              d="M24 49 C24 30 35 21 50 21 C65 21 76 30 76 49 C76 68 65 80 50 80 C35 80 24 68 24 49 Z"
              fill="url(#strClay)"
            />

            {/* Specular Highlight */}
            <Ellipse
              cx="38"
              cy="31"
              rx="10"
              ry="5"
              transform="rotate(-25 38 31)"
              fill="#FFFFFF"
              opacity="0.4"
            />

            {/* Subtle Cooling Sweat Dewdrop on side (Comforting, relatable) */}
            <Path
              d="M74 34 C76 31 79 33 78 37 C77 40 73 39 74 34 Z"
              fill="url(#dropGrad)"
              opacity="0.85"
            />

            {/* Worried Eyebrows */}
            <Path
              d="M34 37 Q40 40 44 41"
              stroke="#E34234"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <Path
              d="M56 41 Q60 40 66 37"
              stroke="#E34234"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Wide Concerned Eyes */}
            <Circle cx="39" cy="45" r="4.2" fill="#292431" />
            <Circle cx="40.5" cy="43.5" r="1.3" fill="#FFFFFF" />

            <Circle cx="61" cy="45" r="4.2" fill="#292431" />
            <Circle cx="62.5" cy="43.5" r="1.3" fill="#FFFFFF" />

            {/* Flushed Anxious Cheeks */}
            <Circle cx="31" cy="54" r="4.5" fill="#E34234" opacity="0.3" />
            <Circle cx="69" cy="54" r="4.5" fill="#E34234" opacity="0.3" />

            {/* Soft Wavy Nervous Mouth */}
            <Path
              d="M42 56 Q46 53 50 57 T58 55"
              stroke="#292431"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </Svg>
        );
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Dynamic Animated Character */}
      <Animated.View style={[styles.characterWrapper, { height: characterHeight }, animatedCharacterStyle]}>
        {renderCharacterSvg()}
      </Animated.View>

      {/* Ground Clay Shadow */}
      {showShadow && (
        <Animated.View style={[styles.shadowWrapper, { height: shadowHeight }, animatedShadowStyle]}>
          <Svg width={size * 0.7} height={shadowHeight} viewBox="0 0 70 12">
            <Ellipse cx="35" cy="6" rx="28" ry="4.5" fill="#292431" opacity="0.18" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  characterWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -2,
  },
});
