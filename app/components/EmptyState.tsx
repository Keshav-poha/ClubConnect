import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ghost } from 'lucide-react-native';
import { Text } from './Text';
import { colors } from '@/theme';

interface EmptyStateProps {
  title?: string;
  message?: string;
  style?: ViewStyle;
}

export const EmptyState = ({
  title = 'No Data',
  message = 'Nothing to show here right now.',
  style,
}: EmptyStateProps) => {
  return (
    <View style={[styles.container, style]}>
      <Ghost color={colors.border} size={48} style={styles.icon} />
      <Text variant="h3" color="textMuted">
        {title}
      </Text>
      <Text variant="body" color="textMuted" style={styles.message}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
  },
});
