import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  AppHeading,
  AppText,
  PrimaryButton,
  AppIcon,
  AppBadge,
} from '@/components/ui';
import { FloatingView } from '@/utils/animations';
import { useTheme } from '@/hooks/useTheme';

export default function IndexScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <FloatingView floatDistance={6} style={styles.floatingMascot}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark ? colors.surfaceSecondary : colors.mint,
              },
            ]}
          >
            <AppIcon name="sparkles" size="xl" color={colors.primary} />
          </View>
        </FloatingView>

        <AppBadge
          label="Design System Initialized"
          variant="mint"
          size="sm"
          style={{ marginBottom: 12 }}
        />

        <AppHeading level="displayLarge" align="center" style={styles.title}>
          Solace AI
        </AppHeading>

        <AppText variant="bodyLarge" align="center" color="textSecondary" style={styles.subtitle}>
          Your personal space to feel, heal and grow.
        </AppText>

        <View style={styles.actionBlock}>
          <PrimaryButton
            title="Explore Design System"
            leadingIcon="sliders"
            size="lg"
            fullWidth
            onPress={() => router.push('/design-system')}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  floatingMascot: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    maxWidth: 280,
    lineHeight: 26,
    marginBottom: 32,
  },
  actionBlock: {
    width: '100%',
    maxWidth: 320,
  },
});
