import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { AppIcon } from '../../src/components/ui';
import { triggerHaptic } from '../../src/utils/haptics';

export default function HomeLayout(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const handleTabPress = () => {
    triggerHaptic.selection();
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 56 + Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name="home"
              size={focused ? 24 : 22}
              color={typeof color === 'string' ? color : colors.primaryDark}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      <Tabs.Screen
        name="companion"
        options={{
          title: 'Companion',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name="messageCircle"
              size={focused ? 24 : 22}
              color={typeof color === 'string' ? color : colors.primaryDark}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name="compass"
              size={focused ? 24 : 22}
              color={typeof color === 'string' ? color : colors.primaryDark}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name="trendingUp"
              size={focused ? 24 : 22}
              color={typeof color === 'string' ? color : colors.primaryDark}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AppIcon
              name="user"
              size={focused ? 24 : 22}
              color={typeof color === 'string' ? color : colors.primaryDark}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tabs>
  );
}
