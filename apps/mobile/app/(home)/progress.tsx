import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppHeading,
  AppText,
  AppCard,
  AppBadge,
  AppButton,
  AppIcon,
} from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import { useProgress } from '../../src/hooks/useProgress';
import { triggerHaptic } from '../../src/utils/haptics';

export default function ProgressScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data: progress } = useProgress();

  const streak = progress?.currentStreak || 0;
  const longestStreak = progress?.longestStreak || 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppBadge label="GROWTH & CONSISTENCY" variant="primary" size="sm" />
          <AppHeading level="h2" style={styles.title}>
            Wellness Progress
          </AppHeading>
          <AppText
            variant="bodyMedium"
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            Celebrate every small step taken towards calm and emotional well-being.
          </AppText>
        </View>

        {/* Big Streak Card */}
        <AppCard
          style={[
            styles.streakCard,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : '#FFF9F2',
              borderColor: '#F3DFC5',
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.streakTopRow}>
            <View style={styles.flameCircle}>
              <AppText style={styles.flameText}>🔥</AppText>
            </View>
            <View style={styles.streakTexts}>
              <View style={styles.streakCountRow}>
                <AppHeading level="h1" style={styles.streakNumber}>
                  {streak}
                </AppHeading>
                <AppHeading level="h3" style={styles.streakDaysLabel}>
                  {streak === 1 ? 'Day' : 'Days'}
                </AppHeading>
              </View>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                {streak > 0
                  ? 'Consistent daily sanctuary visits'
                  : 'Start your streak by checking in today'}
              </AppText>
            </View>
          </View>

          <View style={styles.longestStreakRow}>
            <AppIcon name="award" size={16} color="#D97706" />
            <AppText variant="caption" style={{ color: '#D97706', fontWeight: '600' }}>
              Personal Best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </AppText>
          </View>
        </AppCard>

        {/* Lifetime Activity Stats Grid */}
        <AppHeading level="h4" style={styles.sectionHeading}>
          Lifetime Impact
        </AppHeading>

        <View style={styles.statsGrid}>
          <AppCard style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#E0F2FE' }]}>
              <AppIcon name="smile" size={18} color="#0369A1" />
            </View>
            <AppHeading level="h3" style={styles.statCount}>
              {progress?.totalMoodCheckIns || 0}
            </AppHeading>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Mood Check-ins
            </AppText>
          </AppCard>

          <AppCard style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#DCFCE7' }]}>
              <AppIcon name="activity" size={18} color="#15803D" />
            </View>
            <AppHeading level="h3" style={styles.statCount}>
              {progress?.totalActivities || 0}
            </AppHeading>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Activities Finished
            </AppText>
          </AppCard>

          <AppCard style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
              <AppIcon name="book-open" size={18} color="#B45309" />
            </View>
            <AppHeading level="h3" style={styles.statCount}>
              {progress?.totalJournalEntries || 0}
            </AppHeading>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Journal Reflections
            </AppText>
          </AppCard>

          <AppCard style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#F3E8FF' }]}>
              <AppIcon name="wind" size={18} color="#7E22CE" />
            </View>
            <AppHeading level="h3" style={styles.statCount}>
              {progress?.totalBreathingSessions || 0}
            </AppHeading>
            <AppText variant="caption" style={{ color: colors.textSecondary }}>
              Breathing Sessions
            </AppText>
          </AppCard>
        </View>

        {/* Milestones & Achievements */}
        <AppHeading level="h4" style={styles.sectionHeading}>
          Earned Milestones
        </AppHeading>

        <AppCard style={styles.achievementsCard}>
          <View style={styles.achievementRow}>
            <View style={[styles.achievementIcon, { backgroundColor: '#FFFBEB' }]}>
              <AppText style={{ fontSize: 20 }}>🌱</AppText>
            </View>
            <View style={styles.achievementDetails}>
              <AppText variant="bodySmall" style={{ fontWeight: '700' }}>
                First Steps
              </AppText>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Took your very first step in Solace sanctuary.
              </AppText>
            </View>
            <AppBadge label="UNLOCKED" variant="primary" size="sm" />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.achievementRow}>
            <View style={[styles.achievementIcon, { backgroundColor: '#F5F3FF' }]}>
              <AppText style={{ fontSize: 20 }}>✨</AppText>
            </View>
            <View style={styles.achievementDetails}>
              <AppText variant="bodySmall" style={{ fontWeight: '700' }}>
                Reflective Heart
              </AppText>
              <AppText variant="caption" style={{ color: colors.textSecondary }}>
                Checked in with your inner self.
              </AppText>
            </View>
            <AppBadge
              label={(progress?.totalMoodCheckIns || 0) > 0 ? 'UNLOCKED' : 'IN PROGRESS'}
              variant={(progress?.totalMoodCheckIns || 0) > 0 ? 'primary' : 'neutral'}
              size="sm"
            />
          </View>
        </AppCard>

        {/* Return Button */}
        <View style={styles.buttonWrapper}>
          <AppButton
            title="Return to Sanctuary Home"
            variant="outline"
            size="md"
            fullWidth
            onPress={() => {
              triggerHaptic.light();
              router.navigate('/(home)');
            }}
          />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
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
  streakCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  streakTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  flameCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE5C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flameText: {
    fontSize: 30,
  },
  streakTexts: {
    flex: 1,
  },
  streakCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  streakDaysLabel: {
    fontSize: 20,
    fontWeight: '700',
  },
  longestStreakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2E2CE',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    width: '48%',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    gap: 4,
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statCount: {
    fontSize: 20,
    fontWeight: '800',
  },
  achievementsCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementDetails: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  buttonWrapper: {
    marginTop: 4,
  },
});

