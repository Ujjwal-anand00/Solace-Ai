import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText, AppHeading, AppCard, AppProgressBar } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { MoodSummary } from '@solace/shared';
import { PRIMARY_MOODS } from '../types';

interface MoodAnalyticsChartsProps {
  summary?: MoodSummary | null;
  isLoading?: boolean;
}

export const MoodAnalyticsCharts: React.FC<MoodAnalyticsChartsProps> = ({
  summary,
  isLoading = false,
}) => {
  const { colors, isDark } = useTheme();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AppText variant="bodySmall" color="secondary">
          Calculating mood analytics...
        </AppText>
      </View>
    );
  }

  if (!summary || summary.totalEntries === 0) {
    return (
      <AppCard style={styles.emptyCard}>
        <AppText style={{ fontSize: 32, textAlign: 'center' }}>🌱</AppText>
        <AppHeading level={3} style={styles.emptyTitle}>
          Your Analytics Will Bloom Here
        </AppHeading>
        <AppText
          variant="bodySmall"
          style={[styles.emptySubtitle, { color: colors.textSecondary }]}
        >
          As you record daily check-ins, Solace will visualize your emotional rhythms, intensity trends, and dominant feelings.
        </AppText>
      </AppCard>
    );
  }

  const dominantMoodConfig = PRIMARY_MOODS.find(
    (m) => m.key === summary.dominantMood?.toLowerCase()
  ) || {
    label: summary.dominantMood || 'Neutral',
    emoji: '🌿',
    color: colors.primary,
  };

  const distribution = summary.moodDistribution || {};

  return (
    <View style={styles.container}>
      {/* 4 Metric Boxes */}
      <View style={styles.metricsGrid}>
        <AppCard style={styles.metricCard}>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            CHECK-INS
          </AppText>
          <AppHeading level={2} style={styles.metricNumber}>
            {summary.totalEntries}
          </AppHeading>
          <AppText variant="caption" style={{ color: colors.primaryDark }}>
            Past 30 days
          </AppText>
        </AppCard>

        <AppCard style={styles.metricCard}>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            DOMINANT MOOD
          </AppText>
          <View style={styles.dominantRow}>
            <AppText style={{ fontSize: 20 }}>{dominantMoodConfig.emoji}</AppText>
            <AppHeading level={3} style={[styles.dominantText, { color: dominantMoodConfig.color }]}>
              {dominantMoodConfig.label}
            </AppHeading>
          </View>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            Most frequent
          </AppText>
        </AppCard>

        <AppCard style={styles.metricCard}>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            AVG INTENSITY
          </AppText>
          <AppHeading level={2} style={styles.metricNumber}>
            {summary.averageIntensity}
          </AppHeading>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            Scale of 1-10
          </AppText>
        </AppCard>

        <AppCard style={styles.metricCard}>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            STREAK
          </AppText>
          <View style={styles.dominantRow}>
            <AppText style={{ fontSize: 18 }}>🔥</AppText>
            <AppHeading level={2} style={styles.metricNumber}>
              {summary.checkInStreak || 0}
            </AppHeading>
          </View>
          <AppText variant="caption" style={{ color: colors.primaryDark }}>
            Days in a row
          </AppText>
        </AppCard>
      </View>

      {/* Mood Distribution */}
      <AppCard style={styles.sectionCard}>
        <AppHeading level={3} style={styles.sectionTitle}>
          Mood Distribution
        </AppHeading>
        <AppText variant="caption" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Breakdown of emotions logged across all check-ins
        </AppText>

        <View style={styles.distributionList}>
          {PRIMARY_MOODS.map((mood) => {
            const count = distribution[mood.key] || 0;
            const pct = summary.totalEntries > 0 ? Math.round((count / summary.totalEntries) * 100) : 0;
            return (
              <View key={mood.key} style={styles.distRow}>
                <View style={styles.distLabelGroup}>
                  <AppText style={styles.distEmoji}>{mood.emoji}</AppText>
                  <AppText variant="bodySmall" style={styles.distLabel}>
                    {mood.label}
                  </AppText>
                </View>

                <View style={styles.barWrapper}>
                  <AppProgressBar
                    progress={pct}
                    height={8}
                    color={mood.color}
                    backgroundColor={isDark ? colors.surfaceSecondary : '#EEF2EE'}
                  />
                </View>

                <AppText variant="caption" style={[styles.distPercent, { color: colors.textSecondary }]}>
                  {pct}% ({count})
                </AppText>
              </View>
            );
          })}
        </View>
      </AppCard>

      {/* 7-Day Trend Chart */}
      {summary.recentTrend && summary.recentTrend.length > 0 && (
        <AppCard style={styles.sectionCard}>
          <AppHeading level={3} style={styles.sectionTitle}>
            7-Day Intensity Trend
          </AppHeading>
          <AppText variant="caption" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Average emotional intensity per day (scale 1 to 10)
          </AppText>

          <View style={styles.trendRow}>
            {summary.recentTrend.map((item, idx) => {
              const d = new Date(item.date + 'T00:00:00');
              const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
              const dayLabel = dayNames[d.getDay()];
              const barHeightPct = Math.min(Math.max((item.averageIntensity / 10) * 100, 10), 100);

              return (
                <View key={idx} style={styles.trendCol}>
                  <AppText variant="caption" style={styles.trendValText}>
                    {item.averageIntensity > 0 ? item.averageIntensity : '—'}
                  </AppText>
                  <View style={styles.trendBarTrack}>
                    <View
                      style={[
                        styles.trendBarFill,
                        {
                          height: item.count > 0 ? `${barHeightPct}%` : '4%',
                          backgroundColor:
                            item.count > 0
                              ? colors.primary
                              : isDark
                              ? 'rgba(255,255,255,0.06)'
                              : '#E0E5E0',
                        },
                      ]}
                    />
                  </View>
                  <AppText variant="caption" style={[styles.trendDayText, { color: colors.textSecondary }]}>
                    {dayLabel}
                  </AppText>
                </View>
              );
            })}
          </View>
        </AppCard>
      )}

      {/* Frequently Identified Emotions */}
      {summary.topEmotions && summary.topEmotions.length > 0 && (
        <AppCard style={styles.sectionCard}>
          <AppHeading level={3} style={styles.sectionTitle}>
            Frequent Secondary Feelings
          </AppHeading>
          <AppText variant="caption" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Most common words chosen during check-ins
          </AppText>

          <View style={styles.emotionsBars}>
            {summary.topEmotions.map((item, idx) => (
              <View key={idx} style={styles.emotionBarItem}>
                <View style={styles.emotionBarHeader}>
                  <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
                    {item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1)}
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.primaryDark, fontWeight: '700' }}>
                    {item.count} {item.count === 1 ? 'time' : 'times'}
                  </AppText>
                </View>
                <AppProgressBar
                  progress={summary.totalEntries > 0 ? (item.count / summary.totalEntries) * 100 : 0}
                  height={6}
                  color={colors.primary}
                />
              </View>
            ))}
          </View>
        </AppCard>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
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
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    padding: 14,
    borderRadius: 18,
    gap: 4,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  dominantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dominantText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCard: {
    padding: 18,
    borderRadius: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: -8,
  },
  distributionList: {
    gap: 10,
    marginTop: 4,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: 6,
  },
  distEmoji: {
    fontSize: 16,
  },
  distLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  barWrapper: {
    flex: 1,
  },
  distPercent: {
    width: 60,
    textAlign: 'right',
    fontSize: 11,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
  },
  trendCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  trendValText: {
    fontSize: 10,
    fontWeight: '600',
  },
  trendBarTrack: {
    width: 14,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBarFill: {
    width: '100%',
    borderRadius: 7,
  },
  trendDayText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emotionsBars: {
    gap: 12,
  },
  emotionBarItem: {
    gap: 6,
  },
  emotionBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

