import React, { useMemo } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { EmptyState } from '@/components/EmptyState';
import { UpcomingFeed } from '@/components/UpcomingFeed';
import { useStore } from '@/store';
import { useGlobalStyles } from '@/styles/global';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

export const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const events = useStore((s) => s.events);
  const isLoadingEvents = useStore((s) => s.isLoadingEvents);
  const errorEvents = useStore((s) => s.errorEvents);
  const fetchEvents = useStore((s) => s.fetchEvents);
  const loadMoreEvents = useStore((s) => s.loadMoreEvents);
  const hasMore = useStore((s) => s.hasMore);
  
  const globalStyles = useGlobalStyles();
  const { colors, typography } = useTheme();
  const { isWideScreen } = useResponsive();

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
      event.club?.name.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>Discover</Text>
      
      <View style={[
        styles.searchContainer, 
        globalStyles.clayCard, 
        { backgroundColor: colors.backgroundCard, borderColor: colors.border },
        isWideScreen && styles.searchContainerWide
      ]}>
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary, fontFamily: typography.body.fontFamily, fontSize: typography.body.fontSize }]}
          placeholder="Search clubs, events..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <X color={colors.textMuted} size={20} />
          </Pressable>
        )}
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
            onLoadMore={() => {
              if (!searchQuery) {
                loadMoreEvents();
              }
            }}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainerWide: {
    width: 400, // Constrain width on wide screens
  },
  searchInput: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
  },
  clearButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    marginTop: 100,
  },
});
