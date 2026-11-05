import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppButton,
  AppIcon,
  AppProgressBar,
  AppText,
} from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import { useCreateMood } from '../../src/hooks/useMood';
import { triggerHaptic } from '../../src/utils/haptics';
import { MoodCategory } from '@solace/shared';
import { MoodCheckInDraft } from '../../src/features/mood/types';

// Step Components
import { MoodSelector } from '../../src/features/mood/components/MoodSelector';
import { IntensitySlider } from '../../src/features/mood/components/IntensitySlider';
import { EmotionPicker } from '../../src/features/mood/components/EmotionPicker';
import { ReflectionInput } from '../../src/features/mood/components/ReflectionInput';
import { CheckInConfirmation } from '../../src/features/mood/components/CheckInConfirmation';

export default function MoodCheckInScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ initialMood?: string }>();

  // Determine starting mood from route params if tapped from home dashboard
  const initialMoodCategory = (
    params.initialMood && ['ecstatic', 'happy', 'calm', 'sad', 'anxious'].includes(params.initialMood)
      ? params.initialMood
      : undefined
  ) as MoodCategory | undefined;

  const [currentStep, setCurrentStep] = useState<number>(initialMoodCategory ? 2 : 1);
  const [draft, setDraft] = useState<MoodCheckInDraft>({
    mood: initialMoodCategory,
    moodIntensity: 6,
    emotions: [],
    note: '',
    tags: [],
  });
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const createMoodMutation = useCreateMood();

  const handleNext = () => {
    triggerHaptic.light();
    if (currentStep === 1 && !draft.mood) {
      Alert.alert('Select Mood', 'Please pick how you are feeling right now to continue.');
      return;
    }
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    triggerHaptic.light();
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleClose = () => {
    triggerHaptic.light();
    Alert.alert(
      'Exit Check-In?',
      'Are you sure you want to discard this check-in?',
      [
        { text: 'Keep Going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const handleSave = async () => {
    if (!draft.mood) return;
    triggerHaptic.medium();
    try {
      await createMoodMutation.mutateAsync({
        mood: draft.mood,
        moodIntensity: draft.moodIntensity,
        emotions: draft.emotions,
        note: draft.note ? draft.note.trim() : undefined,
        tags: draft.tags,
      });
      triggerHaptic.success();
      setIsSaved(true);
    } catch (err: unknown) {
      Alert.alert('Error', (err as Error).message || 'Unable to record check-in.');
    }
  };

  const totalSteps = 5;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Top Header Navigation */}
      {!isSaved && (
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.navButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Go back"
          >
            <AppIcon name="arrowLeft" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.stepIndicatorWrapper}>
            <AppText variant="caption" style={[styles.stepText, { color: colors.textSecondary }]}>
              Step {currentStep} of {totalSteps}
            </AppText>
            <AppProgressBar progress={progressPercent} height={4} color={colors.primary} />
          </View>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.navButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Close check-in"
          >
            <AppIcon name="x" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Screen Body */}
      <View style={styles.content}>
        {currentStep === 1 && (
          <MoodSelector
            selectedMood={draft.mood}
            onSelectMood={(mood) => {
              setDraft((prev) => ({ ...prev, mood }));
              // Automatically advance to intensity step on selection
              setCurrentStep(2);
            }}
          />
        )}

        {currentStep === 2 && (
          <IntensitySlider
            value={draft.moodIntensity}
            onChange={(val) => setDraft((prev) => ({ ...prev, moodIntensity: val }))}
          />
        )}

        {currentStep === 3 && (
          <EmotionPicker
            selectedEmotions={draft.emotions}
            onToggleEmotion={(emotion) =>
              setDraft((prev) => {
                const exists = prev.emotions.includes(emotion);
                const nextList = exists
                  ? prev.emotions.filter((e) => e !== emotion)
                  : [...prev.emotions, emotion];
                return { ...prev, emotions: nextList };
              })
            }
            onClearAll={() => setDraft((prev) => ({ ...prev, emotions: [] }))}
          />
        )}

        {currentStep === 4 && (
          <ReflectionInput
            note={draft.note}
            onChangeNote={(note) => setDraft((prev) => ({ ...prev, note }))}
            selectedTags={draft.tags}
            onToggleTag={(tag) =>
              setDraft((prev) => {
                const exists = prev.tags.includes(tag);
                const nextTags = exists
                  ? prev.tags.filter((t) => t !== tag)
                  : [...prev.tags, tag];
                return { ...prev, tags: nextTags };
              })
            }
          />
        )}

        {currentStep === 5 && (
          <CheckInConfirmation
            draft={draft}
            isLoading={createMoodMutation.isPending}
            isSaved={isSaved}
            onSave={handleSave}
            onDone={() => router.replace('/(home)')}
          />
        )}
      </View>

      {/* Bottom Navigation Buttons */}
      {!isSaved && currentStep < 5 && (
        <View style={styles.bottomBar}>
          {currentStep === 3 ? (
            <View style={styles.stepThreeRow}>
              <AppButton
                title="Skip"
                variant="ghost"
                size="md"
                onPress={handleNext}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Continue"
                variant="primary"
                size="md"
                onPress={handleNext}
                trailingIcon="arrowRight"
                style={{ flex: 2 }}
              />
            </View>
          ) : currentStep === 4 ? (
            <View style={styles.stepThreeRow}>
              <AppButton
                title={draft.note.trim() ? 'Next' : 'Skip Note'}
                variant={draft.note.trim() ? 'primary' : 'outline'}
                size="md"
                onPress={handleNext}
                trailingIcon="arrowRight"
                fullWidth
              />
            </View>
          ) : (
            <AppButton
              title="Continue"
              variant="primary"
              size="md"
              fullWidth
              disabled={currentStep === 1 && !draft.mood}
              onPress={handleNext}
              trailingIcon="arrowRight"
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicatorWrapper: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
    gap: 6,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E5E0',
  },
  stepThreeRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
});

