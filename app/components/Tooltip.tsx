import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from './Text';
import { colors } from '@/theme';
import { globalStyles } from '@/styles/global';

interface TooltipProps {
  label: string;
  visible: boolean;
  position?: 'top' | 'bottom';
}

export const Tooltip = ({ label, visible, position = 'bottom' }: TooltipProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      globalStyles.brutalistBorder, 
      { opacity: fadeAnim },
      position === 'top' ? styles.top : styles.bottom
    ]}>
      <Text variant="caption" color="backgroundPrimary">{label}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: colors.accentCyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 50,
  },
  top: {
    top: -40,
    alignSelf: 'center',
  },
  bottom: {
    bottom: -40,
    alignSelf: 'center',
  },
});
