import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, borderRadius } from '@/theme';

interface BadgeProps {
  label: string;
  variant?: 'live' | 'neutral' | 'accent';
  style?: ViewStyle;
}

export const Badge = ({ label, variant = 'neutral', style }: BadgeProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'live':
        return { backgroundColor: colors.accentGreen, borderColor: colors.accentGreen };
      case 'accent':
        return { backgroundColor: colors.accentCyan, borderColor: colors.accentCyan };
      case 'neutral':
        return { backgroundColor: colors.backgroundCard, borderColor: colors.border };
    }
  };

  const getTextColor = () => {
    return variant === 'neutral' ? 'textPrimary' : 'backgroundPrimary';
  };

  return (
    <View style={[styles.container, getVariantStyles(), style]}>
      {variant === 'live' && <View style={styles.dot} />}
      <Text variant="mono" color={getTextColor() as any} style={styles.text}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: borderRadius.sm, // Rounded style
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.backgroundPrimary,
    marginRight: 6,
  },
  text: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
