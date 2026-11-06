import { Stack } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';

export default function ResourcesLayout() {
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
      <Stack.Screen name="category" />
      <Stack.Screen name="search" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
