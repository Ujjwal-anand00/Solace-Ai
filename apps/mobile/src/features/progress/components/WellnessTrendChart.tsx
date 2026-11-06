import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  AppCard,
  AppText,
  AppHeading,
  AppBadge,
  AppIcon,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { ProgressTrendPoint } from '@solace/shared';

interface WellnessTrendChartProps {
  points?: ProgressTrendPoint[];
  period: 'week' | 'month';
  onPeriodChange?: (period: 'week' | 'month') => void;
  isLoading?: boolean;
}

export const WellnessTrendChart: React.FC<WellnessTrendChartProps> = ({
  points = [],
  period,
  onPeriodChange,
  isLoading = false,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null
  );

  const hasData =
    points.length > 0 &&
    points.some(
      (p) => (p.activitiesCount > 0) || (p.moodIntensity !== null && p.moodIntensity > 0)
    );

  // Maximum value for scaling activities bar (at least 5 for pleasant proportions)
  const maxActivities = Math.max(
    5,
    ...points.map((p) => p.activitiesCount || 0)
  );

  const selectedPoint =
    selectedPointIndex !== null && points[selectedPointIndex]
      ? points[selectedPointIndex]
      : points[points.length - 1];

  return (
    <AppCard
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
          borderColor: colors.border,
        },
      ]}
    >
      {/* Header with period toggle */}
      <View style={styles.header}>
        <View>
          <AppHeading level="h4" style={styles.title}>
            Wellness Trends
          </AppHeading>
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            Daily balance & mindful practices
          </AppText>
        </View>

        {onPeriodChange && (
          <View
            style={[
              styles.periodToggle,
              { backgroundColor: isDark ? colors.surface : '#F1F5F0' },
            ]}
          >
            <TouchableOpacity
              onPress={() => onPeriodChange('week')}
              style={[
                styles.toggleBtn,
                period === 'week' && styles.toggleBtnActive,
              ]}
            >
              <AppText
                variant="caption"
                style={[
                  styles.toggleText,
                  period === 'week' && styles.toggleTextActive,
                ]}
              >
                7 Days
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPeriodChange('month')}
              style={[
                styles.toggleBtn,
                period === 'month' && styles.toggleBtnActive,
              ]}
            >
              <AppText
                variant="caption"
                style={[
                  styles.toggleText,
                  period === 'month' && styles.toggleTextActive,
                ]}
              >
                30 Days
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicator, { backgroundColor: '#829B83' }]} />
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            Activities & Practices
          </AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendIndicatorDot, { backgroundColor: '#E9A862' }]} />
          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            Mood (1-5)
          </AppText>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
            Visualizing your rhythm...
          </AppText>
        </View>
      ) : !hasData ? (
        <View style={styles.emptyContainer}>
          <AppIcon name="feather" size={32} color="#829B83" />
          <AppText
            variant="bodyMedium"
            style={[styles.emptyTitle, { color: colors.text }]}
          >
            Every journey begins with a moment
          </AppText>
          <AppText
            variant="caption"
            style={[styles.emptySubtitle, { color: colors.textSecondary }]}
          >
            No activities recorded yet for this period. Even a single deep breath
            marks your day.
          </AppText>
        </View>
      ) : (
        <>
          {/* Selected point inspection tooltip */}
          {selectedPoint && (
            <View
              style={[
                styles.tooltip,
                {
                  backgroundColor: isDark ? colors.surface : '#F8F6EF',
                  borderColor: isDark ? colors.border : '#E2DFD2',
                },
              ]}
            >
              <View style={styles.tooltipCol}>
                <AppText variant="caption" style={{ fontWeight: '700' }}>
                  {selectedPoint.label} ({selectedPoint.date})
                </AppText>
              </View>
              <View style={styles.tooltipValues}>
                <AppBadge
                  label={`${selectedPoint.activitiesCount} activities`}
                  variant="primary"
                  size="sm"
                />
                {selectedPoint.moodIntensity !== null ? (
                  <AppBadge
                    label={`Mood: ${selectedPoint.moodIntensity}/5`}
                    variant="neutral"
                    size="sm"
                  />
                ) : (
                  <AppText variant="caption" style={{ color: colors.textSecondary }}>
                    No check-in
                  </AppText>
                )}
              </View>
            </View>
          )}

          {/* Bar Chart Area */}
          <View style={styles.chartContainer}>
            {points.map((pt, index) => {
              const barHeightPct = Math.min(
                100,
                Math.max(8, (pt.activitiesCount / maxActivities) * 100)
              );
              const isSelected =
                selectedPointIndex === index ||
                (selectedPointIndex === null && index === points.length - 1);

              return (
                <TouchableOpacity
                  key={pt.date + index}
                  onPress={() => setSelectedPointIndex(index)}
                  activeOpacity={0.7}
                  style={styles.barCol}
                >
                  <View style={styles.barTrack}>
                    {/* Mood indicator dot floating above or inside */}
                    {pt.moodIntensity !== null && (
                      <View
                        style={[
                          styles.moodDot,
                          {
                            bottom: `${Math.min(95, Math.max(10, (pt.moodIntensity / 5) * 100))}%`,
                          },
                        ]}
                      />
                    )}

                    {/* Activities Bar */}
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeightPct}%`,
                          backgroundColor: isSelected ? '#536B58' : '#829B83',
                          opacity: pt.activitiesCount > 0 ? (isSelected ? 1 : 0.8) : 0.25,
                        },
                      ]}
                    />
                  </View>
                  <AppText
                    variant="caption"
                    style={[
                      styles.axisLabel,
                      {
                        color: isSelected ? colors.text : colors.textSecondary,
                        fontWeight: isSelected ? '700' : '400',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {period === 'week' ? pt.label : pt.label.split(' ')[1] || pt.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  periodToggle: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },
  toggleBtnActive: {
    backgroundColor: '#829B83',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
  tooltip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  tooltipCol: {
    flex: 1,
  },
  tooltipValues: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingTop: 16,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  barTrack: {
    flex: 1,
    width: '65%',
    maxWidth: 24,
    justifyContent: 'flex-end',
    position: 'relative',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
    minHeight: 6,
  },
  moodDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E9A862',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 2,
  },
  axisLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
});

