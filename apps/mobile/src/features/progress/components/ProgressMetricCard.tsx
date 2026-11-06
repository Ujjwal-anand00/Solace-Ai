import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppCard, AppText, AppHeading, AppIcon } from '../../../components/ui';
import { IconName } from '../../../components/ui/AppIcon';
import { useTheme } from '../../../hooks/useTheme';

interface MetricItem {
  key: string;
  label: string;
  value: number;
  icon: IconName;
  color: string;
  bgLight: string;
}

interface ProgressMetricCardProps {
  moodCount: number;
  activitiesCount: number;
  breathingCount: number;
  planTasksCount: number;
  assessmentsCount: number;
  activeDaysCount: number;
  periodLabel?: string;
}

export const ProgressMetricCard: React.FC<ProgressMetricCardProps> = ({
  moodCount,
  activitiesCount,
  breathingCount,
  planTasksCount,
  assessmentsCount,
  activeDaysCount,
  periodLabel = 'All Time',
}) => {
  const { colors, isDark } = useTheme();

  const metrics: MetricItem[] = [
    {
      key: 'activeDays',
      label: 'Active Days',
      value: activeDaysCount,
      icon: 'calendar',
      color: '#0D9488',
      bgLight: '#CCFBF1',
    },
    {
      key: 'mood',
      label: 'Mood Check-ins',
      value: moodCount,
      icon: 'smile',
      color: '#0369A1',
      bgLight: '#E0F2FE',
    },
    {
      key: 'activities',
      label: 'Activities Completed',
      value: activitiesCount,
      icon: 'activity',
      color: '#15803D',
      bgLight: '#DCFCE7',
    },
    {
      key: 'breathing',
      label: 'Breathing Sessions',
      value: breathingCount,
      icon: 'wind',
      color: '#7E22CE',
      bgLight: '#F3E8FF',
    },
    {
      key: 'planTasks',
      label: 'Plan Tasks Done',
      value: planTasksCount,
      icon: 'check-circle',
      color: '#D97706',
      bgLight: '#FEF3C7',
    },
    {
      key: 'assessments',
      label: 'Assessments',
      value: assessmentsCount,
      icon: 'file-text',
      color: '#4338CA',
      bgLight: '#E0E7FF',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <AppHeading level="h4" style={styles.sectionHeading}>
          Impact & Engagement
        </AppHeading>
        <AppText variant="caption" style={{ color: colors.textSecondary }}>
          {periodLabel}
        </AppText>
      </View>

      <View style={styles.grid}>
        {metrics.map((item) => (
          <AppCard
            key={item.key}
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: isDark ? colors.surface : item.bgLight },
              ]}
            >
              <AppIcon name={item.icon} size={18} color={item.color} />
            </View>
            <AppHeading level="h3" style={styles.count}>
              {item.value}
            </AppHeading>
            <AppText
              variant="caption"
              style={[styles.label, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.label}
            </AppText>
          </AppCard>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  count: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
  },
});

