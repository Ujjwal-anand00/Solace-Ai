import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/hooks/useTheme';
import { AppIcon, IconName } from '../../src/components/ui';
import { triggerHaptic } from '../../src/utils/haptics';

export default function HomeLayout(): React.JSX.Element {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const handleTabPress = () => {
    triggerHaptic.selection();
  };

  const renderTabIcon = (name: IconName, focused: boolean) => (
    <View style={styles.tabIconContainer}>
      <View
        style={[
          styles.tabIconPill,
          focused && {
            backgroundColor: isDark ? 'rgba(203, 179, 232, 0.25)' : '#E8DDF5',
          },
        ]}
      >
        <AppIcon
          name={name}
          size={20}
          color={focused ? colors.primaryDark : colors.textSecondary}
        />
      </View>
      {focused && (
        <View style={[styles.activeIndicator, { backgroundColor: colors.accent }]} />
      )}
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? colors.surfaceSecondary : colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 6),
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#292431',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
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
          tabBarIcon: ({ focused }) => renderTabIcon('home', focused),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      <Tabs.Screen
        name="companion"
        options={{
          title: 'Companion',
          tabBarIcon: ({ focused }) => renderTabIcon('messageCircle', focused),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          tabBarIcon: ({ focused }) => renderTabIcon('compass', focused),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => renderTabIcon('trendingUp', focused),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => renderTabIcon('user', focused),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
  },
  tabIconPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
