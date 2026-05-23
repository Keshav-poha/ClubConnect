import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Text, Divider } from '@/components';
import { colors } from '@/theme';

export const SettingsScreen = () => {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="bodyMedium" color="textMuted" style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.card}>
            {/* Settings rows will go here */}
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="bodyMedium" color="textMuted" style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            {/* About rows will go here */}
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
