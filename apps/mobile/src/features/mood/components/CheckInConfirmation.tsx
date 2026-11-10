import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  AppText,
  AppHeading,
  AppCard,
  AppBadge,
  AppButton,
  SolaceMascot,
} from '../../../components/ui';
import { MoodCharacter } from '../../../components/mood';
import { useTheme } from '../../../hooks/useTheme';
import { PRIMARY_MOODS, INTENSITY_LEVELS, MoodCheckInDraft } from '../types';

interface CheckInConfirmationProps {
  draft: MoodCheckInDraft;
  isLoading: boolean;
  isSaved: boolean;
  onSave: () => void;
  onDone: () => void;
  onEditSection?: (stepIndex: number) => void;
}

export const CheckInConfirmation: React.FC<CheckInConfirmationProps> = ({
  draft,
  isLoading,
  isSaved,
  onSave,
  onDone,
}) => {
  const { colors } = useTheme();

  const moodConfig = PRIMARY_MOODS.find((m) => m.key === draft.mood) || PRIMARY_MOODS[1];
  const intensityInfo = INTENSITY_LEVELS[draft.moodIntensity] || INTENSITY_LEVELS[5];

  if (isSaved) {
    return (
      <View style={styles.savedContainer}>
        <View style={styles.mascotWrapper}>
          <SolaceMascot size={120} expression="happy" animationState="breathe" showGlow />
        </View>

        <AppHeading level={1} style={styles.savedTitle}>
          Check-In Recorded 🌿
        </AppHeading>
        <AppText
          variant="bodyMedium"
          style={[styles.savedSubtitle, { color: colors.textSecondary }]}
        >
          Thank you for taking time to be with yourself. Your emotional check-in has been gently saved to your sanctuary.
        </AppText>

        <View style={styles.doneButtonWrapper}>
          <AppButton
            title="Return to Sanctuary Home"
            variant="primary"
            size="lg"
            fullWidth
            onPress={onDone}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <AppHeading level={1} style={styles.title}>
          Review Your Check-In
        </AppHeading>
        <AppText
          variant="bodyMedium"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Take a moment to look over your reflection before saving.
        </AppText>
      </View>

      {/* Primary Mood & Intensity Card */}
      <AppCard style={styles.summaryCard}>
        <View style={styles.moodRow}>
          <View
            style={[
              styles.emojiCircle,
              { backgroundColor: moodConfig.bgColor, borderColor: moodConfig.borderColor },
            ]}
          >
            <MoodCharacter
              mood={moodConfig.key}
              size={50}
              isSelected={true}
              showShadow={false}
            />
          </View>
          <View style={styles.moodTexts}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              PRIMARY MOOD
            </AppText>
            <AppHeading level={2} style={[styles.moodLabel, { color: moodConfig.color }]}>
              {moodConfig.label}
            </AppHeading>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              {moodConfig.description}
            </AppText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Intensity Row */}
        <View style={styles.intensityRow}>
          <View>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              INTENSITY
            </AppText>
            <AppText variant="bodyLarge" style={{ fontWeight: '700' }}>
              Level {draft.moodIntensity} of 10
            </AppText>
            <AppText variant="caption" style={{ color: colors.primaryDark }}>
              {intensityInfo.label}
            </AppText>
          </View>
          <View style={[styles.intensityBadge, { backgroundColor: colors.primaryLight }]}>
            <AppText style={[styles.intensityBadgeText, { color: colors.primaryDark }]}>
              {draft.moodIntensity}/10
            </AppText>
          </View>
        </View>
      </AppCard>

      {/* Selected Emotions */}
      {draft.emotions.length > 0 && (
        <AppCard style={styles.card}>
          <AppText variant="caption" style={[styles.sectionCaption, { color: colors.textSecondary }]}>
            IDENTIFIED EMOTIONS
          </AppText>
          <View style={styles.chipsWrap}>
            {draft.emotions.map((em) => (
              <AppBadge
                key={em}
                label={em.charAt(0).toUpperCase() + em.slice(1)}
                variant="primary"
                size="md"
              />
            ))}
          </View>
        </AppCard>
      )}

      {/* Reflection Note */}
      {draft.note ? (
        <AppCard style={styles.card}>
          <AppText variant="caption" style={[styles.sectionCaption, { color: colors.textSecondary }]}>
            PERSONAL REFLECTION
          </AppText>
          <AppText variant="bodyMedium" style={styles.reflectionText}>
            “{draft.note}”
          </AppText>

          {draft.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {draft.tags.map((tag) => (
                <AppBadge
                  key={tag}
                  label={`#${tag}`}
                  variant="neutral"
                  size="sm"
                />
              ))}
            </View>
          )}
        </AppCard>
      ) : null}

      {/* Save Button */}
      <View style={styles.actionButtons}>
        <AppButton
          title="Save my check-in"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          onPress={onSave}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 14,
  },
  header: {
    marginBottom: 6,
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
  summaryCard: {
    padding: 18,
    borderRadius: 20,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 30,
  },
  moodTexts: {
    flex: 1,
    gap: 2,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: '800',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intensityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  intensityBadgeText: {
    fontSize: 16,
    fontWeight: '800',
  },
  card: {
    padding: 16,
    borderRadius: 18,
    gap: 10,
  },
  sectionCaption: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 10,
  },
  savedContainer: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
    textAlign: 'center',
  },
  mascotWrapper: {
    marginVertical: 20,
  },
  savedTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  savedSubtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
  },
  doneButtonWrapper: {
    width: '100%',
  },
});

