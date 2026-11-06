import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { companionService } from '../../src/services/api/companionService';
import { CompanionSettings } from '@solace/shared';

export default function AISettingsScreen() {
  const router = useRouter();
  const [, setSettings] = useState<CompanionSettings | null>(null);
  const [tone, setTone] = useState<'gentle' | 'balanced' | 'direct'>('balanced');
  const [enablePersonalization, setEnablePersonalization] = useState(true);
  const [journalConsent, setJournalConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    companionService.getSettings().then((s) => {
      setSettings(s);
      setTone(s.preferredTone || 'balanced');
      setEnablePersonalization(s.enablePersonalization ?? true);
      setJournalConsent(s.journalPersonalizationConsent ?? false);
    });
  }, []);

  const handleSave = async () => {
    triggerHaptic.medium();
    setIsSaving(true);
    try {
      await companionService.updateSettings({
        preferredTone: tone,
        enablePersonalization,
        journalPersonalizationConsent: journalConsent,
      });
      triggerHaptic.success();
      Alert.alert('Saved', 'AI Companion preferences updated successfully.');
      router.back();
    } catch {
      Alert.alert('Error', 'Unable to update companion preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const tones: Array<{ id: 'gentle' | 'balanced' | 'direct'; label: string; desc: string }> = [
    {
      id: 'gentle',
      label: 'Gentle & Soft',
      desc: 'Exceptionally soothing, deeply affirming, and spacious.',
    },
    {
      id: 'balanced',
      label: 'Warm & Balanced',
      desc: 'Grounding reflection combined with gentle mindfulness.',
    },
    {
      id: 'direct',
      label: 'Clear & Direct',
      desc: 'Action-oriented, structured, and focused on practical clarity.',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Companion Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={isSaving}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Personality Tone */}
        <Text style={styles.sectionTitle}>Response Tone Style</Text>
        <Text style={styles.sectionSubtitle}>
          Choose how Solace responds during your sanctuary conversations.
        </Text>

        <View style={styles.toneList}>
          {tones.map((t) => {
            const isSelected = tone === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.toneCard, isSelected && styles.toneCardSelected]}
                onPress={() => {
                  triggerHaptic.selection();
                  setTone(t.id);
                }}
              >
                <View style={styles.toneTop}>
                  <Text style={[styles.toneLabel, isSelected && styles.toneLabelSelected]}>
                    {t.label}
                  </Text>
                  <Text style={styles.toneRadio}>{isSelected ? '◉' : '○'}</Text>
                </View>
                <Text style={styles.toneDesc}>{t.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Personalization Controls */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Context & Personalization</Text>

        <View style={styles.switchCard}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.switchTitle}>Enable AI Personalization</Text>
              <Text style={styles.switchSubtitle}>
                Allows Solace to remember your recent mood check-ins and active wellness plans.
              </Text>
            </View>
            <Switch
              value={enablePersonalization}
              onValueChange={(val) => {
                triggerHaptic.selection();
                setEnablePersonalization(val);
              }}
              trackColor={{ false: '#D1D5DB', true: colors.sage }}
            />
          </View>
        </View>

        {/* Journal Consent (Strict Independent Control) */}
        <View style={[styles.switchCard, { marginTop: 12 }]}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.switchTitle}>Journal Context Consent</Text>
              <Text style={styles.switchSubtitle}>
                Allow Solace companion to reference themes from your journal reflections. Always
                disabled by default.
              </Text>
            </View>
            <Switch
              value={journalConsent}
              onValueChange={(val) => {
                triggerHaptic.medium();
                setJournalConsent(val);
              }}
              trackColor={{ false: '#D1D5DB', true: colors.sage }}
            />
          </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  backBtn: {
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
  saveBtn: {
    backgroundColor: colors.sage,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  toneList: {
    gap: 10,
  },
  toneCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  toneCardSelected: {
    backgroundColor: '#F0F5F1',
    borderColor: colors.sage,
  },
  toneTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  toneLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toneLabelSelected: {
    color: colors.sageDark,
  },
  toneRadio: {
    fontSize: 16,
    color: colors.sageDark,
  },
  toneDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  switchCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

