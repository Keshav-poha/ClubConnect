import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { EventDetailScreen } from '@/screens/EventDetailScreen';
import { UIPlaygroundScreen } from '@/screens/UIPlaygroundScreen';
import { FilmGrain } from '@/components/FilmGrain';
import { Toast } from '@/components/Toast';
import { useStore } from '@/store';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const toast = useStore((s) => s.toast);
  const hideToast = useStore((s) => s.hideToast);

  return (
    <View style={styles.container}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
        <Stack.Screen name="UIPlayground" component={UIPlaygroundScreen} />
      </Stack.Navigator>
      <FilmGrain />
      <Toast 
        visible={!!toast} 
        message={toast?.message || ''} 
        type={toast?.type} 
        onHide={hideToast} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080808',
  },
});
