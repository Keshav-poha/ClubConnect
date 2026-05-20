import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text } from '@/components';

export const HomeScreen = () => {
  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1">Archive</Text>
      <Text variant="body" color="textMuted">Upcoming Events</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
