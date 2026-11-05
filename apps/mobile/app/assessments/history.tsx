import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/hooks/useTheme';
import {
  AppText,
  AppHeading,
  AppCard,
  AppIcon,
  AppBadge,
} from '../../src/components/ui';
import { useAssessmentHistory } from '../../src/hooks/useAssessments';
import { triggerHaptic } from '../../src/utils/haptics';
import { Assessment } from '@solace/shared';

export default function AssessmentHistoryScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data, isLoading } = useAssessmentHistory();

  const history: Assessment[] = data?.data || [];

  const handleOpenDetail = (id: string) => {
    triggerHaptic.selection();
    router.push({
      pathname: '/assessments/result',
      params: { id },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
          accessibilityLabel="Go back"
        >
          <AppIcon name="chevronLeft" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppHeading level="h4">Reflection History</AppHeading>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText variant="bodySmall" color="secondary" style={styles.loadingText}>
              Loading past check-ins...
            </AppText>
          </View>
        ) : history.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyContainer}>
            <View style={[styles.emptyIconBadge, { backgroundColor: colors.primaryLight }]}>
              <AppIcon name="calendar" size={32} color={colors.primaryDark} />
            </View>
            <AppHeading level="h3" style={styles.emptyTitle}>
              No past reflections yet
            </AppHeading>
            <AppText variant="bodySmall" color="secondary" style={styles.emptySubtitle}>
              When you complete a reflection check-in, your insights will be saved here so you can notice your personal trends over time.
            </AppText>
          </Animated.View>
        ) : (
          <View style={styles.list}>
            {history.map((item, index) => {
              const formattedDate = new Date(item.completedAt).toLocaleDateString(
                undefined,
                {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                },
              );

              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.duration(350).delay(index * 50)}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleOpenDetail(item.id)}
                  >
                    <AppCard style={styles.historyCard}>
                      <View style={styles.cardTop}>
                        <View style={styles.typeBadgeArea}>
                          <AppHeading level="h4" style={styles.typeTitle}>
                            {item.assessmentType
                              .split('-')
                              .map(
                                (w) =>
                                  w.charAt(0).toUpperCase() + w.slice(1),
                              )
                              .join(' ')}
                          </AppHeading>
                          <AppText variant="caption" color="secondary">
                            {formattedDate}
                          </AppText>
                        </View>
                        <AppBadge
                          label={item.resultCategory}
                          variant="neutral"
                          size="sm"
                        />
                      </View>

                      <AppText
                        variant="bodySmall"
                        color="secondary"
                        numberOfLines={2}
                        style={styles.previewInterpretation}
                      >
                        {item.interpretation}
                      </AppText>

                      <View style={styles.cardBottom}>
                        <AppText variant="caption" color="tertiary">
                          Score: {item.score} / {item.maxScore || 12}
                        </AppText>
                        <View style={styles.viewRow}>
                          <AppText variant="caption" color="primary" style={styles.viewText}>
                            View Insights
                          </AppText>
                          <AppIcon name="chevronRight" size={14} color={colors.primary} />
                        </View>
                      </View>
                    </AppCard>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    gap: 14,
    marginTop: 8,
  },
  historyCard: {
    padding: 16,
    borderRadius: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadgeArea: {
    flex: 1,
    marginRight: 8,
  },
  typeTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  previewInterpretation: {
    lineHeight: 18,
    marginBottom: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewText: {
    fontWeight: '600',
  },
});

