import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { colors } from '@/theme';

interface BrutalistSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const BrutalistSwitch = ({ value, onValueChange }: BrutalistSwitchProps) => {
  const switchAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

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
    outputRange: [2, 22]
  });

  const backgroundColor = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.backgroundCard, colors.accentCyan]
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} accessible role="switch" aria-checked={value}>
      <Animated.View style={[styles.track, { backgroundColor }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    borderRadius: 0, // Brutalist stark edges
  },
  thumb: {
    width: 16,
    height: 16,
    backgroundColor: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'absolute',
    borderRadius: 0,
  },
});
