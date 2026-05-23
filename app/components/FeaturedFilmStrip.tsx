import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Event } from '@/types';
import { EventCard } from '@/components/EventCard';
import { Badge } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { FeaturedSkeleton } from './FeaturedSkeleton';

interface FeaturedFilmStripProps {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

export const FeaturedFilmStrip = ({ events, isLoading, error }: FeaturedFilmStripProps) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = React.useCallback((event: Event) => {
    navigation.navigate('EventDetail', { event });
  }, [navigation]);

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 50 }).current;
  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  if (isLoading && !events.length) {
    return (
      <View style={styles.skeletonContainer}>
        <FeaturedSkeleton />
      </View>
    );
  }

  if (!isLoading && !error && events.length === 0) {
    return (
      <EmptyState
        title="No Featured Events"
        message="Check back later for curated events."
        style={styles.center}
      />
    );
  }

  const renderFilmStripItem = React.useCallback(({ item, index }: { item: Event; index: number }) => (
    <View style={[styles.filmStripItem, index === activeIndex && styles.activeFilmStripItem]}>
      <View style={styles.featuredBadge}>
        <Badge label="Featured" variant="accent" />
      </View>
      <EventCard event={item} onPress={handlePress} />
    </View>
  ), [activeIndex, handlePress]);

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={336}
      decelerationRate="fast"
      snapToAlignment="start"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      renderItem={renderFilmStripItem}
    />
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    flexDirection: 'row',
  },
  center: {
    marginTop: 40,
    marginBottom: 40,
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
