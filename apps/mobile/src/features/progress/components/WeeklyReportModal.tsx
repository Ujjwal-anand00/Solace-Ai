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
import { WeeklyWellnessReport } from '@solace/shared';
import { triggerHaptic } from '../../../utils/haptics';

interface WeeklyReportModalProps {
  report?: WeeklyWellnessReport;
  visible: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
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
                <AppBadge label="WEEKLY REPORT" variant="primary" size="sm" />
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  7-Day Reflection
                </AppText>
              </View>
              <AppHeading level="h3" style={styles.title}>
                Weekly Wellness Rhythm
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
                  Synthesizing your weekly sanctuary data...
                </AppText>
              </View>
            ) : !report ? (
              <View style={styles.centerContainer}>
                <AppText variant="bodySmall" style={{ color: colors.textSecondary }}>
                  No report available right now.
                </AppText>
              </View>
            ) : (
              <>
                {/* Date range subtitle */}
                <AppText
                  variant="caption"
                  style={[styles.dateRange, { color: colors.textSecondary }]}
                >
                  {report.periodStart} — {report.periodEnd}
                </AppText>

                {/* Insufficient data banner */}
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
                      Solace needs at least 2 active days within the week to
                      detect deeper behavioral patterns. Check in today to start
                      shaping next week's insights!
                    </AppText>
                  </AppCard>
                )}

                {/* Core metrics summary */}
                <View style={styles.metricGrid}>
                  <AppCard
                    style={[
                      styles.metricBox,
                      { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{ color: colors.textSecondary }}
                    >
                      Active Days
                    </AppText>
                    <AppHeading level="h3" style={styles.metricVal}>
                      {report.totalActiveDays} / 7
                    </AppHeading>
                  </AppCard>

                  <AppCard
                    style={[
                      styles.metricBox,
                      { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{ color: colors.textSecondary }}
                    >
                      Mood Check-ins
                    </AppText>
                    <AppHeading level="h3" style={styles.metricVal}>
                      {report.moodCheckIns}
                    </AppHeading>
                  </AppCard>

                  <AppCard
                    style={[
                      styles.metricBox,
                      { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{ color: colors.textSecondary }}
                    >
                      Primary Mood
                    </AppText>
                    <AppHeading level="h3" style={styles.metricVal}>
                      {report.mostFrequentMood || 'None'}
                    </AppHeading>
                  </AppCard>

                  <AppCard
                    style={[
                      styles.metricBox,
                      { backgroundColor: isDark ? colors.surface : '#FFFFFF' },
                    ]}
                  >
                    <AppText
                      variant="caption"
                      style={{ color: colors.textSecondary }}
                    >
                      Practices
                    </AppText>
                    <AppHeading level="h3" style={styles.metricVal}>
                      {report.completedActivities}
                    </AppHeading>
                  </AppCard>
                </View>

                {/* Mindful Observations */}
                <AppHeading level="h4" style={styles.sectionTitle}>
                  Gentle Observations 🌿
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
                      <AppIcon name="feather" size={16} color="#829B83" />
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
              title="Close Reflection"
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
  dateRange: {
    marginBottom: 14,
    fontSize: 12,
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
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBox: {
    width: '48%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
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
