import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  PrimaryButton,
  OutlineButton,
  GhostButton,
  SolaceLogo,
  SolaceMascot,
  AppBadge,
  AppCard,
  AppIcon,
  AppDivider,
} from '../../src/components/ui';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

export default function AuthEntryScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    selectedWellnessGoals,
    notificationPreference,
    resetOnboarding,
  } = useOnboardingStore();

  const handleResetOnboarding = async () => {
    triggerHaptic.medium();
    await resetOnboarding();
    Alert.alert('Onboarding Reset', 'Onboarding has been reset. Returning to the welcome screen.', [
      { text: 'OK', onPress: () => router.replace('/(onboarding)/welcome') },
    ]);
  };

  const handlePlaceholderAuth = (action: string) => {
    triggerHaptic.light();
    Alert.alert(
      'Authentication Placeholder',
      `${action} will be fully implemented in STEP 04 with secure JWT and bcrypt backend registration.`,
      [{ text: 'Got it' }],
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Branding */}
        <View style={styles.headerBlock}>
          <SolaceLogo size="md" variant="horizontal" />
          <AppBadge label="STEP 04 Entry" variant="lavender" size="sm" />
        </View>

        {/* Mascot Greeting */}
        <View style={styles.mascotWrapper}>
          <SolaceMascot size={110} expression="calm" animationState="breathe" showCushion />
        </View>

        {/* Title & Introduction */}
        <View style={styles.textBlock}>
          <AppHeading level={1} align="center" style={styles.title}>
            Welcome to Solace
          </AppHeading>
          <AppText
            variant="bodyMedium"
            color="textSecondary"
            align="center"
            style={styles.subtitle}
          >
            Your personal mental wellness sanctuary. Sign in to sync your reflections and meet your
            AI companion.
          </AppText>
        </View>

        {/* Summary Card of Completed Onboarding State */}
        <AppCard variant="soft" style={styles.stateCard}>
          <View style={styles.stateCardHeader}>
            <AppIcon name="checkCircle" size="sm" color={colors.primary} />
            <AppText variant="label" style={styles.stateCardTitle}>
              ONBOARDING COMPLETED
            </AppText>
          </View>

          <View style={styles.stateDetails}>
            <View style={styles.stateRow}>
              <AppText variant="bodySmall" color="textSecondary">
                Wellness Focus:
              </AppText>
              <AppBadge
                label={`${selectedWellnessGoals.length} goals selected`}
                variant="mint"
                size="sm"
              />
            </View>

            <View style={styles.stateRow}>
              <AppText variant="bodySmall" color="textSecondary">
                Notifications:
              </AppText>
              <AppBadge
                label={notificationPreference.toUpperCase()}
                variant={notificationPreference === 'enabled' ? 'mint' : 'neutral'}
                size="sm"
              />
            </View>
          </View>
        </AppCard>

        {/* Auth Action Buttons (Placeholders for STEP 04) */}
        <View style={styles.authActions}>
          <PrimaryButton
            title="Create Free Account"
            size="lg"
            fullWidth
            leadingIcon="mail"
            onPress={() => handlePlaceholderAuth('Account Creation')}
          />

          <OutlineButton
            title="Sign In to Existing Account"
            size="lg"
            fullWidth
            onPress={() => handlePlaceholderAuth('Sign In')}
            style={styles.signInBtn}
          />
        </View>

        <AppDivider label="DEVELOPMENT & TESTING CONTROLS" style={styles.divider} />

        {/* Testing Helpers */}
        <View style={styles.testingControls}>
          <OutlineButton
            title="Reset Onboarding & Test Again"
            size="md"
            fullWidth
            leadingIcon="refreshCw"
            onPress={handleResetOnboarding}
            style={styles.resetBtn}
          />

          <GhostButton
            title="Explore Design System (/design-system)"
            size="sm"
            fullWidth
            leadingIcon="sliders"
            onPress={() => router.push('/design-system')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  headerBlock: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  mascotWrapper: {
    marginVertical: 12,
    alignItems: 'center',
  },
  textBlock: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 22,
  },
  stateCard: {
    width: '100%',
    maxWidth: 340,
    padding: 16,
    marginBottom: 24,
  },
  stateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stateCardTitle: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  stateDetails: {
    gap: 8,
  },
  stateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authActions: {
    width: '100%',
    maxWidth: 340,
    gap: 12,
    marginBottom: 16,
  },
  signInBtn: {
    marginTop: 4,
  },
  divider: {
    width: '100%',
    maxWidth: 340,
    marginVertical: 20,
  },
  testingControls: {
    width: '100%',
    maxWidth: 340,
    gap: 10,
  },
  resetBtn: {
    borderColor: '#E2E6DF',
  },
});
