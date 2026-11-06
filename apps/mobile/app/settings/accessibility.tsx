import { useState } from 'react';
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
import { useUserProfile, useUpdatePreferences } from '../../src/hooks/useProfile';

export default function AccessibilityScreen() {
  const router = useRouter();
  const { data: user } = useUserProfile();
  const updateMutation = useUpdatePreferences();

  const currentPrefs = user?.accessibilityPreferences || {
    reduceMotion: false,
    highContrast: false,
    hapticFeedback: true,
    fontScale: 1.0,
  };

  const [reduceMotion, setReduceMotion] = useState(currentPrefs.reduceMotion);
  const [highContrast, setHighContrast] = useState(currentPrefs.highContrast);
  const [hapticFeedback, setHapticFeedback] = useState(currentPrefs.hapticFeedback);

  const handleSave = async () => {
    triggerHaptic.medium();
    try {
      await updateMutation.mutateAsync({
        accessibilityPreferences: {
          reduceMotion,
          highContrast,
          hapticFeedback,
          fontScale: 1.0,
        },
      });
      triggerHaptic.success();
      Alert.alert('Saved', 'Accessibility preferences updated successfully.');
      router.back();
    } catch {
      Alert.alert('Error', 'Unable to save accessibility preferences.');
    }
  };

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
        <Text style={styles.headerTitle}>Accessibility</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveBtn}
          disabled={updateMutation.isPending}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Movement & Touch</Text>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.switchTitle}>Reduce Animations & Motion</Text>
              <Text style={styles.switchSubtitle}>
                Substitutes slide animations with soft static transitions.
              </Text>
            </View>
            <Switch
              value={reduceMotion}
              onValueChange={(val) => {
                triggerHaptic.selection();
                setReduceMotion(val);
              }}
              trackColor={{ false: '#D1D5DB', true: colors.sage }}
            />
          </View>
        </View>

        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.switchTitle}>Haptic Feedback</Text>
              <Text style={styles.switchSubtitle}>
                Sensory tactile pulses on key presses and breathing cycles.
              </Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={(val) => {
                triggerHaptic.selection();
                setHapticFeedback(val);
              }}
              trackColor={{ false: '#D1D5DB', true: colors.sage }}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Readability</Text>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.switchTitle}>High Contrast Borders</Text>
              <Text style={styles.switchSubtitle}>
                Darkens dividers and outlines to enhance visual legibility.
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={(val) => {
                triggerHaptic.selection();
                setHighContrast(val);
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
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  card: {
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

