import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppHeading, AppText, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { ResourceDetail } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface ResourceCardProps {
  resource: ResourceDetail;
  onPress: (resource: ResourceDetail) => void;
  onToggleBookmark?: (id: string) => void;
  compact?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onPress,
  onToggleBookmark,
  compact = false,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => {
        triggerHaptic.selection();
        onPress(resource);
      }}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          borderRadius: radius.lg,
          padding: compact ? spacing.sm : spacing.md,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Resource: ${resource.title}, ${resource.readingMinutes} min read`}
    >
      <View style={styles.headerRow}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: colors.primaryLight + '35',
                borderRadius: radius.full,
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{
                color: colors.primaryDark,
                fontWeight: '600',
                fontSize: 11,
                textTransform: 'capitalize',
              }}
            >
              {resource.category.replace('_', ' ')}
            </AppText>
          </View>

          {resource.isCompleted && (
            <View
              style={[
                styles.completedPill,
                {
                  backgroundColor: colors.success + '20',
                  borderRadius: radius.full,
                },
              ]}
            >
              <AppIcon name="check" size={10} color={colors.success} />
              <AppText
                variant="caption"
                style={{
                  color: colors.success,
                  fontSize: 10,
                  fontWeight: '600',
                  marginLeft: 3,
                }}
              >
                Completed
              </AppText>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          <View style={styles.timeWrap}>
            <AppIcon name="clock" size={12} color={colors.textTertiary} />
            <AppText
              variant="caption"
              style={{
                color: colors.textSecondary,
                fontSize: 11,
                marginLeft: 4,
              }}
            >
              {resource.readingMinutes} min
            </AppText>
          </View>

          {onToggleBookmark && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                triggerHaptic.light();
                onToggleBookmark(resource.id);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.bookmarkBtn}
              accessibilityRole="button"
              accessibilityLabel={resource.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <AppIcon
                name="bookmark"
                size={18}
                color={resource.isBookmarked ? colors.primary : colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <AppHeading
        level={4}
        style={{
          color: colors.textPrimary,
          marginTop: spacing.xs,
          marginBottom: 4,
          fontSize: compact ? 15 : 16,
        }}
        numberOfLines={2}
      >
        {resource.title}
      </AppHeading>

      {!compact && (
        <AppText
          variant="bodySmall"
          style={{
            color: colors.textSecondary,
            lineHeight: 20,
            marginBottom: spacing.sm,
          }}
          numberOfLines={2}
        >
          {resource.description}
        </AppText>
      )}

      {/* Progress bar if started and not completed */}
      {Boolean(resource.progressPercent && resource.progressPercent > 0 && !resource.isCompleted) && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBackground,
              {
                backgroundColor: colors.borderLight,
                borderRadius: radius.full,
              },
            ]}
          >
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(100, resource.progressPercent || 0)}%`,
                  backgroundColor: colors.primary,
                  borderRadius: radius.full,
                },
              ]}
            />
          </View>
          <AppText
            variant="caption"
            style={{
              color: colors.textTertiary,
              fontSize: 10,
              marginTop: 3,
            }}
          >
            {resource.progressPercent}% read
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkBtn: {
    padding: 2,
  },
  progressContainer: {
    marginTop: 6,
  },
  progressBackground: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
});
