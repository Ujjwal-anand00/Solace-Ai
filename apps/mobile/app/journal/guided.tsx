import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { useJournalPrompts } from '../../src/hooks/useJournal';
import { JournalPromptCard } from '../../src/features/journal';
import { PromptCategory } from '@solace/shared';

export default function GuidedPromptsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | undefined>(undefined);

  const { data: prompts, isLoading } = useJournalPrompts(selectedCategory);

  const categories: Array<{ id: PromptCategory | undefined; label: string; icon: string }> = [
    { id: undefined, label: 'All', icon: '✨' },
    { id: 'gratitude', label: 'Gratitude', icon: '🌻' },
    { id: 'reflection', label: 'Daily', icon: '🌿' },
    { id: 'emotions', label: 'Emotions', icon: '🌊' },
    { id: 'growth', label: 'Growth', icon: '🌱' },
    { id: 'calm', label: 'Calm', icon: '🕊️' },
    { id: 'relationships', label: 'Connections', icon: '🤝' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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
        <Text style={styles.headerTitle}>Guided Reflections</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.categoryScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <TouchableOpacity
                key={c.label}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => {
                  triggerHaptic.selection();
                  setSelectedCategory(c.id);
                }}
              >
                <Text style={styles.categoryIcon}>{c.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.sage} style={{ marginTop: 40 }} />
        ) : (
          prompts?.map((prompt) => (
            <JournalPromptCard
              key={prompt.id}
              prompt={prompt}
              onSelect={(p) => {
                router.push(
                  `/journal/editor?category=guided_reflection&prompt=${encodeURIComponent(
                    p.text,
                  )}&promptId=${p.id}`,
                );
              }}
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
  categoryScrollWrapper: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  categoryPillActive: {
    backgroundColor: colors.sageLight,
    borderColor: colors.sage,
  },
  categoryIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
});

