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
  AppIcon,
} from '../../src/components/ui';
import { FadeInView } from '../../src/utils/animations';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

export default function AuthLandingScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();

  const handleSignIn = () => {
    triggerHaptic.light();
    router.push('/(auth)/login');
  };

  const handleSignUp = () => {
    triggerHaptic.medium();
    router.push('/(auth)/sign-up');
  };

  const handleShowTerms = () => {
    Alert.alert(
      'Terms & Privacy Commitment',
      'Solace AI is committed to your privacy. Your reflections, journal entries, and personal wellness conversations are confidential, encrypted, and never sold to third parties.',
      [{ text: 'Understood' }],
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header Logo */}
        <FadeInView delay={100} style={styles.headerBlock}>
          <SolaceLogo size="sm" variant="horizontal" />
          <AppBadge label="Private Sanctuary" variant="mint" size="sm" />
        </FadeInView>

        {/* Mascot Centerpiece */}
        <FadeInView delay={250} style={styles.mascotWrapper}>
          <SolaceMascot size={130} expression="calm" animationState="breathe" showCushion />
        </FadeInView>

        {/* Text Section */}
        <FadeInView delay={400} style={styles.textSection}>
          <AppHeading level={1} align="center" style={styles.heading}>
            A little space, just for you.
          </AppHeading>

          <AppText
            variant="bodyLarge"
            color="textSecondary"
            align="center"
            style={styles.description}
          >
            Your safe sanctuary to understand emotions, find peace, and grow alongside an AI
            companion who truly listens.
          </AppText>

          {/* Privacy Guarantee Chip */}
          <View style={styles.privacyBadge}>
            <AppIcon name="shield" size="xs" color={colors.primary} />
            <AppText variant="caption" color="textSecondary" style={styles.privacyText}>
              100% Confidential • End-to-End Protected
            </AppText>
          </View>
        </FadeInView>

        {/* Action Buttons */}
        <FadeInView delay={550} style={styles.actionSection}>
          <PrimaryButton
            title="Continue with Email"
            size="lg"
            fullWidth
            leadingIcon="mail"
            onPress={handleSignIn}
            style={styles.primaryBtn}
          />

          <OutlineButton
            title="Create an Account"
            size="lg"
            fullWidth
            onPress={handleSignUp}
            style={styles.outlineBtn}
          />

          {/* Terms and Privacy Footer */}
          <View style={styles.footerTerms}>
            <AppText variant="caption" color="textMuted" align="center">
              By continuing, you agree to Solace AI’s{' '}
            </AppText>
            <GhostButton
              title="Terms & Privacy Policy"
              size="sm"
              onPress={handleShowTerms}
              style={styles.termsButton}
            />
          </View>
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
    marginBottom: 8,
  },
  mascotWrapper: {
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  description: {
    lineHeight: 25,
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(203, 179, 232, 0.18)',
  },
  privacyText: {
    fontWeight: '600',
  },
  actionSection: {
    width: '100%',
    maxWidth: 340,
    gap: 12,
  },
  primaryBtn: {
    shadowColor: '#CBB3E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  outlineBtn: {
    marginTop: 2,
  },
  footerTerms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  termsButton: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
