import '../global.css';
import React from 'react';
import { LogBox } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ThemeProvider, useTheme } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { usePushRegistration } from '@/hooks/usePushRegistration';

// Suppress known upstream deprecation warning triggered by react-native-css-interop / nativewind
LogBox.ignoreLogs([
  'ImageBackground is deprecated',
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppNavigation(): React.JSX.Element {
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();
  usePushRegistration(isAuthenticated);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(home)" />
      <Stack.Screen name="mood" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="journal" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="design-system" />
    </Stack>
  );
}

export default function RootLayout(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppNavigation />
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
