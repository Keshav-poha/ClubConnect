import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { Event } from '@/types';
import { EventCard } from '@/components/EventCard';
import { EmptyState } from '@/components/EmptyState';
import { FeaturedSkeleton } from './FeaturedSkeleton';
import { useResponsive } from '@/hooks/useResponsive';

interface FeaturedFilmStripProps {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

export const FeaturedFilmStrip = ({ events, isLoading, error }: FeaturedFilmStripProps) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isWideScreen } = useResponsive();

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
    <View style={[
      styles.filmStripItem, 
      !isWideScreen && index === activeIndex && styles.activeFilmStripItem,
      isWideScreen && styles.wideFilmStripItem
    ]}>
      <EventCard event={item} onPress={handlePress} />
    </View>
  ), [activeIndex, handlePress, isWideScreen]);

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={isWideScreen} // Show scrollbar on desktop
      snapToInterval={isWideScreen ? undefined : 336}
      decelerationRate={isWideScreen ? "normal" : "fast"}
      snapToAlignment="start"
      onViewableItemsChanged={!isWideScreen ? onViewableItemsChanged : undefined}
      viewabilityConfig={!isWideScreen ? viewabilityConfig : undefined}
      renderItem={renderFilmStripItem}
      contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingRight: 16, // Extra padding at end
  },
  filmStripItem: {
    width: 320,
    marginLeft: 16,
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
  },
  activeFilmStripItem: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  wideFilmStripItem: {
    width: 350,
    opacity: 1, // On wide screens, don't dim inactive items
    transform: [{ scale: 1 }], // Don't scale down
  }
});
