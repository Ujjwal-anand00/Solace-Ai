import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity } from 'react-native';
import { useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/colors';
import { useAuthStore } from '../../src/store/authStore';
import { useUserProfile } from '../../src/hooks/useProfile';
import { useProgressOverview } from '../../src/hooks/useProgress';
import { triggerHaptic } from '../../src/utils/haptics';
import {
  ProfileHeader,
  ProfileMenuItem,
  AccountDeletionModal,
} from '../../src/features/profile';
import { userService } from '../../src/services/api/userService';

export default function ProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { data: userProfile } = useUserProfile();
  const { data: progressOverview } = useProgressOverview();

  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleConfirmDeletion = async () => {
    setIsDeleting(true);
    try {
      await userService.deleteAccount('DELETE');
      await logout();
      triggerHaptic.success();
      Alert.alert('Account Deleted', 'Your account and personal data have been completely deleted.');
      router.replace('/(auth)');
    } catch {
      Alert.alert('Error', 'Unable to delete account right now.');
    } finally {
      setIsDeleting(false);
      setDeletionModalVisible(false);
    }
  };

  const streakDays = progressOverview?.currentStreak ?? 0;
  const completedActivities = progressOverview?.totalActivities ?? 0;
  const moodCheckins = progressOverview?.totalMoodCheckIns ?? 0;
  const achievementsCount = progressOverview?.earnedAchievements?.length ?? 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.topTitleBox}>
          <Text style={styles.subTitle}>SANCTUARY ACCOUNT</Text>
          <Text style={styles.mainTitle}>Profile & Settings</Text>
        </View>

        {/* Profile Card */}
        {userProfile && (
          <ProfileHeader
            name={userProfile.name}
            preferredName={userProfile.preferredName}
            email={userProfile.email}
            avatarUrl={userProfile.avatarUrl}
            memberSince={userProfile.createdAt}
            onEditPress={() => router.push('/settings/personal-info' as Href)}
          />
        )}

        {/* Progress Overview Snapshot */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{streakDays}</Text>
            <Text style={styles.metricLabel}>Day Streak</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{moodCheckins}</Text>
            <Text style={styles.metricLabel}>Check-ins</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{completedActivities}</Text>
            <Text style={styles.metricLabel}>Mindful Acts</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricNumber}>{achievementsCount}</Text>
            <Text style={styles.metricLabel}>Badges</Text>
          </View>
        </View>

        {/* Navigation Sections */}
        <Text style={styles.sectionHeading}>Account & Sanctuary</Text>
        <View style={styles.menuGroup}>
          <ProfileMenuItem
            icon="👤"
            title="Personal Information"
            subtitle="Name, display name, timezone, bio"
            onPress={() => router.push('/settings/personal-info' as Href)}
          />
          <ProfileMenuItem
            icon="🌿"
            title="Wellness Preferences"
            subtitle="Goals, activity duration, priorities"
            onPress={() => router.push('/settings/wellness-preferences' as Href)}
          />
          <ProfileMenuItem
            icon="✦"
            title="AI Companion Preferences"
            subtitle="Response tone, context & journal consent"
            onPress={() => router.push('/settings/ai-settings' as Href)}
          />
          <ProfileMenuItem
            icon="🔔"
            title="Notification Settings"
            subtitle="Reminders, quiet hours & days"
            onPress={() => router.push('/notifications/settings' as Href)}
          />
        </View>

        <Text style={styles.sectionHeading}>Privacy & Security</Text>
        <View style={styles.menuGroup}>
          <ProfileMenuItem
            icon="🔒"
            title="Privacy & Data"
            subtitle="Data export, transparency, delete account"
            onPress={() => router.push('/settings/privacy-data' as Href)}
          />
          <ProfileMenuItem
            icon="🛡️"
            title="Security & Sessions"
            subtitle="Password, active devices, sign out others"
            onPress={() => router.push('/settings/security' as Href)}
          />
        </View>

        <Text style={styles.sectionHeading}>Experience & Support</Text>
        <View style={styles.menuGroup}>
          <ProfileMenuItem
            icon="🎨"
            title="Appearance"
            subtitle="Light, dark, or system matching"
            onPress={() => router.push('/settings/appearance' as Href)}
          />
          <ProfileMenuItem
            icon="♿"
            title="Accessibility"
            subtitle="Reduce motion, haptics, high contrast"
            onPress={() => router.push('/settings/accessibility' as Href)}
          />
          <ProfileMenuItem
            icon="🌐"
            title="Language & Localization"
            subtitle="English, Hindi, Punjabi"
            badge={userProfile?.language?.toUpperCase() || 'EN'}
            onPress={() => router.push('/settings/language' as Href)}
          />
          <ProfileMenuItem
            icon="💬"
            title="Help & Support"
            subtitle="FAQs, care disclaimer, send feedback"
            onPress={() => router.push('/settings/help-support' as Href)}
          />
          <ProfileMenuItem
            icon="ℹ️"
            title="About Solace AI"
            subtitle="Version 1.0.0, mission, open licenses"
            onPress={() => router.push('/settings/about' as Href)}
          />
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutCard} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out from Solace</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Account Deletion Modal */}
      <AccountDeletionModal
        visible={deletionModalVisible}
        onConfirm={handleConfirmDeletion}
        onCancel={() => setDeletionModalVisible(false)}
        isLoading={isDeleting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  topTitleBox: {
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.sageDark,
    letterSpacing: 1,
    marginBottom: 2,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  metricNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.sageDark,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  signOutCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: 4,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E11D48',
  },
});
