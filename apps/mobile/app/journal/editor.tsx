import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { triggerHaptic } from '../../src/utils/haptics';
import { useCreateJournal, useUpdateJournal } from '../../src/hooks/useJournal';
import { journalDraftStorage } from '../../src/features/journal';
import { JournalCategory } from '@solace/shared';

export default function JournalEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialCategory = (params.category as JournalCategory) || 'free_write';
  const initialPrompt = (params.prompt as string) || '';
  const initialPromptId = (params.promptId as string) || '';
  const editId = (params.id as string) || '';

  const [title, setTitle] = useState((params.title as string) || '');
  const [content, setContent] = useState((params.content as string) || '');
  const [category] = useState<JournalCategory>(initialCategory);
  const [selectedMood, setSelectedMood] = useState<string>((params.mood as string) || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const isFavorite = false;
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const createMutation = useCreateJournal();
  const updateMutation = useUpdateJournal();

  const draftKey = editId || initialPromptId || 'active_editor';

  // Load offline draft if starting fresh
  useEffect(() => {
    if (!editId && !content) {
      journalDraftStorage.getDraft(draftKey).then((saved) => {
        if (saved && saved.data.content) {
          setTitle((t) => t || saved.data.title || '');
          setContent(saved.data.content || '');
          if (saved.data.tags) setTags(saved.data.tags);
          if (saved.data.moodAssociation) setSelectedMood(saved.data.moodAssociation);
        }
      });
    }
  }, [draftKey, editId]);

  // Auto-save draft locally on content changes
  useEffect(() => {
    if (!content.trim()) return;
    const timer = setTimeout(() => {
      setIsSavingDraft(true);
      journalDraftStorage
        .saveDraft(draftKey, {
          title: title.trim() || 'Untitled Reflection',
          content,
          category,
          prompt: initialPrompt || undefined,
          promptId: initialPromptId || undefined,
          moodAssociation: selectedMood || undefined,
          tags,
          isFavorite,
          isDraft: true,
        })
        .finally(() => setIsSavingDraft(false));
    }, 1500);

    return () => clearTimeout(timer);
  }, [title, content, category, selectedMood, tags, isFavorite, draftKey, initialPrompt, initialPromptId]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
      triggerHaptic.selection();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    triggerHaptic.selection();
  };

  const handleSave = async (asDraft = false) => {
    if (!content.trim()) {
      Alert.alert('Empty reflection', 'Please write a few words before saving.');
      return;
    }

    triggerHaptic.medium();
    const finalTitle = title.trim() || (initialPrompt ? initialPrompt.slice(0, 50) : 'Daily Reflection');

    try {
      if (editId) {
        await updateMutation.mutateAsync({
          id: editId,
          payload: {
            title: finalTitle,
            content,
            category,
            moodAssociation: selectedMood || undefined,
            tags,
            isFavorite,
            isDraft: asDraft,
          },
        });
      } else {
        await createMutation.mutateAsync({
          title: finalTitle,
          content,
          category,
          prompt: initialPrompt || undefined,
          promptId: initialPromptId || undefined,
          moodAssociation: selectedMood || undefined,
          tags,
          isFavorite,
          isDraft: asDraft,
        });
      }

      await journalDraftStorage.clearDraft(draftKey);
      triggerHaptic.success();
      router.back();
    } catch {
      Alert.alert('Unable to save', 'An error occurred while saving your journal. Your draft is preserved locally.');
    }
  };

  const moods = [
    { label: 'Peaceful', value: 'peaceful', emoji: '🌿' },
    { label: 'Grateful', value: 'grateful', emoji: '✨' },
    { label: 'Tired', value: 'tired', emoji: '🌙' },
    { label: 'Anxious', value: 'anxious', emoji: '💭' },
    { label: 'Heavy', value: 'heavy', emoji: '🌧️' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Editor Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.light();
              router.back();
            }}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>
              {editId ? 'Edit Entry' : 'New Journal'}
            </Text>
            {isSavingDraft && <Text style={styles.draftSavingText}>Saving draft...</Text>}
          </View>

          <TouchableOpacity
            onPress={() => handleSave(false)}
            style={styles.saveBtn}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Prompt Banner (if arriving from a prompt) */}
          {initialPrompt ? (
            <View style={styles.promptBanner}>
              <Text style={styles.promptBannerLabel}>GUIDED PROMPT</Text>
              <Text style={styles.promptBannerText}>{initialPrompt}</Text>
            </View>
          ) : null}

          {/* Title Input */}
          <TextInput
            style={styles.titleInput}
            placeholder="Title (optional)..."
            placeholderTextColor={colors.textLight}
            value={title}
            onChangeText={setTitle}
            maxLength={180}
          />

          {/* Mood Selector Row */}
          <View style={styles.moodSection}>
            <Text style={styles.sectionLabel}>Associated Mood</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodRow}>
              {moods.map((m) => {
                const isSelected = selectedMood === m.value;
                return (
                  <TouchableOpacity
                    key={m.value}
                    style={[styles.moodChip, isSelected && styles.moodChipSelected]}
                    onPress={() => {
                      triggerHaptic.selection();
                      setSelectedMood(isSelected ? '' : m.value);
                    }}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text
                      style={[
                        styles.moodChipText,
                        isSelected && styles.moodChipTextSelected,
                      ]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Main Content Input */}
          <TextInput
            style={styles.contentInput}
            placeholder="Let your thoughts settle gently onto the page... Take as much space as you need."
            placeholderTextColor={colors.textLight}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          {/* Tag Selector */}
          <View style={styles.tagSection}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add tag (e.g. sleep, family)..."
                placeholderTextColor={colors.textLight}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
                <Text style={styles.addTagBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {tags.length > 0 && (
              <View style={styles.tagsDisplay}>
                {tags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={styles.tagPill}
                    onPress={() => handleRemoveTag(tag)}
                  >
                    <Text style={styles.tagPillText}>#{tag} ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cream,
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
  cancelBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  topBarCenter: {
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  draftSavingText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  saveBtn: {
    backgroundColor: colors.sage,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  promptBanner: {
    backgroundColor: colors.lavenderLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.lavenderDark,
  },
  promptBannerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.sageDark,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  promptBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodSection: {
    marginBottom: 16,
  },
  moodRow: {
    flexDirection: 'row',
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  moodChipSelected: {
    backgroundColor: colors.sageLight,
    borderColor: colors.sage,
  },
  moodEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  moodChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  moodChipTextSelected: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  contentInput: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    minHeight: 240,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  tagSection: {
    marginBottom: 20,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tagInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  addTagBtn: {
    backgroundColor: colors.sage,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 10,
  },
  addTagBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  tagsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagPillText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

