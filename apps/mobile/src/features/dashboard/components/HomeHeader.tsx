import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppHeading, AppText, AppAvatar, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthStore } from '../../../store/authStore';
import { useUnreadNotificationCount } from '../../../hooks/useNotifications';
import { triggerHaptic } from '../../../utils/haptics';

interface HomeHeaderProps {
  onProfilePress?: () => void;
  onNotificationsPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  onProfilePress,
  onNotificationsPress,
}) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = user?.preferredName || user?.name?.split(' ')[0] || 'Friend';

  const handleNotificationPress = () => {
    triggerHaptic.light();
    onNotificationsPress?.();
  };

  const handleProfilePress = () => {
    triggerHaptic.light();
    onProfilePress?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <View style={styles.greetingRow}>
          <AppHeading level="h2" style={[styles.greetingText, { color: colors.textPrimary }]}>
            {greeting}, {displayName} ✨
          </AppHeading>
        </View>
        <AppText variant="bodySmall" style={[styles.subtitle, { color: colors.textSecondary }]}>
          Today is another opportunity to care for yourself.
        </AppText>
      </View>

      <View style={styles.actionsContainer}>
        {/* Notification Bell */}
        <TouchableOpacity
          onPress={handleNotificationPress}
          style={[
            styles.iconButton,
            { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface },
          ]}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <AppIcon name="bell" size={20} color={colors.textPrimary} />
          {unreadCount > 0 && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.accent },
              ]}
            >
              <View style={[styles.badgeDot, { backgroundColor: colors.textPrimary }]} />
            </View>
          )}
        </TouchableOpacity>

        {/* Profile Avatar */}
        <TouchableOpacity
          onPress={handleProfilePress}
          activeOpacity={0.8}
          accessibilityLabel="View profile"
          accessibilityRole="button"
        >
          <AppAvatar
            name={user?.name || 'User'}
            size="md"
            backgroundColor={colors.primary}
            textColor={colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  badge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

