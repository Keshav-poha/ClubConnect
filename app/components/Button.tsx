import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, borderRadius } from '@/theme';
import { globalStyles } from '@/styles/global';
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
  const getVariantStyles = (pressed: boolean): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed ? '#00D8F6' : colors.accentCyan,
          borderColor: 'rgba(255, 255, 255, 0.25)',
          borderWidth: 1.5,
          shadowColor: colors.accentCyan,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: pressed ? 0.35 : 0.5,
          shadowRadius: pressed ? 4 : 8,
          elevation: pressed ? 3 : 6,
        };
      case 'secondary':
        return {
          backgroundColor: pressed ? '#222535' : colors.backgroundCard,
          borderColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: 1.5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: pressed ? 0.15 : 0.25,
          shadowRadius: 6,
          elevation: pressed ? 2 : 4,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: pressed ? colors.textPrimary : 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1.5,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') return 'backgroundPrimary';
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
        styles.base,
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

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.pill,
  },
});
