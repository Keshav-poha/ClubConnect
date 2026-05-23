import React from 'react';
import { StyleSheet, FlatList, StyleProp, ViewStyle, RefreshControlProps, View } from 'react-native';

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
  numColumns = 2,
  style,
  contentContainerStyle,
  onEndReached,
  refreshControl,
  ListHeaderComponent,
  ListFooterComponent,
}: MasonryGridProps<T>) {
  return (
    <FlatList
      data={data}
      numColumns={numColumns}
      keyExtractor={(_, index) => `grid-item-${index}`}
      renderItem={({ item, index }) => (
        <View style={styles.itemContainer}>
          {renderItem(item, index)}
        </View>
      )}
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      columnWrapperStyle={styles.columnWrapper}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent ? <>{ListHeaderComponent}</> : null}
      ListFooterComponent={ListFooterComponent ? <>{ListFooterComponent}</> : null}
      // Performance props per js-lists-flatlist-flashlist skill
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={8}
      windowSize={5}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
    paddingHorizontal: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    flex: 1,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});
