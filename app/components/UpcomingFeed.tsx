import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Event } from '@/types';
import { EventCard } from '@/components/EventCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { EndOfList } from '@/components/EndOfList';
import { FeedSkeleton } from '@/components/FeedSkeleton';
import { MasonryGrid } from '@/components/MasonryGrid';

interface UpcomingFeedProps {
  events: Event[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  onRefresh?: () => void;
  onLoadMore?: () => void;
}

export const UpcomingFeed = React.memo(({
  events,
  isLoading,
  hasMore,
  error,
  onRefresh,
  onLoadMore,
}: UpcomingFeedProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const renderItem = useCallback((item: Event, index: number) => {
    return (
      <EventCard 
        event={item} 
        onPress={(event) => navigation.navigate('EventDetail', { event })} 
      />
    );
  }, [navigation]);

  if (isLoading && events.length === 0 && !refreshing) {
    return <FeedSkeleton />;
  }

  if (error && events.length === 0) {
    return <ErrorState message={error} onRetry={onRefresh} style={styles.center} />;
  }

  if (events.length === 0 && !isLoading && !refreshing) {
    return (
      <EmptyState
        title="No Upcoming Events"
        message="There are no events matching your filter."
        style={styles.center}
      />
    );
  }

  return (
    <MasonryGrid
      data={events}
      numColumns={2}
      contentContainerStyle={styles.contentContainer}
      onEndReached={onLoadMore}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#00EEFF"
        />
      }
      ListFooterComponent={
        isLoading && events.length > 0 ? (
          <LoadingIndicator size="small" style={styles.footerLoading} />
        ) : error && events.length > 0 ? (
          <ErrorState 
            title="Failed to load more" 
            message="Check your connection and try again." 
            onRetry={onLoadMore}
            style={styles.footerLoading} 
          />
        ) : !hasMore && events.length > 0 ? (
          <EndOfList />
        ) : null
      }
      renderItem={renderItem}
    />
  );
});

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
