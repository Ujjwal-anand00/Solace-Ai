import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { useJournals, useToggleJournalFavorite } from '../../src/hooks/useJournal';
import { JournalEntryCard } from '../../src/features/journal';

export default function JournalHistoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const { data: journalsResponse, isLoading } = useJournals({
    search: search.trim() || undefined,
    isFavorite: filterFavorite ? true : undefined,
    category: selectedCategory,
    limit: 50,
  });

  const toggleFavMutation = useToggleJournalFavorite();

  const categories = [
    { id: undefined, label: 'All' },
    { id: 'free_write', label: 'Free Write' },
    { id: 'guided_reflection', label: 'Guided' },
    { id: 'gratitude', label: 'Gratitude' },
    { id: 'emotional_checkin', label: 'Emotions' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal History</Text>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.selection();
            setFilterFavorite(!filterFavorite);
          }}
          style={[styles.favFilterBtn, filterFavorite && styles.favFilterBtnActive]}
        >
          <Text style={styles.favFilterIcon}>{filterFavorite ? '★ Favs' : '☆ All'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your reflections by title, words, tags..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearch}
            onPress={() => setSearch('')}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {categories.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <TouchableOpacity
              key={c.label}
              style={[styles.catChip, isSelected && styles.catChipActive]}
              onPress={() => {
                triggerHaptic.selection();
                setSelectedCategory(c.id);
              }}
            >
              <Text
                style={[
                  styles.catChipText,
                  isSelected && styles.catChipTextActive,
                ]}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Journal Entries List */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.sage} style={{ marginTop: 40 }} />
        ) : journalsResponse?.data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching entries found</Text>
            <Text style={styles.emptyDesc}>
              Try adjusting your search terms or category filters.
            </Text>
          </View>
        ) : (
          journalsResponse?.data.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onPress={() => router.push(`/journal/${entry.id}` as Href)}
              onToggleFavorite={() => toggleFavMutation.mutate(entry.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: colors.sageDark,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  favFilterBtn: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  favFilterBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  favFilterIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  clearSearch: {
    position: 'absolute',
    right: 28,
    top: 12,
  },
  clearSearchText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  categoryRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  catChip: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  catChipActive: {
    backgroundColor: colors.sageLight,
    borderColor: colors.sage,
  },
  catChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  catChipTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

