import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  PrimaryButton,
  AppBadge,
} from '../../src/components/ui';
import { CelebrationIllustration } from '../../src/features/onboarding/components';
import { FadeInView } from '../../src/utils/animations';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

export default function CompleteScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const { completeOnboarding } = useOnboardingStore();
  const [isFinishing, setIsFinishing] = useState(false);

  const handleContinue = async () => {
    setIsFinishing(true);
    triggerHaptic.success();

    // Mark onboarding as completed in AsyncStorage
    await completeOnboarding();

    // Navigate to authentication entry placeholder
    router.replace('/(auth)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Celebration Badge */}
        <FadeInView delay={100} style={styles.badgeWrapper}>
          <AppBadge label="You're All Set" variant="mint" size="md" />
        </FadeInView>

        {/* Mascot Celebration Illustration */}
        <FadeInView delay={250} style={styles.illustrationWrapper}>
          <CelebrationIllustration size={280} />
        </FadeInView>

        {/* Text Section */}
        <FadeInView delay={400} style={styles.textSection}>
          <AppHeading level="displayMedium" align="center" style={styles.heading}>
            Your journey starts here.
          </AppHeading>

          <AppText
            variant="bodyLarge"
            color="textSecondary"
            align="center"
            style={styles.description}
          >
            Small moments of care can make a meaningful difference. Solace is here whenever you need
            a little space for yourself.
          </AppText>

          {/* Three Trust Pillars */}
          <View style={styles.pillarsRow}>
            <AppBadge label="100% Private" variant="neutral" size="sm" />
            <AppBadge label="Personalized" variant="neutral" size="sm" />
            <AppBadge label="At Your Pace" variant="neutral" size="sm" />
          </View>
        </FadeInView>

        {/* Action Button */}
        <FadeInView delay={550} style={styles.actionSection}>
          <PrimaryButton
            title="Begin Your Experience"
            size="lg"
            fullWidth
            trailingIcon="arrowRight"
            loading={isFinishing}
            onPress={handleContinue}
            style={styles.continueBtn}
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
    paddingTop: 20,
    paddingBottom: 28,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  illustrationWrapper: {
    marginVertical: 14,
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
  description: {
    lineHeight: 25,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  actionSection: {
    width: '100%',
    maxWidth: 340,
  },
  continueBtn: {
    shadowColor: '#CBB3E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
});
