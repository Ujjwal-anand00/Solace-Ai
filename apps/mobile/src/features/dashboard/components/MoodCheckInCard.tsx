import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { AppHeading, AppText, AppCard, AppBadge, AppIcon, AccentButton } from '../../../components/ui';
import { MoodSelector, MoodCharacter, MOOD_CONFIGS, MoodKey, normalizeMoodKey } from '../../../components/mood';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { MoodEntry } from '@solace/shared';

interface MoodCheckInCardProps {
  todayMood?: MoodEntry | null;
  onSelectMood: (mood: string) => void;
  onUpdateMood?: () => void;
  onOpenHistory?: () => void;
}

export const MoodCheckInCard: React.FC<MoodCheckInCardProps> = ({
  todayMood,
  onSelectMood,
  onUpdateMood,
  onOpenHistory,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);

  const handleSelectMood = (moodKey: MoodKey) => {
    setSelectedMood(moodKey);
  };

  const handleConfirmMood = () => {
    if (!selectedMood) return;
    triggerHaptic.medium();
    onSelectMood(selectedMood);
  };

  const normalizedTodayKey = React.useMemo(() => {
    return todayMood ? normalizeMoodKey(todayMood.mood) : null;
  }, [todayMood]);

  const todayConfig = normalizedTodayKey ? MOOD_CONFIGS[normalizedTodayKey] : null;

  return (
    <AppCard
      variant="elevated"
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(203, 179, 232, 0.35)',
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
          <AppBadge label="Checked in" variant="accent" size="sm" style={styles.completedBadge} />
        )}
      </View>

      {/* If checked in today, show existing mood summary with character */}
      {todayMood && todayConfig ? (
        <View style={styles.todaySection}>
          <View
            style={[
              styles.existingMoodContainer,
              {
                backgroundColor: isDark ? colors.surfaceTertiary : todayConfig.surfaceColor,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.existingMoodLeft}>
              <View style={styles.existingMoodCharWrapper}>
                <MoodCharacter
                  mood={todayConfig.key}
                  size={46}
                  isSelected={true}
                  isInteractive={false}
                  showShadow={false}
                />
              </View>
              <View style={styles.existingMoodDetails}>
                <AppText
                  variant="bodyMedium"
                  style={[styles.existingMoodTitle, { color: colors.textPrimary }]}
                >
                  Felt {todayConfig.label} today
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Intensity {todayMood.moodIntensity}/10
                  {todayMood.emotions?.length
                    ? ` • ${todayMood.emotions.slice(0, 2).join(', ')}`
                    : ''}
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              onPress={onUpdateMood}
              style={[styles.updateButton, { borderColor: colors.primary, backgroundColor: isDark ? 'transparent' : '#FFFFFF' }]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Update today's mood check-in"
            >
              <AppText variant="caption" style={[styles.updateButtonText, { color: colors.primaryDark }]}>
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
        /* Five Interactive Expressive Characters */
        <View style={styles.optionsContainer}>
          <MoodSelector
            selectedMood={selectedMood}
            onSelectMood={handleSelectMood}
          />

          {/* Smooth Confirmation Action when user taps a character */}
          {selectedMood && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={styles.actionContainer}
            >
              <AccentButton
                title={`Continue with ${MOOD_CONFIGS[selectedMood].label} →`}
                size="md"
                fullWidth
                onPress={handleConfirmMood}
                style={styles.confirmButton}
              />
            </Animated.View>
          )}

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

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    lineHeight: 18,
  },
  completedBadge: {
    marginLeft: 8,
  },
  todaySection: {
    gap: 12,
  },
  optionsContainer: {
    gap: 10,
  },
  actionContainer: {
    marginTop: 4,
    marginBottom: 4,
  },
  confirmButton: {
    shadowColor: '#D4FF3F',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 2,
  },
  existingMoodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  existingMoodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  existingMoodCharWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  existingMoodDetails: {
    flex: 1,
  },
  existingMoodTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  updateButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  updateButtonText: {
    fontWeight: '700',
  },
  historyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    paddingTop: 6,
  },
});
