import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  PrimaryButton,
  GhostButton,
  SolaceLogo,
  AppBadge,
} from '../../src/components/ui';
import { WelcomeIllustration } from '../../src/features/onboarding/components/OnboardingIllustrations';
import { FadeInView } from '../../src/utils/animations';
import { useTheme } from '../../src/hooks/useTheme';

export default function WelcomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();

  const handleGetStarted = () => {
    router.push('/(onboarding)/introduction');
  };

  const handleLogin = () => {
    router.push('/(auth)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Brand Header */}
        <FadeInView delay={100} style={styles.headerBlock}>
          <SolaceLogo size="sm" variant="horizontal" />
          <AppBadge label="Mental Wellness" variant="mint" size="sm" />
        </FadeInView>

        {/* Center Illustration */}
        <FadeInView delay={250} style={styles.illustrationWrapper}>
          <WelcomeIllustration size={280} />
        </FadeInView>

        {/* Content Section */}
        <FadeInView delay={400} style={styles.textSection}>
          <AppHeading level="displayMedium" align="center" style={styles.heading}>
            Make space for yourself.
          </AppHeading>

          <AppText
            variant="bodyLarge"
            color="textSecondary"
            align="center"
            style={styles.supportingText}
          >
            Understand your emotions, find your balance, and take small steps toward a healthier you.
          </AppText>
        </FadeInView>

        {/* Action Buttons */}
        <FadeInView delay={550} style={styles.actionSection}>
          <PrimaryButton
            title="Get Started"
            size="lg"
            fullWidth
            trailingIcon="arrowRight"
            onPress={handleGetStarted}
            style={styles.getStartedButton}
          />

          <GhostButton
            title="Already have an account? Log in"
            size="md"
            fullWidth
            onPress={handleLogin}
          />
        </FadeInView>
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
    paddingBottom: 28,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBlock: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  illustrationWrapper: {
    marginVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSection: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    marginBottom: 28,
  },
  heading: {
    marginBottom: 12,
    lineHeight: 38,
  },
  supportingText: {
    lineHeight: 25,
    paddingHorizontal: 8,
  },
  actionSection: {
    width: '100%',
    maxWidth: 340,
    gap: 8,
  },
  getStartedButton: {
    shadowColor: '#829B83',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
});
