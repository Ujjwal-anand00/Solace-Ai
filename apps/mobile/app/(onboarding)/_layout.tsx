import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';

export default function OnboardingLayout(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="introduction" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}

