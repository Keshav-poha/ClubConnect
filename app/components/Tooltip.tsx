import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';

interface TooltipProps {
  label: string;
  visible: boolean;
  position?: 'top' | 'bottom';
}

export const Tooltip = ({ label, visible, position = 'bottom' }: TooltipProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { colors, borderRadius, isDark } = useTheme();
  const globalStyles = useGlobalStyles();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible && fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) as any === 0) return null;

  return (
    <Animated.View style={[
      styles.container, 
      globalStyles.clayButton, 
      { 
        opacity: fadeAnim,
        backgroundColor: colors.accentCyan,
        borderRadius: borderRadius.md,
      },
      position === 'top' ? styles.top : styles.bottom
    ]}>
      <Text variant="caption" color={isDark ? "textPrimary" : "backgroundCard"}>{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 50,
    ...Platform.select({
      web: {
        transition: 'opacity 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
      } as any,
    }),
  },
  top: {
    top: -48,
    alignSelf: 'center',
  },
  bottom: {
    bottom: -48,
    alignSelf: 'center',
  },
});
