import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { triggerLightHaptic } from '@/utils/haptics';
import { useGlobalStyles } from '@/styles/global';

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
  const globalStyles = useGlobalStyles();

  const getVariantStyles = (pressed: boolean): ViewStyle => {
    const baseClayStyle = pressed ? globalStyles.clayButtonPressed : globalStyles.clayButton;
    
    switch (variant) {
      case 'primary':
        return {
          ...baseClayStyle,
          backgroundColor: colors.accentCyan,
          // Tone down inner shadow highlights for colored buttons
          borderTopColor: 'rgba(255,255,255,0.4)',
          borderLeftColor: 'rgba(255,255,255,0.4)',
          shadowColor: colors.accentCyan,
        } as ViewStyle;
      case 'secondary':
        return {
          ...baseClayStyle,
        } as ViewStyle;
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: pressed ? colors.textPrimary : colors.border,
          borderWidth: 2,
          borderRadius: borderRadius.sm,
          ...Platform.select({
            web: {
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            } as any,
          }),
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') return 'backgroundCard'; // White text on cyan
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
          paddingVertical: 14,
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center',
          ...Platform.select({
            web: {
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            } as any,
          }),
        },
        getVariantStyles(pressed),
        style,
        disabled && { opacity: 0.5 },
      ]}
      {...props}
    >
      <Text variant="bodyMedium" color={getTextColor() as any}>
        {label}
      </Text>
    </Pressable>
  );
};
