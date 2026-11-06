import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface WeekdaySelectorProps {
  selectedDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  onToggleDay: (day: number) => void;
}

const DAYS = [
  { index: 1, label: 'M' },
  { index: 2, label: 'T' },
  { index: 3, label: 'W' },
  { index: 4, label: 'T' },
  { index: 5, label: 'F' },
  { index: 6, label: 'S' },
  { index: 0, label: 'S' },
];

export const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({
  selectedDays,
  onToggleDay,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      {DAYS.map((d) => {
        const isSelected = selectedDays.includes(d.index);

        return (
          <TouchableOpacity
            key={d.index}
            onPress={() => {
              triggerHaptic.selection();
              onToggleDay(d.index);
            }}
            style={[
              styles.dayPill,
              {
                backgroundColor: isSelected
                  ? '#829B83'
                  : isDark
                  ? colors.surfaceSecondary
                  : '#EFECE6',
                borderColor: isSelected ? '#536B58' : colors.border,
              },
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.dayText,
                {
                  color: isSelected ? '#FFFFFF' : colors.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                },
              ]}
            >
              {d.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  dayPill: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 13,
  },
});
