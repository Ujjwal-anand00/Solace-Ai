import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText, AppHeading, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { MoodCalendarDay } from '@solace/shared';
import { PRIMARY_MOODS } from '../types';

interface MoodCalendarViewProps {
  days: MoodCalendarDay[];
  selectedDate?: string | null;
  onSelectDate: (dateStr: string | null) => void;
  year: number;
  month: number;
  onChangeMonth: (year: number, month: number) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const MoodCalendarView: React.FC<MoodCalendarViewProps> = ({
  days,
  selectedDate,
  onSelectDate,
  year,
  month,
  onChangeMonth,
}) => {
  const { colors, isDark } = useTheme();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePrevMonth = () => {
    triggerHaptic.light();
    if (month === 1) {
      onChangeMonth(year - 1, 12);
    } else {
      onChangeMonth(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    triggerHaptic.light();
    if (month === 12) {
      onChangeMonth(year + 1, 1);
    } else {
      onChangeMonth(year, month + 1);
    }
  };

  // Determine starting day of week for the first day of the month
  const firstDayWeekday = new Date(year, month - 1, 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  const getMoodColor = (mood?: string) => {
    if (!mood) return colors.primary;
    const match = PRIMARY_MOODS.find((m) => m.key === mood.toLowerCase());
    return match ? match.color : colors.primary;
  };

  const handleDayPress = (dateStr: string) => {
    triggerHaptic.selection();
    if (selectedDate === dateStr) {
      onSelectDate(null); // toggle off
    } else {
      onSelectDate(dateStr);
    }
  };

  return (
    <View style={styles.container}>
      {/* Month Navigator Header */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.navButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Previous month"
        >
          <AppIcon name="chevronLeft" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <AppHeading level={3} style={styles.monthTitle}>
          {monthNames[month - 1]} {year}
        </AppHeading>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.navButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Next month"
        >
          <AppIcon name="chevronRight" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Weekday Labels */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((w, idx) => (
          <AppText
            key={idx}
            variant="caption"
            style={[styles.weekdayLabel, { color: colors.textSecondary }]}
          >
            {w}
          </AppText>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {/* Leading empty cells before first day */}
        {Array.from({ length: firstDayWeekday }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.dayCell} />
        ))}

        {/* Days of Month */}
        {days.map((item) => {
          const dateParts = item.date.split('-');
          const dayNumber = parseInt(dateParts[2], 10);
          const isSelected = selectedDate === item.date;
          const isToday = item.date === todayStr;
          const moodColor = getMoodColor(item.dominantMood);

          return (
            <TouchableOpacity
              key={item.date}
              onPress={() => handleDayPress(item.date)}
              activeOpacity={0.7}
              style={[
                styles.dayCell,
                isSelected && {
                  backgroundColor: isDark ? 'rgba(130, 155, 131, 0.25)' : '#EAF2EA',
                  borderRadius: 14,
                },
                isToday && !isSelected && {
                  borderColor: colors.primary,
                  borderWidth: 1,
                  borderRadius: 14,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${item.date}, ${item.hasCheckIn ? `${item.count} check-ins` : 'No entries'}`}
            >
              <AppText
                variant="bodySmall"
                style={[
                  styles.dayNumber,
                  {
                    color: isSelected
                      ? colors.primaryDark
                      : isToday
                      ? colors.primary
                      : colors.textPrimary,
                    fontWeight: isSelected || isToday ? '700' : '400',
                  },
                ]}
              >
                {dayNumber}
              </AppText>

              {/* Mood Indicator Dot */}
              {item.hasCheckIn ? (
                <View style={[styles.moodDot, { backgroundColor: moodColor }]} />
              ) : (
                <View style={styles.emptyDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedDate && (
        <View style={styles.filterBanner}>
          <AppText variant="caption" style={{ color: colors.primaryDark, fontWeight: '600' }}>
            Showing entries for {selectedDate}
          </AppText>
          <TouchableOpacity
            onPress={() => onSelectDate(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
              Clear Filter
            </AppText>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 38,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayNumber: {
    fontSize: 13,
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  emptyDot: {
    width: 6,
    height: 6,
    marginTop: 4,
  },
  filterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(130, 155, 131, 0.1)',
    borderRadius: 12,
    marginTop: 10,
  },
});

