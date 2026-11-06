import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { JournalEntry } from '@solace/shared';
import { colors } from '../../../constants/colors';
import { triggerHaptic } from '../../../utils/haptics';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
  onToggleFavorite?: () => void;
}

export const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onPress,
  onToggleFavorite,
}) => {
  const dateFormatted = new Date(entry.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'gratitude':
        return 'Gratitude';
      case 'guided_reflection':
        return 'Guided';
      case 'emotional_checkin':
        return 'Emotion';
      case 'mindful_observation':
        return 'Mindful';
      case 'self_discovery':
        return 'Discovery';
      case 'stress_release':
        return 'Release';
      default:
        return 'Free Write';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        triggerHaptic.light();
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getCategoryLabel(entry.category)}</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.date}>{dateFormatted}</Text>
          {onToggleFavorite && (
            <TouchableOpacity
              onPress={() => {
                triggerHaptic.selection();
                onToggleFavorite();
              }}
              style={styles.favButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.favIcon}>{entry.isFavorite ? '★' : '☆'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {entry.title}
      </Text>

      <Text style={styles.snippet} numberOfLines={2}>
        {entry.content}
      </Text>

      {entry.aiInsight && (
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>✦ Solace Reflection</Text>
        </View>
      )}

      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tagChip}>
              <Text style={styles.tagChipText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.lavender,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.sageDark,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginRight: 8,
  },
  favButton: {
    padding: 2,
  },
  favIcon: {
    fontSize: 18,
    color: '#D4A76A',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  snippet: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  aiTag: {
    backgroundColor: '#FAF5FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E9D8FD',
    marginBottom: 8,
  },
  aiTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B46C1',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: colors.cream,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagChipText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});

