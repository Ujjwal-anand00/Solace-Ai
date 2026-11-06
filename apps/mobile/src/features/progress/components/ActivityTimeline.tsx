import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  AppCard,
  AppText,
  AppHeading,
  AppBadge,
  AppIcon,
  AppButton,
} from '../../../components/ui';
import { IconName } from '../../../components/ui/AppIcon';
import { useTheme } from '../../../hooks/useTheme';
import { ActivityTimelineItem, TimelineActivityType } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface ActivityTimelineProps {
  items: ActivityTimelineItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

const CATEGORY_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'mood', label: 'Mood' },
  { key: 'activity', label: 'Activities' },
  { key: 'journal', label: 'Journals' },
  { key: 'plan_task', label: 'Plan Tasks' },
  { key: 'assessment', label: 'Assessments' },
];

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  items,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}) => {
  const { colors, isDark } = useTheme();

  const getActivityIcon = (type: TimelineActivityType): { icon: IconName; color: string; bg: string } => {
    switch (type) {
      case 'mood':
        return { icon: 'smile', color: '#0369A1', bg: '#E0F2FE' };
      case 'breathing':
        return { icon: 'wind', color: '#7E22CE', bg: '#F3E8FF' };
      case 'activity':
        return { icon: 'activity', color: '#15803D', bg: '#DCFCE7' };
      case 'journal':
        return { icon: 'book-open', color: '#B45309', bg: '#FEF3C7' };
      case 'plan_task':
        return { icon: 'check-circle', color: '#D97706', bg: '#FEF3C7' };
      case 'assessment':
        return { icon: 'file-text', color: '#4338CA', bg: '#E0E7FF' };
      default:
        return { icon: 'sparkles', color: '#829B83', bg: '#E9E2F5' };
    }
  };

  const formatTimestamp = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `Today at ${timeStr}`;
      }
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
    } catch {
      return isoDate;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppHeading level="h4" style={styles.title}>
          Sanctuary Timeline
        </AppHeading>
        <AppText variant="caption" style={{ color: colors.textSecondary }}>
          Your history of self-care moments
        </AppText>
      </View>

      {/* Filter chips */}
      <View style={styles.chipRow}>
        {CATEGORY_CHIPS.map((chip) => {
          const isSelected = selectedCategory === chip.key;
          return (
            <TouchableOpacity
              key={chip.key}
              onPress={() => {
                triggerHaptic.selection();
                onSelectCategory(chip.key);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? '#829B83'
                    : isDark
                    ? colors.surface
                    : '#FFFFFF',
                  borderColor: isSelected ? '#829B83' : colors.border,
                },
              ]}
            >
              <AppText
                variant="caption"
                style={[
                  styles.chipText,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : colors.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {chip.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timeline items list */}
      {items.length === 0 && !isLoading ? (
        <AppCard
          style={[
            styles.emptyCard,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
              borderColor: colors.border,
            },
          ]}
        >
          <AppIcon name="clock" size={28} color="#829B83" />
          <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
            No activities recorded in this category yet.
          </AppText>
        </AppCard>
      ) : (
        <View style={styles.list}>
          {items.map((item, index) => {
            const iconData = getActivityIcon(item.type);
            const isLast = index === items.length - 1;

            return (
              <View key={item.id + index} style={styles.timelineItemRow}>
                {/* Left line indicator */}
                <View style={styles.indicatorCol}>
                  <View
                    style={[
                      styles.itemIcon,
                      {
                        backgroundColor: isDark ? colors.surface : iconData.bg,
                      },
                    ]}
                  >
                    <AppIcon name={iconData.icon} size={16} color={iconData.color} />
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.connectorLine,
                        { backgroundColor: isDark ? colors.border : '#E2DFD2' },
                      ]}
                    />
                  )}
                </View>

                {/* Content Card */}
                <AppCard
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: isDark ? colors.surfaceSecondary : '#FFFFFF',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <AppText variant="bodySmall" style={styles.itemTitle}>
                      {item.title}
                    </AppText>
                    <AppText
                      variant="caption"
                      style={[styles.timestamp, { color: colors.textSecondary }]}
                    >
                      {formatTimestamp(item.timestamp)}
                    </AppText>
                  </View>

                  {Boolean(item.description) && (
                    <AppText
                      variant="caption"
                      style={[styles.description, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </AppText>
                  )}

                  <View style={styles.tagRow}>
                    <AppBadge
                      label={item.category.toUpperCase()}
                      variant="neutral"
                      size="sm"
                    />
                    {item.durationSeconds ? (
                      <AppBadge
                        label={`${Math.round(item.durationSeconds / 60)} min`}
                        variant="primary"
                        size="sm"
                      />
                    ) : null}
                  </View>
                </AppCard>
              </View>
            );
          })}

          {hasMore && onLoadMore && (
            <View style={styles.loadMoreWrapper}>
              <AppButton
                title={isLoading ? 'Loading...' : 'Load Older History'}
                variant="outline"
                size="sm"
                onPress={onLoadMore}
                disabled={isLoading}
              />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  list: {
    gap: 0,
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  indicatorCol: {
    alignItems: 'center',
    marginRight: 10,
    width: 32,
  },
  itemIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  connectorLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    minHeight: 30,
  },
  itemCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  itemTitle: {
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 11,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    marginTop: 2,
  },
  loadMoreWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
});

