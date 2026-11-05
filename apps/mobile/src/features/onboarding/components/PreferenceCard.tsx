import React from 'react';
import { View, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../../hooks/useTheme';
import { AppText } from '../../../components/ui/AppText';
import { AppIcon, IconName } from '../../../components/ui/AppIcon';
import { triggerHaptic } from '../../../utils/haptics';

export interface PreferenceOption {
  id: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface PreferenceCardProps {
  option: PreferenceOption;
  isSelected: boolean;
  onToggle: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

export const PreferenceCard: React.FC<PreferenceCardProps> = ({
  option,
  isSelected,
  onToggle,
  style,
}) => {
  const { colors, isDark, radius } = useTheme();

  const handlePress = () => {
    triggerHaptic.light();
    onToggle(option.id);
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(isSelected ? 1.015 : 1, { damping: 15, stiffness: 200 }) }],
    };
  }, [isSelected]);

  const activeBg = isDark ? 'rgba(130, 155, 131, 0.22)' : 'rgba(220, 233, 221, 0.45)';
  const inactiveBg = isDark ? colors.surface : colors.surface;
  const borderColor = isSelected ? colors.primary : isDark ? colors.border : '#E7EAE5';

  return (
    <Animated.View style={[animatedCardStyle, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[
          styles.card,
          {
            backgroundColor: isSelected ? activeBg : inactiveBg,
            borderColor,
            borderRadius: radius.lg,
          },
        ]}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${option.title}: ${option.description}`}
      >
        <View style={styles.contentRow}>
          {/* Icon Orb */}
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: isSelected
                  ? isDark
                    ? colors.primaryDark
                    : colors.mint
                  : isDark
                    ? colors.surfaceSecondary
                    : colors.surfaceSecondary,
              },
            ]}
          >
            <AppIcon
              name={option.icon}
              size="md"
              color={isSelected ? colors.primaryDark : colors.textSecondary}
            />
          </View>

          {/* Texts */}
          <View style={styles.textWrapper}>
            <AppText
              variant="bodyLarge"
              style={[
                styles.title,
                { color: isSelected ? colors.textPrimary : colors.textPrimary },
              ]}
            >
              {option.title}
            </AppText>
            <AppText variant="bodySmall" color="textSecondary" style={styles.description}>
              {option.description}
            </AppText>
          </View>

          {/* Checkbox indicator */}
          <View
            style={[
              styles.checkCircle,
              {
                borderColor: isSelected ? colors.primary : colors.textMuted,
                backgroundColor: isSelected ? colors.primary : 'transparent',
              },
            ]}
          >
            {isSelected && <AppIcon name="check" size={14} color="#FFFFFF" strokeWidth={2.8} />}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    shadowColor: '#303A34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    lineHeight: 18,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
