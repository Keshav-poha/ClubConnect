import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ghost } from 'lucide-react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';

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
  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();

  return (
    <View style={[styles.container, globalStyles.clayCard, style]}>
      <Ghost color={colors.textMuted} size={48} style={styles.icon} />
      <Text variant="h3" color="textPrimary">
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
    margin: 16,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
  },
});
