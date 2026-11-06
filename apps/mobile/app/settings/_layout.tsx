import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8F6EF' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="wellness-preferences" />
      <Stack.Screen name="ai-settings" />
      <Stack.Screen name="privacy-data" />
      <Stack.Screen name="security" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="accessibility" />
      <Stack.Screen name="language" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="about" />
    </Stack>
  );
}

