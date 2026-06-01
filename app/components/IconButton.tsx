import React from 'react';
import { Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useGlobalStyles } from '@/styles/global';
import { useTheme } from '@/hooks/useTheme';

interface IconButtonProps {
  Icon: LucideIcon;
  onPress?: () => void;
  onLongPress?: () => void;
  onPressOut?: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const IconButton = ({
  Icon,
  onPress,
  onLongPress,
  onPressOut,
  size = 24,
  color,
  style,
}: IconButtonProps) => {
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressOut={onPressOut}
      style={({ pressed }) => [
        styles.container,
        pressed ? globalStyles.clayButtonPressed : globalStyles.clayButton,
        { borderRadius: 9999 }, // Ensure perfect circle for icon buttons
        style,
      ]}
    >
      <Icon size={size} color={color || colors.textPrimary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
      } as any,
    }),
  },
});
