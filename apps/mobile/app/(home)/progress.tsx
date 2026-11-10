import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppCard,
  AppBadge,
  AppButton,
  AppIcon,
} from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useProgressOverview,
  useProgressSummary,
  useProgressTrends,
  useActivityTimeline,
  useStreakDetails,
  useWeeklyReport,
  useMonthlyReport,
} from '../../src/hooks/useProgress';
import { useUserAchievements } from '../../src/hooks/useAchievements';
import {
  StreakCard,
  ProgressMetricCard,
  WellnessTrendChart,
  ActivityTimeline,
  AchievementCard,
  AchievementDetailModal,
  WeeklyReportModal,
  MonthlyReportModal,
  ProgressCelebration,
} from '../../src/features/progress';
import { ProgressPeriod, UserAchievement } from '@solace/shared';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ProgressScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState<ProgressPeriod>('week');
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');
  const [timelineCategory, setTimelineCategory] = useState<string>('all');
  const [timelinePage, setTimelinePage] = useState<number>(1);
  const [selectedAchievement, setSelectedAchievement] =
    useState<UserAchievement | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [weeklyModalVisible, setWeeklyModalVisible] = useState(false);
  const [monthlyModalVisible, setMonthlyModalVisible] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    visible: boolean;
    title: string;
    description: string;
  }>({
    visible: false,
    title: '',
    description: '',
  });

  // Queries
  const {
    data: overview,
    refetch: refetchOverview,
    isRefetching: isRefetchingOverview,
  } = useProgressOverview();

  const {
    data: summary,
    refetch: refetchSummary,
  } = useProgressSummary(selectedPeriod);

  const {
    data: trends,
    isLoading: isLoadingTrends,
    refetch: refetchTrends,
  } = useProgressTrends(chartPeriod);

  const {
    data: timelineData,
    isLoading: isLoadingTimeline,
    refetch: refetchTimeline,
  } = useActivityTimeline(timelineCategory, timelinePage);

  const {
    data: streakDetails,
    isLoading: isLoadingStreak,
    refetch: refetchStreak,
  } = useStreakDetails();

  const {
    data: achievements = [],
    isLoading: isLoadingAchievements,
    refetch: refetchAchievements,
  } = useUserAchievements();

  const {
    data: weeklyReport,
    isLoading: isLoadingWeeklyReport,
    refetch: refetchWeekly,
  } = useWeeklyReport();

  const {
    data: monthlyReport,
    isLoading: isLoadingMonthlyReport,
    refetch: refetchMonthly,
  } = useMonthlyReport();

  const onRefresh = async () => {
    triggerHaptic.light();
    await Promise.all([
      refetchOverview(),
      refetchSummary(),
      refetchTrends(),
      refetchTimeline(),
      refetchStreak(),
      refetchAchievements(),
      refetchWeekly(),
      refetchMonthly(),
    ]);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleAchievementPress = (ach: UserAchievement) => {
    setSelectedAchievement(ach);
    setDetailModalVisible(true);
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingOverview}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <AppBadge label="GROWTH & CONSISTENCY" variant="primary" size="sm" />
          <AppHeading level="h2" style={styles.title}>
            Wellness Progress
          </AppHeading>
          <AppText
            variant="bodyMedium"
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            Celebrate every small step taken towards calm and emotional
            well-being.
          </AppText>
        </View>

        {/* Streak Ribbon Card */}
        <StreakCard
          streakDetails={streakDetails}
          isLoading={isLoadingStreak}
        />

        {/* Reports Quick Access Cards */}
        <View style={styles.reportsBannerRow}>
          <TouchableOpacity
            style={[
              styles.reportBannerCard,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#F0EAF7',
                borderColor: '#E8DDF5',
              },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic.light();
              setWeeklyModalVisible(true);
            }}
          >
            <View style={styles.reportBannerIcon}>
              <AppIcon name="calendar" size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.reportBannerTexts}>
              <AppText variant="bodySmall" style={{ fontWeight: '700' }}>
                Weekly Report 🌿
              </AppText>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                7-day gentle review
              </AppText>
            </View>
            <AppIcon name="chevron-right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.reportBannerCard,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#F6F3FC',
                borderColor: '#E6DEFC',
              },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic.light();
              setMonthlyModalVisible(true);
            }}
          >
            <View style={styles.reportBannerIcon}>
              <AppIcon name="moon" size={18} color="#7E22CE" />
            </View>
            <View style={styles.reportBannerTexts}>
              <AppText variant="bodySmall" style={{ fontWeight: '700' }}>
                Monthly Report 🌙
              </AppText>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Longitudinal summary
              </AppText>
            </View>
            <AppIcon name="chevron-right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Time Period Filter Pills */}
        <View style={styles.periodSelectorWrapper}>
          <View
            style={[
              styles.periodPillContainer,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#F0EAF7',
              },
            ]}
          >
            {(['week', 'month', 'all'] as ProgressPeriod[]).map((period) => {
              const isSelected = selectedPeriod === period;
              const label =
                period === 'week'
                  ? 'Weekly'
                  : period === 'month'
                  ? 'Monthly'
                  : 'All Time';
              return (
                <TouchableOpacity
                  key={period}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedPeriod(period);
                  }}
                  style={[
                    styles.periodPill,
                    isSelected && {
                      backgroundColor: isDark ? colors.surface : '#FFFFFF',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    style={{
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? colors.text : colors.textSecondary,
                    }}
                  >
                    {label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Metrics Grid */}
        <ProgressMetricCard
          moodCount={
            selectedPeriod === 'all'
              ? overview?.totalMoodCheckIns || 0
              : summary?.moodCheckIns || 0
          }
          activitiesCount={
            selectedPeriod === 'all'
              ? overview?.totalActivities || 0
              : summary?.activitiesCompleted || 0
          }
          breathingCount={
            selectedPeriod === 'all'
              ? overview?.totalBreathingSessions || 0
              : summary?.breathingMinutes || 0
          }
          planTasksCount={
            selectedPeriod === 'all'
              ? overview?.totalPlanTasksCompleted || 0
              : summary?.planTasksCompleted || 0
          }
          assessmentsCount={
            selectedPeriod === 'all'
              ? overview?.totalAssessmentsCompleted || 0
              : summary?.assessmentsCompleted || 0
          }
          activeDaysCount={
            selectedPeriod === 'all'
              ? overview?.activeDaysCount || 0
              : summary?.activeDays || 0
          }
          periodLabel={
            selectedPeriod === 'week'
              ? 'Past 7 Days'
              : selectedPeriod === 'month'
              ? 'Past 30 Days'
              : 'Lifetime Sanctuary Journey'
          }
        />

        {/* Wellness Trend Charts */}
        <WellnessTrendChart
          points={trends?.points || []}
          period={chartPeriod}
          onPeriodChange={(p) => {
            triggerHaptic.selection();
            setChartPeriod(p);
          }}
          isLoading={isLoadingTrends}
        />

        {/* Milestones & Achievements Section */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsHeader}>
            <View>
              <AppHeading level="h4" style={styles.sectionHeading}>
                Milestones & Badges
              </AppHeading>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Earned {unlockedCount} of {achievements.length} achievements
              </AppText>
            </View>
            <AppBadge
              label={`${unlockedCount}/${achievements.length} UNLOCKED`}
              variant="primary"
              size="sm"
            />
          </View>

          {isLoadingAchievements ? (
            <AppCard style={styles.loadingCard}>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Fetching your milestone badges...
              </AppText>
            </AppCard>
          ) : (
            <View style={styles.achievementsList}>
              {achievements.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  onPress={handleAchievementPress}
                />
              ))}
            </View>
          )}
        </View>

        {/* Activity Timeline Feed */}
        <ActivityTimeline
          items={timelineData?.data || []}
          selectedCategory={timelineCategory}
          onSelectCategory={(cat) => {
            setTimelineCategory(cat);
            setTimelinePage(1);
          }}
          isLoading={isLoadingTimeline}
          hasMore={
            (timelineData?.meta?.page ?? 1) < (timelineData?.meta?.totalPages ?? 1)
          }
          onLoadMore={() => setTimelinePage((prev) => prev + 1)}
        />

        {/* Return Button */}
        <View style={styles.buttonWrapper}>
          <AppButton
            title="Return to Sanctuary Home"
            variant="outline"
            size="md"
            fullWidth
            onPress={() => {
              triggerHaptic.light();
              router.navigate('/(home)');
            }}
          />
        </View>
      </ScrollView>

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        visible={detailModalVisible}
        onClose={() => setDetailModalVisible(false)}
      />

      {/* Weekly Report Modal */}
      <WeeklyReportModal
        report={weeklyReport}
        visible={weeklyModalVisible}
        onClose={() => setWeeklyModalVisible(false)}
        isLoading={isLoadingWeeklyReport}
      />

      {/* Monthly Report Modal */}
      <MonthlyReportModal
        report={monthlyReport}
        visible={monthlyModalVisible}
        onClose={() => setMonthlyModalVisible(false)}
        isLoading={isLoadingMonthlyReport}
      />

      {/* Celebration Modal */}
      <ProgressCelebration
        visible={celebrationData.visible}
        title={celebrationData.title}
        description={celebrationData.description}
        onClose={() =>
          setCelebrationData((prev) => ({ ...prev, visible: false }))
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  reportsBannerRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  reportBannerCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  reportBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBannerTexts: {
    flex: 1,
  },
  periodSelectorWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  periodPillContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    width: '100%',
  },
  periodPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementsSection: {
    marginVertical: 14,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingCard: {
    padding: 20,
    alignItems: 'center',
  },
  achievementsList: {
    gap: 0,
  },
  buttonWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
});
