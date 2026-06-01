import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { Bell, Moon, Shield, CircleHelp, Trash2, Code } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { SettingsRow } from '@/components/SettingsRow';
import { RootStackParamList } from '@/navigation/types';
import { useStore } from '@/store';
import { colors, borderRadius } from '@/theme';

export const SettingsScreen = () => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const showToast = useStore((s) => s.showToast);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear your local data? This will remove your saved bookmarks.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('clubconnect-storage');
              showToast({ message: 'Local cache cleared successfully', type: 'success' });
            } catch (e) {
              showToast({ message: 'Failed to clear cache', type: 'error' });
            }
          }
        }
      ]
    );
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="bodyMedium" color="textMuted" style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.card}>
            <SettingsRow 
              icon={Bell}
              label="Push Notifications"
              isSwitch
              switchValue={pushEnabled}
              onSwitchChange={setPushEnabled}
              showDivider={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="bodyMedium" color="textMuted" style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingsRow 
              icon={Shield}
              label="Privacy Policy"
              onPress={() => navigation.navigate('PrivacyPolicy')}
              showDivider={false}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="bodyMedium" color="textMuted" style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.card}>
            <SettingsRow 
              icon={Trash2}
              label="Clear Cache & Data"
              onPress={handleClearCache}
              showDivider={false}
              danger
            />
          </View>
        </View>



        <View style={styles.versionContainer}>
          <Text variant="caption" color="textMuted">ClubConnect Version 1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
});
