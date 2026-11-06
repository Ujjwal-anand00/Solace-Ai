import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  AppCard,
  AppText,
  AppHeading,
  AppIcon,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { StreakDetails } from '@solace/shared';

interface StreakCardProps {
  streakDetails?: StreakDetails;
  isLoading?: boolean;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  streakDetails,
  isLoading = false,
}) => {
  const { colors, isDark } = useTheme();

  const currentStreak = streakDetails?.currentStreak || 0;
  const longestStreak = streakDetails?.longestStreak || 0;
  const calendar = streakDetails?.weeklyCalendar || [];
  const message =
    streakDetails?.encouragingMessage ||
    'Welcome back. You can begin again today with a single conscious breath.';

  if (isLoading) {
    return (
      <AppCard style={styles.card}>
        <View style={styles.loadingContainer}>
          <AppText variant="bodySmall" color="secondary">
            Gathering your streak rhythm...
          </AppText>
        </View>
      </AppCard>
    );
  }

  return (
    <AppCard
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surfaceSecondary : '#FFF9F2',
          borderColor: isDark ? colors.border : '#F3DFC5',
          borderWidth: 1,
        },
      ]}
    >
      {/* Top Streak Count Row */}
      <View style={styles.topRow}>
        <View style={[styles.flameCircle, { backgroundColor: '#FEE2E2' }]}>
          <AppText style={styles.flameEmoji}>🔥</AppText>
        </View>

        <View style={styles.streakNumbersArea}>
          <View style={styles.countAndLabelRow}>
            <AppHeading level="h1" style={styles.streakCountText}>
              {currentStreak}
            </AppHeading>
            <AppHeading level="h3" style={styles.streakUnitText}>
              {currentStreak === 1 ? 'Day' : 'Days'}
            </AppHeading>
          </View>
          <AppText variant="caption" color="secondary">
            {currentStreak > 0
              ? 'Consecutive daily presence'
              : 'Take a mindful pause today to start your streak'}
          </AppText>
        </View>

        {/* Longest Streak Badge */}
        <View style={styles.longestBadge}>
          <AppIcon name="award" size={14} color="#D97706" />
          <AppText variant="caption" style={styles.longestText}>
            Best: {longestStreak}d
          </AppText>
        </View>
      </View>

      {/* 7-Day Calendar Ribbon */}
      <View style={styles.calendarRibbon}>
        {calendar.map((day, idx) => (
          <View key={`${day.date}-${idx}`} style={styles.dayCol}>
            <AppText
              variant="caption"
              style={[
                styles.dayNameText,
                day.isToday && { color: colors.primary, fontWeight: '700' },
              ]}
            >
              {day.dayName}
            </AppText>
            <View
              style={[
                styles.dayCircle,
                {
                  backgroundColor: day.isActive
                    ? colors.primary
                    : isDark
                    ? colors.surface
                    : '#E2E8F0',
                  borderColor: day.isToday ? colors.primaryDark : 'transparent',
                  borderWidth: day.isToday ? 2 : 0,
                },
              ]}
            >
              {day.isActive ? (
                <AppIcon name="check" size={12} color="#FFFFFF" />
              ) : null}
            </View>
          </View>
        ))}
      </View>

      {/* Encouraging Affirmation Note */}
      <View style={styles.messageBox}>
        <AppIcon name="sparkles" size={14} color={colors.primary} />
        <AppText variant="bodySmall" color="secondary" style={styles.messageText}>
          {message}
        </AppText>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  flameCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  flameEmoji: {
    fontSize: 26,
  },
  streakNumbersArea: {
    flex: 1,
  },
  countAndLabelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakCountText: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  streakUnitText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D97706',
  },
  longestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  longestText: {
    color: '#D97706',
    fontWeight: '700',
  },
  calendarRibbon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    marginBottom: 12,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayNameText: {
    fontSize: 11,
    color: '#64748B',
  },
  dayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  messageText: {
    flex: 1,
    lineHeight: 18,
  },
});

