import React from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppCard,
  AppBadge,
  AppButton,
  AppAvatar,
  AppIcon,
} from '../../src/components/ui';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ProfileScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const { user, logout, deleteAccount, isLoading } = useAuthStore();

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

  const handleDeleteAccount = () => {
    triggerHaptic.heavy();
    Alert.alert(
      'Delete Account',
      'This will permanently remove your account, mood history, journals, and sanctuary preferences. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              router.replace('/(auth)');
            } catch (err: unknown) {
              Alert.alert('Error', (err as Error).message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  const displayName = user?.preferredName || user?.name || 'Sanctuary Member';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppBadge label="SANCTUARY PROFILE" variant="primary" size="sm" />
          <AppHeading level="h2" style={styles.title}>
            Account & Preferences
          </AppHeading>
        </View>

        {/* User Profile Card */}
        <AppCard style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <AppAvatar
              name={displayName}
              size="lg"
              backgroundColor={colors.primaryLight}
              textColor={colors.primaryDark}
            />
            <View style={styles.userTexts}>
              <AppHeading level="h3" style={styles.userName}>
                {user?.name}
              </AppHeading>
              <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
                {user?.email}
              </AppText>
              {user?.preferredName && (
                <AppText variant="caption" style={{ color: colors.primary, marginTop: 2 }}>
                  Called: "{user.preferredName}"
                </AppText>
              )}
            </View>
          </View>

          {/* Member status */}
          <View style={[styles.memberSinceRow, { borderTopColor: colors.border }]}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Solace Member
            </AppText>
            <AppBadge label="VERIFIED" variant="primary" size="sm" />
          </View>
        </AppCard>

        {/* Wellness Goals */}
        {user?.wellnessGoals && user.wellnessGoals.length > 0 && (
          <View style={styles.section}>
            <AppHeading level="h4" style={styles.sectionTitle}>
              My Wellness Focus
            </AppHeading>
            <View style={styles.goalsWrap}>
              {user.wellnessGoals.map((goal) => (
                <AppBadge
                  key={goal}
                  label={goal.replace('_', ' ').toUpperCase()}
                  variant="primary"
                  size="md"
                />
              ))}
            </View>
          </View>
        )}

        {/* Theme Mode Selector */}
        <View style={styles.section}>
          <AppHeading level="h4" style={styles.sectionTitle}>
            Appearance
          </AppHeading>
          <AppCard style={styles.appearanceCard}>
            <AppText variant="bodySmall" style={{ color: colors.textSecondary, marginBottom: 12 }}>
              Select your preferred visual ambience:
            </AppText>

            <View style={styles.themeSelectorRow}>
              {(['system', 'light', 'dark'] as const).map((mode) => {
                const isSelected = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => {
                      triggerHaptic.selection();
                      setThemeMode(mode);
                    }}
                    style={[
                      styles.themeOptionBtn,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? colors.surfaceSecondary
                          : '#F0EFE9',
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <AppText
                      variant="caption"
                      style={[
                        styles.themeOptionText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </AppCard>
        </View>

        {/* Developer / Design System Link */}
        <View style={styles.section}>
          <AppHeading level="h4" style={styles.sectionTitle}>
            Design Foundation
          </AppHeading>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.light();
              router.push('/design-system');
            }}
            activeOpacity={0.8}
          >
            <AppCard style={styles.linkCard}>
              <View style={styles.linkLeft}>
                <AppIcon name="sliders" size={20} color={colors.primary} />
                <View>
                  <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
                    Component Design System
                  </AppText>
                  <AppText variant="caption" style={{ color: colors.textSecondary }}>
                    Inspect typography, buttons, colors & tokens
                  </AppText>
                </View>
              </View>
              <AppIcon name="chevron-right" size={16} color={colors.textSecondary} />
            </AppCard>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.actionsSection}>
          <AppButton
            title="Sign Out"
            variant="outline"
            size="md"
            fullWidth
            loading={isLoading}
            onPress={handleSignOut}
          />

          <AppButton
            title="Delete Account"
            variant="ghost"
            size="sm"
            fullWidth
            textStyle={{ color: '#E11D48' }}
            onPress={handleDeleteAccount}
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
  header: {
    marginBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  userTexts: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  memberSinceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  goalsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  appearanceCard: {
    padding: 16,
    borderRadius: 18,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOptionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeOptionText: {
    fontWeight: '700',
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionsSection: {
    marginTop: 10,
    gap: 10,
  },
});

