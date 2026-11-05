import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { AppText, AppHeading, AppCard, AppBadge, AppIcon } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { MoodEntry } from '@solace/shared';
import { PRIMARY_MOODS, INTENSITY_LEVELS } from '../types';

interface MoodTimelineCardProps {
  entry: MoodEntry;
  onEdit: (entry: MoodEntry) => void;
  onDelete: (id: string) => void;
}

export const MoodTimelineCard: React.FC<MoodTimelineCardProps> = ({
  entry,
  onEdit,
  onDelete,
}) => {
  const { colors, isDark } = useTheme();

  const moodConfig = PRIMARY_MOODS.find((m) => m.key === entry.mood.toLowerCase()) || {
    key: entry.mood,
    label: entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1),
    emoji: '🌿',
    description: '',
    color: colors.primary,
    bgColor: '#E0F2FE',
    borderColor: '#7DD3FC',
  };

  const intensityInfo = INTENSITY_LEVELS[entry.moodIntensity] || {
    label: 'Moderate',
    description: '',
  };

  const formattedDate = React.useMemo(() => {
    const d = new Date(entry.createdAt);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }, [entry.createdAt]);

  const handleDeletePress = () => {
    triggerHaptic.medium();
    Alert.alert(
      'Delete Check-In',
      'Are you sure you want to delete this mood check-in? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            triggerHaptic.warning();
            onDelete(entry.id);
          },
        },
      ]
    );
  };

  const handleEditPress = () => {
    triggerHaptic.light();
    onEdit(entry);
  };

  return (
    <AppCard style={styles.card}>
      {/* Top Row: Mood, Intensity & Actions */}
      <View style={styles.topRow}>
        <View style={styles.moodGroup}>
          <View
            style={[
              styles.emojiCircle,
              { backgroundColor: moodConfig.bgColor, borderColor: moodConfig.borderColor },
            ]}
          >
            <AppText style={styles.emojiText}>{moodConfig.emoji}</AppText>
          </View>
          <View>
            <AppHeading level={3} style={[styles.moodLabel, { color: moodConfig.color }]}>
              {moodConfig.label}
            </AppHeading>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              {formattedDate}
            </AppText>
          </View>
        </View>

        <View style={styles.actionsGroup}>
          <View style={[styles.intensityPill, { backgroundColor: colors.primaryLight }]}>
            <AppText variant="caption" style={[styles.intensityText, { color: colors.primaryDark }]}>
              {entry.moodIntensity}/10 • {intensityInfo.label}
            </AppText>
          </View>

          <TouchableOpacity
            onPress={handleEditPress}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Edit check-in"
          >
            <AppIcon name="sliders" size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeletePress}
            style={styles.actionBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Delete check-in"
          >
            <AppIcon name="x" size={16} color="#E11D48" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Identified Emotions */}
      {entry.emotions && entry.emotions.length > 0 && (
        <View style={styles.emotionsRow}>
          {entry.emotions.map((em) => (
            <AppBadge
              key={em}
              label={em.charAt(0).toUpperCase() + em.slice(1)}
              variant="neutral"
              size="sm"
            />
          ))}
        </View>
      )}

      {/* Reflection Note */}
      {entry.note ? (
        <View
          style={[
            styles.noteBox,
            { backgroundColor: isDark ? colors.surfaceSecondary : '#F6F8F6' },
          ]}
        >
          <AppText
            variant="bodySmall"
            style={[styles.noteText, { color: colors.textPrimary }]}
            numberOfLines={4}
          >
            “{entry.note}”
          </AppText>
        </View>
      ) : null}

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {entry.tags.map((tag) => (
            <AppText
              key={tag}
              variant="caption"
              style={[styles.tagText, { color: colors.primary }]}
            >
              #{tag}
            </AppText>
          ))}
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moodGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 22,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intensityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  intensityText: {
    fontWeight: '700',
    fontSize: 11,
  },
  actionBtn: {
    padding: 4,
  },
  emotionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  noteBox: {
    padding: 12,
    borderRadius: 12,
  },
  noteText: {
    fontStyle: 'italic',
    lineHeight: 19,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagText: {
    fontWeight: '600',
    fontSize: 11,
  },
});

