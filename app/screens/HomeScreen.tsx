import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer, Text, LoadingIndicator, ErrorState, EventCard, Badge, EmptyState } from '@/components';
import { FeaturedSkeleton } from '@/components/FeaturedSkeleton';
import { useStore } from '@/store';

export const HomeScreen = () => {
  const { featuredEvents, isLoadingEvents, errorEvents, fetchFeaturedEvents } = useStore();

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const [activeIndex, setActiveIndex] = React.useState(0);

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>Archive</Text>
      
      {isLoadingEvents && !featuredEvents.length && (
        <View style={styles.skeletonContainer}>
          <FeaturedSkeleton />
        </View>
      )}

      {!isLoadingEvents && !errorEvents && featuredEvents.length === 0 && (
        <EmptyState title="No Featured Events" message="Check back later for curated events." style={styles.center} />
      )}
      
      {errorEvents && (
        <ErrorState message={errorEvents} onRetry={fetchFeaturedEvents} />
      )}
      
      <FlatList
        data={featuredEvents}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={336} // 320 width + 16 marginLeft
        decelerationRate="fast"
        snapToAlignment="start"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <View style={[styles.filmStripItem, index === activeIndex && styles.activeFilmStripItem]}>
            <View style={styles.featuredBadge}>
              <Badge label="Featured" variant="accent" />
            </View>
            <EventCard event={item} />
          </View>
        )}
      />
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
  center: {
    marginTop: 100,
  },
  skeletonContainer: {
    flexDirection: 'row',
  },
  filmStripItem: {
    width: 320,
    marginRight: 16,
    marginLeft: 16,
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  activeFilmStripItem: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
});
