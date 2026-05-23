import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Bell, Moon, Shield, CircleHelp, LogOut } from 'lucide-react-native';
import { ScreenContainer, Text, SettingsRow } from '@/components';
import { colors } from '@/theme';

export const SettingsScreen = () => {
  const [pushEnabled, setPushEnabled] = useState(false);

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
            />
            <SettingsRow 
              icon={Moon}
              label="Theme"
              value="Noir Brutalism"
              showDivider={false}
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="bodyMedium" color="textMuted" style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingsRow 
              icon={Shield}
              label="Privacy Policy"
              onPress={() => Linking.openURL('https://clubconnect.app/privacy')}
            />
            <SettingsRow 
              icon={CircleHelp}
              label="Help & Support"
              onPress={() => Linking.openURL('https://clubconnect.app/support')}
              showDivider={false}
            />
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
    borderRadius: 0,
  },
});
