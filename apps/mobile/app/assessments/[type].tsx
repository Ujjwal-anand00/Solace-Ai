import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useTheme } from '../../src/hooks/useTheme';
import {
  AppText,
  AppHeading,
  AppCard,
  AppButton,
  AppIcon,
  AppProgressBar,
} from '../../src/components/ui';
import {
  useAssessmentTypeDetail,
  useSubmitAssessment,
} from '../../src/hooks/useAssessments';
import { triggerHaptic } from '../../src/utils/haptics';
import { AssessmentQuestion, AssessmentOption } from '@solace/shared';

export default function AssessmentFlowScreen(): React.JSX.Element {
  const { type } = useLocalSearchParams<{ type: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: assessmentMeta, isLoading } = useAssessmentTypeDetail(type || '');
  const submitMutation = useSubmitAssessment(type || '');

  // Step 0 = Welcome screen; Step 1..N = Questions
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const questions: AssessmentQuestion[] = assessmentMeta?.questions || [];
  const totalQuestions = questions.length;

  const handleSelectOption = (questionId: string, optionValue: number) => {
    triggerHaptic.selection();
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  const handleNext = () => {
    triggerHaptic.light();
    if (currentStepIndex === 0) {
      setCurrentStepIndex(1);
      return;
    }

    if (currentStepIndex < totalQuestions) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    triggerHaptic.light();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] ?? 0,
    }));

    try {
      const result = await submitMutation.mutateAsync({
        answers: formattedAnswers,
        questionsVersion: assessmentMeta?.questionsVersion || '1.0',
      });

      triggerHaptic.success();
      router.replace({
        pathname: '/assessments/result',
        params: { id: result.id },
      });
    } catch {
      triggerHaptic.error();
      Alert.alert(
        'Submission Error',
        'Could not complete your assessment right now. Please try again.',
        [{ text: 'OK' }],
      );
    }
  };

  if (isLoading || !assessmentMeta) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodySmall" color="secondary" style={styles.loadingText}>
            Loading reflection questions...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // Welcome Step (Step 0)
  if (currentStepIndex === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
          >
            <AppIcon name="chevronLeft" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppHeading level="h4">Reflective Check-in</AppHeading>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.welcomeContent}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.welcomeCardWrapper}>
            <View
              style={[
                styles.largeIconBadge,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <AppIcon name="compass" size={36} color={colors.primaryDark} />
            </View>

            <AppHeading level="h2" style={styles.welcomeTitle}>
              {assessmentMeta.title}
            </AppHeading>
            <AppText variant="bodyMedium" color="secondary" style={styles.welcomeSubtitle}>
              {assessmentMeta.subtitle}
            </AppText>

            <AppCard style={styles.welcomeInfoCard}>
              <View style={styles.infoRow}>
                <AppIcon name="clock" size={18} color={colors.primary} />
                <AppText variant="bodySmall" color="primary">
                  Takes only {assessmentMeta.estimatedMinutes || 2} minutes
                </AppText>
              </View>
              <View style={styles.infoRow}>
                <AppIcon name="checkCircle" size={18} color={colors.primary} />
                <AppText variant="bodySmall" color="primary">
                  {totalQuestions} thoughtful, non-judgmental questions
                </AppText>
              </View>
              <View style={styles.infoRow}>
                <AppIcon name="heart" size={18} color={colors.primary} />
                <AppText variant="bodySmall" color="primary">
                  Personalized mindfulness recommendations
                </AppText>
              </View>
            </AppCard>

            <View style={styles.disclaimerPill}>
              <AppIcon name="info" size={14} color={colors.textSecondary} />
              <AppText variant="caption" color="secondary" style={styles.disclaimerInline}>
                This self-check is strictly for informational reflection and is not a clinical medical evaluation.
              </AppText>
            </View>
          </Animated.View>
        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}>
          <AppButton
            title="Start Reflection"
            fullWidth
            onPress={handleNext}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Question Steps (Step 1..totalQuestions)
  const currentQuestion = questions[currentStepIndex - 1];
  const progressRatio = currentStepIndex / totalQuestions;
  const currentSelectedValue = currentQuestion ? answers[currentQuestion.id] : undefined;
  const hasSelectedCurrent = currentSelectedValue !== undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Nav with Progress */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
        >
          <AppIcon name="chevronLeft" size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.progressHeaderArea}>
          <AppText variant="caption" color="secondary">
            Question {currentStepIndex} of {totalQuestions}
          </AppText>
          <View style={styles.progressBarWrapper}>
            <AppProgressBar
              progress={progressRatio}
              color={colors.primary}
              backgroundColor={colors.border}
              height={4}
            />
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.questionContent}>
        {currentQuestion && (
          <Animated.View
            key={currentQuestion.id}
            entering={FadeInRight.duration(300)}
            exiting={FadeOutLeft.duration(200)}
            style={styles.questionBlock}
          >
            <AppHeading level="h3" style={styles.questionText}>
              {currentQuestion.text}
            </AppHeading>

            {currentQuestion.subtitle && (
              <AppText variant="bodySmall" color="secondary" style={styles.questionSubtitle}>
                {currentQuestion.subtitle}
              </AppText>
            )}

            {/* Options List */}
            <View style={styles.optionsList}>
              {currentQuestion.options.map((opt: AssessmentOption) => {
                const isSelected = currentSelectedValue === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    activeOpacity={0.8}
                    onPress={() => handleSelectOption(currentQuestion.id, opt.value)}
                    style={[
                      styles.optionCard,
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
                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primary : 'transparent',
                        },
                      ]}
                    >
                      {isSelected && <View style={styles.radioInnerDot} />}
                    </View>

                    <View style={styles.optionTextArea}>
                      <AppText
                        variant="bodyMedium"
                        style={[
                          styles.optionLabel,
                          {
                            color: isSelected ? colors.primaryDark : colors.textPrimary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {opt.label}
                      </AppText>
                      {opt.description && (
                        <AppText variant="caption" color="secondary">
                          {opt.description}
                        </AppText>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Button Bar */}
      <View style={[styles.bottomBar, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}>
        <AppButton
          title={
            submitMutation.isPending
              ? 'Analyzing Responses...'
              : currentStepIndex === totalQuestions
              ? 'Complete Reflection'
              : 'Continue'
          }
          disabled={!hasSelectedCurrent || submitMutation.isPending}
          loading={submitMutation.isPending}
          fullWidth
          onPress={handleNext}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
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
  progressHeaderArea: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  progressBarWrapper: {
    width: '100%',
    marginTop: 6,
  },
  welcomeContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
  },
  welcomeCardWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  largeIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    textAlign: 'center',
    marginBottom: 24,
  },
  welcomeInfoCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    gap: 14,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  disclaimerPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  disclaimerInline: {
    flex: 1,
    lineHeight: 16,
  },
  questionContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  questionBlock: {
    width: '100%',
  },
  questionText: {
    fontSize: 22,
    lineHeight: 30,
    marginBottom: 8,
  },
  questionSubtitle: {
    marginBottom: 24,
  },
  optionsList: {
    gap: 12,
    marginTop: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  optionTextArea: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
});

