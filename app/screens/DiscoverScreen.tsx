import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text } from '@/components';

export const DiscoverScreen = () => {
  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h2">Discover</Text>
      <Text variant="body" color="textMuted">Search events and clubs</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
