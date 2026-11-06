import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeading, AppText, AppIcon, AppButton } from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useResourceDetail,
  useToggleResourceFavorite,
  useUpdateResourceProgress,
  useCompleteResource,
} from '../../src/hooks/useResources';
import {
  ResourceContentRenderer,
  ReadingProgressBar,
  RelatedActivityCard,
} from '../../src/features/resources';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ResourceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const resourceId = id || '';

  const { colors, spacing, radius } = useTheme();

  const { data: resource, isLoading, error } = useResourceDetail(resourceId);
  const toggleFavoriteMutation = useToggleResourceFavorite();
  const updateProgressMutation = useUpdateResourceProgress();
  const completeMutation = useCompleteResource();

  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const totalHeight = contentSize.height - layoutMeasurement.height;
    if (totalHeight > 0) {
      const current = contentOffset.y;
      const percent = Math.min(100, Math.max(0, Math.round((current / totalHeight) * 100)));
      setScrollProgress(percent);

      // Periodically persist progress when crossing 25%, 50%, 75% thresholds
      if (
        resource &&
        !resource.isCompleted &&
        percent > (resource.progressPercent || 0) &&
        (percent === 25 || percent === 50 || percent === 75)
      ) {
        updateProgressMutation.mutate({
          resourceId: resource.id,
          progressPercent: percent,
        });
      }
    }
  };

  const handleToggleBookmark = () => {
    if (!resource) return;
    triggerHaptic.light();
    toggleFavoriteMutation.mutate(resource.id);
  };

  const handleComplete = () => {
    if (!resource) return;
    triggerHaptic.success();
    completeMutation.mutate(resource.id);
  };

  const handleShare = async () => {
    if (!resource) return;
    triggerHaptic.light();
    try {
      await Share.share({
        title: resource.title,
        message: `${resource.title}\n\n${resource.description}\n\nRead more in Solace AI.`,
      });
    } catch {
      // Ignored
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 12 }}>
            Loading guide...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !resource) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingCenter, { paddingHorizontal: spacing.lg }]}>
          <AppIcon name="alertCircle" size={40} color={colors.error} />
          <AppHeading level={4} style={{ color: colors.textPrimary, marginTop: 16 }}>
            Resource Not Found
          </AppHeading>
          <AppText
            variant="bodySmall"
            style={{
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: 8,
              marginBottom: 20,
            }}
          >
            The educational resource you requested could not be located or may have been updated.
          </AppText>
          <AppButton variant="outline" onPress={() => router.back()}>
            Go Back
          </AppButton>
        </View>
      </SafeAreaView>
    );
  }

  const effectiveProgress = resource.isCompleted
    ? 100
    : Math.max(scrollProgress, resource.progressPercent || 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Navigation Bar */}
      <View
        style={[
          styles.navBar,
          {
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderBottomColor: colors.borderLight,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="chevronLeft" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

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
              textTransform: 'capitalize',
              fontSize: 11,
            }}
          >
            {resource.category.replace('_', ' ')}
          </AppText>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            onPress={handleToggleBookmark}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel={resource.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <AppIcon
              name="bookmark"
              size={20}
              color={resource.isBookmarked ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Share guide"
          >
            <AppIcon name="share" size={19} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Reading Progress Indicator */}
      <ReadingProgressBar progressPercent={effectiveProgress} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={32}
      >
        {/* Article Header */}
        <View style={[styles.headerSection, { paddingHorizontal: spacing.md }]}>
          <AppHeading
            level={2}
            style={{
              color: colors.textPrimary,
              lineHeight: 32,
              marginBottom: spacing.xs,
            }}
          >
            {resource.title}
          </AppHeading>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <AppIcon name="clock" size={13} color={colors.textTertiary} />
              <AppText
                variant="caption"
                style={{
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {resource.readingMinutes} min read
              </AppText>
            </View>

            <View style={styles.metaDot} />

            <View style={styles.metaItem}>
              <AppIcon name="feather" size={13} color={colors.textTertiary} />
              <AppText
                variant="caption"
                style={{
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {resource.author || 'Solace Wellness Team'}
              </AppText>
            </View>
          </View>

          {/* Educational Disclaimer Banner */}
          <View
            style={[
              styles.disclaimerBanner,
              {
                backgroundColor: colors.surfaceSecondary + '50',
                borderColor: colors.borderLight,
                borderRadius: radius.md,
                marginTop: spacing.md,
                padding: spacing.sm,
              },
            ]}
          >
            <AppIcon name="info" size={15} color={colors.primary} />
            <AppText
              variant="caption"
              style={{
                color: colors.textSecondary,
                flex: 1,
                marginLeft: 8,
                fontSize: 11,
                lineHeight: 16,
              }}
            >
              Educational Wellness Guidance: This content is designed to offer supportive wellness insights and mindfulness techniques. It is not intended as medical advice or clinical diagnosis.
            </AppText>
          </View>
        </View>

        {/* Content Body */}
        <View style={[styles.bodySection, { paddingHorizontal: spacing.md, marginTop: spacing.lg }]}>
          {resource.blocks && resource.blocks.length > 0 ? (
            <ResourceContentRenderer blocks={resource.blocks} />
          ) : (
            <AppText
              variant="body"
              style={{
                color: colors.textPrimary,
                lineHeight: 24,
              }}
            >
              {resource.description}
            </AppText>
          )}
        </View>

        {/* Completion Section */}
        <View
          style={[
            styles.completionSection,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
              borderRadius: radius.xl,
              marginHorizontal: spacing.md,
              marginTop: spacing.xl,
              padding: spacing.lg,
            },
          ]}
        >
          {resource.isCompleted ? (
            <View style={styles.completedBadgeRow}>
              <View
                style={[
                  styles.completedCheckCircle,
                  {
                    backgroundColor: colors.success + '20',
                    borderRadius: radius.full,
                  },
                ]}
              >
                <AppIcon name="check" size={24} color={colors.success} />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <AppHeading level={4} style={{ color: colors.textPrimary }}>
                  Guide Completed
                </AppHeading>
                <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 2 }}>
                  Recorded to your wellness streak and personal learning progress.
                </AppText>
              </View>
            </View>
          ) : (
            <View style={styles.uncompletedWrap}>
              <AppHeading level={4} style={{ color: colors.textPrimary, textAlign: 'center' }}>
                Reflected on this guide?
              </AppHeading>
              <AppText
                variant="bodySmall"
                style={{
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 4,
                  marginBottom: spacing.md,
                }}
              >
                Mark this reading as completed to track your personal learning journey and advance your wellness streaks.
              </AppText>

              <AppButton
                variant="primary"
                size="md"
                onPress={handleComplete}
                loading={completeMutation.isPending}
                fullWidth
              >
                Mark as Completed
              </AppButton>
            </View>
          )}
        </View>

        {/* Related Practice & Next Steps */}
        <View style={[styles.relatedSection, { paddingHorizontal: spacing.md, marginTop: spacing.xl }]}>
          <AppHeading level={4} style={{ color: colors.textPrimary }}>
            Put into Practice
          </AppHeading>
          <AppText variant="caption" style={{ color: colors.textSecondary, marginBottom: 8 }}>
            Pair this insight with gentle wellness exercises
          </AppText>

          <RelatedActivityCard
            title="Mindful Breathing"
            subtitle="Regulate your nervous system with box breathing"
            duration="3 min"
            onPress={() => router.push('/(home)/activities' as any)}
          />

          <RelatedActivityCard
            title="Private Reflection Journal"
            subtitle="Write down your thoughts and emotional takeaways"
            onPress={() => router.push('/journal' as any)}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  navButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scrollContent: {
    paddingTop: 16,
  },
  headerSection: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#BBB',
    marginHorizontal: 8,
  },
  disclaimerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  bodySection: {
    width: '100%',
  },
  completionSection: {
    borderWidth: 1,
  },
  completedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedCheckCircle: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncompletedWrap: {
    alignItems: 'center',
  },
  relatedSection: {
    marginTop: 20,
  },
});
