import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  AppCard,
  AppText,
  AppHeading,
  AppIcon,
  AppButton,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import {
  NotificationPreferences as NotificationPreferencesType,
  UpdateNotificationPreferencesDto,
} from '@solace/shared';
import { WeekdaySelector } from './WeekdaySelector';
import { ReminderTimePicker } from './ReminderTimePicker';
import { QuietHoursSelector } from './QuietHoursSelector';
import { LocalNotificationService } from '../../../services/notifications/localNotificationService';
import { triggerHaptic } from '../../../utils/haptics';

interface NotificationPreferencesProps {
  preferences: NotificationPreferencesType;
  onSave: (updated: UpdateNotificationPreferencesDto) => Promise<void>;
  isSaving?: boolean;
}

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences,
  onSave,
  isSaving = false,
}) => {
  const { colors, isDark } = useTheme();

  // Local state for interactive editing before save
  const [form, setForm] = useState<NotificationPreferencesType>(preferences);
  const [permissionStatus, setPermissionStatus] = useState<Notifications.PermissionStatus>(
    Notifications.PermissionStatus.UNDETERMINED,
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setForm(preferences);
  }, [preferences]);

  useEffect(() => {
    LocalNotificationService.getPermissionStatus().then(setPermissionStatus);
  }, []);

  const handleRequestPermission = async () => {
    triggerHaptic.light();
    const granted = await LocalNotificationService.requestPermissions();
    if (granted) {
      setPermissionStatus(Notifications.PermissionStatus.GRANTED);
      triggerHaptic.success();
    } else {
      setPermissionStatus(Notifications.PermissionStatus.DENIED);
      triggerHaptic.warning();
    }
  };

  const updateField = <K extends keyof NotificationPreferencesType>(
    key: K,
    val: NotificationPreferencesType[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    triggerHaptic.light();
    await onSave(form);
    setHasUnsavedChanges(false);
    triggerHaptic.success();
  };

  return (
    <View style={styles.container}>
      {/* Permission Status Banner */}
      {permissionStatus !== Notifications.PermissionStatus.GRANTED && (
        <AppCard
          style={[
            styles.permissionBanner,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#FFFBEB',
              borderColor: '#FDE68A',
            },
          ]}
        >
          <View style={styles.permissionRow}>
            <AppIcon name="bell" size={20} color="#D97706" />
            <View style={{ flex: 1 }}>
              <AppText variant="bodySmall" style={{ fontWeight: '700', color: '#B45309' }}>
                Push Notifications are Off
              </AppText>
              <AppText variant="caption" style={{ color: '#92400E', marginTop: 2 }}>
                Allow Solace to send mindful reminders when your session time arrives.
              </AppText>
            </View>
            <AppButton
              title="Allow"
              variant="primary"
              size="sm"
              onPress={handleRequestPermission}
            />
          </View>
        </AppCard>
      )}

      {/* Master Toggle Card */}
      <AppCard
        style={[
          styles.masterCard,
          {
            backgroundColor: isDark ? colors.surfaceSecondary : '#F0EAF7',
            borderColor: '#E8DDF5',
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerTextCol}>
            <AppHeading level="h4" style={styles.cardTitle}>
              Allow Notifications
            </AppHeading>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Master switch for all Solace sanctuary reminders.
            </AppText>
          </View>
          <Switch
            value={form.masterEnabled}
            onValueChange={(val) => {
              triggerHaptic.selection();
              updateField('masterEnabled', val);
            }}
            trackColor={{ false: colors.border, true: colors.primaryDark }}
            thumbColor="#FFFFFF"
          />
        </View>
      </AppCard>

      {/* Category Section Cards */}
      {form.masterEnabled && (
        <>
          {/* 1. Daily Wellness Reminders */}
          <AppCard
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerTextCol}>
                <View style={styles.titleWithIcon}>
                  <AppIcon name="feather" size={16} color={colors.primaryDark} />
                  <AppHeading level="h4" style={styles.cardTitle}>
                    Daily Wellness Pause
                  </AppHeading>
                </View>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  A gentle invitation to pause and take a mindful breath.
                </AppText>
              </View>
              <Switch
                value={form.dailyWellness.enabled}
                onValueChange={(val) => {
                  triggerHaptic.selection();
                  updateField('dailyWellness', { ...form.dailyWellness, enabled: val });
                }}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor="#FFFFFF"
              />
            </View>

            {form.dailyWellness.enabled && (
              <View style={styles.cardBody}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <ReminderTimePicker
                  label="Reminder Time"
                  time={form.dailyWellness.time}
                  onChangeTime={(t) => {
                    updateField('dailyWellness', { ...form.dailyWellness, time: t });
                  }}
                />
                <AppText
                  variant="caption"
                  style={[styles.fieldLabel, { color: colors.textSecondary }]}
                >
                  Days of Week
                </AppText>
                <WeekdaySelector
                  selectedDays={form.dailyWellness.days}
                  onToggleDay={(day) => {
                    const current = form.dailyWellness.days;
                    const next = current.includes(day)
                      ? current.filter((d) => d !== day)
                      : [...current, day];
                    updateField('dailyWellness', { ...form.dailyWellness, days: next });
                  }}
                />
              </View>
            )}
          </AppCard>

          {/* 2. Mood Check-in Reminders */}
          <AppCard
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerTextCol}>
                <View style={styles.titleWithIcon}>
                  <AppIcon name="smile" size={16} color="#0369A1" />
                  <AppHeading level="h4" style={styles.cardTitle}>
                    Mood Check-in Reminder
                  </AppHeading>
                </View>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Remind me to record how I feel today (automatically skipped if already logged).
                </AppText>
              </View>
              <Switch
                value={form.moodCheckin.enabled}
                onValueChange={(val) => {
                  triggerHaptic.selection();
                  updateField('moodCheckin', { ...form.moodCheckin, enabled: val });
                }}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor="#FFFFFF"
              />
            </View>

            {form.moodCheckin.enabled && (
              <View style={styles.cardBody}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <ReminderTimePicker
                  label="Check-in Time"
                  time={form.moodCheckin.time}
                  onChangeTime={(t) => {
                    updateField('moodCheckin', { ...form.moodCheckin, time: t });
                  }}
                />
              </View>
            )}
          </AppCard>

          {/* 3. Wellness Plan Reminders */}
          <AppCard
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerTextCol}>
                <View style={styles.titleWithIcon}>
                  <AppIcon name="check-circle" size={16} color="#D97706" />
                  <AppHeading level="h4" style={styles.cardTitle}>
                    Wellness Plan Reminders
                  </AppHeading>
                </View>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Reminders for pending tasks in your active wellness plan.
                </AppText>
              </View>
              <Switch
                value={form.planReminders.enabled}
                onValueChange={(val) => {
                  triggerHaptic.selection();
                  updateField('planReminders', { ...form.planReminders, enabled: val });
                }}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor="#FFFFFF"
              />
            </View>

            {form.planReminders.enabled && (
              <View style={styles.cardBody}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <ReminderTimePicker
                  label="Plan Time"
                  time={form.planReminders.time || '10:00'}
                  onChangeTime={(t) => {
                    updateField('planReminders', { ...form.planReminders, time: t });
                  }}
                />
              </View>
            )}
          </AppCard>

          {/* 4. Breathing & Mindfulness Reminders */}
          <AppCard
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerTextCol}>
                <View style={styles.titleWithIcon}>
                  <AppIcon name="wind" size={16} color="#7E22CE" />
                  <AppHeading level="h4" style={styles.cardTitle}>
                    Breathing & Mindfulness
                  </AppHeading>
                </View>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Scheduled mid-day breathwork and grounding sessions.
                </AppText>
              </View>
              <Switch
                value={form.breathingReminders.enabled}
                onValueChange={(val) => {
                  triggerHaptic.selection();
                  updateField('breathingReminders', {
                    ...form.breathingReminders,
                    enabled: val,
                  });
                }}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor="#FFFFFF"
              />
            </View>

            {form.breathingReminders.enabled && (
              <View style={styles.cardBody}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <ReminderTimePicker
                  label="Breathing Time"
                  time={form.breathingReminders.time || '14:00'}
                  onChangeTime={(t) => {
                    updateField('breathingReminders', {
                      ...form.breathingReminders,
                      time: t,
                    });
                  }}
                />
              </View>
            )}
          </AppCard>

          {/* 5. Milestones & Achievements */}
          <AppCard
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerTextCol}>
                <View style={styles.titleWithIcon}>
                  <AppIcon name="sparkles" size={16} color="#B45309" />
                  <AppHeading level="h4" style={styles.cardTitle}>
                    Milestones & Streaks
                  </AppHeading>
                </View>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Celebrate earned milestone badges and consistency achievements.
                </AppText>
              </View>
              <Switch
                value={form.milestones.enabled}
                onValueChange={(val) => {
                  triggerHaptic.selection();
                  updateField('milestones', { enabled: val });
                }}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor="#FFFFFF"
              />
            </View>
          </AppCard>

          {/* 6. Weekly Wellness Summary */}
          <AppCard
            style={[
              styles.card,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.headerTextCol}>
                <View style={styles.titleWithIcon}>
                  <AppIcon name="calendar" size={16} color="#15803D" />
                  <AppHeading level="h4" style={styles.cardTitle}>
                    Weekly Wellness Report
                  </AppHeading>
                </View>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  A weekly review of your consistency and mindfulness habits.
                </AppText>
              </View>
              <Switch
                value={form.weeklySummary.enabled}
                onValueChange={(val) => {
                  triggerHaptic.selection();
                  updateField('weeklySummary', { ...form.weeklySummary, enabled: val });
                }}
                trackColor={{ false: colors.border, true: colors.primaryDark }}
                thumbColor="#FFFFFF"
              />
            </View>

            {form.weeklySummary.enabled && (
              <View style={styles.cardBody}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <ReminderTimePicker
                  label="Summary Delivery Time"
                  time={form.weeklySummary.time || '18:00'}
                  onChangeTime={(t) => {
                    updateField('weeklySummary', { ...form.weeklySummary, time: t });
                  }}
                />
              </View>
            )}
          </AppCard>

          {/* 7. Quiet Hours */}
          <QuietHoursSelector
            quietHours={form.quietHours}
            onChange={(qh) => updateField('quietHours', qh)}
          />

          {/* Timezone Info */}
          <View style={styles.timezoneInfo}>
            <AppIcon name="compass" size={14} color={colors.textSecondary} />
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Reminders calculated in your local timezone ({form.timezone || 'UTC'})
            </AppText>
          </View>
        </>
      )}

      {/* Save Action Button */}
      <View style={styles.buttonWrapper}>
        <AppButton
          title={isSaving ? 'Saving Changes...' : 'Save Preferences'}
          variant="primary"
          size="md"
          fullWidth
          disabled={!hasUnsavedChanges || isSaving}
          onPress={handleSave}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  permissionBanner: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  masterCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  fieldLabel: {
    marginTop: 8,
    marginBottom: 2,
  },
  timezoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonWrapper: {
    marginTop: 8,
    marginBottom: 20,
  },
});

