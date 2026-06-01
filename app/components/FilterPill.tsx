import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

interface FilterPillProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FilterPill = React.memo(({ label, isActive = false, onPress, style }: FilterPillProps) => {
  const { colors, borderRadius, isDark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: 16,
          paddingVertical: 8,
          marginRight: 8,
          borderRadius: borderRadius.pill,
          borderWidth: 1.5,
        },
        isActive 
          ? {
              backgroundColor: colors.accentCyan,
              borderColor: colors.border,
              shadowColor: colors.accentCyan,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.35,
              shadowRadius: 8,
              elevation: 4,
            }
          : {
              backgroundColor: colors.backgroundCard,
              borderColor: colors.border,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 2,
            },
        pressed && !isActive && { backgroundColor: isDark ? '#222535' : '#F1F5F9' },
        style,
      ]}
    >
      <Text
        variant="bodyMedium"
        color={isActive ? (isDark ? 'textPrimary' : 'backgroundCard') : 'textPrimary'}
      >
        {label}
      </Text>
    </Pressable>
  );
});
