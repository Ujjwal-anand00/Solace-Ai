import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard, AppText, AppHeading, AppBadge, AppButton, AppProgressBar, AppIcon } from '../../../components/ui';
import { WellnessPlan, DailyPlanTask } from '@solace/shared';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface WellnessPlanCardProps {
  plan?: WellnessPlan | null;
  isLoading?: boolean;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
  onCreatePlanPress?: () => void;
  onViewAllPlansPress?: () => void;
}

export const WellnessPlanCard: React.FC<WellnessPlanCardProps> = ({
  plan,
  isLoading = false,
  onTaskToggle,
  onCreatePlanPress,
  onViewAllPlansPress,
}) => {
  const { colors, isDark } = useTheme();

  // Local completed state for smooth optimistic UI interactions
  const [completedTaskIds, setCompletedTaskIds] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (plan?.dailyTasks) {
      const initialMap: Record<string, boolean> = {};
      plan.dailyTasks.forEach((t) => {
        initialMap[t.id] = t.completed;
      });
      setCompletedTaskIds(initialMap);
    }
  }, [plan]);

  const handleToggle = (task: DailyPlanTask) => {
    triggerHaptic.selection();
    const newStatus = !completedTaskIds[task.id];
    setCompletedTaskIds((prev) => ({
      ...prev,
      [task.id]: newStatus,
    }));
    onTaskToggle?.(task.id, newStatus);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <View style={styles.loadingPlaceholder}>
            <AppText variant="bodySmall" color="secondary">
              Gathering your daily wellness plan...
            </AppText>
          </View>
        </AppCard>
      </View>
    );
  }

  // Empty state: no active plan yet
  if (!plan || !plan.dailyTasks || plan.dailyTasks.length === 0) {
    return (
      <View style={styles.container}>
        <AppCard
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#F0EAF7',
              borderColor: isDark ? colors.border : '#E7DFED',
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.emptyHeader}>
            <View
              style={[
                styles.emptyIconBadge,
                { backgroundColor: isDark ? colors.surface : colors.primaryLight },
              ]}
            >
              <AppIcon name="compass" size={24} color={colors.primary} />
            </View>
            <AppBadge label="DAILY PLAN" variant="primary" size="sm" />
          </View>

          <AppHeading level="h4" style={styles.emptyTitle}>
            Your personal wellness journey starts here
          </AppHeading>
          <AppText
            variant="bodySmall"
            style={[styles.emptySubtitle, { color: colors.textSecondary }]}
          >
            Create a gentle daily routine with mindful breathing, self-reflection, and calming rituals tailored to you.
          </AppText>

          <View style={styles.emptyButtonWrapper}>
            <AppButton
              title="Create My Wellness Plan"
              variant="primary"
              size="md"
              fullWidth
              trailingIcon="chevron-right"
              onPress={onCreatePlanPress}
            />
          </View>
        </AppCard>
      </View>
    );
  }

  // Active Plan
  const totalTasks = plan.dailyTasks.length;
  const completedCount = plan.dailyTasks.filter(
    (t) => completedTaskIds[t.id] ?? t.completed
  ).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return (
    <View style={styles.container}>
      <AppCard style={styles.card}>
        {/* Card Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <AppBadge label="DAILY PLAN" variant="primary" size="sm" />
            <AppHeading level="h4" style={styles.planTitle} numberOfLines={1}>
              {plan.title}
            </AppHeading>
          </View>
          {onViewAllPlansPress && (
            <TouchableOpacity
              onPress={onViewAllPlansPress}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
                View All
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar & Counter */}
        <View style={styles.progressSection}>
          <View style={styles.progressTextRow}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              {completedCount} of {totalTasks} completed
            </AppText>
            <AppText
              variant="caption"
              style={{ color: colors.primaryDark, fontWeight: '700' }}
            >
              {progressPercent}%
            </AppText>
          </View>
          <AppProgressBar
            progress={progressPercent}
            height={6}
            color={colors.accent}
            style={styles.progressBar}
          />
        </View>

        {/* Task List */}
        <View style={styles.tasksList}>
          {plan.dailyTasks.map((task) => {
            const isDone = completedTaskIds[task.id] ?? task.completed;
            return (
              <TouchableOpacity
                key={task.id}
                onPress={() => handleToggle(task)}
                style={[
                  styles.taskItem,
                  {
                    backgroundColor: isDark
                      ? colors.surfaceSecondary
                      : isDone
                      ? '#F0EAF7'
                      : colors.surface,
                    borderColor: isDone ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isDone }}
              >
                <View
                  style={[
                    styles.checkbox,
                    isDone && { backgroundColor: colors.accent, borderColor: colors.accentDark },
                  ]}
                >
                  {isDone && <AppIcon name="check" size={12} color="#292431" />}
                </View>

                <View style={styles.taskContent}>
                  <AppText
                    variant="bodyMedium"
                    style={[
                      styles.taskTitle,
                      { color: isDone ? colors.textSecondary : colors.textPrimary },
                      isDone && styles.taskDoneText,
                    ]}
                    numberOfLines={1}
                  >
                    {task.title}
                  </AppText>
                  <View style={styles.taskMeta}>
                    <AppText variant="caption" style={{ color: colors.textSecondary }}>
                      {task.durationMinutes} min • {task.category}
                    </AppText>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  card: {
    padding: 18,
    borderRadius: 20,
  },
  loadingPlaceholder: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
    gap: 4,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressBar: {
    marginTop: 2,
  },
  tasksList: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#B0BEB2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskDoneText: {
    textDecorationLine: 'line-through',
    opacity: 0.65,
  },
  taskMeta: {
    marginTop: 2,
  },
  emptyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyButtonWrapper: {
    marginTop: 4,
  },
});

