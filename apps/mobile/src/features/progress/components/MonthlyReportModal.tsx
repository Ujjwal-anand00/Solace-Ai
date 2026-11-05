import React from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import {
  AppCard,
  AppText,
  AppHeading,
  AppBadge,
  AppButton,
  AppIcon,
} from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { MonthlyWellnessReport } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface MonthlyReportModalProps {
  report?: MonthlyWellnessReport;
  visible: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  report,
  visible,
  onClose,
  isLoading = false,
}) => {
  const { colors, isDark } = useTheme();

  const handleClose = () => {
    triggerHaptic.light();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#FDFBF7',
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <AppBadge label="MONTHLY SUMMARY" variant="primary" size="sm" />
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Longitudinal Reflection
                </AppText>
              </View>
              <AppHeading level="h3" style={styles.title}>
                {report?.month || 'Monthly Wellness Journey'}
              </AppHeading>
            </View>

            <TouchableOpacity
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? colors.surface : '#EFECE6' },
              ]}
              onPress={handleClose}
            >
              <AppIcon name="x" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.centerContainer}>
                <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
                  Analyzing your monthly milestones...
                </AppText>
              </View>
            ) : !report ? (
              <View style={styles.centerContainer}>
                <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
                  No monthly report found.
                </AppText>
              </View>
            ) : (
              <>
                {/* Insufficient data notification */}
                {!report.hasSufficientData && (
                  <AppCard
                    style={[
                      styles.noticeCard,
                      {
                        backgroundColor: isDark ? colors.surface : '#FFFBEB',
                        borderColor: '#FDE68A',
                      },
                    ]}
                  >
                    <AppIcon name="info" size={18} color="#D97706" />
                    <AppText
                      variant="caption"
                      style={{ color: '#B45309', flex: 1, lineHeight: 18 }}
                    >
                      Solace needs at least 4 active days in a month to compute
                      comprehensive emotional trends and comparative milestones.
                    </AppText>
                  </AppCard>
                )}

                {/* Core monthly consistency card */}
                <AppCard
                  style={[
                    styles.bannerCard,
                    {
                      backgroundColor: isDark ? colors.surface : '#FFF9F2',
                      borderColor: '#F3DFC5',
                    },
                  ]}
                >
                  <View style={styles.bannerRow}>
                    <View style={styles.bannerItem}>
                      <AppText variant="caption" style={{ color: colors.textSecondary }}>
                        Active Sanctuary Days
                      </AppText>
                      <AppHeading level="h2" style={styles.bannerVal}>
                        {report.totalActiveDays}
                      </AppHeading>
                    </View>
                    <View style={styles.bannerItem}>
                      <AppText variant="caption" style={{ color: colors.textSecondary }}>
                        Consistency Rate
                      </AppText>
                      <AppHeading level="h2" style={styles.bannerVal}>
                        {report.streakPerformance?.consistencyRate ?? 0}%
                      </AppHeading>
                    </View>
                    <View style={styles.bannerItem}>
                      <AppText variant="caption" style={{ color: colors.textSecondary }}>
                        Best Streak
                      </AppText>
                      <AppHeading level="h2" style={styles.bannerVal}>
                        {report.streakPerformance?.longestStreak ?? 0}d
                      </AppHeading>
                    </View>
                  </View>
                </AppCard>

                {/* Mood distribution */}
                <AppHeading level="h4" style={styles.sectionTitle}>
                  Emotions Felt This Month 💭
                </AppHeading>
                <View style={styles.moodPillsRow}>
                  {Object.entries(report.moodDistribution || {}).length === 0 ? (
                    <AppText
                      variant="caption"
                      style={{ color: colors.textSecondary }}
                    >
                      No mood entries logged yet this month.
                    </AppText>
                  ) : (
                    Object.entries(report.moodDistribution).map(
                      ([mood, count]) => (
                        <View
                          key={mood}
                          style={[
                            styles.moodPill,
                            {
                              backgroundColor: isDark
                                ? colors.surface
                                : '#F1F5F0',
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <AppText
                            variant="caption"
                            style={{ textTransform: 'capitalize', fontWeight: '700' }}
                          >
                            {mood}
                          </AppText>
                          <AppBadge
                            label={`${count}`}
                            variant="primary"
                            size="sm"
                          />
                        </View>
                      )
                    )
                  )}
                </View>

                {/* Most practiced activities */}
                {report.mostUsedActivities && report.mostUsedActivities.length > 0 && (
                  <>
                    <AppHeading level="h4" style={styles.sectionTitle}>
                      Top Mindfulness Practices 🌱
                    </AppHeading>
                    <View style={styles.activityList}>
                      {report.mostUsedActivities.map((act, index) => (
                        <View
                          key={index}
                          style={[
                            styles.activityItem,
                            {
                              backgroundColor: isDark
                                ? colors.surface
                                : '#FFFFFF',
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <AppText variant="bodySmall" style={{ fontWeight: '600' }}>
                            {act.title}
                          </AppText>
                          <AppBadge
                            label={`${act.count} times`}
                            variant="neutral"
                            size="sm"
                          />
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* Period comparison */}
                {report.comparisonWithPreviousPeriod && (
                  <View
                    style={[
                      styles.comparisonBox,
                      {
                        backgroundColor: isDark ? colors.surface : '#EEF2FF',
                        borderColor: '#C7D2FE',
                      },
                    ]}
                  >
                    <AppIcon name="trend-up" size={16} color="#4338CA" />
                    <AppText
                      variant="caption"
                      style={{ color: '#3730A3', flex: 1 }}
                    >
                      Comparison with last period: {report.comparisonWithPreviousPeriod.activeDaysDiff >= 0 ? '+' : ''}{report.comparisonWithPreviousPeriod.activeDaysDiff} active days, and {report.comparisonWithPreviousPeriod.activitiesDiff >= 0 ? '+' : ''}{report.comparisonWithPreviousPeriod.activitiesDiff} activities completed.
                    </AppText>
                  </View>
                )}

                {/* Observations */}
                <AppHeading level="h4" style={styles.sectionTitle}>
                  Mindful Summary 🌙
                </AppHeading>
                <View style={styles.observationsList}>
                  {report.observations.map((obs, idx) => (
                    <AppCard
                      key={idx}
                      style={[
                        styles.obsCard,
                        {
                          backgroundColor: isDark ? colors.surface : '#FFFFFF',
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <AppIcon name="sparkles" size={16} color="#829B83" />
                      <AppText
                        variant="bodySmall"
                        style={{ flex: 1, lineHeight: 20 }}
                      >
                        {obs}
                      </AppText>
                    </AppCard>
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <AppButton
              title="Close Summary"
              variant="outline"
              size="md"
              fullWidth
              onPress={handleClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '85%',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  bannerCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bannerItem: {
    alignItems: 'center',
    gap: 4,
  },
  bannerVal: {
    fontSize: 24,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  moodPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  activityList: {
    gap: 8,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  comparisonBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  observationsList: {
    gap: 10,
  },
  obsCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    alignItems: 'flex-start',
  },
  footer: {
    paddingVertical: 14,
  },
});
