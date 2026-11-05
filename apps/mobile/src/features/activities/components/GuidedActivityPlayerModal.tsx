import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import {
  AppHeading,
  AppText,
  AppIcon,
  AppButton,
  AppBadge,
  AppProgressBar,
  SolaceMascot,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { useCompleteActivity } from '../../../hooks/useActivities';
import { WellnessActivity } from '@solace/shared';

interface GuidedActivityPlayerModalProps {
  activity: WellnessActivity | null;
  visible: boolean;
  onClose: () => void;
  onCompleted?: () => void;
}

export const GuidedActivityPlayerModal: React.FC<GuidedActivityPlayerModalProps> = ({
  activity,
  visible,
  onClose,
  onCompleted,
}) => {
  const { colors } = useTheme();
  const completeMutation = useCompleteActivity();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState('Grounded');
  const [reflectionNote, setReflectionNote] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const instructions = activity?.instructions || [];
  const totalSteps = instructions.length;

  useEffect(() => {
    if (visible && activity) {
      setCurrentStepIndex(0);
      setElapsedSeconds(0);
      setIsCompleted(false);
      setReflectionNote('');

      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible, activity]);

  const handleNextStep = () => {
    triggerHaptic.selection();
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Completed all steps
      if (timerRef.current) clearInterval(timerRef.current);
      triggerHaptic.success();
      setIsCompleted(true);
    }
  };

  const handlePrevStep = () => {
    triggerHaptic.selection();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleExit = () => {
    triggerHaptic.selection();
    if (!isCompleted && elapsedSeconds > 20) {
      Alert.alert(
        'Leave Activity?',
        'You are currently in the middle of this session. Would you like to finish or exit?',
        [
          { text: 'Continue Session', style: 'cancel' },
          {
            text: 'Finish Now',
            onPress: () => {
              if (timerRef.current) clearInterval(timerRef.current);
              setIsCompleted(true);
            },
          },
          {
            text: 'Discard & Exit',
            style: 'destructive',
            onPress: onClose,
          },
        ],
      );
    } else {
      onClose();
    }
  };

  const handleFinishSave = async () => {
    if (!activity) return;

    triggerHaptic.selection();
    try {
      await completeMutation.mutateAsync({
        id: activity.id,
        dto: {
          durationCompleted: Math.max(elapsedSeconds, 30),
          feedback: reflectionNote.trim()
            ? `${selectedFeeling} - ${reflectionNote.trim()}`
            : `Felt ${selectedFeeling}`,
        },
      });
      onCompleted?.();
      onClose();
    } catch {
      // Handled
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!activity) return null;

  const feelings = ['Peaceful', 'Grounded', 'Refreshed', 'Supported', 'Clear'];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleExit}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {!isCompleted ? (
          <View style={styles.activeContainer}>
            {/* Header */}
            <View style={styles.topHeader}>
              <TouchableOpacity
                onPress={handleExit}
                style={[styles.closeCircle, { backgroundColor: colors.surface }]}
                accessibilityLabel="Exit activity"
              >
                <AppIcon name="x" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                <AppBadge label={activity.category.toUpperCase()} variant="primary" size="sm" />
                <AppHeading level="h4" numberOfLines={1} style={styles.headerTitle}>
                  {activity.title}
                </AppHeading>
              </View>
              <View style={[styles.timerBadge, { backgroundColor: colors.surface }]}>
                <AppIcon name="clock" size={14} color={colors.textSecondary} />
                <AppText variant="caption" style={{ fontWeight: '600', color: colors.textPrimary }}>
                  {formatTime(elapsedSeconds)}
                </AppText>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressWrap}>
              <AppProgressBar
                progress={totalSteps > 0 ? (currentStepIndex + 1) / totalSteps : 0}
                color={colors.primaryDark}
                backgroundColor={colors.border}
                height={6}
              />
              <View style={styles.stepCountRow}>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Step {currentStepIndex + 1} of {totalSteps}
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Est. {Math.round(activity.duration / 60)} min total
                </AppText>
              </View>
            </View>

            {/* Step Card Content */}
            <ScrollView contentContainerStyle={styles.stepCardScroll} showsVerticalScrollIndicator={false}>
              <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.stepHeader}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: colors.primaryLight }]}>
                    <AppText variant="h4" style={{ color: colors.primaryDark, fontWeight: '700' }}>
                      {currentStepIndex + 1}
                    </AppText>
                  </View>
                  <AppHeading level="h4" style={styles.stepHeading}>
                    Guidance Step
                  </AppHeading>
                </View>

                <AppText variant="bodyLarge" style={[styles.instructionText, { color: colors.textPrimary }]}>
                  {instructions[currentStepIndex] || 'Take a moment to center yourself and breathe gently.'}
                </AppText>

                <View style={styles.mascotSmallWrap}>
                  <SolaceMascot
                    size={70}
                    expression="listening"
                    animationState="breathe"
                    showGlow={false}
                    showCushion={false}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Bottom Stepper Controls */}
            <View style={[styles.bottomControls, { borderTopColor: colors.border }]}>
              {currentStepIndex > 0 ? (
                <AppButton
                  title="Previous"
                  variant="outline"
                  size="md"
                  onPress={handlePrevStep}
                  style={styles.navBtn}
                />
              ) : (
                <View style={styles.navBtn} />
              )}

              <AppButton
                title={currentStepIndex === totalSteps - 1 ? 'Complete Session ✨' : 'Next Step'}
                variant="primary"
                size="md"
                onPress={handleNextStep}
                style={styles.navBtn}
              />
            </View>
          </View>
        ) : (
          /* Completed View */
          <ScrollView contentContainerStyle={styles.completedContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.completedHero}>
              <SolaceMascot
                size={110}
                expression="happy"
                animationState="floating"
                showGlow
                showCushion
              />
              <AppHeading level="h2" style={styles.completedTitle}>
                Activity Completed 🌿
              </AppHeading>
              <AppText variant="bodyMedium" style={[styles.completedSubtitle, { color: colors.textSecondary }]}>
                {activity.title}
              </AppText>
              <AppText variant="caption" style={{ color: colors.textTertiary }}>
                Time dedicated: {formatTime(elapsedSeconds)}
              </AppText>
            </View>

            {/* Feeling Check-in */}
            <View style={styles.completedSection}>
              <AppText variant="caption" style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                HOW DO YOU FEEL NOW?
              </AppText>
              <View style={styles.chipsRow}>
                {feelings.map((f) => {
                  const isSelected = selectedFeeling === f;
                  return (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.feelingChip,
                        {
                          backgroundColor: isSelected ? colors.primaryDark : colors.surface,
                          borderColor: isSelected ? colors.primaryDark : colors.border,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic.selection();
                        setSelectedFeeling(f);
                      }}
                    >
                      <AppText
                        variant="bodySmall"
                        style={{ color: isSelected ? '#FFFFFF' : colors.textPrimary, fontWeight: '600' }}
                      >
                        {f}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Optional Reflection Note */}
            <View style={styles.completedSection}>
              <AppText variant="caption" style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                OPTIONAL REFLECTION (SAVED TO LOG)
              </AppText>
              <TextInput
                style={[
                  styles.reflectionInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="What shifted or stood out during this practice?"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                value={reflectionNote}
                onChangeText={setReflectionNote}
              />
            </View>

            <View style={styles.finishBtnWrap}>
              <AppButton
                title={completeMutation.isPending ? 'Saving...' : 'Save & Close'}
                variant="primary"
                size="lg"
                onPress={handleFinishSave}
                loading={completeMutation.isPending}
                fullWidth
              />
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  activeContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    alignItems: 'center',
    gap: 4,
    maxWidth: '60%',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  progressWrap: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 8,
  },
  stepCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepCardScroll: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  stepCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  instructionText: {
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    paddingVertical: 12,
  },
  mascotSmallWrap: {
    marginTop: 8,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  navBtn: {
    flex: 1,
  },
  completedContainer: {
    padding: 24,
    gap: 24,
    alignItems: 'center',
  },
  completedHero: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  completedTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  completedSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  completedSection: {
    width: '100%',
    gap: 12,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  feelingChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  reflectionInput: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  finishBtnWrap: {
    width: '100%',
    marginTop: 12,
    marginBottom: 24,
  },
});
