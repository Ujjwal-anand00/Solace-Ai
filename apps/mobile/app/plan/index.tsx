import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/hooks/useTheme';
import {
  AppText,
  AppHeading,
  AppCard,
  AppButton,
  AppIcon,
  AppBadge,
  AppProgressBar,
  IconName,
} from '../../src/components/ui';
import {
  useCurrentWellnessPlan,
  useCompleteWellnessTask,
  useSkipWellnessTask,
  usePauseWellnessPlan,
  useResumeWellnessPlan,
} from '../../src/hooks/useWellnessPlan';
import { triggerHaptic } from '../../src/utils/haptics';
import { DailyPlanTask } from '@solace/shared';

export default function WellnessPlanScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: plan, isLoading } = useCurrentWellnessPlan();
  const completeTaskMutation = useCompleteWellnessTask();
  const skipTaskMutation = useSkipWellnessTask();
  const pausePlanMutation = usePauseWellnessPlan();
  const resumePlanMutation = useResumeWellnessPlan();

  const [selectedDay, setSelectedDay] = useState(1);

  // Group tasks by day
  const tasksByDay = useMemo(() => {
    if (!plan?.dailyTasks) return {};
    const map: Record<number, DailyPlanTask[]> = {};
    plan.dailyTasks.forEach((t) => {
      if (!map[t.day]) map[t.day] = [];
      map[t.day].push(t);
    });
    return map;
  }, [plan]);

  const daysList = useMemo(() => {
    if (!plan) return [];
    const count = plan.durationDays || plan.dailyTasks.length || 7;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [plan]);

  const selectedDayTasks = tasksByDay[selectedDay] || [];

  const handleToggleTask = (task: DailyPlanTask) => {
    if (!plan) return;
    triggerHaptic.selection();
    completeTaskMutation.mutate({
      planId: plan.id,
      taskId: task.id,
      completed: !task.completed,
    });
  };

  const handleSkipTask = (task: DailyPlanTask) => {
    if (!plan) return;
    triggerHaptic.light();
    Alert.alert(
      'Skip Task',
      `Would you like to skip "${task.title}" for today? You can always complete it later.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            skipTaskMutation.mutate({
              planId: plan.id,
              taskId: task.id,
            });
          },
        },
      ],
    );
  };

  const handleTogglePause = () => {
    if (!plan) return;
    triggerHaptic.medium();
    if (plan.status === 'active') {
      Alert.alert(
        'Pause Wellness Plan',
        'Your daily streak and progress will be paused until you choose to resume.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Pause Plan',
            onPress: () => pausePlanMutation.mutate(plan.id),
          },
        ],
      );
    } else if (plan.status === 'paused') {
      resumePlanMutation.mutate(plan.id);
    }
  };

  const handleNewPlan = () => {
    triggerHaptic.light();
    if (plan && plan.status === 'active') {
      Alert.alert(
        'Generate New Plan?',
        'You already have an active wellness plan. Generating and activating a new plan will safely archive your current plan.',
        [
          { text: 'Keep Current Plan', style: 'cancel' },
          {
            text: 'Create New Plan',
            onPress: () => router.push('/plan/generate'),
          },
        ],
      );
    } else {
      router.push('/plan/generate');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodySmall" color="secondary" style={styles.loadingText}>
            Retrieving your wellness plan...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  // Empty State: No active plan
  if (!plan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.iconButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
          >
            <AppIcon name="chevronLeft" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppHeading level="h4">Wellness Plan</AppHeading>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBadge, { backgroundColor: colors.primaryLight }]}>
            <AppIcon name="compass" size={38} color={colors.primaryDark} />
          </View>
          <AppHeading level="h2" style={styles.emptyTitle}>
            A daily routine for your peace
          </AppHeading>
          <AppText variant="bodyMedium" color="secondary" style={styles.emptySubtitle}>
            Solace AI creates gentle, customized plans tailored to your focus areas, whether it is better sleep, easing stress, or mindful pauses.
          </AppText>
          <AppButton
            title="Create My Wellness Plan"
            size="lg"
            onPress={() => router.push('/plan/generate')}
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isPaused = plan.status === 'paused';
  const isCompleted = plan.status === 'completed';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Nav Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
        >
          <AppIcon name="chevronLeft" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppHeading level="h4">Your Wellness Plan</AppHeading>
        <TouchableOpacity
          onPress={handleNewPlan}
          style={[styles.iconButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
          accessibilityLabel="Generate new plan"
        >
          <AppIcon name="plus" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan Header Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <AppCard style={styles.overviewCard}>
            <View style={styles.overviewTopRow}>
              <View style={styles.statusBadges}>
                <AppBadge
                  label={plan.status.toUpperCase()}
                  variant={isPaused ? 'warning' : isCompleted ? 'success' : 'primary'}
                  size="sm"
                />
                {plan.isAiGenerated && (
                  <AppBadge label="AI PERSONALIZED" variant="neutral" size="sm" />
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleTogglePause}
                style={[
                  styles.pauseButton,
                  {
                    backgroundColor: isPaused ? colors.primaryLight : isDark ? colors.surfaceSecondary : '#F1F5F9',
                  },
                ]}
              >
                <AppIcon
                  name={isPaused ? 'play' : 'pause'}
                  size={14}
                  color={isPaused ? colors.primaryDark : colors.textSecondary}
                />
                <AppText
                  variant="caption"
                  style={{
                    color: isPaused ? colors.primaryDark : colors.textSecondary,
                    fontWeight: '600',
                  }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </AppText>
              </TouchableOpacity>
            </View>

            <AppHeading level="h3" style={styles.planTitle}>
              {plan.title}
            </AppHeading>
            <AppText variant="bodySmall" color="secondary" style={styles.planDesc}>
              {plan.description}
            </AppText>

            {/* Progress Section */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <AppText variant="caption" color="secondary">
                  Journey Completion
                </AppText>
                <AppText variant="caption" color="primary" style={{ fontWeight: '700' }}>
                  {plan.progress}%
                </AppText>
              </View>
              <AppProgressBar
                progress={plan.progress / 100}
                color={colors.primary}
                backgroundColor={colors.border}
                height={6}
              />
            </View>

            {/* Focus Tags */}
            {plan.focusAreas?.length > 0 && (
              <View style={styles.focusTagsList}>
                {plan.focusAreas.map((area) => (
                  <View
                    key={area}
                    style={[
                      styles.focusTagPill,
                      { backgroundColor: isDark ? colors.surface : colors.primaryLight },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{ color: colors.primaryDark, fontWeight: '600' }}
                    >
                      #{area}
                    </AppText>
                  </View>
                ))}
              </View>
            )}
          </AppCard>
        </Animated.View>

        {/* Day Selector Ribbon */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.ribbonSection}>
          <AppText variant="bodySmall" color="secondary" style={styles.ribbonLabel}>
            SELECT DAY
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysScroll}
          >
            {daysList.map((dayNum) => {
              const isSelected = selectedDay === dayNum;
              const dayTasks = tasksByDay[dayNum] || [];
              const dayCompleted =
                dayTasks.length > 0 && dayTasks.every((t) => t.completed);

              return (
                <TouchableOpacity
                  key={dayNum}
                  activeOpacity={0.7}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedDay(dayNum);
                  }}
                  style={[
                    styles.dayPill,
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
                    variant="caption"
                    style={[
                      styles.dayPillText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    Day {dayNum}
                  </AppText>
                  {dayCompleted && (
                    <View style={styles.dayDot}>
                      <AppIcon
                        name="check"
                        size={10}
                        color={isSelected ? '#FFFFFF' : colors.primary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Day Tasks List */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.tasksSection}>
          <View style={styles.dayHeaderRow}>
            <AppHeading level="h4">Day {selectedDay} Practices</AppHeading>
            <AppText variant="caption" color="secondary">
              {selectedDayTasks.filter((t) => t.completed).length} of {selectedDayTasks.length} done
            </AppText>
          </View>

          {selectedDayTasks.length === 0 ? (
            <AppCard style={styles.emptyDayCard}>
              <AppText variant="bodySmall" color="secondary">
                No specific practices scheduled for Day {selectedDay}. Take a spontaneous mindful pause!
              </AppText>
            </AppCard>
          ) : (
            <View style={styles.tasksList}>
              {selectedDayTasks.map((task) => {
                const categoryIconMap: Record<string, string> = {
                  breathing: 'wind',
                  mindfulness: 'compass',
                  relaxation: 'moon',
                  'self-care': 'heart',
                  affirmation: 'sparkles',
                  reflection: 'bookOpen',
                };

                return (
                  <AppCard key={task.id} style={styles.taskCard}>
                    <View style={styles.taskCardMain}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleToggleTask(task)}
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: task.completed
                              ? colors.primary
                              : 'transparent',
                            borderColor: task.completed
                              ? colors.primary
                              : colors.border,
                          },
                        ]}
                      >
                        {task.completed && (
                          <AppIcon name="check" size={14} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>

                      <View style={styles.taskInfoArea}>
                        <View style={styles.taskTitleRow}>
                          <AppText
                            variant="bodyMedium"
                            style={[
                              styles.taskTitle,
                              task.completed && styles.taskTitleCompleted,
                            ]}
                          >
                            {task.title}
                          </AppText>
                          {task.skipped && (
                            <AppBadge label="SKIPPED" variant="warning" size="sm" />
                          )}
                        </View>

                        {task.description ? (
                          <AppText
                            variant="bodySmall"
                            color="secondary"
                            style={styles.taskDesc}
                          >
                            {task.description}
                          </AppText>
                        ) : null}

                        <View style={styles.taskMetaRow}>
                          <View style={styles.taskCategoryPill}>
                            <AppIcon
                              name={(categoryIconMap[task.category] || 'compass') as IconName}
                              size={12}
                              color={colors.primary}
                            />
                            <AppText
                              variant="caption"
                              color="secondary"
                              style={{ textTransform: 'capitalize' }}
                            >
                              {task.category}
                            </AppText>
                          </View>

                          <View style={styles.taskDurationPill}>
                            <AppIcon name="clock" size={12} color={colors.textSecondary} />
                            <AppText variant="caption" color="secondary">
                              {task.durationMinutes} min
                            </AppText>
                          </View>
                        </View>
                      </View>

                      {!task.completed && !task.skipped && (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleSkipTask(task)}
                          style={styles.skipButton}
                        >
                          <AppText variant="caption" color="tertiary">
                            Skip
                          </AppText>
                        </TouchableOpacity>
                      )}
                    </View>
                  </AppCard>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* Completion Celebration Banner */}
        {isCompleted && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.celebrationCard}>
            <AppIcon name="award" size={28} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <AppHeading level="h4">Plan Completed! 🎉</AppHeading>
              <AppText variant="bodySmall" color="secondary">
                You showed up for yourself throughout this journey. Ready for a new chapter?
              </AppText>
            </View>
            <AppButton
              title="New Plan"
              size="sm"
              onPress={handleNewPlan}
            />
          </Animated.View>
        )}
      </ScrollView>
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
  iconButton: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 220,
  },
  overviewCard: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },
  overviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  planDesc: {
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  focusTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ribbonSection: {
    marginBottom: 20,
  },
  ribbonLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  daysScroll: {
    gap: 8,
  },
  dayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  dayPillText: {
    fontWeight: '600',
  },
  dayDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksSection: {
    marginBottom: 24,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  emptyDayCard: {
    padding: 16,
    borderRadius: 14,
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    padding: 14,
    borderRadius: 14,
  },
  taskCardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  taskInfoArea: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskTitle: {
    fontWeight: '600',
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskDesc: {
    lineHeight: 18,
    marginBottom: 8,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskDurationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  skipButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  celebrationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF7EE',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#C6E8C9',
  },
});

