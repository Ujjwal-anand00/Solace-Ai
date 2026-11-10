import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard, AppText, AppHeading, AppBadge, AppIcon } from '../../../components/ui';
import { UserProgress, ProgressHistoryItem } from '@solace/shared';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface ProgressOverviewProps {
  progress?: UserProgress | null;
  history?: ProgressHistoryItem[] | null;
  isLoading?: boolean;
  onPressDetails?: () => void;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  progress,
  history = [],
  isLoading = false,
  onPressDetails,
}) => {
  const { colors, isDark } = useTheme();

  // Generate the last 7 days list (ending with today)
  const last7Days = React.useMemo(() => {
    const days: { dateStr: string; dayLabel: string; isToday: boolean; active: boolean }[] = [];
    const today = new Date();

    // Map history array by date string YYYY-MM-DD
    const historyMap = new Map<string, boolean>();
    (history || []).forEach((h) => {
      const hadActivity =
        h.activitiesCompleted > 0 ||
        h.moodLogged ||
        h.journalWritten ||
        h.breathingMinutes > 0;
      historyMap.set(h.date, hadActivity);
    });

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isoDate = d.toISOString().split('T')[0];
      const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const dayLabel = dayNames[d.getDay()];
      const isToday = i === 0;
      const active = historyMap.get(isoDate) || false;

      days.push({
        dateStr: isoDate,
        dayLabel,
        isToday,
        active,
      });
    }

    return days;
  }, [history]);

  const streak = progress?.currentStreak || 0;
  const totalActivities = progress?.totalActivities || 0;
  const totalMoods = progress?.totalMoodCheckIns || 0;

  const handleCardPress = () => {
    if (onPressDetails) {
      triggerHaptic.light();
      onPressDetails();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <View style={styles.loadingPlaceholder}>
            <AppText variant="bodySmall" color="secondary">
              Updating your wellness progress...
            </AppText>
          </View>
        </AppCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={onPressDetails ? 0.9 : 1}
        onPress={handleCardPress}
        disabled={!onPressDetails}
      >
        <AppCard style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <AppBadge label="PROGRESS & STREAK" variant="primary" size="sm" />
              <AppHeading level="h4" style={styles.title}>
                Consistency Sanctuary
              </AppHeading>
            </View>
            {onPressDetails && (
              <AppIcon name="chevron-right" size={18} color={colors.textSecondary} />
            )}
          </View>

          {/* Streak Banner / Metric Highlights */}
          <View
            style={[
              styles.streakBanner,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#F0EAF7',
                borderColor: isDark ? colors.border : '#E7DFED',
              },
            ]}
          >
            <View style={[styles.streakIconWrapper, { backgroundColor: isDark ? '#4A1D1B' : '#F8D8D4' }]}>
              <AppText style={styles.flameEmoji}>🔥</AppText>
            </View>
            <View style={styles.streakTextWrapper}>
              <View style={styles.streakNumberRow}>
                <AppText style={[styles.streakCount, { color: colors.textPrimary }]}>
                  {streak}
                </AppText>
                <AppText style={[styles.streakLabel, { color: colors.textPrimary }]}>
                  {streak === 1 ? ' Day Streak' : ' Days Streak'}
                </AppText>
              </View>
              <AppText
                variant="caption"
                style={[styles.streakEncouragement, { color: colors.textSecondary }]}
              >
                {streak > 0
                  ? 'Keep the gentle momentum going!'
                  : 'Start your streak today with a check-in!'}
              </AppText>
            </View>
          </View>

          {/* 7-Day Visual Dots */}
          <View style={styles.sevenDaysContainer}>
            <AppText variant="caption" style={[styles.sevenDaysLabel, { color: colors.textSecondary }]}>
              Past 7 Days
            </AppText>
            <View style={styles.daysRow}>
              {last7Days.map((day, idx) => (
                <View key={idx} style={styles.dayCol}>
                  <View
                    style={[
                      styles.dotCircle,
                      day.active
                        ? { backgroundColor: colors.accent, borderColor: colors.accentDark }
                        : {
                            backgroundColor: isDark ? colors.surfaceSecondary : '#F0EAF7',
                            borderColor: isDark ? colors.border : '#E7DFED',
                          },
                      day.isToday && {
                        borderWidth: 2,
                        borderColor: colors.primaryDark,
                      },
                    ]}
                  >
                    {day.active ? (
                      <AppIcon name="check" size={10} color="#292431" />
                    ) : (
                      day.isToday && (
                        <View
                          style={[styles.todayInnerDot, { backgroundColor: colors.primary }]}
                        />
                      )
                    )}
                  </View>
                  <AppText
                    variant="caption"
                    style={[
                      styles.dayText,
                      { color: day.isToday ? colors.primaryDark : colors.textSecondary },
                      day.isToday && styles.todayDayText,
                    ]}
                  >
                    {day.dayLabel}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Stats Summary Grid */}
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: isDark ? colors.surfaceSecondary : '#F0EAF7' },
              ]}
            >
              <AppIcon name="smile" size={18} color={colors.primary} />
              <AppText style={[styles.statValue, { color: colors.textPrimary }]}>
                {totalMoods}
              </AppText>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Mood Check-ins
              </AppText>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: isDark ? colors.surfaceSecondary : '#F7F9F7' },
              ]}
            >
              <AppIcon name="compass" size={18} color={colors.primary} />
              <AppText style={[styles.statValue, { color: colors.textPrimary }]}>
                {totalActivities}
              </AppText>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Activities Done
              </AppText>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: isDark ? colors.surfaceSecondary : '#F7F9F7' },
              ]}
            >
              <AppIcon name="star" size={18} color="#E59866" />
              <AppText style={[styles.statValue, { color: colors.textPrimary }]}>
                {progress?.earnedAchievements?.length || 0}
              </AppText>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Milestones
              </AppText>
            </View>
          </View>
        </AppCard>
      </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 14,
  },
  headerLeft: {
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  streakIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEAD4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  flameEmoji: {
    fontSize: 22,
  },
  streakTextWrapper: {
    flex: 1,
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  streakEncouragement: {
    fontSize: 12,
    marginTop: 2,
  },
  sevenDaysContainer: {
    marginBottom: 16,
  },
  sevenDaysLabel: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dotCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '500',
  },
  todayDayText: {
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
});

