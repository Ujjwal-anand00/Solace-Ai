import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { JournalPrompt } from '@solace/shared';
import { colors } from '../../../constants/colors';
import { triggerHaptic } from '../../../utils/haptics';

interface JournalPromptCardProps {
  prompt: JournalPrompt;
  onSelect: (prompt: JournalPrompt) => void;
}

export const JournalPromptCard: React.FC<JournalPromptCardProps> = ({
  prompt,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        triggerHaptic.selection();
        onSelect(prompt);
      }}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{prompt.category.toUpperCase()}</Text>
        </View>
        <Text style={styles.actionPrompt}>Write ↗</Text>
      </View>

      <Text style={styles.promptText}>{prompt.text}</Text>

      {prompt.subtext && <Text style={styles.subtext}>{prompt.subtext}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.sage,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: colors.cream,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.sageDark,
    letterSpacing: 0.5,
  },
  actionPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.sage,
  },
  promptText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  subtext: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

