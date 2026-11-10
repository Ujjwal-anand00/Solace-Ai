import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { AppHeading, AppText, SolaceMascot, AppIcon, IconName } from '../../../components/ui';
import { useTheme } from '../../../hooks/useTheme';
import { triggerHaptic } from '../../../utils/haptics';

interface WelcomeStartersProps {
  userName?: string;
  onSelectStarter: (starter: string) => void;
}

const STARTERS = [
  {
    icon: 'wind',
    label: "I'm feeling a bit overwhelmed today",
  },
  {
    icon: 'sparkles',
    label: 'Can you guide me through a quick breathing exercise?',
  },
  {
    icon: 'heart',
    label: 'I need help processing a difficult situation',
  },
  {
    icon: 'compass',
    label: 'Help me reframe some negative thoughts',
  },
  {
    icon: 'smile',
    label: 'I had a small win today and want to celebrate it',
  },
  {
    icon: 'feather',
    label: 'What is a gentle mindfulness prompt for right now?',
  },
] as const;

export const WelcomeStarters: React.FC<WelcomeStartersProps> = ({
  userName = 'Friend',
  onSelectStarter,
}) => {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
    >
      <View style={styles.mascotContainer}>
        <SolaceMascot
          size={110}
          expression="happy"
          animationState="floating"
          showGlow
          showCushion
        />
      </View>

      <View style={styles.welcomeCard}>
        <AppHeading level="h3" style={styles.greetingTitle}>
          Hello, {userName} 🌿
        </AppHeading>
        <AppText
          variant="bodyMedium"
          style={[styles.greetingSubtitle, { color: colors.textSecondary }]}
        >
          I am here to listen without judgment, offer thoughtful perspective, and support your well-being.
        </AppText>
      </View>

      <View style={styles.promptsSection}>
        <AppText variant="caption" style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          SUGGESTED CONVERSATION STARTERS
        </AppText>

        <View style={styles.chipsGrid}>
          {STARTERS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.starterChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => {
                triggerHaptic.selection();
                onSelectStarter(item.label);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.chipIconWrap, { backgroundColor: colors.primaryLight }]}>
                <AppIcon name={item.icon as IconName} size={15} color={colors.primaryDark} />
              </View>
              <AppText variant="bodySmall" style={[styles.chipText, { color: colors.textPrimary }]}>
                {item.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  mascotContainer: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeCard: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  greetingTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 22,
    fontWeight: '700',
  },
  greetingSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },
  promptsSection: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
    textAlign: 'center',
  },
  chipsGrid: {
    gap: 10,
    width: '100%',
  },
  starterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  chipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
});
