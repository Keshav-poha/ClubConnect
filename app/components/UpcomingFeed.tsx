import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Event } from '@/types';
import { EventCard, EmptyState, ErrorState, LoadingIndicator } from '@/components';

interface UpcomingFeedProps {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => void;
  onLoadMore?: () => void;
}

export const UpcomingFeed = ({
  events,
  isLoading,
  error,
  onRefresh,
  onLoadMore,
}: UpcomingFeedProps) => {
  if (isLoading && events.length === 0) {
    return <LoadingIndicator style={styles.center} />;
  }

  if (error && events.length === 0) {
    return <ErrorState message={error} onRetry={onRefresh} style={styles.center} />;
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.contentContainer}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        !isLoading ? (
          <EmptyState
            title="No Upcoming Events"
            message="There are no events matching your filter."
            style={styles.center}
          />
        ) : null
      }
      ListFooterComponent={
        isLoading && events.length > 0 ? (
          <LoadingIndicator size="small" style={styles.footerLoading} />
        ) : null
      }
      renderItem={({ item }) => <EventCard event={item} />}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  center: {
    marginTop: 40,
    marginBottom: 40,
  },
  footerLoading: {
    paddingVertical: 16,
  },
});
