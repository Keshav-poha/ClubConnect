import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme';

interface LoadingIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export const LoadingIndicator = ({
  size = 'large',
  color = colors.accentCyan,
  style,
}: LoadingIndicatorProps) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
