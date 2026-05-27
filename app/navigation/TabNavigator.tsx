import React from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Compass, Bookmark, Film, Settings } from 'lucide-react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { DiscoverScreen } from '@/screens/DiscoverScreen';
import { SavedScreen } from '@/screens/SavedScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { colors } from '@/theme';

import { useWindowDimensions, Platform, View, Pressable, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation, isDesktop }: BottomTabBarProps & { isDesktop: boolean }) => {
  return (
    <View style={isDesktop ? styles.sidebarContainer : styles.tabBarContainer}>
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
            style={[
              styles.tabItem,
              isDesktop ? styles.desktopTabItem : styles.mobileTabItem,
            ]}
          >
            {Icon && Icon({
              focused: isFocused,
              color: isFocused ? colors.textPrimary : colors.textMuted,
              size: 24
            })}
          </Pressable>
        );
      })}
    </View>
  );
};

export const TabNavigator = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} isDesktop={isDesktop} />}
      screenOptions={{
        headerShown: false,
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

const styles = StyleSheet.create({
  sidebarContainer: {
    position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any,
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: colors.backgroundPrimary,
    borderRightColor: colors.border,
    borderRightWidth: 1,
    flexDirection: 'column',
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 100,
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: colors.backgroundPrimary,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopTabItem: {
    height: 60,
    width: 80,
    marginBottom: 16,
  },
  mobileTabItem: {
    flex: 1,
    height: '100%',
  },
});
