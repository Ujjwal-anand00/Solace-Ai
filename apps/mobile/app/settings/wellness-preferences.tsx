import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { useUserProfile, useUpdatePreferences } from '../../src/hooks/useProfile';

export default function WellnessPreferencesScreen() {
  const router = useRouter();
  const { data: user } = useUserProfile();
  const updateMutation = useUpdatePreferences();

  const allGoals = [
    { id: 'understand_emotions', label: 'Understand my emotions', icon: '🌊' },
    { id: 'manage_stress', label: 'Manage stress & overwhelm', icon: '🌿' },
    { id: 'improve_sleep', label: 'Improve sleep routine', icon: '🌙' },
    { id: 'self_confidence', label: 'Improve self-confidence', icon: '✨' },
    { id: 'mindfulness', label: 'Practice daily mindfulness', icon: '🕊️' },
    { id: 'daily_habits', label: 'Build positive daily habits', icon: '🌱' },
    { id: 'express_thoughts', label: 'Express my inner thoughts', icon: '✍️' },
    { id: 'emotional_balance', label: 'Build lasting emotional balance', icon: '⚖️' },
  ];

  const currentPrefs = user?.wellnessPreferences || {
    goals: user?.wellnessGoals || [],
    preferredActivityDurationMinutes: 10,
    preferredCategories: ['breathing', 'mindfulness'],
    preferredDailyTime: '09:00',
    reminderDays: [1, 2, 3, 4, 5],
  };

  const [selectedGoals, setSelectedGoals] = useState<string[]>(
    currentPrefs.goals && currentPrefs.goals.length > 0
      ? currentPrefs.goals
      : user?.wellnessGoals || [],
  );

  const [duration, setDuration] = useState<number>(
    currentPrefs.preferredActivityDurationMinutes || 10,
  );

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    currentPrefs.preferredCategories || ['breathing', 'mindfulness'],
  );

  const toggleGoal = (id: string) => {
    triggerHaptic.selection();
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const toggleCategory = (cat: string) => {
    triggerHaptic.selection();
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSave = async () => {
    triggerHaptic.medium();
    try {
      await updateMutation.mutateAsync({
        wellnessPreferences: {
          goals: selectedGoals,
          preferredActivityDurationMinutes: duration,
          preferredCategories: selectedCategories,
        },
      });
      triggerHaptic.success();
      Alert.alert('Saved', 'Your wellness routine preferences have been updated.');
      router.back();
    } catch {
      Alert.alert('Error', 'Unable to update wellness preferences.');
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
        <Text style={styles.headerTitle}>Wellness Preferences</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveBtn}
          disabled={updateMutation.isPending}
        >
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Wellness Goals */}
        <Text style={styles.sectionTitle}>Focus Areas & Goals</Text>
        <Text style={styles.sectionSubtitle}>
          Select the areas you wish to prioritize. These guide your daily recommendations.
        </Text>

        <View style={styles.goalsWrap}>
          {allGoals.map((g) => {
            const isSelected = selectedGoals.includes(g.id);
            return (
              <TouchableOpacity
                key={g.id}
                style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                onPress={() => toggleGoal(g.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.goalIcon}>{g.icon}</Text>
                <Text style={[styles.goalLabel, isSelected && styles.goalLabelSelected]}>
                  {g.label}
                </Text>
                <Text style={styles.goalCheck}>{isSelected ? '✓' : '+'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Duration Preference */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Activity Duration</Text>
        <Text style={styles.sectionSubtitle}>Preferred time per mindfulness session:</Text>

        <View style={styles.durationRow}>
          {[5, 10, 15, 20].map((mins) => {
            const isSelected = duration === mins;
            return (
              <TouchableOpacity
                key={mins}
                style={[styles.durationPill, isSelected && styles.durationPillSelected]}
                onPress={() => {
                  triggerHaptic.selection();
                  setDuration(mins);
                }}
              >
                <Text
                  style={[styles.durationText, isSelected && styles.durationTextSelected]}
                >
                  {mins} min
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Categories Preference */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Preferred Practice Types</Text>
        <View style={styles.catGrid}>
          {['breathing', 'mindfulness', 'reflection', 'grounding'].map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catCard, isSelected && styles.catCardSelected]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={[styles.catText, isSelected && styles.catTextSelected]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
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
  goalsWrap: {
    gap: 8,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  goalCardSelected: {
    backgroundColor: '#F0F5F1',
    borderColor: colors.sage,
  },
  goalIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  goalLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  goalLabelSelected: {
    fontWeight: '700',
    color: colors.sageDark,
  },
  goalCheck: {
    fontSize: 16,
    color: colors.sageDark,
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  durationPill: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  durationPillSelected: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  durationText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  durationTextSelected: {
    color: colors.white,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catCard: {
    width: '48%',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  catCardSelected: {
    backgroundColor: colors.sageLight,
    borderColor: colors.sage,
  },
  catText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  catTextSelected: {
    color: colors.textPrimary,
  },
});

