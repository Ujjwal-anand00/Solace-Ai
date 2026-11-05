import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  PrimaryButton,
  GhostButton,
  AppIcon,
  AppBadge,
} from '../../src/components/ui';
import { PreferenceCard, PreferenceOption } from '../../src/features/onboarding/components';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

const WELLNESS_PREFERENCES: PreferenceOption[] = [
  {
    id: 'emotions',
    title: 'Understand my emotions',
    description: 'Gain clarity on daily mood patterns and emotional triggers.',
    icon: 'heart',
  },
  {
    id: 'stress',
    title: 'Manage everyday stress',
    description: 'Find calm and grounding during demanding moments.',
    icon: 'feather',
  },
  {
    id: 'sleep',
    title: 'Improve my sleep routine',
    description: 'Relax deeply in the evening and wake up refreshed.',
    icon: 'moon',
  },
  {
    id: 'confidence',
    title: 'Build self-confidence',
    description: 'Cultivate self-worth, courage, and daily kindness.',
    icon: 'sparkles',
  },
  {
    id: 'mindfulness',
    title: 'Practice mindfulness',
    description: 'Stay present through guided breathing and pause breaks.',
    icon: 'sun',
  },
  {
    id: 'habits',
    title: 'Improve my daily habits',
    description: 'Create small, achievable self-care rituals.',
    icon: 'calendar',
  },
  {
    id: 'thoughts',
    title: 'Express my thoughts',
    description: 'Reflect safely in your private, judgment-free journal.',
    icon: 'smile',
  },
  {
    id: 'balance',
    title: 'Build emotional balance',
    description: 'Navigate life changes with inner resilience and peace.',
    icon: 'compass',
  },
];

export default function PreferencesScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const { selectedWellnessGoals, toggleWellnessGoal } = useOnboardingStore();

  const handleContinue = () => {
    triggerHaptic.medium();
    router.push('/(onboarding)/notifications');
  };

  const handleSkip = () => {
    triggerHaptic.light();
    router.push('/(onboarding)/notifications');
  };

  const handleBack = () => {
    router.back();
  };

  const selectedCount = selectedWellnessGoals.length;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <AppIcon name="chevronLeft" size="md" color={colors.textPrimary} />
        </TouchableOpacity>

        {selectedCount > 0 ? (
          <AppBadge
            label={`${selectedCount} selected`}
            variant="mint"
            size="sm"
          />
        ) : (
          <GhostButton
            title="Skip"
            size="sm"
            onPress={handleSkip}
            accessibilityLabel="Skip preferences"
          />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Header */}
        <View style={styles.headerBlock}>
          <AppHeading level={1} style={styles.heading}>
            How can Solace support you?
          </AppHeading>
          <AppText variant="bodyLarge" color="textSecondary" style={styles.description}>
            Choose what matters most to you. You can always change these preferences later.
          </AppText>
        </View>

        {/* 8 Wellness Cards List */}
        <View style={styles.cardsList}>
          {WELLNESS_PREFERENCES.map((option) => (
            <PreferenceCard
              key={option.id}
              option={option}
              isSelected={selectedWellnessGoals.includes(option.id)}
              onToggle={toggleWellnessGoal}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { borderTopColor: colors.border }]}>
        <PrimaryButton
          title={selectedCount > 0 ? `Continue (${selectedCount})` : 'Continue'}
          size="lg"
          fullWidth
          trailingIcon="arrowRight"
          onPress={handleContinue}
          style={styles.continueBtn}
        />

        {selectedCount > 0 && (
          <GhostButton
            title="Skip for now"
            size="sm"
            onPress={handleSkip}
            style={styles.skipBtn}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerBlock: {
    marginBottom: 20,
  },
  heading: {
    marginBottom: 8,
    lineHeight: 34,
  },
  description: {
    lineHeight: 24,
  },
  cardsList: {
    gap: 2,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  continueBtn: {
    maxWidth: 360,
  },
  skipBtn: {
    marginTop: 6,
  },
});
