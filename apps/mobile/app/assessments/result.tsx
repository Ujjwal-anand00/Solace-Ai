import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../src/hooks/useTheme';
import {
  AppText,
  AppHeading,
  AppCard,
  AppButton,
  AppIcon,
  AppBadge,
} from '../../src/components/ui';
import { useAssessmentDetail } from '../../src/hooks/useAssessments';
import { triggerHaptic } from '../../src/utils/haptics';

export default function AssessmentResultScreen(): React.JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const { data: assessment, isLoading } = useAssessmentDetail(id || '');

  const handleFinish = () => {
    triggerHaptic.selection();
    router.replace('/(home)');
  };

  const handleGoToPlan = () => {
    triggerHaptic.selection();
    router.push('/plan/generate');
  };

  const handleGoToActivities = () => {
    triggerHaptic.selection();
    router.navigate('/(home)/activities');
  };

  if (isLoading || !assessment) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="bodySmall" color="secondary" style={styles.loadingText}>
            Generating your personal reflection insights...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={handleFinish}
          style={[styles.closeButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
          accessibilityLabel="Close insights"
        >
          <AppIcon name="x" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppHeading level="h4">Your Insights</AppHeading>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={styles.heroSection}>
          <View style={[styles.heroIconBadge, { backgroundColor: colors.primaryLight }]}>
            <AppIcon name="heart" size={32} color={colors.primaryDark} />
          </View>
          <AppHeading level="h2" style={styles.heroTitle}>
            Thank you for checking in 🌿
          </AppHeading>
          <AppText variant="bodySmall" color="secondary" style={styles.heroSubtitle}>
            Noticing where you are is the very first step toward gentle care.
          </AppText>
        </Animated.View>

        {/* Reflection Category Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <AppCard style={styles.categoryCard}>
            <View style={styles.categoryTopRow}>
              <AppBadge
                label={assessment.resultCategory.toUpperCase()}
                variant="primary"
                size="md"
              />
              <AppText variant="caption" color="secondary">
                Reflection Score: {assessment.score} / {assessment.maxScore || 12}
              </AppText>
            </View>

            <AppText variant="bodyMedium" style={styles.interpretationText}>
              {assessment.interpretation}
            </AppText>
          </AppCard>
        </Animated.View>

        {/* Suggested Practices Section */}
        {assessment.suggestedActivities?.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(150)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppIcon name="sparkles" size={18} color={colors.primary} />
              <AppHeading level="h4">Suggested Calming Practices</AppHeading>
            </View>

            <View style={styles.activityList}>
              {assessment.suggestedActivities.map((slug) => {
                const title = slug
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');

                return (
                  <TouchableOpacity
                    key={slug}
                    activeOpacity={0.8}
                    onPress={handleGoToActivities}
                    style={[
                      styles.activityCard,
                      {
                        backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.activityInfo}>
                      <AppText variant="bodyMedium" style={styles.activityTitle}>
                        {title}
                      </AppText>
                      <AppText variant="caption" color="secondary">
                        Curated for your current reflection
                      </AppText>
                    </View>
                    <View style={[styles.arrowBadge, { backgroundColor: colors.primaryLight }]}>
                      <AppIcon name="arrowRight" size={16} color={colors.primaryDark} />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Recommended Next Steps */}
        {assessment.recommendedNextSteps?.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppIcon name="checkCircle" size={18} color={colors.primary} />
              <AppHeading level="h4">Gentle Next Steps</AppHeading>
            </View>

            <AppCard style={styles.stepsCard}>
              {assessment.recommendedNextSteps.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={[styles.stepBullet, { backgroundColor: colors.primary }]} />
                  <AppText variant="bodySmall" color="secondary" style={styles.stepText}>
                    {step}
                  </AppText>
                </View>
              ))}
            </AppCard>
          </Animated.View>
        )}

        {/* Non-Diagnostic Disclaimer */}
        <Animated.View entering={FadeInDown.duration(400).delay(250)} style={styles.disclaimerCard}>
          <AppIcon name="info" size={16} color={colors.textSecondary} />
          <AppText variant="caption" color="secondary" style={styles.disclaimerText}>
            {assessment.disclaimer}
          </AppText>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.actionsArea}>
          <AppButton
            title="Create a Tailored Wellness Plan"
            fullWidth
            onPress={handleGoToPlan}
          />
          <AppButton
            title="Return to Sanctuary"
            variant="outline"
            fullWidth
            onPress={handleFinish}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  heroIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  heroSubtitle: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  categoryCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  categoryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  interpretationText: {
    lineHeight: 24,
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  arrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepsCard: {
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  stepText: {
    flex: 1,
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 24,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 16,
  },
  actionsArea: {
    gap: 12,
  },
});

