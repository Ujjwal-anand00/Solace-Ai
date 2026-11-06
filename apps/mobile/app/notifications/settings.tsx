import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeading, AppText, AppIcon } from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from '../../src/hooks/useNotificationPreferences';
import { NotificationPreferences } from '../../src/features/notifications';
import { triggerHaptic } from '../../src/utils/haptics';

export default function NotificationSettingsScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();

  const { data: preferences, isLoading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View
        style={[
          styles.headerBar,
          {
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          style={styles.backButton}
        >
          <AppIcon name="arrowLeft" size={20} color={colors.text} />
        </TouchableOpacity>

        <AppHeading level="h3" style={styles.headerTitle}>
          Notification Settings
        </AppHeading>

        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.subHeader}>
          <AppHeading level="h2" style={styles.title}>
            Mindful Reminders
          </AppHeading>
          <AppText
            variant="bodyMedium"
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            Choose how Solace gently supports your daily mindfulness and emotional check-in routine.
          </AppText>
        </View>

        {isLoading || !preferences ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 8 }}>
              Loading preferences...
            </AppText>
          </View>
        ) : (
          <NotificationPreferences
            preferences={preferences}
            onSave={async (updated) => {
              await updateMutation.mutateAsync(updated);
            }}
            isSaving={updateMutation.isPending}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 36,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  subHeader: {
    marginBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

