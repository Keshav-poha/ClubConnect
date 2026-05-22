import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Text, EmptyState, UpcomingFeed } from '@/components';
import { useStore } from '@/store';
import { colors } from '@/theme';

export const SavedScreen = () => {
  const { bookmarkedEvents } = useStore();

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>Bookmarks</Text>
      
      <View style={styles.content}>
        {bookmarkedEvents.length === 0 ? (
          <EmptyState 
            title="No Bookmarks" 
            message="Events you bookmark will appear here."
            style={styles.emptyContainer}
          />
        ) : (
          <UpcomingFeed 
            events={bookmarkedEvents}
            isLoading={false}
            hasMore={false}
            error={null}
          />
        )}
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
  },
  emptyContainer: {
    marginTop: 100,
  },
});
