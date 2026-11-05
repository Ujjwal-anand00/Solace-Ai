import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppHeading, AppText, AppIcon, IconName } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

export interface CategoryInfo {
  key: string;
  title: string;
  description: string;
  icon: IconName;
  accentColor: string;
  count?: number;
}

interface CategoryCardProps {
  category: CategoryInfo;
  isSelected?: boolean;
  onPress: (key: string) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isSelected = false,
  onPress,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
          borderColor: isSelected ? colors.primaryDark : colors.border,
        },
      ]}
      onPress={() => {
        triggerHaptic.selection();
        onPress(category.key);
      }}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrap, { backgroundColor: category.accentColor + '20' }]}>
        <AppIcon name={category.icon} size={22} color={category.accentColor} />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <AppHeading
            level="h4"
            style={[
              styles.title,
              { color: isSelected ? colors.primaryDark : colors.textPrimary },
            ]}
          >
            {category.title}
          </AppHeading>
          {category.count !== undefined && (
            <View style={[styles.countBadge, { backgroundColor: colors.surfaceVariant }]}>
              <AppText variant="caption" style={styles.countText}>
                {category.count}
              </AppText>
            </View>
          )}
        </View>

        <AppText
          variant="caption"
          numberOfLines={2}
          style={[styles.description, { color: colors.textSecondary }]}
        >
          {category.description}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
});

