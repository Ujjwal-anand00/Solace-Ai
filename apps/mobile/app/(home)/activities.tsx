import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppCard,
  AppBadge,
  AppIcon,
  AppChip,
} from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import { useActivities } from '../../src/hooks/useActivities';
import { triggerHaptic } from '../../src/utils/haptics';
import { WellnessActivity } from '@solace/shared';

const CATEGORIES = [
  { key: 'all', label: 'All Activities' },
  { key: 'breathing', label: 'Breathing' },
  { key: 'meditation', label: 'Meditation' },
  { key: 'journaling', label: 'Journaling' },
  { key: 'grounding', label: 'Grounding' },
  { key: 'movement', label: 'Movement' },
];

export default function ActivitiesScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: activities = [], isLoading } = useActivities(
    selectedCategory === 'all' ? undefined : { category: selectedCategory }
  );

  const handleSelectCategory = (catKey: string) => {
    triggerHaptic.selection();
    setSelectedCategory(catKey);
  };

  const handleStartActivity = (activity: WellnessActivity) => {
    triggerHaptic.medium();
    Alert.alert(
      activity.title,
      `${activity.description}\n\nEstimated duration: ${Math.round(activity.duration / 60)} minutes.\n\nInteractive full-screen activity player is scheduled for STEP 08!`,
      [{ text: 'Got It' }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppBadge label="MINDFUL SANCTUARY" variant="primary" size="sm" />
          <AppHeading level="h2" style={styles.title}>
            Wellness Activities
          </AppHeading>
          <AppText
            variant="bodyMedium"
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            Grounding exercises, guided meditations, and gentle somatic reflections.
          </AppText>
        </View>

        {/* Categories Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <AppChip
                key={cat.key}
                label={cat.label}
                selected={isSelected}
                onPress={() => handleSelectCategory(cat.key)}
              />
            );
          })}
        </ScrollView>

        {/* Activities List */}
        <View style={styles.activitiesContainer}>
          {isLoading ? (
            <View style={styles.loadingWrapper}>
              <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
                Loading mindful activities...
              </AppText>
            </View>
          ) : activities.length === 0 ? (
            <AppCard style={styles.emptyCard}>
              <AppText variant="bodyMedium" style={{ color: colors.textSecondary, textAlign: 'center' }}>
                No activities found in this category yet.
              </AppText>
            </AppCard>
          ) : (
            activities.map((activity) => {
              const durationMin = Math.round(activity.duration / 60);
              return (
                <TouchableOpacity
                  key={activity.id}
                  activeOpacity={0.85}
                  onPress={() => handleStartActivity(activity)}
                >
                  <AppCard style={styles.activityCard}>
                    <View style={styles.cardHeader}>
                      <View style={styles.badgeGroup}>
                        <AppBadge label={activity.category.toUpperCase()} variant="primary" size="sm" />
                        <AppBadge label={`${durationMin} min`} variant="neutral" size="sm" />
                      </View>
                      <View
                        style={[
                          styles.playCircle,
                          { backgroundColor: colors.primaryLight },
                        ]}
                      >
                        <AppIcon name="play" size={14} color={colors.primaryDark} />
                      </View>
                    </View>

                    <AppHeading level="h4" style={styles.activityTitle}>
                      {activity.title}
                    </AppHeading>
                    <AppText
                      variant="bodySmall"
                      style={[styles.activityDescription, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {activity.description}
                    </AppText>

                    <View style={styles.cardFooter}>
                      <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
                        Start Session
                      </AppText>
                      <AppIcon name="chevron-right" size={14} color={colors.primary} />
                    </View>
                  </AppCard>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  categoriesRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  activitiesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  loadingWrapper: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  activityCard: {
    padding: 18,
    borderRadius: 20,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  activityDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
});

