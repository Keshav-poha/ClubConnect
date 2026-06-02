import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { EventDetailScreen } from '@/screens/EventDetailScreen';
import { PrivacyPolicyScreen } from '@/screens/PrivacyPolicyScreen';
import { SocietyApplicationsListScreen } from '@/screens/SocietyApplicationsListScreen';
import { ApplicationFormScreen } from '@/screens/ApplicationFormScreen';
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
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="SocietyApplicationsList" component={SocietyApplicationsListScreen} />
        <Stack.Screen name="ApplicationForm" component={ApplicationFormScreen} />
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
