import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '@/theme';
import { globalStyles } from '@/styles/global';

interface IconButtonProps {
  Icon: LucideIcon;
  onPress?: () => void;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const IconButton = ({
  Icon,
  onPress,
  size = 24,
  color = colors.textPrimary,
  style,
}: IconButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        globalStyles.brutalistBorder,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Icon size={size} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
