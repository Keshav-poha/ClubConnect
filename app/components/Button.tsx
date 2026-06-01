import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { triggerLightHaptic } from '@/utils/haptics';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
}

export const Button = ({
  label,
  variant = 'primary',
  style,
  onPress,
  disabled,
  ...props
}: ButtonProps) => {
  const { colors, borderRadius, isDark } = useTheme();

  const getVariantStyles = (pressed: boolean): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed ? (isDark ? '#2563EB' : '#1D4ED8') : colors.accentCyan,
          borderColor: colors.border,
          borderWidth: 1.5,
          shadowColor: colors.accentCyan,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: pressed ? 0.35 : 0.5,
          shadowRadius: pressed ? 4 : 8,
          elevation: pressed ? 3 : 6,
        };
      case 'secondary':
        return {
          backgroundColor: pressed ? (isDark ? '#222535' : '#F1F5F9') : colors.backgroundCard,
          borderColor: colors.border,
          borderWidth: 1.5,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: pressed ? 0.15 : 0.25,
          shadowRadius: 6,
          elevation: pressed ? 2 : 4,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: pressed ? colors.textPrimary : colors.border,
          borderWidth: 1.5,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') return isDark ? 'textPrimary' : 'backgroundCard';
    return 'textPrimary';
  };

  const handlePress = () => {
    if (disabled) return;
    triggerLightHaptic();
    onPress?.({} as any);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          paddingVertical: 12,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: borderRadius.pill,
        },
        getVariantStyles(pressed),
        style,
      ]}
      {...props}
    >
      <Text variant="bodyMedium" color={getTextColor() as any}>
        {label}
      </Text>
    </Pressable>
  );
};
