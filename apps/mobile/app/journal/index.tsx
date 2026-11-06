import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import {
  useJournals,
  useJournalStats,
  useRandomJournalPrompt,
  useToggleJournalFavorite,
} from '../../src/hooks/useJournal';
import {
  JournalEntryCard,
  JournalPromptCard,
} from '../../src/features/journal';

export default function JournalHomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: journalsResponse,
    isLoading: isLoadingJournals,
    refetch: refetchJournals,
  } = useJournals({ limit: 5 });

  const { data: stats, refetch: refetchStats } = useJournalStats();
  const { data: randomPrompt, refetch: refetchPrompt } = useRandomJournalPrompt();
  const toggleFavMutation = useToggleJournalFavorite();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchJournals(), refetchStats(), refetchPrompt()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
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

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => {
              triggerHaptic.light();
              router.push('/journal/calendar');
            }}
          >
            <Text style={styles.headerIcon}>📅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => {
              triggerHaptic.light();
              router.push('/journal/history');
            }}
          >
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.tagline}>Your Private Sanctuary</Text>
          <Text style={styles.mainTitle}>Reflect & Release 🌿</Text>
          <Text style={styles.subtitle}>
            Your thoughts deserve a safe, tender space. Write freely at your own gentle pace.
          </Text>
        </View>

        {/* Stats Row */}
        {stats && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalEntries}</Text>
              <Text style={styles.statLabel}>Entries</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.favoriteCount}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        )}

        {/* Quick Action Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ways to Write</Text>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#F0F5F1' }]}
            onPress={() => {
              triggerHaptic.light();
              router.push('/journal/editor?category=free_write');
            }}
          >
            <Text style={styles.actionIcon}>✍️</Text>
            <Text style={styles.actionTitle}>Free Write</Text>
            <Text style={styles.actionDesc}>Unburden your mind without structure</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.lavenderLight }]}
            onPress={() => {
              triggerHaptic.light();
              router.push('/journal/gratitude');
            }}
          >
            <Text style={styles.actionIcon}>🌻</Text>
            <Text style={styles.actionTitle}>Gratitude</Text>
            <Text style={styles.actionDesc}>Notice the gentle bright spots</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FBF5EE' }]}
            onPress={() => {
              triggerHaptic.light();
              router.push('/journal/guided');
            }}
          >
            <Text style={styles.actionIcon}>🧭</Text>
            <Text style={styles.actionTitle}>Guided</Text>
            <Text style={styles.actionDesc}>Explore targeted reflection prompts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#EFF6FF' }]}
            onPress={() => {
              triggerHaptic.light();
              router.push('/journal/editor?category=emotional_checkin');
            }}
          >
            <Text style={styles.actionIcon}>🌊</Text>
            <Text style={styles.actionTitle}>Emotion Log</Text>
            <Text style={styles.actionDesc}>Check in with your feelings</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Spark / Random Prompt */}
        {randomPrompt && (
          <View style={styles.promptSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daily Reflection Spark</Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic.light();
                  refetchPrompt();
                }}
              >
                <Text style={styles.refreshPromptText}>New prompt ⟳</Text>
              </TouchableOpacity>
            </View>
            <JournalPromptCard
              prompt={randomPrompt}
              onSelect={(p) => {
                router.push(
                  `/journal/editor?category=guided_reflection&prompt=${encodeURIComponent(
                    p.text,
                  )}&promptId=${p.id}`,
                );
              }}
            />
          </View>
        )}

        {/* Recent Entries */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reflections</Text>
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.light();
                router.push('/journal/history');
              }}
            >
              <Text style={styles.viewAllText}>View all ›</Text>
            </TouchableOpacity>
          </View>

          {isLoadingJournals && (
            <Text style={styles.emptyText}>Loading your entries...</Text>
          )}

          {!isLoadingJournals && journalsResponse?.data.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Your journal is waiting</Text>
              <Text style={styles.emptyDesc}>
                Take a deep breath. Even a single sentence is a meaningful step toward clarity.
              </Text>
              <TouchableOpacity
                style={styles.firstWriteBtn}
                onPress={() => {
                  triggerHaptic.medium();
                  router.push('/journal/editor');
                }}
              >
                <Text style={styles.firstWriteText}>Write First Entry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoadingJournals &&
            journalsResponse?.data.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onPress={() => router.push(`/journal/${entry.id}` as Href)}
                onToggleFavorite={() => toggleFavMutation.mutate(entry.id)}
              />
            ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          triggerHaptic.medium();
          router.push('/journal/editor');
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
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
    paddingVertical: 10,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 16,
    color: colors.sageDark,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerIcon: {
    fontSize: 17,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.sageDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.sageDark,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  refreshPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sageDark,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sageDark,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  promptSection: {
    marginTop: 12,
  },
  recentSection: {
    marginTop: 16,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    lineHeight: 18,
    marginBottom: 16,
  },
  firstWriteBtn: {
    backgroundColor: colors.sage,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  firstWriteText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    paddingHorizontal: 20,
    fontSize: 13,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.sage,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '300',
    marginTop: -2,
  },
});

