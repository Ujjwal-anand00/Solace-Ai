import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MoodCharacter } from './MoodCharacter';
import { MoodCharacterConfig } from './moodConfig';
import { AppText, AppIcon } from '../ui';
import { useTheme } from '../../hooks/useTheme';
import { triggerHaptic } from '../../utils/haptics';

export interface MoodOptionProps {
  config: MoodCharacterConfig;
  isSelected: boolean;
  isSubdued?: boolean;
  onSelect: (key: MoodCharacterConfig['key']) => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const MoodOption: React.FC<MoodOptionProps> = ({
  config,
  isSelected,
  isSubdued = false,
  onSelect,
  size = 56,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const pressScale = useSharedValue(1);

  const animatedPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
    opacity: isSubdued ? withSpring(0.68) : withSpring(1),
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.92, { damping: 14, stiffness: 240 });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 14, stiffness: 240 });
  };

  const handlePress = () => {
    triggerHaptic.selection();
    onSelect(config.key);
  };

  return (
    <Animated.View style={[styles.container, animatedPressStyle, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.88}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={config.accessibleLabel}
        style={styles.touchTarget}
      >
        {/* Selection Aura Container */}
        <View
          style={[
            styles.avatarCircle,
            {
              width: size + 16,
              height: size + 16,
              borderRadius: (size + 16) / 2,
              backgroundColor: isSelected
                ? isDark
                  ? 'rgba(203, 179, 232, 0.22)'
                  : config.surfaceColor
                : isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : '#F8F6FA',
              borderColor: isSelected ? colors.primary : 'transparent',
              borderWidth: isSelected ? 2 : 1,
            },
            isSelected && styles.selectedGlow,
          ]}
        >
          {/* Custom Animated Mood Character */}
          <MoodCharacter
            mood={config.key}
            size={size}
            isSelected={isSelected}
            isInteractive={true}
            showShadow={true}
          />

          {/* Neon Lime Active Selection Pip */}
          {isSelected && (
            <View style={[styles.selectionPip, { backgroundColor: colors.accent }]}>
              <AppIcon name="check" size={10} color="#292431" strokeWidth={3} />
            </View>
          )}
        </View>

        {/* Mood Label */}
        <View style={styles.labelWrapper}>
          <AppText
            variant="caption"
            numberOfLines={1}
            style={[
              styles.labelText,
              {
                color: isSelected
                  ? isDark
                    ? colors.primary
                    : colors.primaryDark
                  : colors.textSecondary,
                fontWeight: isSelected ? '800' : '600',
              },
            ]}
          >
            {config.label}
          </AppText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
    minWidth: 58,
    minHeight: 80,
  },
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  selectedGlow: {
    shadowColor: '#CBB3E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  selectionPip: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  labelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  labelText: {
    fontSize: 12,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});

