import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Text, Button, Badge, Divider } from '@/components';
import { colors } from '@/theme';

export const UIPlaygroundScreen = () => {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1">UI Playground</Text>
        <Text variant="bodyMedium" color="textMuted">Noir Brutalism Components</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Typography</Text>
          <Text variant="h1">Heading 1</Text>
          <Text variant="h2">Heading 2</Text>
          <Text variant="h3">Heading 3</Text>
          <Text variant="body">Body Text</Text>
          <Text variant="bodyMedium">Body Medium Text</Text>
          <Text variant="caption">Caption Text</Text>
          <Text variant="mono">Mono Text</Text>
        </View>
        <Divider />

        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Buttons</Text>
          <View style={styles.row}>
            <Button label="Primary Button" variant="primary" onPress={() => {}} />
            <Button label="Outline Button" variant="outline" onPress={() => {}} />
          </View>
        </View>
        <Divider />

        <View style={styles.section}>
          <Text variant="h2" style={styles.sectionTitle}>Badges</Text>
          <View style={styles.row}>
            <Badge label="Tech" />
            <Badge label="Workshop" color={colors.accentCyan} />
            <Badge label="Social" color={colors.accentGreen} />
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
    padding: 16,
    paddingTop: 60,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: colors.accentCyan,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
