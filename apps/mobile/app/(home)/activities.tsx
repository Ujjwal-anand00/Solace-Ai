import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppIcon,
  AppBadge,
  AppButton,
  LoadingIndicator,
} from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import { useActivities } from '../../src/hooks/useActivities';
import { triggerHaptic } from '../../src/utils/haptics';
import { WellnessActivity } from '@solace/shared';
import {
  BreathingSessionModal,
  GuidedActivityPlayerModal,
  CategoryCard,
  CategoryInfo,
  FeaturedActivityCard,
  ActivityListItem,
} from '../../src/features/activities';

const CATEGORIES: CategoryInfo[] = [
  {
    key: 'breathing',
    title: 'Breathing',
    description: 'Rhythmic breathwork to ground awareness and calm the nervous system.',
    icon: 'wind',
    accentColor: '#9678BD',
  },
  {
    key: 'mindfulness',
    title: 'Mindfulness',
    description: 'Sensory awareness and present-moment grounding practices.',
    icon: 'smile',
    accentColor: '#CBB3E8',
  },
  {
    key: 'relaxation',
    title: 'Relaxation',
    description: 'Gentle body scans and progressive muscular tension release.',
    icon: 'moon',
    accentColor: '#6A5682',
  },
  {
    key: 'self-care',
    title: 'Self-Care',
    description: 'Digital detoxes, hydration pauses, and gentle daily resets.',
    icon: 'heart',
    accentColor: '#E34234',
  },
  {
    key: 'affirmation',
    title: 'Positive Affirmations',
    description: 'Empowering self-compassion and resilience statements.',
    icon: 'sparkles',
    accentColor: '#D4FF3F',
  },
  {
    key: 'reflection',
    title: 'Reflection',
    description: 'Evening gratitude and gentle cognitive reframing prompts.',
    icon: 'bookOpen',
    accentColor: '#9678BD',
  },
];

const DURATION_FILTERS = [
  { key: 'all', label: 'Any Duration' },
  { key: '<3', label: '< 3 min' },
  { key: '3-5', label: '3-5 min' },
  { key: '5+', label: '5+ min' },
];

const DIFFICULTY_FILTERS = [
  { key: 'all', label: 'All Levels' },
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'advanced', label: 'Advanced' },
];

export default function ActivitiesScreen(): React.JSX.Element {
  const { colors } = useTheme();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Modals state
  const [breathingModalVisible, setBreathingModalVisible] = useState(false);
  const [breathingPatternId, setBreathingPatternId] = useState('box');
  const [breathingActivityId, setBreathingActivityId] = useState<string | undefined>(undefined);
  const [playerActivity, setPlayerActivity] = useState<WellnessActivity | null>(null);

  // Query activities from backend
  const {
    data: rawActivities = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useActivities(
    selectedCategory === 'all'
      ? undefined
      : { category: selectedCategory },
  );

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const act of rawActivities) {
      counts[act.category] = (counts[act.category] || 0) + 1;
    }
    return counts;
  }, [rawActivities]);

  // Featured activity (e.g. Box Breathing or first activity)
  const featuredActivity = useMemo(() => {
    return (
      rawActivities.find((a) => a.title.toLowerCase().includes('box breathing')) ||
      rawActivities[0]
    );
  }, [rawActivities]);

  // Filter activities by search, duration, difficulty
  const filteredActivities = useMemo(() => {
    return rawActivities.filter((act) => {
      // 1. Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = act.title.toLowerCase().includes(query);
        const matchesDesc = act.description.toLowerCase().includes(query);
        const matchesCat = act.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && act.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 3. Duration filter
      const mins = act.duration / 60;
      if (selectedDuration === '<3' && mins >= 3) return false;
      if (selectedDuration === '3-5' && (mins < 3 || mins > 5)) return false;
      if (selectedDuration === '5+' && mins <= 5) return false;

      // 4. Difficulty filter
      if (selectedDifficulty !== 'all' && act.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [rawActivities, searchQuery, selectedCategory, selectedDuration, selectedDifficulty]);

  // Start an activity handler
  const handleStartActivity = (activity: WellnessActivity) => {
    triggerHaptic.selection();

    if (activity.category.toLowerCase() === 'breathing') {
      let pattern = 'box';
      const t = activity.title.toLowerCase();
      if (t.includes('relaxing') || t.includes('4-6')) pattern = 'relaxing';
      else if (t.includes('equal') || t.includes('4-4')) pattern = 'equal';
      else if (t.includes('extended') || t.includes('4-8')) pattern = 'extended-exhale';
      else if (t.includes('4-7-8')) pattern = '4-7-8';

      setBreathingPatternId(pattern);
      setBreathingActivityId(activity.id);
      setBreathingModalVisible(true);
    } else {
      setPlayerActivity(activity);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => { refetch(); }} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppBadge label="MINDFUL SANCTUARY" variant="primary" size="sm" />
          <AppHeading level="h2" style={styles.title}>
            Take a moment for yourself 🌿
          </AppHeading>
          <AppText variant="bodyMedium" style={[styles.subtitle, { color: colors.textSecondary }]}>
            Small moments of care can make a meaningful difference.
          </AppText>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppIcon name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search practices, breathing, meditations..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <AppIcon name="x" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Featured Card (Shown when not searching and category is all) */}
        {!searchQuery && selectedCategory === 'all' && featuredActivity && (
          <View style={styles.sectionWrap}>
            <FeaturedActivityCard
              activity={featuredActivity}
              onStart={handleStartActivity}
            />
          </View>
        )}

        {/* Category Cards Overview (Shown when in 'all' view) */}
        {!searchQuery && selectedCategory === 'all' && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <AppHeading level="h4" style={styles.sectionHeading}>
                Explore by Category
              </AppHeading>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                6 Core Disciplines
              </AppText>
            </View>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => (
                <CategoryCard
                  key={cat.key}
                  category={{
                    ...cat,
                    count: categoryCounts[cat.key],
                  }}
                  isSelected={selectedCategory === cat.key}
                  onPress={(key) => setSelectedCategory(key)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Category Filter Pills (When category is selected or during search) */}
        {(selectedCategory !== 'all' || searchQuery.length > 0) && (
          <View style={styles.filterPillsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsScroll}>
              <TouchableOpacity
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: selectedCategory === 'all' ? colors.primaryDark : colors.surface,
                    borderColor: selectedCategory === 'all' ? colors.primaryDark : colors.border,
                  },
                ]}
                onPress={() => {
                  triggerHaptic.selection();
                  setSelectedCategory('all');
                }}
              >
                <AppText
                  variant="caption"
                  style={[
                    styles.filterPillText,
                    { color: selectedCategory === 'all' ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  All Categories
                </AppText>
              </TouchableOpacity>

              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isSelected ? colors.primaryDark : colors.surface,
                        borderColor: isSelected ? colors.primaryDark : colors.border,
                      },
                    ]}
                    onPress={() => {
                      triggerHaptic.selection();
                      setSelectedCategory(cat.key);
                    }}
                  >
                    <AppText
                      variant="caption"
                      style={[
                        styles.filterPillText,
                        { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                      ]}
                    >
                      {cat.title}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Secondary Filters: Duration & Difficulty */}
        <View style={styles.subFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFiltersScroll}>
            {/* Duration Pills */}
            {DURATION_FILTERS.map((d) => {
              const isSelected = selectedDuration === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[
                    styles.subFilterPill,
                    {
                      backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                      borderColor: isSelected ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedDuration(d.key);
                  }}
                >
                  <AppText
                    variant="caption"
                    style={{
                      color: isSelected ? colors.primaryDark : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {d.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}

            <View style={[styles.filterDivider, { backgroundColor: colors.border }]} />

            {/* Difficulty Pills */}
            {DIFFICULTY_FILTERS.map((diff) => {
              const isSelected = selectedDifficulty === diff.key;
              return (
                <TouchableOpacity
                  key={diff.key}
                  style={[
                    styles.subFilterPill,
                    {
                      backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                      borderColor: isSelected ? colors.primaryDark : colors.border,
                    },
                  ]}
                  onPress={() => {
                    triggerHaptic.selection();
                    setSelectedDifficulty(diff.key);
                  }}
                >
                  <AppText
                    variant="caption"
                    style={{
                      color: isSelected ? colors.primaryDark : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    }}
                  >
                    {diff.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Activities List */}
        <View style={styles.listSection}>
          <View style={styles.listHeaderRow}>
            <AppHeading level="h4" style={styles.sectionHeading}>
              {selectedCategory === 'all'
                ? 'All Mindful Practices'
                : `${CATEGORIES.find((c) => c.key === selectedCategory)?.title || 'Selected'} Practices`}
            </AppHeading>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              {filteredActivities.length} available
            </AppText>
          </View>

          {isLoading ? (
            <View style={styles.loadingWrap}>
              <LoadingIndicator size="large" />
              <AppText variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 8 }}>
                Loading mindful practices...
              </AppText>
            </View>
          ) : isError ? (
            <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppIcon name="alertCircle" size={24} color="#E53E3E" />
              <AppText variant="bodyMedium" style={{ fontWeight: '600' }}>
                Unable to load practices
              </AppText>
              <AppButton title="Try Again" size="sm" variant="outline" onPress={() => refetch()} />
            </View>
          ) : filteredActivities.length === 0 ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <AppIcon name="compass" size={28} color={colors.textSecondary} />
              <AppText variant="bodyMedium" style={{ fontWeight: '600', marginTop: 6 }}>
                No practices found
              </AppText>
              <AppText variant="caption" style={{ color: colors.textSecondary, textAlign: 'center' }}>
                Try adjusting your search query, duration, or difficulty filters.
              </AppText>
              <AppButton
                title="Reset Filters"
                size="sm"
                variant="outline"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDuration('all');
                  setSelectedDifficulty('all');
                }}
                style={{ marginTop: 8 }}
              />
            </View>
          ) : (
            <View style={styles.activitiesList}>
              {filteredActivities.map((act) => (
                <ActivityListItem
                  key={act.id}
                  activity={act}
                  onPress={handleStartActivity}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Guided Breathing Session Modal */}
      <BreathingSessionModal
        visible={breathingModalVisible}
        initialPatternId={breathingPatternId}
        activityId={breathingActivityId}
        onClose={() => setBreathingModalVisible(false)}
        onActivityCompleted={() => refetch()}
      />

      {/* Guided Activity Player Modal (Mindfulness, Relaxation, Self-care, Reflection) */}
      <GuidedActivityPlayerModal
        activity={playerActivity}
        visible={Boolean(playerActivity)}
        onClose={() => setPlayerActivity(null)}
        onCompleted={() => refetch()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  clearBtn: {
    padding: 4,
  },
  sectionWrap: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
  },
  categoryGrid: {
    gap: 10,
  },
  filterPillsRow: {
    marginHorizontal: -20,
  },
  pillsScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterPillText: {
    fontWeight: '600',
    fontSize: 12,
  },
  subFiltersRow: {
    marginHorizontal: -20,
  },
  subFiltersScroll: {
    paddingHorizontal: 20,
    gap: 6,
    alignItems: 'center',
  },
  subFilterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterDivider: {
    width: 1,
    height: 16,
    marginHorizontal: 4,
  },
  listSection: {
    gap: 12,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  errorCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 10,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  activitiesList: {
    gap: 10,
  },
});
