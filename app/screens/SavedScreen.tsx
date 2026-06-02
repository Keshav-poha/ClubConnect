import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { EmptyState } from '@/components/EmptyState';
import { UpcomingFeed } from '@/components/UpcomingFeed';
import { useStore } from '@/store';

export const SavedScreen = () => {
  const bookmarkedEvents = useStore((s) => s.bookmarkedEvents);

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>
        Bookmarks
      </Text>

      <View style={styles.content}>
        {bookmarkedEvents.length === 0 ? (
          <EmptyState
            title="No Bookmarks"
            message="Events you bookmark will appear here."
            style={styles.emptyContainer}
          />
        ) : (
          <UpcomingFeed events={bookmarkedEvents} isLoading={false} hasMore={false} error={null} />
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
    marginTop: 80,
  },
});
