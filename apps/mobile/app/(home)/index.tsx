import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/hooks/useTheme';
import { useMoods } from '../../src/hooks/useMood';
import { useDailyAffirmation } from '../../src/hooks/useAffirmations';
import { useActivities } from '../../src/hooks/useActivities';
import {
  useCurrentWellnessPlan,
  useCompleteWellnessTask,
} from '../../src/hooks/useWellnessPlan';
import { useAssessmentHistory } from '../../src/hooks/useAssessments';
import { useProgress, useProgressHistory } from '../../src/hooks/useProgress';
import { useResources } from '../../src/hooks/useResources';
import { useUnreadNotificationCount } from '../../src/hooks/useNotifications';
import { triggerHaptic } from '../../src/utils/haptics';
import { WellnessActivity, WellnessResource, MoodEntry } from '@solace/shared';
import {
  AppCard,
  AppText,
  AppHeading,
  AppIcon,
  AppButton,
} from '../../src/components/ui';

// Modular Dashboard Components
import {
  HomeHeader,
  MoodCheckInCard,
  DailyAffirmationCard,
  CompanionPreviewCard,
  QuickActivitiesSection,
  WellnessPlanCard,
  ProgressOverview,
  ResourceSection,
} from '../../src/features/dashboard/components';

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Queries
  const { data: moodData, refetch: refetchMoods } = useMoods({ limit: 5 });
  const {
    data: dailyAffirmation,
    refetch: refetchAffirmation,
    isFetching: isAffirmationFetching,
  } = useDailyAffirmation();
  const { data: activities = [], isLoading: isActivitiesLoading, refetch: refetchActivities } =
    useActivities();
  const {
    data: currentPlan,
    isLoading: isPlanLoading,
    refetch: refetchPlan,
  } = useCurrentWellnessPlan();
  const completeTaskMutation = useCompleteWellnessTask();
  const { data: assessmentData, refetch: refetchAssessments } = useAssessmentHistory(1, 1);
  const latestAssessment = assessmentData?.data?.[0];
  const { data: progress, isLoading: isProgressLoading, refetch: refetchProgress } = useProgress();
  const { data: history = [], refetch: refetchHistory } = useProgressHistory();
  const { data: resourceData, isLoading: isResourcesLoading, refetch: refetchResources } =
    useResources();
  const resources = resourceData?.data || [];
  const { refetch: refetchNotifications } = useUnreadNotificationCount();

  // Determine if user has already checked in today
  const todayMood: MoodEntry | null = React.useMemo(() => {
    if (!moodData?.data || moodData.data.length === 0) return null;
    const todayStr = new Date().toDateString();
    return (
      moodData.data.find((entry) => new Date(entry.createdAt).toDateString() === todayStr) ||
      null
    );
  }, [moodData]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    triggerHaptic.light();
    setRefreshing(true);
    try {
      await Promise.all([
        refetchMoods(),
        refetchAffirmation(),
        refetchActivities(),
        refetchPlan(),
        refetchAssessments(),
        refetchProgress(),
        refetchHistory(),
        refetchResources(),
        refetchNotifications(),
      ]);
    } catch {
      // Ignore background refresh errors
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchMoods,
    refetchAffirmation,
    refetchActivities,
    refetchPlan,
    refetchAssessments,
    refetchProgress,
    refetchHistory,
    refetchResources,
    refetchNotifications,
  ]);

  // Mood selection handler - launches dedicated multi-step check-in flow with initial mood
  const handleSelectMood = (moodKey: string) => {
    triggerHaptic.medium();
    router.push({
      pathname: '/mood/check-in',
      params: { initialMood: moodKey },
    });
  };

  const handleUpdateMood = () => {
    triggerHaptic.light();
    router.push('/mood/check-in');
  };

  const handleOpenMoodHistory = () => {
    triggerHaptic.light();
    router.push('/mood/history');
  };

  const handleActivityPress = (_activity: WellnessActivity) => {
    triggerHaptic.selection();
    router.navigate('/(home)/activities');
  };

  const handleResourcePress = (resource: WellnessResource) => {
    triggerHaptic.selection();
    router.push({ pathname: '/resources/[id]', params: { id: resource.id } } as any);
  };

  const handleNotificationsPress = () => {
    triggerHaptic.selection();
    router.push('/notifications' as Href);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Section A: Personalized Greeting Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)}>
          <HomeHeader
            onProfilePress={() => router.navigate('/(home)/profile')}
            onNotificationsPress={handleNotificationsPress}
          />
        </Animated.View>

        {/* Section B: Daily Emotional Check-In Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <MoodCheckInCard
            todayMood={todayMood}
            onSelectMood={handleSelectMood}
            onUpdateMood={handleUpdateMood}
            onOpenHistory={handleOpenMoodHistory}
          />
        </Animated.View>

        {/* Section C: Daily Affirmation Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(150)}>
          <DailyAffirmationCard
            affirmation={dailyAffirmation}
            isLoading={isAffirmationFetching}
            onRefresh={() => refetchAffirmation()}
          />
        </Animated.View>

        {/* Section D: AI Companion Introduction Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <CompanionPreviewCard
            onStartConversation={() => router.navigate('/(home)/companion')}
          />
        </Animated.View>

        {/* Section E: Quick Wellness Activities */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <QuickActivitiesSection
            activities={activities}
            isLoading={isActivitiesLoading}
            onActivityPress={handleActivityPress}
            onSeeAllPress={() => router.navigate('/(home)/activities')}
          />
        </Animated.View>

        {/* Section F: Daily Wellness Plan */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <WellnessPlanCard
            plan={currentPlan}
            isLoading={isPlanLoading}
            onTaskToggle={(taskId, completed) => {
              if (currentPlan) {
                completeTaskMutation.mutate({
                  planId: currentPlan.id,
                  taskId,
                  completed,
                });
              }
            }}
            onCreatePlanPress={() => router.push('/plan/generate' as Href)}
            onViewAllPlansPress={() => router.push('/plan' as Href)}
          />
        </Animated.View>

        {/* Section G: Self-Reflection Assessment Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(320)}>
          <AppCard style={styles.assessmentCard}>
            <View style={styles.assessmentCardHeader}>
              <View style={[styles.assessmentIconBadge, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="heart" size={20} color={colors.primaryDark} />
              </View>
              <View style={{ flex: 1 }}>
                <AppHeading level="h4">Mindful Self-Reflection</AppHeading>
                <AppText variant="caption" color="secondary">
                  {latestAssessment
                    ? `Latest: ${latestAssessment.assessmentType.toUpperCase()} • ${latestAssessment.resultCategory}`
                    : '2-min gentle check-in on stress, sleep & energy'}
                </AppText>
              </View>
              <AppButton
                title={latestAssessment ? 'Reflect' : 'Start'}
                size="sm"
                onPress={() => router.push('/assessments' as Href)}
              />
            </View>
          </AppCard>
        </Animated.View>

        {/* Section G2: Private Journal Sanctuary */}
        <Animated.View entering={FadeInDown.duration(400).delay(335)}>
          <AppCard style={styles.assessmentCard}>
            <View style={styles.assessmentCardHeader}>
              <View style={[styles.assessmentIconBadge, { backgroundColor: '#E9E2F5' }]}>
                <AppIcon name="book-open" size={20} color="#553C9A" />
              </View>
              <View style={{ flex: 1 }}>
                <AppHeading level="h4">Private Journal 🌿</AppHeading>
                <AppText variant="caption" color="secondary">
                  Write freely, practice gratitude, or explore guided prompts
                </AppText>
              </View>
              <AppButton
                title="Write"
                size="sm"
                onPress={() => {
                  triggerHaptic.selection();
                  router.push('/journal' as Href);
                }}
              />
            </View>
          </AppCard>
        </Animated.View>

        {/* Section H: Progress Overview & 7-Day Dots */}
        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
          <ProgressOverview
            progress={progress}
            history={history}
            isLoading={isProgressLoading}
            onPressDetails={() => router.navigate('/(home)/progress')}
          />
        </Animated.View>

        {/* Section H: Recommended Wellness Resources */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <ResourceSection
            resources={resources}
            isLoading={isResourcesLoading}
            onResourcePress={handleResourcePress}
            onSeeAllPress={() => {
              triggerHaptic.selection();
              router.push('/resources' as any);
            }}
          />
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bottomSpacer: {
    height: 16,
  },
  assessmentCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  assessmentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  assessmentIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
