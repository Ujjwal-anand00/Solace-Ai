import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeading, AppText, AppIcon } from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useResources,
  useToggleResourceFavorite,
  useResourceCategories,
} from '../../src/hooks/useResources';
import { ResourceCard } from '../../src/features/resources';
import { ResourceDetail } from '@solace/shared';
import { triggerHaptic } from '../../src/utils/haptics';

export default function CategoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; title?: string }>();
  const categoryId = params.id || 'emotions';

  const { colors, spacing, radius } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const { data: categories = [] } = useResourceCategories();
  const currentCategory = categories.find((c) => c.id === categoryId);

  const categoryTitle =
    params.title || currentCategory?.title || categoryId.replace('_', ' ');

  const {
    data: resourceList,
    isLoading,
    refetch,
  } = useResources({
    category: categoryId,
    limit: 50,
  });

  const toggleFavoriteMutation = useToggleResourceFavorite();

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic.light();
    await refetch();
    setRefreshing(false);
  };

  const handleOpenResource = (resource: ResourceDetail) => {
    router.push(`/resources/${resource.id}` as any);
  };

  const handleToggleBookmark = (id: string) => {
    toggleFavoriteMutation.mutate(id);
  };

  const resources = resourceList?.data || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Header */}
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
          <AppHeading level={4} style={{ color: colors.textPrimary }} numberOfLines={1}>
            {categoryTitle}
          </AppHeading>
        </View>

        <TouchableOpacity
          onPress={() => {
            triggerHaptic.selection();
            router.push('/resources/search' as any);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[
            styles.searchButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
              borderRadius: radius.full,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Search category"
        >
          <AppIcon name="search" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
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
        {/* Category Description Banner */}
        {currentCategory?.description && (
          <View
            style={[
              styles.categoryHero,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
                borderRadius: radius.lg,
                marginHorizontal: spacing.md,
                marginTop: spacing.md,
                padding: spacing.md,
              },
            ]}
          >
            <AppText
              variant="bodySmall"
              style={{
                color: colors.textSecondary,
                lineHeight: 20,
              }}
            >
              {currentCategory.description}
            </AppText>
            <AppText
              variant="caption"
              style={{
                color: colors.primaryDark,
                fontWeight: '600',
                marginTop: 8,
              }}
            >
              {resources.length} {resources.length === 1 ? 'guide' : 'guides'} available
            </AppText>
          </View>
        )}

        {/* Resource List */}
        <View style={[styles.listContainer, { paddingHorizontal: spacing.md, marginTop: spacing.md }]}>
          {isLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : resources.length === 0 ? (
            <View style={styles.emptyWrap}>
              <AppIcon name="bookOpen" size={40} color={colors.textTertiary} />
              <AppText
                variant="body"
                style={{
                  color: colors.textSecondary,
                  marginTop: 12,
                  textAlign: 'center',
                }}
              >
                No guides found in this category yet.
              </AppText>
            </View>
          ) : (
            resources.map((item) => (
              <ResourceCard
                key={item.id}
                resource={item}
                onPress={handleOpenResource}
                onToggleBookmark={handleToggleBookmark}
              />
            ))
          )}
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
  searchButton: {
    width: 36,
    height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 8,
  },
  categoryHero: {
    borderWidth: 1,
  },
  listContainer: {
    marginTop: 12,
  },
  loadingWrap: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
