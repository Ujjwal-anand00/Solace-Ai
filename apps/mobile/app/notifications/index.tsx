import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppCard,
  AppButton,
  AppIcon,
  AppBadge,
} from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useNotificationsInbox,
  useUnreadNotificationCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../../src/hooks/useNotifications';
import { NotificationItem } from '../../src/features/notifications';
import { SolaceNotification } from '@solace/shared';
import { triggerHaptic } from '../../src/utils/haptics';

export default function NotificationsScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [page, setPage] = useState(1);

  const {
    data: inboxData,
    isLoading,
    refetch,
    isRefetching,
  } = useNotificationsInbox(page, 20);

  const { data: unreadCount = 0, refetch: refetchUnread } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteMutation = useDeleteNotification();

  const notifications = inboxData?.data || [];
  const meta = inboxData?.meta;
  const hasMore = (meta?.page ?? 1) < (meta?.totalPages ?? 1);

  const unreadNotifications = notifications.filter(
    (n) => n.status === 'pending' || n.status === 'sent',
  );
  const readNotifications = notifications.filter((n) => n.status === 'read');

  const onRefresh = async () => {
    triggerHaptic.light();
    await Promise.all([refetch(), refetchUnread()]);
  };

  const handleNotificationPress = (notification: SolaceNotification) => {
    if (notification.deepLink) {
      try {
        router.push(notification.deepLink as Href);
      } catch {
        router.push('/(home)');
      }
    }
  };

  const handleMarkAllRead = async () => {
    triggerHaptic.light();
    await markAllAsReadMutation.mutateAsync();
    triggerHaptic.success();
  };

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

        <View style={styles.headerTitleCol}>
          <AppHeading level="h3" style={styles.headerTitle}>
            Notifications
          </AppHeading>
          {unreadCount > 0 && (
            <AppBadge label={`${unreadCount} NEW`} variant="primary" size="sm" />
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.push('/notifications/settings' as Href);
          }}
          style={styles.settingsButton}
        >
          <AppIcon name="settings" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Quick action: Mark all as read */}
        {unreadNotifications.length > 0 && (
          <View style={styles.actionRow}>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              You have {unreadNotifications.length} unread updates
            </AppText>
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
              <AppText
                variant="caption"
                style={{ fontWeight: '700', color: colors.primary }}
              >
                Mark all as read
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 8 }}>
              Checking your sanctuary updates...
            </AppText>
          </View>
        ) : notifications.length === 0 ? (
          <AppCard
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.emptyIconCircle}>
              <AppIcon name="bell" size={28} color="#829B83" />
            </View>
            <AppHeading level="h4" style={styles.emptyTitle}>
              All Caught Up
            </AppHeading>
            <AppText
              variant="bodySmall"
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              Your sanctuary is peaceful and clear. Scheduled reminders will appear here when ready.
            </AppText>
            <AppButton
              title="Configure Reminders"
              variant="outline"
              size="sm"
              onPress={() => router.push('/notifications/settings' as Href)}
            />
          </AppCard>
        ) : (
          <>
            {/* Section A: New & Unread */}
            {unreadNotifications.length > 0 && (
              <View style={styles.section}>
                <AppHeading level="h4" style={styles.sectionHeading}>
                  New for You
                </AppHeading>
                {unreadNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onPress={handleNotificationPress}
                    onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </View>
            )}

            {/* Section B: Earlier */}
            {readNotifications.length > 0 && (
              <View style={styles.section}>
                <AppHeading level="h4" style={styles.sectionHeading}>
                  Earlier
                </AppHeading>
                {readNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onPress={handleNotificationPress}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </View>
            )}

            {/* Load More Pagination */}
            {hasMore && (
              <View style={styles.loadMoreWrapper}>
                <AppButton
                  title="Load Earlier Notifications"
                  variant="outline"
                  size="sm"
                  onPress={() => setPage((p) => p + 1)}
                />
              </View>
            )}
          </>
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
  headerTitleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  markAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  centerContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F8F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
    maxWidth: 260,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  loadMoreWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
});
