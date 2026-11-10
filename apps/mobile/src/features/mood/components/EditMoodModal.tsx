import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  AppText,
  AppHeading,
  AppButton,
  AppIcon,
  AppCard,
} from '../../../components/ui';
import { MoodCharacter } from '../../../components/mood';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { MoodEntry } from '@solace/shared';
import { useUpdateMood } from '../../../hooks/useMood';
import { SECONDARY_EMOTIONS, CONTEXT_TAGS, INTENSITY_LEVELS, PRIMARY_MOODS } from '../types';

interface EditMoodModalProps {
  visible: boolean;
  entry: MoodEntry | null;
  onClose: () => void;
}

export const EditMoodModal: React.FC<EditMoodModalProps> = ({
  visible,
  entry,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const updateMoodMutation = useUpdateMood();

  const [intensity, setIntensity] = useState<number>(entry?.moodIntensity || 5);
  const [emotions, setEmotions] = useState<string[]>(entry?.emotions || []);
  const [note, setNote] = useState<string>(entry?.note || '');
  const [tags, setTags] = useState<string[]>(entry?.tags || []);

  useEffect(() => {
    if (entry) {
      setIntensity(entry.moodIntensity);
      setEmotions(entry.emotions || []);
      setNote(entry.note || '');
      setTags(entry.tags || []);
    }
  }, [entry]);

  const handleToggleEmotion = (em: string) => {
    triggerHaptic.selection();
    setEmotions((prev) =>
      prev.includes(em) ? prev.filter((e) => e !== em) : [...prev, em]
    );
  };

  const handleToggleTag = (tag: string) => {
    triggerHaptic.selection();
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!entry) return;
    triggerHaptic.medium();
    try {
      await updateMoodMutation.mutateAsync({
        id: entry.id,
        data: {
          moodIntensity: intensity,
          emotions,
          note: note.trim() || undefined,
          tags,
        },
      });
      triggerHaptic.success();
      onClose();
    } catch (err: unknown) {
      Alert.alert('Error', (err as Error).message || 'Unable to update check-in.');
    }
  };

  if (!entry) return null;

  const moodConfig = PRIMARY_MOODS.find((m) => m.key === entry.mood.toLowerCase()) || {
    label: entry.mood,
    color: colors.primary,
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MoodCharacter
                mood={entry.mood}
                size={34}
                showShadow={false}
                isInteractive={false}
              />
              <View>
                <AppHeading level={3} style={styles.title}>
                  Edit Check-In
                </AppHeading>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Felt {moodConfig.label}
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <AppIcon name="x" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Intensity Level Adjuster */}
            <AppText variant="caption" style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              INTENSITY: {intensity} / 10 ({INTENSITY_LEVELS[intensity]?.label})
            </AppText>
            <View style={styles.intensityRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
                const isSelected = val === intensity;
                return (
                  <TouchableOpacity
                    key={val}
                    onPress={() => {
                      triggerHaptic.selection();
                      setIntensity(val);
                    }}
                    style={[
                      styles.stepBtn,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? colors.surfaceSecondary
                          : '#F0EFE9',
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {val}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Emotions Selection */}
            <AppText variant="caption" style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>
              SECONDARY EMOTIONS
            </AppText>
            <View style={styles.chipsWrap}>
              {SECONDARY_EMOTIONS.map((em) => {
                const lower = em.toLowerCase();
                const isSelected = emotions.includes(lower);
                return (
                  <TouchableOpacity
                    key={em}
                    onPress={() => handleToggleEmotion(lower)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? colors.surfaceSecondary
                          : '#FFFFFF',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{
                        color: isSelected ? '#FFFFFF' : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      {em}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Note Editor */}
            <AppText variant="caption" style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>
              PERSONAL REFLECTION NOTE
            </AppText>
            <AppCard style={styles.inputCard}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Adjust your private reflections..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                style={[styles.textInput, { color: colors.textPrimary }]}
              />
            </AppCard>

            {/* Context Tags */}
            <AppText variant="caption" style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 16 }]}>
              CONTEXT THEMES
            </AppText>
            <View style={styles.chipsWrap}>
              {CONTEXT_TAGS.map((tag) => {
                const lower = tag.toLowerCase();
                const isSelected = tags.includes(lower);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => handleToggleTag(lower)}
                    style={[
                      styles.tagChip,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryLight
                          : isDark
                          ? colors.surfaceSecondary
                          : '#FFFFFF',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{
                        color: isSelected ? colors.primaryDark : colors.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      }}
                    >
                      #{tag}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actions}>
              <AppButton
                title="Save Changes"
                variant="primary"
                size="md"
                fullWidth
                loading={updateMoodMutation.isPending}
                onPress={handleSave}
              />
              <AppButton
                title="Cancel"
                variant="ghost"
                size="sm"
                fullWidth
                onPress={onClose}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E5E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  stepBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  tagChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  inputCard: {
    padding: 12,
    borderRadius: 14,
  },
  textInput: {
    fontSize: 14,
    minHeight: 60,
  },
  actions: {
    marginTop: 20,
    marginBottom: 20,
    gap: 8,
  },
});

