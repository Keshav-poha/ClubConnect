import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from './Text';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

export const AnimatedNumber = ({ value, duration = 1000 }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animValue.addListener((v) => {
      setDisplayValue(Math.round(v.value));
    });

    Animated.timing(animValue, {
      toValue: value,
      duration,
      useNativeDriver: false, // Cannot use native driver for text value updates
    }).start();

    return () => {
      animValue.removeAllListeners();
    };
  }, [value, duration, animValue]);

  return (
    <View style={styles.container}>
      <Text variant="h1">{displayValue}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
