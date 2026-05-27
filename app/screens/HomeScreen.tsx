import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { ErrorState } from '@/components/ErrorState';
import { FilterRow } from '@/components/FilterRow';
import { UpcomingFeed } from '@/components/UpcomingFeed';
import { FeaturedFilmStrip } from '@/components/FeaturedFilmStrip';
import { useStore } from '@/store';
import { colors, borderRadius } from '@/theme';

export const HomeScreen = () => {
  const featuredEvents = useStore((s) => s.featuredEvents);
  const events = useStore((s) => s.events);
  const isLoadingEvents = useStore((s) => s.isLoadingEvents);
  const errorEvents = useStore((s) => s.errorEvents);
  const hasMore = useStore((s) => s.hasMore);
  const fetchFeaturedEvents = useStore((s) => s.fetchFeaturedEvents);
  const fetchEvents = useStore((s) => s.fetchEvents);
  const loadMoreEvents = useStore((s) => s.loadMoreEvents);
  const clubs = useStore((s) => s.clubs);
  const fetchClubs = useStore((s) => s.fetchClubs);
  const timeFilter = useStore((s) => s.timeFilter);
  const setTimeFilter = useStore((s) => s.setTimeFilter);

  const [activeFilter, setActiveFilter] = React.useState<string>('all');

  useEffect(() => {
    fetchFeaturedEvents();
    fetchClubs();
  }, []);

  useEffect(() => {
    fetchEvents(1, 20, activeFilter, timeFilter);
  }, [activeFilter, timeFilter]);

  const filterOptions = React.useMemo(() => {
    return [
      { id: 'all', label: 'All' },
      ...clubs.map(club => ({ id: club.id, label: club.name }))
    ];
  }, [clubs]);

  return (
    <ScreenContainer hasSidebar={true} style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>ClubConnect</Text>
      
      <View style={styles.segmentContainer}>
        <Pressable
          style={[
            styles.segmentButton,
            timeFilter === 'upcoming' && styles.segmentButtonActive,
          ]}
          onPress={() => setTimeFilter('upcoming')}
        >
          <Text
            variant="bodyMedium"
            color={timeFilter === 'upcoming' ? 'backgroundPrimary' : 'textMuted'}
          >
            Upcoming
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.segmentButton,
            timeFilter === 'past' && styles.segmentButtonActive,
          ]}
          onPress={() => setTimeFilter('past')}
        >
          <Text
            variant="bodyMedium"
            color={timeFilter === 'past' ? 'backgroundPrimary' : 'textMuted'}
          >
            Past
          </Text>
        </Pressable>
      </View>

      {timeFilter === 'upcoming' && errorEvents && (
        <ErrorState message={errorEvents} onRetry={fetchFeaturedEvents} />
      )}
      
      {timeFilter === 'upcoming' && !errorEvents && featuredEvents.length > 0 && (
        <FeaturedFilmStrip
          events={featuredEvents}
          isLoading={isLoadingEvents}
          error={errorEvents}
        />
      )}

      <View style={styles.sectionHeader}>
        <Text variant="h2">
          {timeFilter === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
        </Text>
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
        hasMore={hasMore}
        error={errorEvents}
        onRefresh={() => fetchEvents(1, 20, activeFilter, timeFilter)}
        onLoadMore={() => loadMoreEvents(20, activeFilter)}
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
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    padding: 4,
    borderRadius: borderRadius.md,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md - 4,
  },
  segmentButtonActive: {
    backgroundColor: colors.textPrimary,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  filterRow: {
    marginBottom: 16,
  },
});
