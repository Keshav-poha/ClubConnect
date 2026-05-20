import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer, Text, LoadingIndicator, ErrorState, EventCard } from '@/components';
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
        renderItem={({ item }) => (
          <View style={styles.filmStripItem}>
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
});
