import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
} from 'react-native';
import {
  AppHeading,
  AppText,
  AppIcon,
  AppButton,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useCompanionSettings, useUpdateCompanionSettings } from '../../../hooks/useCompanion';
import { triggerHaptic } from '../../../utils/haptics';

interface CompanionSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CompanionSettingsModal: React.FC<CompanionSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();
  const { data: settings, isLoading } = useCompanionSettings();
  const updateSettingsMutation = useUpdateCompanionSettings();

  const [enablePersonalization, setEnablePersonalization] = useState(true);
  const [journalConsent, setJournalConsent] = useState(false);
  const [preferredTone, setPreferredTone] = useState<'gentle' | 'balanced' | 'direct'>('balanced');

  useEffect(() => {
    if (settings) {
      setEnablePersonalization(settings.enablePersonalization);
      setJournalConsent(settings.journalPersonalizationConsent);
      setPreferredTone(settings.preferredTone);
    }
  }, [settings]);

  const handleSave = async () => {
    triggerHaptic.selection();
    try {
      await updateSettingsMutation.mutateAsync({
        enablePersonalization,
        journalPersonalizationConsent: journalConsent,
        preferredTone,
      });
      onClose();
    } catch {
      // Handled by react query
    }
  };

  const tones: Array<{
    key: 'gentle' | 'balanced' | 'direct';
    title: string;
    desc: string;
  }> = [
    {
      key: 'gentle',
      title: 'Gentle',
      desc: 'Soothing, soft, patient, giving ample space to feel.',
    },
    {
      key: 'balanced',
      title: 'Balanced',
      desc: 'Warm, thoughtful, emotionally grounding, and conversational.',
    },
    {
      key: 'direct',
      title: 'Direct',
      desc: 'Caring, structured, clear, and solution-focused.',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: colors.border }]}>
            <View style={styles.titleWithIcon}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="settings" size={18} color={colors.primaryDark} />
              </View>
              <AppHeading level="h4" style={styles.modalTitle}>
                Companion Settings
              </AppHeading>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceVariant }]}
              accessibilityLabel="Close settings"
            >
              <AppIcon name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Privacy notice banner */}
            <View style={[styles.privacyNotice, { backgroundColor: colors.surfaceVariant }]}>
              <AppIcon name="shield" size={16} color={colors.primaryDark} />
              <AppText
                variant="caption"
                style={[styles.privacyNoticeText, { color: colors.textSecondary }]}
              >
                Your reflections and emotions are sacred. Your conversations are private and never used to train global models.
              </AppText>
            </View>

            {/* Section: Personalization */}
            <View style={styles.section}>
              <AppText variant="caption" style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                PERSONALIZATION & CONTEXT
              </AppText>

              <View style={[styles.settingRow, { borderColor: colors.border }]}>
                <View style={styles.settingTexts}>
                  <AppText variant="bodyMedium" style={styles.settingLabel}>
                    Tailored Wellness Context
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.textSecondary }}>
                    Allow Solace to reference your wellness goals and recent mood check-ins for tailored reflections.
                  </AppText>
                </View>
                <Switch
                  value={enablePersonalization}
                  onValueChange={(val) => {
                    triggerHaptic.selection();
                    setEnablePersonalization(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                />
              </View>

              <View style={[styles.settingRow, { borderColor: colors.border }]}>
                <View style={styles.settingTexts}>
                  <AppText variant="bodyMedium" style={styles.settingLabel}>
                    Journal Themes Sharing
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.textSecondary }}>
                    Allow Solace to consider high-level journal tags and topics to understand your journey better.
                  </AppText>
                </View>
                <Switch
                  value={journalConsent}
                  onValueChange={(val) => {
                    triggerHaptic.selection();
                    setJournalConsent(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={Platform.OS === 'android' ? '#FFFFFF' : undefined}
                />
              </View>
            </View>

            {/* Section: Tone Preference */}
            <View style={styles.section}>
              <AppText variant="caption" style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                PREFERRED CONVERSATIONAL TONE
              </AppText>

              <View style={styles.toneOptions}>
                {tones.map((t) => {
                  const isSelected = preferredTone === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[
                        styles.toneCard,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                          borderColor: isSelected ? colors.primaryDark : colors.border,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic.selection();
                        setPreferredTone(t.key);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.toneCardHeader}>
                        <AppText
                          variant="bodyMedium"
                          style={[
                            styles.toneTitle,
                            { color: isSelected ? colors.primaryDark : colors.textPrimary },
                          ]}
                        >
                          {t.title}
                        </AppText>
                        {isSelected && (
                          <AppIcon name="check" size={16} color={colors.primaryDark} />
                        )}
                      </View>
                      <AppText variant="caption" style={{ color: colors.textSecondary }}>
                        {t.desc}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Save Button */}
          <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
            <AppButton
              title={updateSettingsMutation.isPending ? 'Saving...' : 'Save Preferences'}
              onPress={handleSave}
              variant="primary"
              size="lg"
              fullWidth
              loading={updateSettingsMutation.isPending || isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 14,
  },
  privacyNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  section: {
    gap: 10,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  settingTexts: {
    flex: 1,
    gap: 4,
  },
  settingLabel: {
    fontWeight: '600',
  },
  toneOptions: {
    gap: 10,
  },
  toneCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 4,
  },
  toneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toneTitle: {
    fontWeight: '700',
  },
  footerRow: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
