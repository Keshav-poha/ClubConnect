import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Event } from '@/types';
import { EventCard, EmptyState, ErrorState, LoadingIndicator, EndOfList } from '@/components';

interface UpcomingFeedProps {
  events: Event[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  onRefresh?: () => void;
  onLoadMore?: () => void;
}

export const UpcomingFeed = ({
  events,
  isLoading,
  hasMore,
  error,
  onRefresh,
  onLoadMore,
}: UpcomingFeedProps) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  if (isLoading && events.length === 0 && !refreshing) {
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#00EEFF"
        />
      }
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
        ) : !hasMore && events.length > 0 ? (
          <EndOfList />
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
