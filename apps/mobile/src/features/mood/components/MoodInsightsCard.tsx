import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { AppText, AppHeading, AppCard, AppIcon, IconName } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';
import { MoodInsightsResponse } from '@solace/shared';

interface MoodInsightsCardProps {
  insightsResponse?: MoodInsightsResponse | null;
  isLoading?: boolean;
}

export const MoodInsightsCard: React.FC<MoodInsightsCardProps> = ({
  insightsResponse,
  isLoading = false,
}) => {
  const { colors } = useTheme();

  const handleCallLifeline = () => {
    triggerHaptic.medium();
    Linking.openURL('tel:988');
  };

  const handleTextCrisis = () => {
    triggerHaptic.medium();
    const smsUrl = Platform.select({
      ios: 'sms:741741&body=HOME',
      default: 'sms:741741?body=HOME',
    });
    Linking.openURL(smsUrl);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <AppText variant="bodySmall" color="secondary">
          Gathering gentle observations...
        </AppText>
      </View>
    );
  }

  const insights = insightsResponse?.insights || [];
  const safety = insightsResponse?.safetySupport;

  if (insights.length === 0 && !safety?.recommended) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Crisis Safety Card if safety support recommended */}
      {safety?.recommended && (
        <AppCard style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <View style={styles.safetyIconCircle}>
              <AppIcon name="heart" size={20} color="#DC2626" />
            </View>
            <View style={styles.safetyHeaderTexts}>
              <AppHeading level={3} style={styles.safetyTitle}>
                Compassionate Support Notice
              </AppHeading>
              <AppText variant="caption" style={{ color: '#7F1D1D' }}>
                We noticed notes reflecting intense distress. You are deeply valued.
              </AppText>
            </View>
          </View>

          <AppText variant="bodySmall" style={styles.safetyBody}>
            {safety.message}
          </AppText>

          <View style={styles.safetyActions}>
            <TouchableOpacity
              onPress={handleCallLifeline}
              style={[styles.safetyButton, { backgroundColor: '#DC2626' }]}
              activeOpacity={0.8}
            >
              <AppIcon name="phone" size={16} color="#FFFFFF" />
              <AppText variant="caption" style={styles.safetyButtonText}>
                Call 988 Lifeline
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTextCrisis}
              style={[styles.safetyButton, { backgroundColor: '#B91C1C' }]}
              activeOpacity={0.8}
            >
              <AppIcon name="messageCircle" size={16} color="#FFFFFF" />
              <AppText variant="caption" style={styles.safetyButtonText}>
                Text HOME to 741741
              </AppText>
            </TouchableOpacity>
          </View>
        </AppCard>
      )}

      {/* Supportive Rule-based Insights */}
      <AppHeading level={3} style={styles.sectionHeading}>
        Supportive Reflections 🌿
      </AppHeading>
      <AppText variant="caption" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Gentle observations grounded in your recorded feelings
      </AppText>

      <View style={styles.insightsList}>
        {insights.map((item) => (
          <AppCard key={item.id} style={styles.insightItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
              <AppIcon name={(item.icon as IconName) || 'sparkles'} size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.insightContent}>
              <AppText variant="bodyMedium" style={{ fontWeight: '700' }}>
                {item.title}
              </AppText>
              <AppText
                variant="bodySmall"
                style={[styles.insightDesc, { color: colors.textSecondary }]}
              >
                {item.description}
              </AppText>
            </View>
          </AppCard>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: -8,
    marginBottom: 4,
  },
  insightsList: {
    gap: 10,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 18,
    gap: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
    gap: 4,
  },
  insightDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  safetyCard: {
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1.5,
    borderRadius: 18,
    marginBottom: 8,
    gap: 10,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  safetyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyHeaderTexts: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
  },
  safetyBody: {
    fontSize: 13,
    lineHeight: 18,
    color: '#7F1D1D',
  },
  safetyActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  safetyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  safetyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
