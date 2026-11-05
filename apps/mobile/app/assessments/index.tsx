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
  AppButton,
  IconName,
} from '../../src/components/ui';
import { useAssessmentTypes } from '../../src/hooks/useAssessments';
import { triggerHaptic } from '../../src/utils/haptics';
import { AssessmentTypeMetadata } from '@solace/shared';

export default function AssessmentsIndexScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data: assessmentTypes = [], isLoading } = useAssessmentTypes();

  const handleStartAssessment = (typeId: string) => {
    triggerHaptic.selection();
    router.push({
      pathname: '/assessments/[type]',
      params: { type: typeId },
    });
  };

  const handleOpenHistory = () => {
    triggerHaptic.light();
    router.push('/assessments/history');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
          accessibilityLabel="Go back"
        >
          <AppIcon name="chevronLeft" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <AppHeading level="h4">Self-Reflection</AppHeading>
        <TouchableOpacity
          onPress={handleOpenHistory}
          style={[styles.historyButton, { backgroundColor: isDark ? colors.surfaceSecondary : colors.surface }]}
          accessibilityLabel="View reflection history"
        >
          <AppIcon name="calendar" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={styles.header}>
          <View style={[styles.badgePill, { backgroundColor: colors.primaryLight }]}>
            <AppIcon name="heart" size={14} color={colors.primaryDark} />
            <AppText variant="caption" style={[styles.badgeText, { color: colors.primaryDark }]}>
              MINDFUL CHECK-INS
            </AppText>
          </View>
          <AppHeading level="h2" style={styles.mainTitle}>
            How are you really doing? 🌿
          </AppHeading>
          <AppText variant="bodySmall" color="secondary" style={styles.description}>
            Take 2 minutes to pause and reflect on your stress, sleep, energy, or emotional balance. Every feeling is welcome here.
          </AppText>
        </Animated.View>

        {/* Loading Indicator */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText variant="bodySmall" color="secondary" style={styles.loadingText}>
              Preparing your reflections...
            </AppText>
          </View>
        ) : (
          /* Assessment Cards */
          <View style={styles.cardList}>
            {assessmentTypes.map((item: AssessmentTypeMetadata, index: number) => {
              const iconMap: Record<string, string> = {
                stress: 'activity',
                sleep: 'moon',
                energy: 'sun',
                'emotional-wellbeing': 'heart',
              };

              return (
                <Animated.View
                  key={item.id}
                  entering={FadeInDown.duration(400).delay(100 + index * 60)}
                >
                  <AppCard style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.iconBadge,
                          {
                            backgroundColor:
                              item.id === 'stress'
                                ? '#F9EDE8'
                                : item.id === 'sleep'
                                ? '#EBE8F9'
                                : item.id === 'energy'
                                ? '#FBF3DD'
                                : '#E7F2EB',
                          },
                        ]}
                      >
                        <AppIcon
                          name={(iconMap[item.id] || 'compass') as IconName}
                          size={24}
                          color={
                            item.id === 'stress'
                              ? '#D27357'
                              : item.id === 'sleep'
                              ? '#6E5FB7'
                              : item.id === 'energy'
                              ? '#B58B24'
                              : colors.primary
                          }
                        />
                      </View>
                      <View style={styles.titleArea}>
                        <AppHeading level="h4">{item.title}</AppHeading>
                        <AppText variant="caption" color="secondary">
                          {item.subtitle}
                        </AppText>
                      </View>
                      <AppBadge
                        label={`${item.estimatedMinutes || 2} min`}
                        variant="neutral"
                        size="sm"
                      />
                    </View>

                    <AppText variant="bodySmall" color="secondary" style={styles.cardDesc}>
                      {item.description}
                    </AppText>

                    <View style={styles.cardFooter}>
                      <AppText variant="caption" color="tertiary">
                        {item.questionCount || 4} simple questions
                      </AppText>
                      <AppButton
                        title="Begin Reflection"
                        size="sm"
                        onPress={() => handleStartAssessment(item.id)}
                      />
                    </View>
                  </AppCard>
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* Non-Diagnostic Disclaimer Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(350)} style={styles.disclaimerCard}>
          <AppIcon name="info" size={16} color={colors.textSecondary} />
          <AppText variant="caption" color="secondary" style={styles.disclaimerText}>
            Solace AI self-reflection check-ins are designed exclusively for informational and mindfulness self-awareness. They do not constitute clinical diagnoses or medical advice.
          </AppText>
        </Animated.View>
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButton: {
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
  header: {
    marginTop: 8,
    marginBottom: 20,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
    gap: 6,
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    lineHeight: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  cardList: {
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
  },
  cardDesc: {
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  disclaimerCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
    gap: 10,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 16,
  },
});

