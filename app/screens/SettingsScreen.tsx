import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Bell, Moon, Shield, Trash2, Sun } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { SettingsRow } from '@/components/SettingsRow';
import { RootStackParamList } from '@/navigation/types';
import { useStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';
import { useResponsive } from '@/hooks/useResponsive';

export const SettingsScreen = () => {
  const [pushEnabled, setPushEnabled] = useState(false);
  const showToast = useStore((s) => s.showToast);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const themeMode = useStore((s) => s.themeMode);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const { colors, borderRadius, isDark } = useTheme();
  const globalStyles = useGlobalStyles();
  const { isWideScreen } = useResponsive();

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
      <View style={[styles.header, isWideScreen && styles.centeredContent]}>
        <Text variant="h1">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.contentWrapper, isWideScreen && styles.centeredContent]}>
          <View style={styles.section}>
            <Text variant="bodyMedium" color="textMuted" style={styles.sectionTitle}>App Preferences</Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border, borderRadius: borderRadius.md }]}>
              <SettingsRow 
                icon={Bell}
                label="Push Notifications"
                isSwitch
                switchValue={pushEnabled}
                onSwitchChange={setPushEnabled}
                showDivider={true}
              />
              <SettingsRow 
                icon={isDark ? Moon : Sun}
                label="Dark Theme"
                isSwitch
                switchValue={isDark}
                onSwitchChange={toggleTheme}
                showDivider={false}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="bodyMedium" color="textMuted" style={styles.sectionTitle}>About</Text>
            <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border, borderRadius: borderRadius.md }]}>
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
            <View style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border, borderRadius: borderRadius.md }]}>
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
  contentWrapper: {
    width: '100%',
  },
  centeredContent: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
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
    borderWidth: 1,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
});
