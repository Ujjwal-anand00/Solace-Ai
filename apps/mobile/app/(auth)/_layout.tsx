import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';

export default function AuthLayout(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="profile-setup" />
    </Stack>
  );
}
