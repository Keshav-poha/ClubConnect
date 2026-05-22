import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ScreenContainer, Text, ErrorState, FilterRow, UpcomingFeed } from '@/components';
import { FeaturedFilmStrip } from '@/components/FeaturedFilmStrip';
import { useStore } from '@/store';

export const HomeScreen = () => {
  const {
    featuredEvents,
    events,
    isLoadingEvents,
    errorEvents,
    fetchFeaturedEvents,
    fetchEvents,
    clubs,
    fetchClubs
  } = useStore();

  const [activeFilter, setActiveFilter] = React.useState<string>('all');

  useEffect(() => {
    fetchFeaturedEvents();
    fetchClubs();
  }, []);

  useEffect(() => {
    fetchEvents(1, 20, activeFilter);
  }, [activeFilter]);

  const filterOptions = React.useMemo(() => {
    return [
      { id: 'all', label: 'All' },
      ...clubs.map(club => ({ id: club.id, label: club.name }))
    ];
  }, [clubs]);

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>Archive</Text>
      
      {errorEvents && (
        <ErrorState message={errorEvents} onRetry={fetchFeaturedEvents} />
      )}
      
      {!errorEvents && (
        <FeaturedFilmStrip
          events={featuredEvents}
          isLoading={isLoadingEvents}
          error={errorEvents}
        />
      )}

      <View style={styles.sectionHeader}>
        <Text variant="h2">Upcoming Events</Text>
      </View>

      <FilterRow
        options={filterOptions}
        activeId={activeFilter}
        onSelect={setActiveFilter}
        style={styles.filterRow}
      />

      <UpcomingFeed
        events={events}
        isLoading={isLoadingEvents}
        error={errorEvents}
        onRefresh={() => fetchEvents(1, 20, activeFilter)}
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
  },
  filterRow: {
    marginBottom: 16,
  },
});
