import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText, AppHeading, AppBadge } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { SECONDARY_EMOTIONS } from '../types';

interface EmotionPickerProps {
  selectedEmotions: string[];
  onToggleEmotion: (emotion: string) => void;
  onClearAll?: () => void;
}

export const EmotionPicker: React.FC<EmotionPickerProps> = ({
  selectedEmotions,
  onToggleEmotion,
  onClearAll,
}) => {
  const { colors, isDark } = useTheme();

  const handleToggle = (emotion: string) => {
    triggerHaptic.selection();
    onToggleEmotion(emotion);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppHeading level={1} style={styles.title}>
          What else are you feeling?
        </AppHeading>
        <AppText
          variant="bodyMedium"
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Emotions often come in layers. Choose any words that resonate with you, or skip ahead.
        </AppText>
      </View>

      {/* Selected Counter & Clear Button */}
      <View style={styles.metaRow}>
        <AppBadge
          label={`${selectedEmotions.length} selected`}
          variant={selectedEmotions.length > 0 ? 'primary' : 'neutral'}
          size="sm"
        />

        {selectedEmotions.length > 0 && onClearAll && (
          <TouchableOpacity
            onPress={() => {
              triggerHaptic.light();
              onClearAll();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '600' }}>
              Clear all
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {/* Chips Grid */}
      <View style={styles.chipsWrap}>
        {SECONDARY_EMOTIONS.map((emotion) => {
          const isSelected = selectedEmotions.includes(emotion.toLowerCase());
          return (
            <TouchableOpacity
              key={emotion}
              activeOpacity={0.7}
              onPress={() => handleToggle(emotion.toLowerCase())}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : isDark
                    ? colors.surfaceSecondary
                    : '#FFFFFF',
                  borderColor: isSelected
                    ? colors.primary
                    : isDark
                    ? 'rgba(255,255,255,0.1)'
                    : '#D6DDD6',
                },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={emotion}
            >
              <AppText
                variant="bodyMedium"
                style={[
                  styles.chipText,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : colors.textPrimary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {emotion}
              </AppText>
            </TouchableOpacity>
          );
        })}
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
  },
});

