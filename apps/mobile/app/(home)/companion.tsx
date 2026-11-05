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
  SolaceMascot,
} from '../../src/components/ui';
import { useTheme } from '../../src/hooks/useTheme';
import { triggerHaptic } from '../../src/utils/haptics';

export default function CompanionScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors } = useTheme();

  const handleBackHome = () => {
    triggerHaptic.light();
    router.navigate('/(home)');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppBadge label="AI COMPANION" variant="primary" size="sm" />
          <AppHeading level="h2" style={styles.title}>
            Solace Companion 🌿
          </AppHeading>
          <AppText
            variant="bodyMedium"
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            A calm, empathetic presence ready to listen, reflect, and guide you through life’s moments.
          </AppText>
        </View>

        {/* Mascot Centerpiece */}
        <View style={styles.mascotWrapper}>
          <SolaceMascot
            size={140}
            expression="listening"
            animationState="breathe"
            showGlow
            showCushion
          />
        </View>

        {/* Core Principles Card */}
        <AppCard style={styles.infoCard}>
          <AppHeading level="h4" style={styles.cardHeading}>
            Coming in Step 07: Real-time Companion Engine
          </AppHeading>
          <AppText
            variant="bodySmall"
            style={[styles.cardDescription, { color: colors.textSecondary }]}
          >
            Our conversational companion is being tuned with trauma-informed therapeutic framing, emotional sentiment awareness, and personalized grounding techniques.
          </AppText>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBadge, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="heart" size={16} color={colors.primaryDark} />
              </View>
              <View style={styles.featureTexts}>
                <AppText variant="bodySmall" style={styles.featureTitle}>
                  Empathetic Active Listening
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Non-judgmental, warm responses calibrated to your current mood.
                </AppText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconBadge, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="sparkles" size={16} color={colors.primaryDark} />
              </View>
              <View style={styles.featureTexts}>
                <AppText variant="bodySmall" style={styles.featureTitle}>
                  Contextual Grounding & CBT Prompts
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Gentle cognitive re-framing and breath sync when feelings get intense.
                </AppText>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={[styles.featureIconBadge, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name="shield" size={16} color={colors.primaryDark} />
              </View>
              <View style={styles.featureTexts}>
                <AppText variant="bodySmall" style={styles.featureTitle}>
                  Safe & Confidential Sanctuary
                </AppText>
                <AppText variant="caption" style={{ color: colors.textSecondary }}>
                  Your emotional reflections remain private and protected at all times.
                </AppText>
              </View>
            </View>
          </View>
        </AppCard>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <AppButton
            title="Return to Sanctuary Home"
            variant="primary"
            size="lg"
            fullWidth
            leadingIcon="home"
            onPress={handleBackHome}
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  mascotWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  infoCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  featureList: {
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTexts: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

