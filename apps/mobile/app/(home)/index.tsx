import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppCard,
  AppBadge,
  AppIcon,
  PrimaryButton,
  OutlineButton,
  GhostButton,
  SolaceMascot,
  SolaceLogo,
} from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

export default function HomeScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, logout, isLoading } = useAuthStore();

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = user?.preferredName || user?.name || 'Friend';

  const handleSignOut = () => {
    triggerHaptic.medium();
    Alert.alert('Sign Out', 'Are you sure you want to exit your sanctuary?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  const handleMoodCheckIn = () => {
    triggerHaptic.light();
    Alert.alert(
      'Mood & Emotional Tracking',
      'Daily mood logging, sentiment analysis, and wellness check-ins will be implemented in STEP 05.',
      [{ text: 'Looking Forward' }],
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <SolaceLogo size="sm" variant="horizontal" />

          <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <AppIcon name="user" size="sm" color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Greeting Block */}
        <View style={styles.greetingBlock}>
          <AppText variant="caption" color="textSecondary" style={styles.dateTag}>
            TODAY’S SANCTUARY
          </AppText>
          <AppHeading level={1} style={styles.greetingTitle}>
            {greeting}, {displayName}
          </AppHeading>
          <AppText variant="bodyLarge" color="textSecondary" style={styles.greetingSubtitle}>
            How is your heart feeling today? Solace is here whenever you need a calm moment.
          </AppText>
        </View>

        {/* Mascot Centerpiece */}
        <View style={styles.mascotWrapper}>
          <SolaceMascot size={135} expression="happy" animationState="floating" showCushion />
        </View>

        {/* Quick Check-in Prompt Card (Step 05 hook) */}
        <AppCard variant="elevated" style={styles.checkInCard}>
          <View style={styles.checkInHeader}>
            <View style={[styles.checkInIcon, { backgroundColor: colors.mint }]}>
              <AppIcon name="heart" size="md" color={colors.primaryDark} />
            </View>
            <View style={styles.checkInTexts}>
              <AppText variant="bodyLarge" style={styles.checkInTitle}>
                Daily Mood Check-In
              </AppText>
              <AppText variant="bodySmall" color="textSecondary">
                Take 30 seconds to reflect and tune in with yourself.
              </AppText>
            </View>
          </View>

          <PrimaryButton
            title="Start Daily Check-in"
            size="md"
            fullWidth
            trailingIcon="arrowRight"
            onPress={handleMoodCheckIn}
            style={styles.checkInBtn}
          />
        </AppCard>

        {/* User Wellness Goals Summary */}
        {user?.wellnessGoals && user.wellnessGoals.length > 0 && (
          <View style={styles.goalsSection}>
            <AppText variant="label" color="textSecondary" style={styles.sectionLabel}>
              ACTIVE WELLNESS FOCUS
            </AppText>

            <View style={styles.goalsRow}>
              {user.wellnessGoals.map((goal) => (
                <AppBadge
                  key={goal}
                  label={goal.replace('_', ' ').toUpperCase()}
                  variant="mint"
                  size="sm"
                />
              ))}
            </View>
          </View>
        )}

        {/* Profile Details Card */}
        <AppCard variant="soft" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
              <AppText style={styles.avatarInitial}>
                {displayName.charAt(0).toUpperCase()}
              </AppText>
            </View>

            <View style={styles.profileTexts}>
              <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
                {user?.name}
              </AppText>
              <AppText variant="bodySmall" color="textSecondary">
                {user?.email}
              </AppText>
            </View>

            <AppBadge label="Verified" variant="neutral" size="sm" />
          </View>
        </AppCard>

        {/* Action Controls */}
        <View style={styles.actions}>
          <OutlineButton
            title="Sign Out"
            size="md"
            fullWidth
            loading={isLoading}
            onPress={handleSignOut}
            style={styles.signOutBtn}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingBlock: {
    marginBottom: 16,
  },
  dateTag: {
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 4,
  },
  greetingTitle: {
    lineHeight: 36,
    marginBottom: 6,
  },
  greetingSubtitle: {
    lineHeight: 23,
  },
  mascotWrapper: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInCard: {
    padding: 18,
    marginBottom: 20,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  checkInIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInTexts: {
    flex: 1,
  },
  checkInTitle: {
    fontWeight: '700',
    marginBottom: 2,
  },
  checkInBtn: {
    marginTop: 4,
  },
  goalsSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  goalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileCard: {
    padding: 14,
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },
  profileTexts: {
    flex: 1,
  },
  actions: {
    gap: 10,
    alignItems: 'center',
  },
  signOutBtn: {
    maxWidth: 340,
  },
});
