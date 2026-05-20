import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
// We will import EventDetailScreen here in the future

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      {/* <Stack.Screen name="EventDetail" component={EventDetailScreen} /> */}
    </Stack.Navigator>
  );
};
