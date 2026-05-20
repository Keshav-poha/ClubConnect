import React from 'react';
import { Pressable, PressableProps, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme';
import { globalStyles } from '@/styles/global';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
}

export const Button = ({
  label,
  variant = 'primary',
  style,
  ...props
}: ButtonProps) => {
  const getVariantStyles = (pressed: boolean): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed ? colors.accentCyan : colors.textPrimary,
          borderColor: pressed ? colors.accentCyan : colors.textPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: pressed ? '#222' : colors.backgroundCard,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: pressed ? colors.textPrimary : colors.border,
        };
    }
  };

  const getTextColor = () => {
    if (variant === 'primary') return 'backgroundPrimary';
    return 'textPrimary';
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        globalStyles.brutalistBorder,
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
  },
});
