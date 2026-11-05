import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppText,
  AppHeading,
  AppButton,
  AppIcon,
  AppCard,
} from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useMoods,
  useMoodSummary,
  useMoodCalendar,
  useMoodInsights,
  useDeleteMood,
} from '../../src/hooks/useMood';
import { triggerHaptic } from '../../src/utils/haptics';
import { MoodEntry } from '@solace/shared';
import { PRIMARY_MOODS } from '../../src/features/mood/types';

// Feature Components
import {
  MoodCalendarView,
  MoodTimelineCard,
  MoodAnalyticsCharts,
  MoodInsightsCard,
  EditMoodModal,
} from '../../src/features/mood/components';

export default function MoodHistoryScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Active view tab: 'timeline' | 'analytics'
  const [activeTab, setActiveTab] = useState<'timeline' | 'analytics'>('timeline');

  // Calendar year & month state
  const now = new Date();
  const [calendarYear, setCalendarYear] = useState<number>(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState<number>(now.getMonth() + 1);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Filter state
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null);

  // Edit modal state
  const [editingEntry, setEditingEntry] = useState<MoodEntry | null>(null);

  // Queries
  const {
    data: moodsData,
    isLoading: isMoodsLoading,
    refetch: refetchMoods,
    isRefetching: isMoodsRefetching,
  } = useMoods({
    limit: 50,
    mood: selectedMoodFilter || undefined,
    startDate: selectedCalendarDate ? `${selectedCalendarDate}T00:00:00.000Z` : undefined,
    endDate: selectedCalendarDate ? `${selectedCalendarDate}T23:59:59.999Z` : undefined,
  });

  const {
    data: calendarDays = [],
    refetch: refetchCalendar,
  } = useMoodCalendar(calendarYear, calendarMonth);

  const {
    data: summary,
    isLoading: isSummaryLoading,
    refetch: refetchSummary,
  } = useMoodSummary();

  const {
    data: insightsResponse,
    isLoading: isInsightsLoading,
    refetch: refetchInsights,
  } = useMoodInsights(30);

  const deleteMoodMutation = useDeleteMood();

  const handleRefresh = async () => {
    triggerHaptic.light();
    await Promise.all([
      refetchMoods(),
      refetchCalendar(),
      refetchSummary(),
      refetchInsights(),
    ]);
  };

  const handleTabChange = (tab: 'timeline' | 'analytics') => {
    triggerHaptic.selection();
    setActiveTab(tab);
  };

  const handleFilterMood = (key: string | null) => {
    triggerHaptic.selection();
    setSelectedMoodFilter((prev) => (prev === key ? null : key));
  };

  const entries = moodsData?.data || [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          style={styles.backBtn}
          accessibilityLabel="Back"
        >
          <AppIcon name="arrowLeft" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <AppHeading level={3} style={styles.headerTitle}>
            Mood Sanctuary
          </AppHeading>
        </View>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic.medium();
            router.push('/mood/check-in');
          }}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          accessibilityLabel="New check-in"
        >
          <AppIcon name="plus" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <View style={[styles.segmentTrack, { backgroundColor: isDark ? colors.surfaceSecondary : '#F0EFE9' }]}>
          <TouchableOpacity
            onPress={() => handleTabChange('timeline')}
            style={[
              styles.segmentTab,
              activeTab === 'timeline' && {
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
                elevation: 2,
              },
            ]}
          >
            <AppText
              variant="bodySmall"
              style={[
                styles.segmentTabText,
                {
                  color: activeTab === 'timeline' ? colors.primaryDark : colors.textSecondary,
                  fontWeight: activeTab === 'timeline' ? '700' : '500',
                },
              ]}
            >
              Calendar & Timeline
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabChange('analytics')}
            style={[
              styles.segmentTab,
              activeTab === 'analytics' && {
                backgroundColor: colors.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
                elevation: 2,
              },
            ]}
          >
            <AppText
              variant="bodySmall"
              style={[
                styles.segmentTabText,
                {
                  color: activeTab === 'analytics' ? colors.primaryDark : colors.textSecondary,
                  fontWeight: activeTab === 'analytics' ? '700' : '500',
                },
              ]}
            >
              Analytics & Insights
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isMoodsRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {activeTab === 'timeline' ? (
          <View style={styles.timelineTabContent}>
            {/* Calendar Section */}
            <AppCard style={styles.calendarCard}>
              <MoodCalendarView
                days={calendarDays}
                selectedDate={selectedCalendarDate}
                onSelectDate={setSelectedCalendarDate}
                year={calendarYear}
                month={calendarMonth}
                onChangeMonth={(y, m) => {
                  setCalendarYear(y);
                  setCalendarMonth(m);
                }}
              />
            </AppCard>

            {/* Filter Pills */}
            <View style={styles.filtersSection}>
              <View style={styles.filtersHeader}>
                <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '700' }}>
                  FILTER BY MOOD
                </AppText>
                {selectedMoodFilter && (
                  <TouchableOpacity onPress={() => handleFilterMood(null)}>
                    <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
                      Reset
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {PRIMARY_MOODS.map((m) => {
                  const isSelected = selectedMoodFilter === m.key;
                  return (
                    <TouchableOpacity
                      key={m.key}
                      onPress={() => handleFilterMood(m.key)}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: isSelected
                            ? m.bgColor
                            : isDark
                            ? colors.surfaceSecondary
                            : '#FFFFFF',
                          borderColor: isSelected ? m.color : colors.border,
                        },
                      ]}
                    >
                      <AppText style={{ fontSize: 13 }}>{m.emoji}</AppText>
                      <AppText
                        variant="caption"
                        style={{
                          color: isSelected ? m.color : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        }}
                      >
                        {m.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Entries Timeline List */}
            <View style={styles.entriesList}>
              <AppHeading level={3} style={styles.listHeading}>
                Recorded Check-Ins ({entries.length})
              </AppHeading>

              {isMoodsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              ) : entries.length === 0 ? (
                <AppCard style={styles.emptyCard}>
                  <AppText style={{ fontSize: 28, textAlign: 'center' }}>🕊️</AppText>
                  <AppHeading level={3} style={styles.emptyTitle}>
                    No Check-Ins Found
                  </AppHeading>
                  <AppText variant="bodySmall" style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    {selectedMoodFilter || selectedCalendarDate
                      ? 'No entries match your current filter. Try resetting filters or recording a new check-in.'
                      : 'Take a quiet moment to record your first check-in today.'}
                  </AppText>
                  <View style={{ marginTop: 12 }}>
                    <AppButton
                      title="Record Mood"
                      variant="primary"
                      size="sm"
                      onPress={() => router.push('/mood/check-in')}
                    />
                  </View>
                </AppCard>
              ) : (
                entries.map((entry) => (
                  <MoodTimelineCard
                    key={entry.id}
                    entry={entry}
                    onEdit={(e) => setEditingEntry(e)}
                    onDelete={(id) => deleteMoodMutation.mutate(id)}
                  />
                ))
              )}
            </View>
          </View>
        ) : (
          /* Analytics & Insights Tab */
          <View style={styles.analyticsTabContent}>
            <MoodAnalyticsCharts summary={summary} isLoading={isSummaryLoading} />
            <MoodInsightsCard insightsResponse={insightsResponse} isLoading={isInsightsLoading} />
          </View>
        )}
      </ScrollView>

      {/* Edit Entry Modal */}
      <EditMoodModal
        visible={Boolean(editingEntry)}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
      />
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
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  segmentTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabText: {
    fontSize: 13,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  timelineTabContent: {
    gap: 16,
    paddingTop: 8,
  },
  calendarCard: {
    padding: 12,
    borderRadius: 20,
  },
  filtersSection: {
    gap: 8,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  entriesList: {
    gap: 10,
  },
  listHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  analyticsTabContent: {
    gap: 20,
    paddingTop: 8,
  },
});

