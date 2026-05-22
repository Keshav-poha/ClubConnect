import React, { useMemo } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { ScreenContainer, Text, EmptyState, UpcomingFeed } from '@/components';
import { useStore } from '@/store';
import { colors, typography } from '@/theme';
import { globalStyles } from '@/styles/global';

export const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { events, isLoadingEvents, errorEvents, fetchEvents, loadMoreEvents, hasMore } = useStore();

  React.useEffect(() => {
    if (events.length === 0) {
      fetchEvents();
    }
  }, []);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(query) || 
      event.club.name.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>Discover</Text>
      
      <View style={[styles.searchContainer, globalStyles.brutalistBorder]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search clubs, events..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.content}>
        {searchQuery.trim() && filteredEvents.length === 0 ? (
          <EmptyState 
            title="No Results" 
            message="Try searching for something else."
            style={styles.emptyContainer}
          />
        ) : (
          <UpcomingFeed 
            events={filteredEvents}
            isLoading={isLoadingEvents}
            hasMore={searchQuery ? false : hasMore} // Don't show footer loading during search
            error={errorEvents}
            onRefresh={() => fetchEvents()}
            onLoadMore={() => !searchQuery && loadMoreEvents()}
          />
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
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.backgroundCard,
  },
  searchInput: {
    height: 56,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.base,
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    marginTop: 100,
  },
});
