import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text } from '@/components';

export const SavedScreen = () => {
  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h2">Saved</Text>
      <Text variant="body" color="textMuted">Your bookmarked events</Text>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
