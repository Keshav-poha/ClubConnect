import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, borderRadius } from '@/theme';
import { globalStyles } from '@/styles/global';

interface FilterPillProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FilterPill = React.memo(({ label, isActive = false, onPress, style }: FilterPillProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        isActive ? styles.activeContainer : styles.inactiveContainer,
        pressed && !isActive && styles.pressedContainer,
        style,
      ]}
    >
      <Text
        variant="bodyMedium"
        color={isActive ? 'backgroundPrimary' : 'textPrimary'}
      >
        {label}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: borderRadius.pill,
  },
  activeContainer: {
    backgroundColor: colors.accentCyan,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    shadowColor: colors.accentCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  inactiveContainer: {
    backgroundColor: colors.backgroundCard,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  pressedContainer: {
    backgroundColor: '#222535',
  },
});
