import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme';
import { globalStyles } from '@/styles/global';

interface FilterPillProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FilterPill = ({ label, isActive = false, onPress, style }: FilterPillProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        globalStyles.brutalistBorder,
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
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeContainer: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  inactiveContainer: {
    backgroundColor: colors.backgroundCard,
    borderColor: colors.border,
  },
  pressedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
