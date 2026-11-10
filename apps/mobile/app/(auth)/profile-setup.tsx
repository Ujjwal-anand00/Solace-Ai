import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppInput,
  PrimaryButton,
  GhostButton,
  AppIcon,
  AppBadge,
} from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

const AVATAR_OPTIONS = [
  { id: 'lavender_bloom', name: 'Lavender Calm', bg: '#CBB3E8', icon: 'smile' as const },
  { id: 'neon_vitality', name: 'Neon Spark', bg: '#D4FF3F', icon: 'sparkles' as const },
  { id: 'dawn_peach', name: 'Dawn Glow', bg: '#F5DFD2', icon: 'sun' as const },
  { id: 'spirit_lavender', name: 'Dream Aura', bg: '#E8DDF5', icon: 'moon' as const },
  { id: 'soft_balance', name: 'Gentle Feather', bg: '#F0EAF7', icon: 'feather' as const },
  { id: 'deep_lavender', name: 'Deep Balance', bg: '#9678BD', icon: 'heart' as const },
];

const AVAILABLE_GOALS = [
  { id: 'emotions', label: 'Understand emotions' },
  { id: 'stress', label: 'Manage stress' },
  { id: 'sleep', label: 'Improve sleep' },
  { id: 'confidence', label: 'Self-confidence' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'habits', label: 'Healthy habits' },
  { id: 'thoughts', label: 'Express thoughts' },
  { id: 'balance', label: 'Emotional balance' },
];

export default function ProfileSetupScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark, radius } = useTheme();
  const { user, updateProfile, isLoading } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [preferredName, setPreferredName] = useState(user?.preferredName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || AVATAR_OPTIONS[0].id);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(user?.wellnessGoals || []);
  const [dateOfBirth, setDateOfBirth] = useState('');

  const toggleGoal = (id: string) => {
    triggerHaptic.light();
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const handleSelectAvatar = (avatarId: string) => {
    triggerHaptic.light();
    setSelectedAvatar(avatarId);
  };

  const handleCompleteSetup = async () => {
    triggerHaptic.medium();

    try {
      await updateProfile({
        name: name.trim() || user?.name,
        preferredName: preferredName.trim() || undefined,
        avatarUrl: selectedAvatar,
        wellnessGoals: selectedGoals,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : undefined,
      });

      triggerHaptic.success();
      router.replace('/(home)');
    } catch {
      // If error occurs, still proceed to home to keep UX smooth
      router.replace('/(home)');
    }
  };

  const handleSkipForNow = () => {
    triggerHaptic.light();
    router.replace('/(home)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerBlock}>
            <AppBadge label="Profile Personalization" variant="mint" size="sm" />
            <AppHeading level={1} style={styles.heading}>
              Personalize your sanctuary
            </AppHeading>
            <AppText variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
              Help Solace understand how you prefer to be addressed. All fields are customizable
              anytime.
            </AppText>
          </View>

          {/* Avatar Selector */}
          <View style={styles.section}>
            <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
              CHOOSE YOUR COMPANION AVATAR
            </AppText>

            <View style={styles.avatarGrid}>
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = selectedAvatar === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelectAvatar(item.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.avatarItem,
                      {
                        backgroundColor: item.bg,
                        borderColor: isSelected ? colors.primaryDark : 'transparent',
                        borderWidth: isSelected ? 3 : 1,
                      },
                    ]}
                  >
                    <AppIcon name={item.icon} size="md" color="#292431" />
                    {isSelected && (
                      <View style={[styles.avatarBadge, { backgroundColor: colors.primaryDark }]}>
                        <AppIcon name="check" size={10} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Name & Preferred Name */}
          <View style={styles.section}>
            <AppInput
              label="Full name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <AppInput
              label="Preferred name or nickname (Optional)"
              placeholder="What should Solace call you?"
              value={preferredName}
              onChangeText={setPreferredName}
              autoCapitalize="words"
              helperText="Used in gentle daily greetings and companion conversations."
            />
          </View>

          {/* Wellness Goals */}
          <View style={styles.section}>
            <View style={styles.goalsHeader}>
              <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
                YOUR WELLNESS FOCUS
              </AppText>
              <AppText variant="caption" color="textMuted">
                {selectedGoals.length} selected
              </AppText>
            </View>

            <View style={styles.chipsRow}>
              {AVAILABLE_GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => toggleGoal(goal.id)}
                    activeOpacity={0.75}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(203, 179, 232, 0.3)'
                            : colors.accent
                          : isDark
                            ? colors.surface
                            : colors.surfaceSecondary,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.full,
                      },
                    ]}
                  >
                    {isSelected && (
                      <AppIcon name="check" size={12} color={colors.primaryDark} strokeWidth={2.8} />
                    )}
                    <AppText
                      variant="bodySmall"
                      style={{
                        fontWeight: isSelected ? '600' : '400',
                        color: isSelected ? colors.primaryDark : colors.textPrimary,
                      }}
                    >
                      {goal.label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Optional Birthday (Non-invasive) */}
          <View style={styles.section}>
            <AppInput
              label="Date of birth (Optional)"
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              leadingIcon="calendar"
              helperText="Helps us tailor mindful age-appropriate self-care recommendations."
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <PrimaryButton
              title="Enter Sanctuary"
              size="lg"
              fullWidth
              loading={isLoading}
              trailingIcon="arrowRight"
              onPress={handleCompleteSetup}
              style={styles.submitBtn}
            />

            <GhostButton
              title="Skip for now"
              size="md"
              fullWidth
              onPress={handleSkipForNow}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerBlock: {
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  heading: {
    marginTop: 10,
    marginBottom: 8,
    lineHeight: 34,
  },
  subtitle: {
    lineHeight: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 10,
    letterSpacing: 0.8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  actions: {
    marginTop: 10,
    gap: 10,
  },
  submitBtn: {
    shadowColor: '#CBB3E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
});
