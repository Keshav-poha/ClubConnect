import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text, EmptyState } from '@/components';
import { colors } from '@/theme';

export const SavedScreen = () => {
  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>Bookmarks</Text>
      
      <View style={styles.content}>
        <EmptyState 
          title="No Bookmarks" 
          message="Events you bookmark will appear here."
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  headerTitle: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
