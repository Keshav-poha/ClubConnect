import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { FilterPill } from './FilterPill';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterRowProps {
  options: FilterOption[];
  activeId?: string;
  onSelect: (id: string) => void;
  style?: ViewStyle;
}

export const FilterRow = React.memo(({ options, activeId, onSelect, style }: FilterRowProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      style={[styles.container, style]}
    >
      {options.map((option) => (
        <FilterPill
          key={option.id}
          id={option.id}
          label={option.label}
          isActive={activeId === option.id}
          onPress={onSelect}
        />
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
