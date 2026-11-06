import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppHeading, AppText, AppIcon, IconName } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { ResourceCategoryMeta } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface ResourceCategoryCardProps {
  category: ResourceCategoryMeta;
  onPress: (category: ResourceCategoryMeta) => void;
  accentColor?: string;
}

const CATEGORY_ICON_MAP: Record<string, IconName> = {
  emotions: 'heart',
  stress: 'wind',
  mindfulness: 'feather',
  sleep: 'moon',
  self_care: 'sparkles',
  confidence: 'shield',
  habits: 'calendar',
  growth: 'trendingUp',
};

export const ResourceCategoryCard: React.FC<ResourceCategoryCardProps> = ({
  category,
  onPress,
  accentColor,
}) => {
  const { colors, spacing, radius } = useTheme();

  const iconName: IconName = CATEGORY_ICON_MAP[category.id] || 'bookOpen';
  const color = accentColor || colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        triggerHaptic.selection();
        onPress(category);
      }}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          borderRadius: radius.lg,
          padding: spacing.md,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Category: ${category.title}, ${category.count ?? 0} resources available`}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: color + '15',
              borderRadius: radius.md,
            },
          ]}
        >
          <AppIcon name={iconName} size={22} color={color} />
        </View>

        {category.count !== undefined && (
          <View
            style={[
              styles.countBadge,
              {
                backgroundColor: colors.backgroundSecondary,
                borderRadius: radius.full,
              },
            ]}
          >
            <AppText
              variant="caption"
              style={{
                color: colors.textSecondary,
                fontWeight: '600',
                fontSize: 11,
              }}
            >
              {category.count} {category.count === 1 ? 'article' : 'articles'}
            </AppText>
          </View>
        )}
      </View>

      <AppHeading
        level={4}
        style={{
          color: colors.textPrimary,
          marginTop: spacing.sm,
          marginBottom: 4,
          fontSize: 16,
        }}
        numberOfLines={1}
      >
        {category.title}
      </AppHeading>

      <AppText
        variant="caption"
        style={{
          color: colors.textSecondary,
          lineHeight: 18,
        }}
        numberOfLines={2}
      >
        {category.description}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
