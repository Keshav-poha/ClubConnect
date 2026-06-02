import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { Text } from './Text';
import { Button } from './Button';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while fetching data.',
  onRetry,
  style,
}: ErrorStateProps) => {
  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();

  return (
    <View style={[styles.container, globalStyles.clayCard, style]}>
      <AlertCircle color={colors.accentCyan} size={48} style={styles.icon} />
      <Text variant="h3" color="textPrimary">
        {title}
      </Text>
      <Text variant="body" color="textMuted" style={styles.message}>
        {message}
      </Text>
      {onRetry && (
        <Button label="Try Again" variant="outline" onPress={onRetry} style={styles.button} />
      )}
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
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 150,
  },
});
