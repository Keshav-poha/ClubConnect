import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Compass, Bookmark, Film, Settings } from 'lucide-react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { DiscoverScreen } from '@/screens/DiscoverScreen';
import { SavedScreen } from '@/screens/SavedScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { colors } from '@/theme';

import { useWindowDimensions, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: isDesktop ? {
          position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any,
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          backgroundColor: colors.backgroundPrimary,
          borderRightColor: colors.border,
          borderRightWidth: 1,
          borderTopWidth: 0,
          flexDirection: 'column',
          paddingTop: 40,
          alignItems: 'center',
          justifyContent: 'flex-start',
        } : {
          backgroundColor: colors.backgroundPrimary,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarItemStyle: isDesktop ? {
          height: 60,
          width: 80,
          marginBottom: 16,
        } : undefined,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Film color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Bookmark color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
