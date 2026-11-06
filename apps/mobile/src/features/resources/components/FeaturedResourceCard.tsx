import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppHeading, AppText, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { ResourceDetail } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface FeaturedResourceCardProps {
  resource: ResourceDetail;
  onPress: (resource: ResourceDetail) => void;
  onToggleBookmark?: (id: string) => void;
}

export const FeaturedResourceCard: React.FC<FeaturedResourceCardProps> = ({
  resource,
  onPress,
  onToggleBookmark,
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
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          borderRadius: radius.xl,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Featured resource: ${resource.title}`}
    >
      <View
        style={[
          styles.badgeRow,
          {
            paddingHorizontal: spacing.md,
            paddingTop: spacing.md,
          },
        ]}
      >
        <View
          style={[
            styles.categoryBadge,
            {
              backgroundColor: colors.primaryLight + '40',
              borderRadius: radius.full,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{
              color: colors.primaryDark,
              fontWeight: '600',
              textTransform: 'capitalize',
            }}
          >
            {resource.category.replace('_', ' ')}
          </AppText>
        </View>

        <View style={styles.rightHeader}>
          <View style={styles.durationWrap}>
            <AppIcon name="clock" size={14} color={colors.textTertiary} />
            <AppText
              variant="caption"
              style={[styles.durationText, { color: colors.textSecondary }]}
            >
              {resource.readingMinutes} min read
            </AppText>
          </View>

          {onToggleBookmark && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                triggerHaptic.light();
                onToggleBookmark(resource.id);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.bookmarkButton}
              accessibilityRole="button"
              accessibilityLabel={resource.isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
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

      <View style={[styles.body, { padding: spacing.md }]}>
        <AppHeading
          level={4}
          style={{
            color: colors.textPrimary,
            marginBottom: spacing.xs,
          }}
          numberOfLines={2}
        >
          {resource.title}
        </AppHeading>

        <AppText
          variant="bodySmall"
          style={{
            color: colors.textSecondary,
            lineHeight: 20,
            marginBottom: spacing.md,
          }}
          numberOfLines={3}
        >
          {resource.description}
        </AppText>

        <View style={styles.footerRow}>
          <View style={styles.authorWrap}>
            <AppIcon name="feather" size={14} color={colors.textTertiary} />
            <AppText
              variant="caption"
              style={{
                color: colors.textTertiary,
                marginLeft: 4,
              }}
            >
              {resource.author || 'Solace Wellness Team'}
            </AppText>
          </View>

          <View
            style={[
              styles.ctaPill,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.full,
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{
                color: '#FFFFFF',
                fontWeight: '600',
              }}
            >
              Read Now
            </AppText>
            <AppIcon name="chevronRight" size={14} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    borderWidth: 1,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  bookmarkButton: {
    padding: 2,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  authorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
