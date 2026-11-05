import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/hooks/useTheme';
import {
  AppText,
  AppHeading,
  AppCard,
  AppButton,
  AppIcon,
  AppBadge,
  IconName,
} from '../../src/components/ui';
import {
  useCurrentWellnessPlan,
  useGenerateWellnessPlan,
  useActivateWellnessPlan,
} from '../../src/hooks/useWellnessPlan';
import { triggerHaptic } from '../../src/utils/haptics';
import { CreateWellnessPlanDto } from '@solace/shared';

const FOCUS_OPTIONS = [
  { id: 'stress', label: 'Stress Management', icon: 'activity' },
  { id: 'sleep', label: 'Better Sleep Habits', icon: 'moon' },
  { id: 'mindfulness', label: 'Mindfulness & Presence', icon: 'compass' },
  { id: 'self-care', label: 'Self-Care & Rest', icon: 'heart' },
  { id: 'emotional-awareness', label: 'Emotional Awareness', icon: 'smile' },
  { id: 'gratitude', label: 'Gratitude & Joy', icon: 'sparkles' },
  { id: 'habits', label: 'Positive Daily Routines', icon: 'calendar' },
  { id: 'confidence', label: 'Self-Confidence', icon: 'award' },
];

const DURATION_OPTIONS = [7, 14, 30] as const;
const TIME_OPTIONS = [5, 10, 15, 20, 30] as const;

export default function PlanGenerateScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: currentPlan } = useCurrentWellnessPlan();
  const generateMutation = useGenerateWellnessPlan();
  const activateMutation = useActivateWellnessPlan();

  // Wizard state: 1 = Focus & Time; 2 = AI Generating; 3 = Preview & Confirmation
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['stress', 'mindfulness']);
  const [selectedDuration, setSelectedDuration] = useState<7 | 14 | 30>(7);
  const [selectedMinutes, setSelectedMinutes] = useState<5 | 10 | 15 | 20 | 30>(10);
  const [generatedPreview, setGeneratedPreview] = useState<CreateWellnessPlanDto | null>(null);

  const toggleFocus = (id: string) => {
    triggerHaptic.selection();
    setSelectedFocus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleGenerate = async () => {
    if (selectedFocus.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one focus area.');
      return;
    }

    triggerHaptic.medium();
    setWizardStep(2);

    try {
      const preview = await generateMutation.mutateAsync({
        focusAreas: selectedFocus,
        durationDays: selectedDuration,
        dailyMinutes: selectedMinutes,
      });

      setGeneratedPreview(preview);
      setWizardStep(3);
      triggerHaptic.success();
    } catch {
      triggerHaptic.error();
      Alert.alert(
        'Generation Error',
        'Could not generate your wellness plan. Please try again.',
        [{ text: 'OK', onPress: () => setWizardStep(1) }],
      );
    }
  };

  const handleActivate = async () => {
    if (!generatedPreview) return;
    triggerHaptic.medium();

    const doActivate = async (replaceActive: boolean) => {
      try {
        await activateMutation.mutateAsync({
          ...generatedPreview,
          replaceActive,
        });

        triggerHaptic.success();
        router.replace('/plan' as Href);
      } catch (err: unknown) {
        triggerHaptic.error();
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Could not activate plan.';
        Alert.alert('Activation Failed', errorMessage);
      }
    };

    if (currentPlan && currentPlan.status === 'active') {
      Alert.alert(
        'Replace Existing Plan?',
        'You currently have an active plan. Activating this will replace it with your new journey. Would you like to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace & Activate',
            onPress: () => doActivate(true),
          },
        ],
      );
    } else {
      doActivate(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
        >
          <AppIcon name="chevronLeft" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppHeading level="h4">Plan Generator</AppHeading>
        <View style={{ width: 40 }} />
      </View>

      {/* Step 1: Configuration */}
      {wizardStep === 1 && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400).delay(50)} style={styles.introBlock}>
            <View style={[styles.sparkleBadge, { backgroundColor: colors.primaryLight }]}>
              <AppIcon name="sparkles" size={16} color={colors.primaryDark} />
              <AppText variant="caption" style={{ color: colors.primaryDark, fontWeight: '700' }}>
                AI PERSONALIZATION
              </AppText>
            </View>
            <AppHeading level="h2" style={styles.title}>
              Shape your personal path 🌿
            </AppHeading>
            <AppText variant="bodySmall" color="secondary" style={styles.subtitle}>
              Tell Solace what matters most to you right now. We will generate a gentle, balanced routine tailored to your day.
            </AppText>
          </Animated.View>

          {/* Focus Areas Selection */}
          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
            <AppHeading level="h4" style={styles.sectionTitle}>
              1. Choose your focus areas
            </AppHeading>
            <View style={styles.focusGrid}>
              {FOCUS_OPTIONS.map((opt) => {
                const isSelected = selectedFocus.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    activeOpacity={0.7}
                    onPress={() => toggleFocus(opt.id)}
                    style={[
                      styles.focusCard,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryLight
                          : isDark
                          ? colors.surfaceSecondary
                          : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <AppIcon
                      name={opt.icon as IconName}
                      size={20}
                      color={isSelected ? colors.primaryDark : colors.textSecondary}
                    />
                    <AppText
                      variant="bodySmall"
                      style={{
                        color: isSelected ? colors.primaryDark : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {opt.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Duration Selection */}
          <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.section}>
            <AppHeading level="h4" style={styles.sectionTitle}>
              2. Plan Duration
            </AppHeading>
            <View style={styles.chipsRow}>
              {DURATION_OPTIONS.map((days) => {
                const isSelected = selectedDuration === days;
                return (
                  <TouchableOpacity
                    key={days}
                    activeOpacity={0.7}
                    onPress={() => {
                      triggerHaptic.selection();
                      setSelectedDuration(days);
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? colors.surfaceSecondary
                          : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="bodyMedium"
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: '600',
                      }}
                    >
                      {days} Days
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          {/* Daily Time Availability */}
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
            <AppHeading level="h4" style={styles.sectionTitle}>
              3. Daily Time Commitment
            </AppHeading>
            <View style={styles.chipsRow}>
              {TIME_OPTIONS.map((mins) => {
                const isSelected = selectedMinutes === mins;
                return (
                  <TouchableOpacity
                    key={mins}
                    activeOpacity={0.7}
                    onPress={() => {
                      triggerHaptic.selection();
                      setSelectedMinutes(mins);
                    }}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? colors.surfaceSecondary
                          : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="bodyMedium"
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: '600',
                      }}
                    >
                      {mins} min
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>

          <View style={styles.bottomCtaWrapper}>
            <AppButton
              title="Generate My Wellness Plan"
              size="lg"
              fullWidth
              onPress={handleGenerate}
            />
          </View>
        </ScrollView>
      )}

      {/* Step 2: AI Generation Loading Animation */}
      {wizardStep === 2 && (
        <View style={styles.generatingContainer}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.generatingBlock}>
            <View style={[styles.generatingIconBadge, { backgroundColor: colors.primaryLight }]}>
              <ActivityIndicator size="large" color={colors.primaryDark} />
            </View>
            <AppHeading level="h3" style={styles.generatingTitle}>
              Crafting your gentle path...
            </AppHeading>
            <AppText variant="bodyMedium" color="secondary" style={styles.generatingSubtitle}>
              Solace AI is balancing your selected goals with realistic {selectedMinutes}-minute daily practices.
            </AppText>

            <AppCard style={styles.quoteCard}>
              <AppText variant="bodySmall" style={styles.quoteText}>
                "Caring for yourself is not an all-or-nothing task. Small, steady pauses create enduring peace."
              </AppText>
            </AppCard>
          </Animated.View>
        </View>
      )}

      {/* Step 3: Plan Preview & Review */}
      {wizardStep === 3 && generatedPreview && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(400).delay(50)}>
            <AppCard style={styles.previewHeaderCard}>
              <View style={styles.previewBadgeRow}>
                <AppBadge label="PLAN PREVIEW" variant="primary" size="sm" />
                <AppBadge
                  label={`${generatedPreview.durationDays} DAYS`}
                  variant="neutral"
                  size="sm"
                />
              </View>

              <AppHeading level="h2" style={styles.previewTitle}>
                {generatedPreview.title}
              </AppHeading>
              <AppText variant="bodyMedium" color="secondary" style={styles.previewDesc}>
                {generatedPreview.description}
              </AppText>
            </AppCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.section}>
            <AppHeading level="h4" style={styles.sectionTitle}>
              Your Daily Journey Overview
            </AppHeading>
            <View style={styles.previewTasksList}>
              {generatedPreview.dailyTasks.map((task) => (
                <AppCard key={task.day} style={styles.previewTaskCard}>
                  <View style={styles.previewTaskRow}>
                    <View style={[styles.dayBadge, { backgroundColor: colors.primaryLight }]}>
                      <AppText variant="caption" style={{ color: colors.primaryDark, fontWeight: '700' }}>
                        D{task.day}
                      </AppText>
                    </View>
                    <View style={styles.previewTaskInfo}>
                      <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
                        {task.title}
                      </AppText>
                      {task.description ? (
                        <AppText variant="caption" color="secondary" style={{ marginTop: 2 }}>
                          {task.description}
                        </AppText>
                      ) : null}
                      <AppText variant="caption" color="tertiary" style={{ marginTop: 4 }}>
                        {task.category} • {task.durationMinutes} mins
                      </AppText>
                    </View>
                  </View>
                </AppCard>
              ))}
            </View>
          </Animated.View>

          <View style={styles.previewActions}>
            <AppButton
              title={activateMutation.isPending ? 'Activating Plan...' : 'Activate This Plan'}
              size="lg"
              fullWidth
              loading={activateMutation.isPending}
              disabled={activateMutation.isPending}
              onPress={handleActivate}
            />
            <AppButton
              title="Adjust Preferences"
              variant="outline"
              fullWidth
              disabled={activateMutation.isPending}
              onPress={() => setWizardStep(1)}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  introBlock: {
    marginTop: 8,
    marginBottom: 24,
  },
  sparkleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  focusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    minWidth: '47%',
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  bottomCtaWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
  generatingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  generatingBlock: {
    alignItems: 'center',
    width: '100%',
  },
  generatingIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  generatingTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  generatingSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  quoteCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.02)',
    width: '100%',
  },
  quoteText: {
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  previewHeaderCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  previewBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewDesc: {
    lineHeight: 22,
  },
  previewTasksList: {
    gap: 10,
  },
  previewTaskCard: {
    padding: 12,
    borderRadius: 12,
  },
  previewTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTaskInfo: {
    flex: 1,
  },
  previewActions: {
    gap: 12,
    marginTop: 20,
  },
});

