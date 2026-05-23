import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, StyleProp, ViewStyle, RefreshControl } from 'react-native';

interface MasonryGridProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  numColumns?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  onEndReached?: () => void;
  refreshControl?: React.ReactElement<typeof RefreshControl>;
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
  const columns = useMemo(() => {
    const cols: T[][] = Array.from({ length: numColumns }, () => []);
    data.forEach((item, index) => {
      cols[index % numColumns].push(item);
    });
    return cols;
  }, [data, numColumns]);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    if (isCloseToBottom && onEndReached) {
      onEndReached();
    }
  };

  return (
    <ScrollView
      style={[styles.container, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {ListHeaderComponent}
      <View style={styles.gridContainer}>
        {columns.map((col, colIndex) => (
          <View key={`col-${colIndex}`} style={styles.column}>
            {col.map((item, itemIndex) => {
              // Calculate global index if needed
              const globalIndex = itemIndex * numColumns + colIndex;
              return (
                <View key={`item-${globalIndex}`} style={styles.itemContainer}>
                  {renderItem(item, globalIndex)}
                </View>
              );
            })}
          </View>
        ))}
      </View>
      {ListFooterComponent}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 8,
  },
  column: {
    flex: 1,
    paddingHorizontal: 8,
  },
  itemContainer: {
    marginBottom: 16,
  },
});
