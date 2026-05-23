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
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  // Stable listener — added once, cleaned up once
  useEffect(() => {
    const id = animValue.addListener((v) => {
      setDisplayValue(Math.round(v.value));
    });
    return () => {
      animValue.removeListener(id);
    };
  }, [animValue]);

  // Animation effect — stops previous before starting new
  useEffect(() => {
    if (animRef.current) {
      animRef.current.stop();
    }
    animRef.current = Animated.timing(animValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    });
    animRef.current.start();

    return () => {
      animRef.current?.stop();
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
