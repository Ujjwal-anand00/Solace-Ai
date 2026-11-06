import { Stack } from 'expo-router';

export default function JournalLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F8F6EF' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="editor" />
      <Stack.Screen name="history" />
      <Stack.Screen name="guided" />
      <Stack.Screen name="gratitude" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}

