import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme';

interface EndOfListProps {
  style?: ViewStyle;
}

export const EndOfList = ({ style }: EndOfListProps) => {
  return (
    <View style={[styles.container, style]}>
      <Text variant="mono" color="textMuted" style={styles.text}>
        /// END OF FEED ///
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 16,
    borderStyle: 'dashed',
  },
  text: {
    letterSpacing: 2,
    fontSize: 12,
  },
});
