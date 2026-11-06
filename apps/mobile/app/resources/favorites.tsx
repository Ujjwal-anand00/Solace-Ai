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
import { AppHeading, AppText, AppIcon, AppButton } from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useResourceFavorites,
  useToggleResourceFavorite,
} from '../../src/hooks/useResources';
import { ResourceCard } from '../../src/features/resources';
import { ResourceDetail } from '@solace/shared';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ResourceFavoritesScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: favorites = [],
    isLoading,
    refetch,
  } = useResourceFavorites();

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
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
            Saved Resources
          </AppHeading>
        </View>

        <View style={{ width: 36 }} />
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
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : favorites.length === 0 ? (
          <View style={[styles.emptyWrap, { paddingHorizontal: spacing.lg }]}>
            <View
              style={[
                styles.emptyIconCircle,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                  borderRadius: radius.full,
                },
              ]}
            >
              <AppIcon name="bookmark" size={32} color={colors.textTertiary} />
            </View>

            <AppHeading
              level={4}
              style={{
                color: colors.textPrimary,
                marginTop: spacing.md,
                marginBottom: 6,
                textAlign: 'center',
              }}
            >
              No Saved Guides Yet
            </AppHeading>

            <AppText
              variant="bodySmall"
              style={{
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
                marginBottom: spacing.lg,
              }}
            >
              Bookmark educational guides and wellness reflections while exploring to keep them easily accessible here whenever you need gentle guidance.
            </AppText>

            <AppButton
              variant="outline"
              size="sm"
              onPress={() => router.push('/resources' as any)}
            >
              Explore Guides
            </AppButton>
          </View>
        ) : (
          <View style={[styles.listWrap, { paddingHorizontal: spacing.md }]}>
            <AppText
              variant="caption"
              style={{
                color: colors.textSecondary,
                marginBottom: spacing.sm,
              }}
            >
              {favorites.length} {favorites.length === 1 ? 'guide' : 'guides'} saved in your private library
            </AppText>

            {favorites.map((item) => (
              <ResourceCard
                key={item.id}
                resource={{ ...item, isBookmarked: true }}
                onPress={handleOpenResource}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
          </View>
        )}
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
  scrollContent: {
    paddingTop: 16,
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listWrap: {
    marginTop: 8,
  },
});
