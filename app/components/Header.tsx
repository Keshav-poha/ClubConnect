import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
}

export const Header = ({ title, subtitle, rightElement, style }: HeaderProps) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <Text variant="h1">{title}</Text>
        {subtitle && (
          <Text variant="body" color="textMuted" style={styles.subtitle}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
  },
  rightElement: {
    marginLeft: 16,
  },
});
