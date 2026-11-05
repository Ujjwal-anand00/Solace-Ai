import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AppHeading, AppText, AppIcon } from '../../../components/ui';
import { ActivityCard } from './ActivityCard';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { WellnessActivity } from '@solace/shared';

interface QuickActivitiesSectionProps {
  activities?: WellnessActivity[];
  isLoading?: boolean;
  onActivityPress: (activity: WellnessActivity) => void;
  onSeeAllPress: () => void;
}

export const QuickActivitiesSection: React.FC<QuickActivitiesSectionProps> = ({
  activities = [],
  isLoading,
  onActivityPress,
  onSeeAllPress,
}) => {
  const { colors } = useTheme();

  const handleSeeAll = () => {
    triggerHaptic.light();
    onSeeAllPress();
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <AppHeading level="h3" style={[styles.title, { color: colors.textPrimary }]}>
            Quick Activities
          </AppHeading>
          <AppText variant="bodySmall" style={[styles.subtitle, { color: colors.textSecondary }]}>
            Small mindful moments to refresh your day.
          </AppText>
        </View>

        <TouchableOpacity
          onPress={handleSeeAll}
          style={styles.seeAllButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="See all activities"
        >
          <AppText variant="caption" style={[styles.seeAllText, { color: colors.primaryDark }]}>
            See all
          </AppText>
          <AppIcon name="chevron-right" size={14} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Activities FlatList */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" style={{ color: colors.textSecondary, marginTop: 8 }}>
            Finding mindful practices for you...
          </AppText>
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
            No activities available at the moment.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={activities}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ActivityCard activity={item} onPress={onActivityPress} />
          )}
          contentContainerStyle={styles.listContent}
          decelerationRate="fast"
          snapToInterval={232} // 220 width + 12 marginRight
          snapToAlignment="start"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  seeAllText: {
    fontWeight: '700',
    fontSize: 13,
    marginRight: 2,
  },
  listContent: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  loadingContainer: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

