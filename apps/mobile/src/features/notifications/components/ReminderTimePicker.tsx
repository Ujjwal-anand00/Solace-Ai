import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import {
  AppCard,
  AppText,
  AppButton,
  AppIcon,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface ReminderTimePickerProps {
  time: string; // "HH:mm"
  onChangeTime: (time: string) => void;
  label?: string;
}

const PRESETS = [
  { label: 'Morning', time: '09:00' },
  { label: 'Midday', time: '13:00' },
  { label: 'Evening', time: '19:00' },
  { label: 'Night', time: '21:30' },
];

export const ReminderTimePicker: React.FC<ReminderTimePickerProps> = ({
  time,
  onChangeTime,
  label = 'Preferred Time',
}) => {
  const { colors, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const [hoursStr, minsStr] = (time || '09:00').split(':');
  const [tempHours, setTempHours] = useState(parseInt(hoursStr, 10) || 9);
  const [tempMins, setTempMins] = useState(parseInt(minsStr, 10) || 0);

  const format12Hour = (h: number, m: number): string => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = String(m).padStart(2, '0');
    return `${displayHour}:${displayMin} ${period}`;
  };

  const handleOpen = () => {
    triggerHaptic.light();
    const [h, mi] = (time || '09:00').split(':');
    setTempHours(parseInt(h, 10) || 9);
    setTempMins(parseInt(mi, 10) || 0);
    setModalVisible(true);
  };

  const handleSave = () => {
    triggerHaptic.light();
    const formatted = `${String(tempHours).padStart(2, '0')}:${String(tempMins).padStart(2, '0')}`;
    onChangeTime(formatted);
    setModalVisible(false);
  };

  const adjustHours = (delta: number) => {
    triggerHaptic.selection();
    setTempHours((prev) => (prev + delta + 24) % 24);
  };

  const adjustMins = (delta: number) => {
    triggerHaptic.selection();
    setTempMins((prev) => (prev + delta + 60) % 60);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppText variant="caption" style={{ color: colors.textSecondary }}>
          {label}
        </AppText>
        <TouchableOpacity
          onPress={handleOpen}
          style={[
            styles.timeBadge,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#F0EAF7',
              borderColor: '#E8DDF5',
            },
          ]}
        >
          <AppIcon name="clock" size={14} color={colors.primaryDark} />
          <AppText
            variant="bodySmall"
            style={{ fontWeight: '700', color: colors.primaryDark }}
          >
            {format12Hour(parseInt(hoursStr, 10) || 9, parseInt(minsStr, 10) || 0)}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Quick Presets */}
      <View style={styles.presetsRow}>
        {PRESETS.map((preset) => {
          const isSelected = preset.time === time;
          return (
            <TouchableOpacity
              key={preset.time}
              onPress={() => {
                triggerHaptic.selection();
                onChangeTime(preset.time);
              }}
              style={[
                styles.presetPill,
                {
                  backgroundColor: isSelected
                    ? colors.accent
                    : isDark
                    ? colors.surfaceSecondary
                    : '#FFFFFF',
                  borderColor: isSelected ? colors.accentDark : colors.border,
                },
              ]}
            >
              <AppText
                variant="caption"
                style={{
                  color: isSelected ? '#292431' : colors.textSecondary,
                  fontWeight: isSelected ? '700' : '500',
                  fontSize: 11,
                }}
              >
                {preset.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Custom Stepper Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />

          <AppCard
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <AppText variant="bodyMedium" style={styles.modalTitle}>
              Select Reminder Time
            </AppText>

            <View style={styles.pickerRow}>
              {/* Hours Stepper */}
              <View style={styles.stepperCol}>
                <TouchableOpacity
                  onPress={() => adjustHours(1)}
                  style={styles.stepBtn}
                >
                  <AppIcon name="chevronUp" size={20} color={colors.text} />
                </TouchableOpacity>
                <AppText style={styles.timeVal}>
                  {String(tempHours).padStart(2, '0')}
                </AppText>
                <TouchableOpacity
                  onPress={() => adjustHours(-1)}
                  style={styles.stepBtn}
                >
                  <AppIcon name="chevronDown" size={20} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Hour
                </AppText>
              </View>

              <AppText style={styles.colon}>:</AppText>

              {/* Minutes Stepper */}
              <View style={styles.stepperCol}>
                <TouchableOpacity
                  onPress={() => adjustMins(5)}
                  style={styles.stepBtn}
                >
                  <AppIcon name="chevronUp" size={20} color={colors.text} />
                </TouchableOpacity>
                <AppText style={styles.timeVal}>
                  {String(tempMins).padStart(2, '0')}
                </AppText>
                <TouchableOpacity
                  onPress={() => adjustMins(-5)}
                  style={styles.stepBtn}
                >
                  <AppIcon name="chevronDown" size={20} color={colors.text} />
                </TouchableOpacity>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Minute
                </AppText>
              </View>
            </View>

            <AppText
              variant="bodySmall"
              style={[styles.previewText, { color: colors.primary }]}
            >
              {format12Hour(tempHours, tempMins)}
            </AppText>

            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="outline"
                size="sm"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1 }}
              />
              <AppButton
                title="Confirm"
                variant="primary"
                size="sm"
                onPress={handleSave}
                style={{ flex: 1 }}
              />
            </View>
          </AppCard>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  presetPill: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: '700',
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  stepperCol: {
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    padding: 8,
  },
  timeVal: {
    fontSize: 28,
    fontWeight: '800',
  },
  colon: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  previewText: {
    fontWeight: '700',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
});

