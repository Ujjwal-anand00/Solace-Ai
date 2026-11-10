import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AppText, AppHeading, AppCard } from '../../../components/ui';
import { MoodCharacter } from '../../../components/mood';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { PRIMARY_MOODS, PrimaryMoodConfig } from '../types';
import { MoodCategory } from '@solace/shared';

interface MoodSelectorProps {
  selectedMood?: MoodCategory;
  onSelectMood: (mood: MoodCategory) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppHeading level={1} style={styles.title}>
          How are you feeling right now?
        </AppHeading>
        <AppText
          variant="bodyMedium"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Take a moment to check in with yourself. Every feeling is welcome here.
        </AppText>
      </View>

      <View style={styles.moodList}>
        {PRIMARY_MOODS.map((item) => (
          <MoodCardItem
            key={item.key}
            config={item}
            isSelected={selectedMood === item.key}
            onPress={() => {
              triggerHaptic.selection();
              onSelectMood(item.key);
            }}
            isDark={isDark}
          />
        ))}
      </View>
    </View>
  );
};

interface MoodCardItemProps {
  config: PrimaryMoodConfig;
  isSelected: boolean;
  onPress: () => void;
  isDark: boolean;
}

const MoodCardItem: React.FC<MoodCardItemProps> = ({
  config,
  isSelected,
  onPress,
  isDark,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 14, stiffness: 220 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 14, stiffness: 220 });
  };

  return (
    <Animated.View style={[styles.cardWrapper, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${config.label}, ${config.description}`}
      >
        <AppCard
          style={[
            styles.card,
            {
              backgroundColor: isDark
                ? isSelected
                  ? 'rgba(130, 155, 131, 0.25)'
                  : 'rgba(255, 255, 255, 0.05)'
                : isSelected
                ? config.bgColor
                : '#FFFFFF',
              borderColor: isSelected ? config.color : isDark ? 'rgba(255,255,255,0.1)' : '#E6EAE6',
              borderWidth: isSelected ? 2 : 1,
            },
          ]}
        >
          <View style={styles.cardContent}>
            <View
              style={[
                styles.emojiContainer,
                {
                  backgroundColor: isDark
                    ? 'rgba(255, 255, 255, 0.08)'
                    : isSelected
                    ? '#FFFFFF'
                    : config.bgColor,
                },
              ]}
            >
              <MoodCharacter
                mood={config.key}
                size={44}
                isSelected={isSelected}
                isInteractive={false}
                showShadow={false}
              />
            </View>

            <View style={styles.textColumn}>
              <AppText
                variant="bodyLarge"
                style={[
                  styles.label,
                  { color: isSelected ? config.color : isDark ? '#FFFFFF' : '#1C2E24' },
                ]}
              >
                {config.label}
              </AppText>
              <AppText
                variant="caption"
                style={[
                  styles.description,
                  { color: isSelected ? config.color : isDark ? '#A1A8A2' : '#6B7A70' },
                ]}
              >
                {config.description}
              </AppText>
            </View>

            <View
              style={[
                styles.radioIndicator,
                {
                  borderColor: isSelected ? config.color : isDark ? '#4B5563' : '#D1D5DB',
                  backgroundColor: isSelected ? config.color : 'transparent',
                },
              ]}
            >
              {isSelected && <View style={styles.radioInnerDot} />}
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    marginBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  moodList: {
    gap: 12,
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  emojiContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  textColumn: {
    flex: 1,
  },
  label: {
    fontWeight: '700',
    fontSize: 16,
  },
  description: {
    marginTop: 2,
    fontSize: 12,
  },
  radioIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});

