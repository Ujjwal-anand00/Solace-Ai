import { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeading, AppText, AppIcon, AppChip } from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import {
  useResourceSearch,
  useResourceCategories,
  useToggleResourceFavorite,
} from '../../src/hooks/useResources';
import { ResourceCard } from '../../src/features/resources';
import { ResourceDetail } from '@solace/shared';
import { triggerHaptic } from '../../src/utils/haptics';

const SUGGESTED_TOPICS = [
  'Overwhelm',
  'Bedtime wind-down',
  'Breathing',
  'Self-compassion',
  'Habit building',
  'Boundary setting',
  'Grounding',
  'Inner critic',
];

export default function ResourceSearchScreen() {
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { data: categories = [] } = useResourceCategories();

  const {
    data: searchResult,
    isLoading,
  } = useResourceSearch(query, {
    category: selectedCategory,
  });

  const toggleFavoriteMutation = useToggleResourceFavorite();

  const handleOpenResource = (resource: ResourceDetail) => {
    router.push(`/resources/${resource.id}` as any);
  };

  const handleToggleBookmark = (id: string) => {
    toggleFavoriteMutation.mutate(id);
  };

  const results = searchResult?.resources || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search Bar Header */}
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

        <View
          style={[
            styles.inputWrap,
            {
              backgroundColor: colors.surface,
              borderColor: colors.borderLight,
              borderRadius: radius.full,
            },
          ]}
        >
          <AppIcon name="search" size={18} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search guides, topics, habits..."
            placeholderTextColor={colors.textTertiary}
            style={[
              styles.textInput,
              {
                color: colors.textPrimary,
              },
            ]}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="x" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={{ paddingVertical: spacing.xs }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.chipsContainer,
            { paddingHorizontal: spacing.md },
          ]}
        >
          <AppChip
            label="All Categories"
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
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing['2xl'] }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {query.trim().length === 0 ? (
          /* Empty Search Suggestions */
          <View style={[styles.suggestedContainer, { paddingHorizontal: spacing.md }]}>
            <AppHeading
              level={4}
              style={{
                color: colors.textPrimary,
                marginBottom: spacing.xs,
              }}
            >
              Popular Wellness Topics
            </AppHeading>
            <AppText
              variant="caption"
              style={{
                color: colors.textSecondary,
                marginBottom: spacing.md,
              }}
            >
              Tap a topic to quickly discover supportive guides
            </AppText>

            <View style={styles.topicPillsWrap}>
              {SUGGESTED_TOPICS.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  onPress={() => {
                    triggerHaptic.selection();
                    setQuery(topic);
                  }}
                  style={[
                    styles.topicPill,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.borderLight,
                      borderRadius: radius.full,
                    },
                  ]}
                >
                  <AppText
                    variant="bodySmall"
                    style={{
                      color: colors.textPrimary,
                      fontWeight: '500',
                    }}
                  >
                    {topic}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
            <AppText
              variant="caption"
              style={{
                color: colors.textSecondary,
                marginTop: 8,
              }}
            >
              Searching resource library...
            </AppText>
          </View>
        ) : results.length === 0 ? (
          <View style={[styles.emptyWrap, { paddingHorizontal: spacing.md }]}>
            <AppIcon name="search" size={36} color={colors.textTertiary} />
            <AppHeading
              level={4}
              style={{
                color: colors.textPrimary,
                marginTop: 12,
                marginBottom: 4,
              }}
            >
              No guides found
            </AppHeading>
            <AppText
              variant="bodySmall"
              style={{
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              We couldn't find any resources matching "{query}". Try checking your spelling or search for broader topics like "sleep" or "stress".
            </AppText>
          </View>
        ) : (
          <View style={[styles.resultsList, { paddingHorizontal: spacing.md }]}>
            <AppText
              variant="caption"
              style={{
                color: colors.textSecondary,
                marginBottom: 10,
              }}
            >
              Found {results.length} {results.length === 1 ? 'guide' : 'guides'}
            </AppText>

            {results.map((item) => (
              <ResourceCard
                key={item.id}
                resource={item}
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
    gap: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    paddingTop: 16,
  },
  suggestedContainer: {
    marginTop: 8,
  },
  topicPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicPill: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  loadingWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingVertical: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsList: {
    marginTop: 8,
  },
});
