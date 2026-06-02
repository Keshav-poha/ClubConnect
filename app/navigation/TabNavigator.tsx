import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Bookmark, Film, Settings, ClipboardList } from 'lucide-react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { SavedScreen } from '@/screens/SavedScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { ApplicationsDirectoryScreen } from '@/screens/ApplicationsDirectoryScreen';
import { useTheme } from '@/hooks/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';
import { useGlobalStyles } from '@/styles/global';

import { View, Pressable, StyleSheet, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isWideScreen } = useResponsive();
  const globalStyles = useGlobalStyles();

  const containerStyle = isWideScreen
    ? [
        styles.sidebarContainer,
        globalStyles.clayCard,
        {
          marginLeft: insets.left > 0 ? insets.left : 16,
          marginTop: insets.top > 0 ? insets.top + 16 : 32,
          marginBottom: insets.bottom > 0 ? insets.bottom + 16 : 32,
        },
      ]
    : [
        styles.tabBarContainer,
        globalStyles.clayCard,
        {
          borderRadius: 9999, // Pill shape for bottom bar
          marginBottom: insets.bottom > 0 ? insets.bottom : 16,
        },
      ];

  return (
    <View style={containerStyle}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const Icon = options.tabBarIcon;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={isWideScreen ? styles.sidebarItem : styles.tabItem}
          >
            {isFocused && (
              <View
                style={[
                  isWideScreen ? styles.activeIndicatorSidebar : styles.activeIndicator,
                  { backgroundColor: colors.accentCyan },
                ]}
              />
            )}
            {Icon &&
              Icon({
                focused: isFocused,
                color: isFocused ? colors.accentCyan : colors.textMuted,
                size: 24,
              })}
          </Pressable>
        );
      })}
    </View>
  );
};

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Film color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsDirectoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    overflow: 'hidden',
  },
  sidebarContainer: {
    flexDirection: 'column',
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    gap: 32,
    zIndex: 10,
    overflow: 'hidden',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sidebarItem: {
    width: '100%',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    width: 32,
    height: 4,
    borderRadius: 2,
    opacity: 0.15,
  },
  activeIndicatorSidebar: {
    position: 'absolute',
    left: 8,
    width: 4,
    height: 32,
    borderRadius: 2,
    opacity: 0.15,
  },
});
