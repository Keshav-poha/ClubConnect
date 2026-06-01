import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface BrutalistSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const BrutalistSwitch = ({ value, onValueChange }: BrutalistSwitchProps) => {
  const switchAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const { colors, borderRadius, isDark } = useTheme();

  useEffect(() => {
    Animated.spring(switchAnim, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      friction: 6,
      tension: 100,
    }).start();
  }, [value, switchAnim]);

  const translateX = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 23]
  });

  const backgroundColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.backgroundCard, colors.accentCyan]
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} accessible role="switch" aria-checked={value}>
      <Animated.View style={[styles.track, { backgroundColor, borderColor: colors.border, borderRadius: borderRadius.pill }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }], borderRadius: borderRadius.pill }]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
  thumb: {
    width: 18,
    height: 18,
    backgroundColor: '#ffffff',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
});
