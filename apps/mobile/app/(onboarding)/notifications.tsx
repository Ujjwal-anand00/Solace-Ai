import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  PrimaryButton,
  GhostButton,
  AppIcon,
  AppCard,
} from '../../src/components/ui';
import {
  NotificationPreviewCard,
  NotificationSample,
} from '../../src/features/onboarding/components';
import { notificationService } from '../../src/services/notifications/notificationService';
import { useOnboardingStore } from '../../src/store/onboardingStore';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

const SAMPLES: NotificationSample[] = [
  {
    id: 'sample-01',
    timeTag: '9:00 AM',
    category: 'Daily Mood Check-in',
    title: 'Morning Check-in',
    body: 'How are you feeling this morning? Take 30 seconds to center yourself.',
    icon: 'sun',
    iconBgVariant: 'peach',
  },
  {
    id: 'sample-02',
    timeTag: '2:30 PM',
    category: 'Mindful Breathing',
    title: 'Mindful Breathing Pause',
    body: 'Take a gentle 2-minute breath break to release midday stress.',
    icon: 'feather',
    iconBgVariant: 'mint',
  },
  {
    id: 'sample-03',
    timeTag: '8:30 PM',
    category: 'Personal Affirmation',
    title: 'Evening Reflection',
    body: 'You don’t have to carry everything alone today. Rest gently tonight.',
    icon: 'moon',
    iconBgVariant: 'lavender',
  },
];

export default function NotificationsScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const { setNotificationPreference } = useOnboardingStore();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    triggerHaptic.medium();

    try {
      const result = await notificationService.requestPermission();
      if (result.status === 'granted') {
        await setNotificationPreference('enabled');
        triggerHaptic.success();
      } else if (result.status === 'denied') {
        await setNotificationPreference('denied');
      } else {
        await setNotificationPreference('enabled');
      }
    } catch {
      await setNotificationPreference('skipped');
    } finally {
      setIsRequesting(false);
      router.push('/(onboarding)/complete');
    }
  };

  const handleMaybeLater = async () => {
    triggerHaptic.light();
    await setNotificationPreference('skipped');
    router.push('/(onboarding)/complete');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
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

        <GhostButton
          title="Skip"
          size="sm"
          onPress={handleMaybeLater}
          accessibilityLabel="Skip notifications"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Description */}
        <View style={styles.headerBlock}>
          <View style={[styles.bellCircle, { backgroundColor: colors.lavender }]}>
            <AppIcon name="bell" size="lg" color={colors.primaryDark} />
          </View>

          <AppHeading level={1} style={styles.heading}>
            A gentle reminder, when you need it.
          </AppHeading>
          <AppText variant="bodyLarge" color="textSecondary" style={styles.description}>
            Get thoughtful reminders for mood check-ins, breathing breaks and daily self-care.
          </AppText>
        </View>

        {/* Visual Preview Samples */}
        <View style={styles.previewSection}>
          <AppText variant="label" color="textMuted" style={styles.previewLabel}>
            WHAT YOU’LL RECEIVE
          </AppText>

          {SAMPLES.map((sample) => (
            <NotificationPreviewCard key={sample.id} sample={sample} />
          ))}
        </View>

        {/* Respectful notice banner */}
        <AppCard variant="soft" style={styles.reassuranceCard}>
          <View style={styles.reassuranceRow}>
            <AppIcon name="shield" size="sm" color={colors.primary} />
            <AppText variant="bodySmall" color="textSecondary" style={styles.reassuranceText}>
              We respect your peace. No spam, ever. You can customize timing or silence notifications
              at any moment in settings.
            </AppText>
          </View>
        </AppCard>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { borderTopColor: colors.border }]}>
        <PrimaryButton
          title="Enable Notifications"
          size="lg"
          fullWidth
          loading={isRequesting}
          leadingIcon="bell"
          onPress={handleEnableNotifications}
          style={styles.enableBtn}
        />

        <GhostButton
          title="Maybe Later"
          size="md"
          onPress={handleMaybeLater}
          style={styles.laterBtn}
        />
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
    marginBottom: 24,
  },
  bellCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    marginBottom: 8,
    lineHeight: 34,
  },
  description: {
    lineHeight: 24,
  },
  previewSection: {
    marginBottom: 16,
  },
  previewLabel: {
    marginBottom: 12,
    letterSpacing: 1,
  },
  reassuranceCard: {
    padding: 14,
  },
  reassuranceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  reassuranceText: {
    flex: 1,
    lineHeight: 19,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  enableBtn: {
    maxWidth: 360,
  },
  laterBtn: {
    marginTop: 6,
  },
});
