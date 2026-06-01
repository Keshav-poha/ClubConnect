import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

import { useTheme } from '@/hooks/useTheme';

interface TextProps extends RNTextProps {
  variant?: keyof typeof typography;
  color?: keyof typeof colors;
}

export const Text = ({
  variant = 'body',
  color = 'textPrimary',
  style,
  ...props
}: TextProps) => {
  const { colors: themeColors, typography: themeTypography } = useTheme();

  return (
    <RNText
      style={[
        themeTypography[variant],
        { color: themeColors[color as keyof typeof themeColors] as string },
        style,
      ]}
      {...props}
    />
  );
};
