import React from 'react';
import { Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';

interface FilterPillProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FilterPill = React.memo(({ label, isActive = false, onPress, style }: FilterPillProps) => {
  const { colors, isDark } = useTheme();
  const globalStyles = useGlobalStyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          paddingHorizontal: 16,
          paddingVertical: 10,
          marginRight: 8,
          borderRadius: 9999, // Pill shape
          ...Platform.select({
            web: {
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            } as any,
          }),
        },
        isActive || pressed 
          ? {
              ...globalStyles.clayButtonPressed,
              backgroundColor: isActive ? colors.accentCyan : colors.backgroundCard,
              borderTopColor: isActive ? 'rgba(0,0,0,0.1)' : colors.clayShadow,
              borderLeftColor: isActive ? 'rgba(0,0,0,0.1)' : colors.clayShadow,
              borderBottomColor: isActive ? 'rgba(255,255,255,0.2)' : colors.clayHighlight,
              borderRightColor: isActive ? 'rgba(255,255,255,0.2)' : colors.clayHighlight,
            }
          : globalStyles.clayButton,
        style,
      ]}
    >
      <Text
        variant="bodyMedium"
        color={isActive ? 'backgroundCard' : 'textPrimary'}
      >
        {label}
      </Text>
    </Pressable>
  );
});
