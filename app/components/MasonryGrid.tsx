import React from 'react';
import {
  StyleSheet,
  FlatList,
  StyleProp,
  ViewStyle,
  RefreshControlProps,
  View,
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface MasonryGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  numColumns?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onEndReached?: () => void;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  ListHeaderComponent?: React.ReactNode;
  ListFooterComponent?: React.ReactNode;
}

export function MasonryGrid<T>({
  data,
  renderItem,
  numColumns: propNumColumns,
  style,
  contentContainerStyle,
  onEndReached,
  refreshControl,
  ListHeaderComponent,
  ListFooterComponent,
}: MasonryGridProps<T>) {
  const { numColumns } = useResponsive();
  const cols = propNumColumns || numColumns;

  return (
    <FlatList
      key={`grid-${cols}`}
      data={data}
      numColumns={cols}
      keyExtractor={(item: any, index) => (item.id ? String(item.id) : `grid-item-${index}`)}
      renderItem={({ item, index }) => (
        <View style={styles.itemContainer}>{renderItem(item, index)}</View>
      )}
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      columnWrapperStyle={cols > 1 ? styles.columnWrapper : undefined}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent ? <>{ListHeaderComponent}</> : null}
      ListFooterComponent={ListFooterComponent ? <>{ListFooterComponent}</> : null}
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      updateCellsBatchingPeriod={150}
      initialNumToRender={4}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Clearance for tab bar
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    flex: 1,
    paddingHorizontal: 16, // Increased to allow puffy shadows to breathe
    marginBottom: 16, // EventCard handles its own bottom margin, but we add some here too
  },
});
