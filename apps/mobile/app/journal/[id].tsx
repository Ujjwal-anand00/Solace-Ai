import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Href } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import {
  useJournalDetail,
  useDeleteJournal,
  useToggleJournalFavorite,
  useRequestJournalInsight,
} from '../../src/hooks/useJournal';
import { AIConsentModal } from '../../src/features/journal';

export default function JournalDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [consentModalVisible, setConsentModalVisible] = useState(false);

  const { data: entry, isLoading } = useJournalDetail(id as string);
  const deleteMutation = useDeleteJournal();
  const toggleFavMutation = useToggleJournalFavorite();
  const insightMutation = useRequestJournalInsight();

  const handleDelete = () => {
    Alert.alert(
      'Delete Reflection',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic.warning();
            await deleteMutation.mutateAsync(id as string);
            router.back();
          },
        },
      ],
    );
  };

  const handleConsentConfirm = async () => {
    setConsentModalVisible(false);
    triggerHaptic.medium();
    try {
      await insightMutation.mutateAsync({
        id: id as string,
        consent: true,
      });
      triggerHaptic.success();
    } catch {
      Alert.alert('Error', 'Unable to generate reflection insight right now.');
    }
  };

  if (isLoading || !entry) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.sage} />
        </View>
      </SafeAreaView>
    );
  }

  const dateFormatted = new Date(entry.createdAt).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic.light();
            router.back();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.selection();
              toggleFavMutation.mutate(entry.id);
            }}
            style={styles.actionBtn}
          >
            <Text style={styles.favIcon}>{entry.isFavorite ? '★' : '☆'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerHaptic.light();
              router.push(
                `/journal/editor?id=${entry.id}&title=${encodeURIComponent(
                  entry.title,
                )}&content=${encodeURIComponent(entry.content)}&category=${entry.category}` as Href,
              );
            }}
            style={styles.actionBtn}
          >
            <Text style={styles.actionIcon}>✎</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Date and Category Badge */}
        <View style={styles.metaRow}>
          <Text style={styles.dateText}>{dateFormatted}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {entry.category.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{entry.title}</Text>

        {/* Guided Prompt Banner */}
        {entry.prompt ? (
          <View style={styles.promptBanner}>
            <Text style={styles.promptLabel}>REFLECTION PROMPT</Text>
            <Text style={styles.promptText}>{entry.prompt}</Text>
          </View>
        ) : null}

        {/* Content */}
        <Text style={styles.content}>{entry.content}</Text>

        {/* Associated Mood & Tags */}
        {(entry.moodAssociation || (entry.tags && entry.tags.length > 0)) && (
          <View style={styles.detailsBox}>
            {entry.moodAssociation && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mood felt:</Text>
                <Text style={styles.detailValue}>{entry.moodAssociation}</Text>
              </View>
            )}

            {entry.tags && entry.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {entry.tags.map((t, idx) => (
                  <View key={idx} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{t}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* AI Reflection Section */}
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiIcon}>✦</Text>
            <Text style={styles.aiTitle}>Solace Reflection</Text>
          </View>

          {entry.aiInsight ? (
            <View style={styles.insightCard}>
              <Text style={styles.insightTheme}>{entry.aiInsight.theme}</Text>
              <Text style={styles.insightReflection}>{entry.aiInsight.reflection}</Text>

              {entry.aiInsight.suggestedAction ? (
                <View style={styles.suggestedBox}>
                  <Text style={styles.suggestedLabel}>GENTLE PRACTICE</Text>
                  <Text style={styles.suggestedText}>
                    {entry.aiInsight.suggestedAction}
                  </Text>
                </View>
              ) : null}

              {entry.aiInsight.affirmingThought ? (
                <View style={styles.affirmingBox}>
                  <Text style={styles.affirmingText}>
                    "{entry.aiInsight.affirmingThought}"
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.aiRequestCard}>
              <Text style={styles.aiRequestDesc}>
                Would you like Solace AI to gently reflect on this entry? Your thoughts remain
                strictly private and are never used to train models.
              </Text>

              <TouchableOpacity
                style={styles.requestBtn}
                onPress={() => setConsentModalVisible(true)}
                disabled={insightMutation.isPending}
              >
                {insightMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.requestBtnText}>Request AI Reflection</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* AI Consent Modal */}
      <AIConsentModal
        visible={consentModalVisible}
        onConfirm={handleConsentConfirm}
        onCancel={() => setConsentModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.white,
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: colors.sageDark,
    fontWeight: '600',
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  favIcon: {
    fontSize: 20,
    color: '#D4A76A',
  },
  actionIcon: {
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  categoryBadge: {
    backgroundColor: colors.lavender,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.sageDark,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
    lineHeight: 30,
  },
  promptBanner: {
    backgroundColor: colors.lavenderLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderLeftWidth: 4,
    borderLeftColor: colors.lavenderDark,
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.sageDark,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  promptText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    fontWeight: '500',
  },
  content: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: 24,
  },
  detailsBox: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginRight: 6,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: colors.cream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  aiSection: {
    marginTop: 10,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  aiIcon: {
    fontSize: 16,
    color: '#6B46C1',
    marginRight: 6,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  insightCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E9D8FD',
  },
  insightTheme: {
    fontSize: 15,
    fontWeight: '700',
    color: '#553C9A',
    marginBottom: 8,
  },
  insightReflection: {
    fontSize: 14,
    color: '#2D3748',
    lineHeight: 22,
    marginBottom: 14,
  },
  suggestedBox: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9D8FD',
  },
  suggestedLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B46C1',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  suggestedText: {
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  affirmingBox: {
    paddingTop: 6,
    alignItems: 'center',
  },
  affirmingText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#6B46C1',
    fontWeight: '600',
    textAlign: 'center',
  },
  aiRequestCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  aiRequestDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  requestBtn: {
    backgroundColor: colors.sage,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  requestBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});

