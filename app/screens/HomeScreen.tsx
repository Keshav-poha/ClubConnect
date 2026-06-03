import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { ErrorState } from '@/components/ErrorState';
import { FilterRow } from '@/components/FilterRow';
import { UpcomingFeed } from '@/components/UpcomingFeed';
import { FeaturedFilmStrip } from '@/components/FeaturedFilmStrip';
import { useStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { useGlobalStyles } from '@/styles/global';

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

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { colors, borderRadius, isDark } = useTheme();
  const { isWideScreen } = useResponsive();
  const globalStyles = useGlobalStyles();

  useEffect(() => {
    fetchFeaturedEvents();
    fetchClubs();
  }, [fetchFeaturedEvents, fetchClubs]);

  useEffect(() => {
    fetchEvents(1, 20, activeFilter, timeFilter);
  }, [activeFilter, timeFilter, fetchEvents]);

  const handleRefresh = React.useCallback(() => {
    fetchEvents(1, 20, activeFilter, timeFilter);
  }, [activeFilter, timeFilter, fetchEvents]);

  const filterOptions = useMemo(() => {
    return [
      { id: 'all', label: 'All' },
      ...clubs.map((club) => ({ id: club.id, label: club.name })),
    ];
  }, [clubs]);

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>
        ClubConnect
      </Text>

      <View
        style={[
          styles.segmentContainer,
          {
            backgroundColor: colors.backgroundCard,
            borderTopColor: colors.clayShadow,
            borderLeftColor: colors.clayShadow,
            borderBottomColor: colors.clayHighlight,
            borderRightColor: colors.clayHighlight,
            borderRadius: borderRadius.pill,
          },
          isWideScreen && styles.segmentContainerWide,
        ]}
      >
        <Pressable
          style={[
            styles.segmentButton,
            timeFilter === 'upcoming' && [
              globalStyles.clayButton,
              {
                backgroundColor: colors.accentCyan,
                borderTopColor: 'rgba(255,255,255,0.3)',
                borderLeftColor: 'rgba(255,255,255,0.3)',
                shadowColor: colors.accentCyan,
              },
            ],
          ]}
          onPress={() => setTimeFilter('upcoming')}
        >
          <Text
            variant="bodyMedium"
            color={timeFilter === 'upcoming' ? 'backgroundCard' : 'textMuted'}
          >
            Upcoming
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.segmentButton,
            timeFilter === 'past' && [
              globalStyles.clayButton,
              {
                backgroundColor: colors.accentCyan,
                borderTopColor: 'rgba(255,255,255,0.3)',
                borderLeftColor: 'rgba(255,255,255,0.3)',
                shadowColor: colors.accentCyan,
              },
            ],
          ]}
          onPress={() => setTimeFilter('past')}
        >
          <Text variant="bodyMedium" color={timeFilter === 'past' ? 'backgroundCard' : 'textMuted'}>
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
        <Text variant="h2">{timeFilter === 'upcoming' ? 'Upcoming Events' : 'Past Events'}</Text>
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
        onRefresh={handleRefresh}
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
    padding: 6,
    marginHorizontal: 16,
    marginBottom: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  segmentContainerWide: {
    width: 400, // Constrain width on wide screens
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    ...Platform.select({
      web: {
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      } as any,
    }),
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
