import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { AppHeading, AppText, PrimaryButton, AppIcon } from '@/components/ui';

export default function NotFoundScreen(): React.JSX.Element {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: isDark ? colors.surfaceSecondary : colors.mint,
            },
          ]}
        >
          <AppIcon name="alertCircle" size="xl" color={colors.primary} />
        </View>

        <AppHeading level={2} align="center" style={styles.title}>
          This screen doesn't exist
        </AppHeading>

        <AppText variant="bodyMedium" align="center" color="textSecondary" style={styles.subtitle}>
          Let's return to your mindful sanctuary.
        </AppText>

        <PrimaryButton
          title="Return to Solace"
          leadingIcon="home"
          onPress={() => router.replace('/')}
          style={styles.button}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    maxWidth: 260,
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
});
