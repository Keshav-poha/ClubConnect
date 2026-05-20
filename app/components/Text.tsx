import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

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
  return (
    <RNText
      style={[
        typography[variant],
        { color: colors[color as keyof typeof colors] as string },
        style,
      ]}
      {...props}
    />
  );
};
