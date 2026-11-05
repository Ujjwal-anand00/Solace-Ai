import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Linking, Platform } from 'react-native';
import { AppText, AppHeading, AppCard, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { CONTEXT_TAGS } from '../types';

interface ReflectionInputProps {
  note: string;
  onChangeNote: (text: string) => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

const CRISIS_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'harm myself',
  'want to die',
  'dont want to live',
  "don't want to live",
  'better off dead',
];

export const ReflectionInput: React.FC<ReflectionInputProps> = ({
  note,
  onChangeNote,
  selectedTags,
  onToggleTag,
}) => {
  const { colors, isDark } = useTheme();

  // Safety trigger detection
  const isSafetyTriggered = React.useMemo(() => {
    if (!note) return false;
    const lower = note.toLowerCase();
    return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
  }, [note]);

  const handleToggleTag = (tag: string) => {
    triggerHaptic.selection();
    onToggleTag(tag);
  };

  const handleCallLifeline = () => {
    triggerHaptic.medium();
    Linking.openURL('tel:988');
  };

  const handleTextCrisis = () => {
    triggerHaptic.medium();
    const smsUrl = Platform.select({
      ios: 'sms:741741&body=HOME',
      default: 'sms:741741?body=HOME',
    });
    Linking.openURL(smsUrl);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppHeading level={1} style={styles.title}>
          Would you like to share what’s on your mind?
        </AppHeading>
        <AppText
          variant="bodyMedium"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Expressing thoughts in words helps process them. This is optional and remains private.
        </AppText>
      </View>

      {/* Safety Support Banner if Crisis Words Detected */}
      {isSafetyTriggered && (
        <AppCard style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <View style={styles.safetyIconCircle}>
              <AppIcon name="heart" size={20} color="#DC2626" />
            </View>
            <View style={styles.safetyHeaderTexts}>
              <AppHeading level={3} style={styles.safetyTitle}>
                You Are Not Alone
              </AppHeading>
              <AppText variant="caption" style={{ color: '#7F1D1D' }}>
                Compassionate, confidential support is available 24/7.
              </AppText>
            </View>
          </View>

          <AppText variant="bodySmall" style={styles.safetyBody}>
            If you are feeling overwhelmed or having thoughts of self-harm, please reach out to trained support specialists:
          </AppText>

          <View style={styles.safetyActions}>
            <TouchableOpacity
              onPress={handleCallLifeline}
              style={[styles.safetyButton, { backgroundColor: '#DC2626' }]}
              activeOpacity={0.8}
            >
              <AppIcon name="phone" size={16} color="#FFFFFF" />
              <AppText variant="caption" style={styles.safetyButtonText}>
                Call 988 Lifeline
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTextCrisis}
              style={[styles.safetyButton, { backgroundColor: '#B91C1C' }]}
              activeOpacity={0.8}
            >
              <AppIcon name="messageCircle" size={16} color="#FFFFFF" />
              <AppText variant="caption" style={styles.safetyButtonText}>
                Text HOME to 741741
              </AppText>
            </TouchableOpacity>
          </View>
        </AppCard>
      )}

      {/* Multiline Note Input */}
      <AppCard style={styles.inputCard}>
        <TextInput
          value={note}
          onChangeText={onChangeNote}
          placeholder="What events, thoughts or sensations are present? (Optional)"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
          style={[
            styles.textInput,
            {
              color: colors.textPrimary,
              minHeight: 120,
            },
          ]}
        />

        <View style={styles.inputFooter}>
          <View style={styles.privacyTag}>
            <AppIcon name="shield" size={14} color={colors.primary} />
            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
              Private Sanctuary Note
            </AppText>
          </View>

          <AppText variant="caption" style={{ color: colors.textSecondary }}>
            {note.length} / 1000
          </AppText>
        </View>
      </AppCard>

      {/* Contextual Tags */}
      <View style={styles.tagsSection}>
        <AppHeading level={3} style={styles.tagsHeading}>
          Contextual Themes (Optional)
        </AppHeading>
        <AppText variant="caption" style={[styles.tagsSubtitle, { color: colors.textSecondary }]}>
          Tag what areas of life are influencing how you feel:
        </AppText>

        <View style={styles.tagsWrap}>
          {CONTEXT_TAGS.map((tag) => {
            const isSelected = selectedTags.includes(tag.toLowerCase());
            return (
              <TouchableOpacity
                key={tag}
                activeOpacity={0.7}
                onPress={() => handleToggleTag(tag.toLowerCase())}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primaryLight
                      : isDark
                      ? colors.surfaceSecondary
                      : '#FFFFFF',
                    borderColor: isSelected
                      ? colors.primary
                      : isDark
                      ? 'rgba(255,255,255,0.1)'
                      : '#DDE2DD',
                  },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
              >
                <AppText
                  variant="caption"
                  style={[
                    styles.tagText,
                    {
                      color: isSelected ? colors.primaryDark : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {tag}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    marginBottom: 16,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  safetyCard: {
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1.5,
    borderRadius: 18,
    marginBottom: 16,
    gap: 10,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  safetyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyHeaderTexts: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
  },
  safetyBody: {
    fontSize: 13,
    lineHeight: 18,
    color: '#7F1D1D',
  },
  safetyActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  safetyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  safetyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  inputCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E5E0',
  },
  privacyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  tagsSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
  },
});

