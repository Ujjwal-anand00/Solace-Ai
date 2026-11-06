import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { AppCard, AppText, AppHeading, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { NotificationQuietHours } from '@solace/shared';
import { ReminderTimePicker } from './ReminderTimePicker';
import { triggerHaptic } from '../../../utils/haptics';

interface QuietHoursSelectorProps {
  quietHours: NotificationQuietHours;
  onChange: (updated: NotificationQuietHours) => void;
}

export const QuietHoursSelector: React.FC<QuietHoursSelectorProps> = ({
  quietHours,
  onChange,
}) => {
  const { colors, isDark } = useTheme();

  const handleToggle = (enabled: boolean) => {
    triggerHaptic.selection();
    onChange({
      ...quietHours,
      enabled,
    });
  };

  const handleStartTimeChange = (startTime: string) => {
    onChange({
      ...quietHours,
      startTime,
    });
  };

  const handleEndTimeChange = (endTime: string) => {
    onChange({
      ...quietHours,
      endTime,
    });
  };

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
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <View style={styles.titleWithIcon}>
            <AppIcon name="moon" size={18} color="#7E22CE" />
            <AppHeading level="h4" style={styles.title}>
              Quiet Hours
            </AppHeading>
          </View>
          <AppText
            variant="caption"
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            Mute reminders during sleep or deep rest.
          </AppText>
        </View>

        <Switch
          value={quietHours.enabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.border, true: '#829B83' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {quietHours.enabled && (
        <View style={styles.timesContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <ReminderTimePicker
            label="Starts At (Bedtime)"
            time={quietHours.startTime || '22:00'}
            onChangeTime={handleStartTimeChange}
          />

          <View style={{ height: 10 }} />

          <ReminderTimePicker
            label="Ends At (Morning)"
            time={quietHours.endTime || '08:00'}
            onChangeTime={handleEndTimeChange}
          />
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleCol: {
    flex: 1,
    marginRight: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  timesContainer: {
    marginTop: 4,
  },
});

