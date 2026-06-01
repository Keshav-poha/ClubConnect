import React from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
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
      snapToInterval={isWideScreen ? undefined : 368} // 320 width + 48 margins
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
    paddingRight: 32, // Extra padding at end
    paddingVertical: 24, // Allow shadows to breathe without clipping
  },
  filmStripItem: {
    width: 320,
    marginLeft: 24, // increased from 16 for shadow breathing room
    opacity: 0.6,
    transform: [{ scale: 0.95 }],
    ...Platform.select({
      web: {
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      } as any,
    }),
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
