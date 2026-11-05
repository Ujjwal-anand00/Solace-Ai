import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { AppHeading, AppText, AppCard, AppBadge, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { MoodEntry } from '@solace/shared';

interface MoodCheckInCardProps {
  todayMood?: MoodEntry | null;
  onSelectMood: (mood: string) => void;
  onUpdateMood?: () => void;
  onOpenHistory?: () => void;
}

interface MoodOption {
  key: string;
  label: string;
  emoji: string;
  bgColor: string;
  activeColor: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { key: 'ecstatic', label: 'Amazing', emoji: '🌟', bgColor: '#FEF9C3', activeColor: '#EAB308' },
  { key: 'happy', label: 'Good', emoji: '😊', bgColor: '#DCFCE7', activeColor: '#22C55E' },
  { key: 'calm', label: 'Okay', emoji: '🌿', bgColor: '#E0F2FE', activeColor: '#0EA5E9' },
  { key: 'sad', label: 'Low', emoji: '🌧️', bgColor: '#F3E8FF', activeColor: '#A855F7' },
  { key: 'anxious', label: 'Stressed', emoji: '⚡', bgColor: '#FEE2E2', activeColor: '#EF4444' },
];

export const MoodCheckInCard: React.FC<MoodCheckInCardProps> = ({
  todayMood,
  onSelectMood,
  onUpdateMood,
  onOpenHistory,
}) => {
  const { colors, isDark } = useTheme();

  const handleMoodPress = (moodKey: string) => {
    triggerHaptic.selection();
    onSelectMood(moodKey);
  };

  const todayMoodLabel = React.useMemo(() => {
    if (!todayMood) return null;
    const match = MOOD_OPTIONS.find((m) => m.key === todayMood.mood.toLowerCase());
    return match ? `${match.emoji} ${match.label}` : todayMood.mood;
  }, [todayMood]);

  return (
    <AppCard
      variant="elevated"
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(130, 155, 131, 0.15)',
        },
      ]}
    >
      {/* Header section */}
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <AppHeading level={3} style={[styles.title, { color: colors.textPrimary }]}>
            How are you feeling today?
          </AppHeading>
          <AppText variant="bodySmall" style={[styles.subtitle, { color: colors.textSecondary }]}>
            {todayMood
              ? "You've recorded an emotional check-in today."
              : 'A mindful pause to acknowledge your inner state.'}
          </AppText>
        </View>

        {todayMood && (
          <AppBadge label="Checked in" variant="success" size="sm" style={styles.completedBadge} />
        )}
      </View>

      {/* If checked in today, show existing mood summary */}
      {todayMood ? (
        <View style={styles.todaySection}>
          <View style={[styles.existingMoodContainer, { backgroundColor: isDark ? colors.background : '#F3F4ED' }]}>
            <View style={styles.existingMoodLeft}>
              <View style={styles.existingMoodDot}>
                <AppText style={styles.existingMoodEmoji}>
                  {MOOD_OPTIONS.find((m) => m.key === todayMood.mood.toLowerCase())?.emoji || '🌿'}
                </AppText>
              </View>
              <View style={styles.existingMoodDetails}>
                <AppText variant="bodyMedium" style={[styles.existingMoodTitle, { color: colors.textPrimary }]}>
                  Felt {todayMoodLabel} today
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Intensity {todayMood.moodIntensity}/10
                  {todayMood.emotions?.length ? ` • ${todayMood.emotions.slice(0, 2).join(', ')}` : ''}
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              onPress={onUpdateMood}
              style={[styles.updateButton, { borderColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <AppText variant="caption" style={[styles.updateButtonText, { color: colors.primary }]}>
                Update
              </AppText>
            </TouchableOpacity>
          </View>

          {onOpenHistory && (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.light();
                onOpenHistory();
              }}
              style={styles.historyLinkRow}
              activeOpacity={0.7}
            >
              <AppText variant="caption" style={{ color: colors.primaryDark, fontWeight: '700' }}>
                View Mood History & Calendar
              </AppText>
              <AppIcon name="chevronRight" size={14} color={colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* Mood Options Row */
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            {MOOD_OPTIONS.map((option) => (
              <MoodOptionItem
                key={option.key}
                option={option}
                onPress={() => handleMoodPress(option.key)}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>

          {onOpenHistory && (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.light();
                onOpenHistory();
              }}
              style={styles.historyLinkRow}
              activeOpacity={0.7}
            >
              <AppText variant="caption" style={{ color: colors.primaryDark, fontWeight: '700' }}>
                Explore Mood Calendar & Analytics
              </AppText>
              <AppIcon name="chevronRight" size={14} color={colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </AppCard>
  );
};

interface MoodOptionItemProps {
  option: MoodOption;
  onPress: () => void;
  colors: Record<string, string>;
  isDark: boolean;
}

const MoodOptionItem: React.FC<MoodOptionItemProps> = ({ option, onPress, colors, isDark }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 12, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  };

  return (
    <Animated.View style={[styles.optionItem, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={styles.optionTouchTarget}
        accessibilityLabel={`Mood ${option.label}`}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.emojiCircle,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : option.bgColor,
            },
          ]}
        >
          <AppText style={styles.emojiText}>{option.emoji}</AppText>
        </View>
        <AppText variant="caption" style={[styles.optionLabel, { color: colors.textPrimary }]}>
          {option.label}
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  completedBadge: {
    marginLeft: 8,
  },
  todaySection: {
    gap: 12,
  },
  optionsContainer: {
    gap: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionItem: {
    flex: 1,
    alignItems: 'center',
  },
  optionTouchTarget: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  emojiText: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  existingMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
  },
  existingMoodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  existingMoodDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  existingMoodEmoji: {
    fontSize: 22,
  },
  existingMoodDetails: {
    flex: 1,
  },
  existingMoodTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  updateButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  updateButtonText: {
    fontWeight: '600',
  },
  historyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 4,
  },
});
