import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer, Text, LoadingIndicator, ErrorState, EventCard, Badge } from '@/components';
import { useStore } from '@/store';

export const HomeScreen = () => {
  const { featuredEvents, isLoadingEvents, errorEvents, fetchFeaturedEvents } = useStore();

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>Archive</Text>
      
      {isLoadingEvents && !featuredEvents.length && (
        <LoadingIndicator style={styles.center} />
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
        renderItem={({ item }) => (
          <View style={styles.filmStripItem}>
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
  filmStripItem: {
    width: 320,
    marginRight: 16,
    marginLeft: 16,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
});
