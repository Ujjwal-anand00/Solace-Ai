import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppIcon,
  AppChip,
} from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useFeaturedResources,
  useRecommendedResources,
  useResourceCategories,
  useResources,
  useToggleResourceFavorite,
} from '../../src/hooks/useResources';
import {
  FeaturedResourceCard,
  ResourceCategoryCard,
  ResourceCard,
} from '../../src/features/resources';
import { ResourceDetail, ResourceCategoryMeta } from '@solace/shared';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ResourcesHomeScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: featured = [],
    isLoading: loadingFeatured,
    refetch: refetchFeatured,
  } = useFeaturedResources();

  const {
    data: recommended = [],
    isLoading: loadingRecommended,
    refetch: refetchRecommended,
  } = useRecommendedResources();

  const {
    data: categories = [],
    isLoading: loadingCategories,
    refetch: refetchCategories,
  } = useResourceCategories();

  const {
    data: resourceList,
    isLoading: loadingList,
    refetch: refetchList,
  } = useResources({
    category: selectedCategory,
    limit: 10,
  });

  const toggleFavoriteMutation = useToggleResourceFavorite();

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic.light();
    await Promise.all([
      refetchFeatured(),
      refetchRecommended(),
      refetchCategories(),
      refetchList(),
    ]);
    setRefreshing(false);
  };

  const handleOpenResource = (resource: ResourceDetail) => {
    router.push(`/resources/${resource.id}` as any);
  };

  const handleSelectCategory = (cat: ResourceCategoryMeta) => {
    router.push({
      pathname: '/resources/category',
      params: { id: cat.id, title: cat.title },
    } as any);
  };

  const handleToggleBookmark = (id: string) => {
    toggleFavoriteMutation.mutate(id);
  };

  const allArticles = resourceList?.data || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top App Header */}
      <View
        style={[
          styles.headerBar,
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
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <AppIcon name="chevronLeft" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <AppHeading level={4} style={{ color: colors.textPrimary }}>
            Explore & Learn
          </AppHeading>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              router.push('/resources/search' as any);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.actionIconButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
                borderRadius: radius.full,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Search resources"
          >
            <AppIcon name="search" size={18} color={colors.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              router.push('/resources/favorites' as any);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.actionIconButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
                borderRadius: radius.full,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="View saved bookmarks"
          >
            <AppIcon name="bookmark" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Welcome Banner */}
        <View style={[styles.welcomeSection, { paddingHorizontal: spacing.md }]}>
          <AppText
            variant="caption"
            style={{
              color: colors.primary,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Wellness Library
          </AppText>
          <AppHeading
            level={2}
            style={{
              color: colors.textPrimary,
              marginTop: 4,
              marginBottom: 4,
            }}
          >
            Evidence-Informed Guidance
          </AppHeading>
          <AppText
            variant="bodySmall"
            style={{
              color: colors.textSecondary,
              lineHeight: 20,
            }}
          >
            Small insights can make a meaningful difference. Explore gentle techniques, healthy habits, and mindfulness wisdom.
          </AppText>
        </View>

        {/* Featured Resources Section */}
        {loadingFeatured ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : featured.length > 0 ? (
          <View style={styles.sectionWrap}>
            <View style={[styles.sectionHeaderRow, { paddingHorizontal: spacing.md }]}>
              <View>
                <AppHeading level={4} style={{ color: colors.textPrimary }}>
                  Featured Guides
                </AppHeading>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Curated by our wellness specialists
                </AppText>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[styles.horizontalList, { paddingLeft: spacing.md }]}
            >
              {featured.map((item) => (
                <FeaturedResourceCard
                  key={item.id}
                  resource={item}
                  onPress={handleOpenResource}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Recommended Section */}
        {!loadingRecommended && recommended.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={[styles.sectionHeaderRow, { paddingHorizontal: spacing.md }]}>
              <View>
                <AppHeading level={4} style={{ color: colors.textPrimary }}>
                  Recommended For You
                </AppHeading>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Tailored to your current wellness goals
                </AppText>
              </View>
            </View>

            <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.sm }}>
              {recommended.slice(0, 3).map((item) => (
                <ResourceCard
                  key={item.id}
                  resource={item}
                  onPress={handleOpenResource}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </View>
          </View>
        )}

        {/* Browse by Category */}
        <View style={styles.sectionWrap}>
          <View style={[styles.sectionHeaderRow, { paddingHorizontal: spacing.md }]}>
            <View>
              <AppHeading level={4} style={{ color: colors.textPrimary }}>
                Browse by Category
              </AppHeading>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                8 foundational pillars of well-being
              </AppText>
            </View>
          </View>

          {loadingCategories ? (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <View style={[styles.categoriesGrid, { paddingHorizontal: spacing.md }]}>
              {categories.map((cat) => (
                <ResourceCategoryCard
                  key={cat.id}
                  category={cat}
                  onPress={handleSelectCategory}
                />
              ))}
            </View>
          )}
        </View>

        {/* All / Filterable Articles Section */}
        <View style={styles.sectionWrap}>
          <View style={[styles.sectionHeaderRow, { paddingHorizontal: spacing.md }]}>
            <View>
              <AppHeading level={4} style={{ color: colors.textPrimary }}>
                All Articles & Guides
              </AppHeading>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Read at your own pace
              </AppText>
            </View>
          </View>

          {/* Category Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.chipsContainer,
              { paddingHorizontal: spacing.md, marginTop: spacing.sm },
            ]}
          >
            <AppChip
              label="All"
              selected={selectedCategory === undefined}
              onPress={() => setSelectedCategory(undefined)}
            />
            {categories.map((cat) => (
              <AppChip
                key={cat.id}
                label={cat.title}
                selected={selectedCategory === cat.id}
                onPress={() =>
                  setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)
                }
              />
            ))}
          </ScrollView>

          {/* Resource List */}
          <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.md }}>
            {loadingList ? (
              <View style={styles.loadingSection}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : allArticles.length === 0 ? (
              <View style={styles.emptyWrap}>
                <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
                  No articles found in this category yet.
                </AppText>
              </View>
            ) : (
              allArticles.map((item) => (
                <ResourceCard
                  key={item.id}
                  resource={item}
                  onPress={handleOpenResource}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 16,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  horizontalList: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  categoriesGrid: {
    marginTop: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  loadingSection: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
});
