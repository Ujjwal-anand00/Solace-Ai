import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard, AppText, AppIcon } from '../../../components/ui';
import { IconName } from '../../../components/ui/AppIcon';
import { useTheme } from '../../../hooks/useTheme';
import { SolaceNotification, NotificationType } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface NotificationItemProps {
  notification: SolaceNotification;
  onPress: (notification: SolaceNotification) => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onPress,
  onMarkAsRead,
  onDelete,
}) => {
  const { colors, isDark } = useTheme();
  const isUnread = notification.status === 'pending' || notification.status === 'sent';

  const getCategoryIcon = (type: NotificationType): { icon: IconName; color: string; bg: string } => {
    switch (type) {
      case 'mood_checkin':
      case 'checkin':
        return { icon: 'smile', color: '#0369A1', bg: '#E0F2FE' };
      case 'breathing':
        return { icon: 'wind', color: '#7E22CE', bg: '#F3E8FF' };
      case 'plan_task':
        return { icon: 'check-circle', color: '#D97706', bg: '#FEF3C7' };
      case 'streak_alert':
      case 'achievement':
        return { icon: 'sparkles', color: '#B45309', bg: '#FEF3C7' };
      case 'weekly_summary':
        return { icon: 'calendar', color: '#15803D', bg: '#DCFCE7' };
      case 'daily_wellness':
        return { icon: 'feather', color: '#536B58', bg: '#E9E2F5' };
      default:
        return { icon: 'bell', color: '#536B58', bg: '#F1F5F0' };
    }
  };

  const formatRelativeTime = (isoString: string): string => {
    try {
      const now = new Date();
      const date = new Date(isoString);
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 60) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const iconData = getCategoryIcon(notification.type);

  const handlePress = () => {
    triggerHaptic.light();
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onPress(notification);
  };

  const handleDelete = () => {
    triggerHaptic.light();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={handlePress}
      style={styles.touchable}
    >
      <AppCard
        style={[
          styles.card,
          {
            backgroundColor: isDark
              ? isUnread
                ? colors.surfaceSecondary
                : colors.surface
              : isUnread
              ? '#FFFFFF'
              : '#FBF9F5',
            borderColor: isUnread ? '#829B83' : colors.border,
          },
        ]}
      >
        <View style={styles.row}>
          {/* Category Icon */}
          <View
            style={[
              styles.iconWrapper,
              { backgroundColor: isDark ? colors.surface : iconData.bg },
            ]}
          >
            <AppIcon name={iconData.icon} size={18} color={iconData.color} />
          </View>

          {/* Texts */}
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <AppText
                variant="bodySmall"
                style={[
                  styles.title,
                  {
                    fontWeight: isUnread ? '700' : '600',
                    color: colors.text,
                  },
                ]}
                numberOfLines={1}
              >
                {notification.title}
              </AppText>
              <AppText
                variant="caption"
                style={[styles.timestamp, { color: colors.textSecondary }]}
              >
                {formatRelativeTime(notification.createdAt)}
              </AppText>
            </View>

            <AppText
              variant="caption"
              style={[
                styles.message,
                {
                  color: isUnread ? colors.text : colors.textSecondary,
                  fontWeight: isUnread ? '500' : '400',
                },
              ]}
              numberOfLines={2}
            >
              {notification.message}
            </AppText>
          </View>

          {/* Unread indicator & Delete */}
          <View style={styles.actionCol}>
            {isUnread && <View style={styles.unreadDot} />}
            {onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.deleteButton}
              >
                <AppIcon name="trash" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </AppCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginBottom: 8,
  },
  card: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    flex: 1,
    marginRight: 6,
  },
  timestamp: {
    fontSize: 11,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionCol: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#829B83',
  },
  deleteButton: {
    padding: 2,
  },
});

