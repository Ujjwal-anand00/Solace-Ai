import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/hooks/useTheme';
import { useMoods, useCreateMood } from '../../src/hooks/useMood';
import { useDailyAffirmation } from '../../src/hooks/useAffirmations';
import { useActivities } from '../../src/hooks/useActivities';
import { useCurrentWellnessPlan } from '../../src/hooks/useWellnessPlan';
import { useProgress, useProgressHistory } from '../../src/hooks/useProgress';
import { useResources } from '../../src/hooks/useResources';
import { useUnreadNotificationCount } from '../../src/hooks/useNotifications';
import { triggerHaptic } from '../../src/utils/haptics';
import { WellnessActivity, WellnessResource, MoodEntry, MoodCategory } from '@solace/shared';

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
  const { data: progress, isLoading: isProgressLoading, refetch: refetchProgress } = useProgress();
  const { data: history = [], refetch: refetchHistory } = useProgressHistory();
  const { data: resources = [], isLoading: isResourcesLoading, refetch: refetchResources } =
    useResources();
  const { refetch: refetchNotifications } = useUnreadNotificationCount();

  // Mutations
  const createMoodMutation = useCreateMood();

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
    refetchProgress,
    refetchHistory,
    refetchResources,
    refetchNotifications,
  ]);

  // Mood selection handler
  const handleSelectMood = async (moodKey: string) => {
    triggerHaptic.medium();
    try {
      await createMoodMutation.mutateAsync({
        mood: moodKey as MoodCategory,
        moodIntensity: 7,
        note: 'Logged from sanctuary home',
      });
      triggerHaptic.success();
    } catch (err: unknown) {
      Alert.alert('Mood Log', (err as Error).message || 'Unable to record mood check-in');
    }
  };

  const handleUpdateMood = () => {
    triggerHaptic.light();
    Alert.alert(
      'Update Today’s Mood',
      'Select a new emotion to adjust your emotional check-in for today:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: '🌟 Amazing', onPress: () => handleSelectMood('ecstatic') },
        { text: '😊 Good', onPress: () => handleSelectMood('happy') },
        { text: '🌿 Okay', onPress: () => handleSelectMood('calm') },
        { text: '🌧️ Low', onPress: () => handleSelectMood('sad') },
        { text: '⚡ Stressed', onPress: () => handleSelectMood('anxious') },
      ]
    );
  };

  const handleActivityPress = (activity: WellnessActivity) => {
    triggerHaptic.medium();
    Alert.alert(
      activity.title,
      `${activity.description}\n\nEstimated duration: ${Math.round(activity.duration / 60)} minutes.\n\nInteractive full-screen activity guidance is scheduled for STEP 08!`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'View All Activities',
          onPress: () => router.navigate('/(home)/activities'),
        },
      ]
    );
  };

  const handleResourcePress = (resource: WellnessResource) => {
    triggerHaptic.light();
    Alert.alert(
      resource.title,
      `${resource.description}\n\nFormat: ${resource.contentType.toUpperCase()}\n\nFull resource viewer scheduled for next phase.`,
      [{ text: 'Close' }]
    );
  };

  const handleNotificationsPress = () => {
    Alert.alert(
      'Sanctuary Notifications',
      'All calm here! You are up to date on your reminders and mindful check-ins.',
      [{ text: 'Understood' }]
    );
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
            onCreatePlanPress={() => router.navigate('/(home)/activities')}
            onViewAllPlansPress={() => router.navigate('/(home)/activities')}
          />
        </Animated.View>

        {/* Section G: Progress Overview & 7-Day Dots */}
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
              triggerHaptic.light();
              Alert.alert(
                'Mindful Library',
                'Access the complete collection of articles, sleep meditations, and soothing sounds in the upcoming release.'
              );
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
});
