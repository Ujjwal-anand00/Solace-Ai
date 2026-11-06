import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { useJournalCalendar } from '../../src/hooks/useJournal';

export default function JournalCalendarScreen() {
  const router = useRouter();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split('T')[0]);

  const { data: calendarDays, isLoading } = useJournalCalendar(currentYear, currentMonth);

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
    triggerHaptic.selection();
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    triggerHaptic.selection();
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectedDayData = calendarDays?.find((d) => d.date === selectedDate);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal Calendar</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Month Selector Bar */}
        <View style={styles.monthBar}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
            <Text style={styles.navBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {monthNames[currentMonth - 1]} {currentYear}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
            <Text style={styles.navBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Days of week header */}
        <View style={styles.weekDaysHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <Text key={i} style={styles.weekDayText}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.sage} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.calendarGrid}>
            {calendarDays?.map((day) => {
              const isSelected = day.date === selectedDate;
              const hasEntries = day.count > 0;
              const dayNum = parseInt(day.date.split('-')[2], 10);

              return (
                <TouchableOpacity
                  key={day.date}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    hasEntries && styles.dayCellHasEntries,
                  ]}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedDate(day.date);
                  }}
                >
                  <Text
                    style={[
                      styles.dayNum,
                      isSelected && styles.dayNumSelected,
                      hasEntries && !isSelected && styles.dayNumHasEntries,
                    ]}
                  >
                    {dayNum}
                  </Text>
                  {hasEntries && <View style={styles.entryDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Selected Date Entries */}
        <View style={styles.selectedSection}>
          <Text style={styles.selectedTitle}>
            Entries on {new Date(selectedDate).toLocaleDateString(undefined, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>

          {selectedDayData && selectedDayData.entries.length > 0 ? (
            selectedDayData.entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.dayEntryCard}
                onPress={() => {
                  triggerHaptic.light();
                  router.push(`/journal/${entry.id}` as Href);
                }}
              >
                <Text style={styles.dayEntryTitle}>{entry.title}</Text>
                <Text style={styles.dayEntryCategory}>{entry.category.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyDayBox}>
              <Text style={styles.emptyDayText}>No reflections recorded on this day.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: colors.sageDark,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  monthBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  navBtnText: {
    fontSize: 20,
    color: colors.sageDark,
    marginTop: -2,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    width: 36,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dayCell: {
    width: 40,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellSelected: {
    backgroundColor: colors.sage,
  },
  dayCellHasEntries: {
    backgroundColor: '#F0F5F1',
  },
  dayNum: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dayNumSelected: {
    color: colors.white,
    fontWeight: '700',
  },
  dayNumHasEntries: {
    color: colors.sageDark,
    fontWeight: '700',
  },
  entryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.sageDark,
    marginTop: 2,
  },
  selectedSection: {
    marginTop: 24,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dayEntryCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayEntryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dayEntryCategory: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  emptyDayBox: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyDayText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});

