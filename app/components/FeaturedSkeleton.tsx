import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { globalStyles } from '@/styles/global';
import { colors } from '@/theme';

export const FeaturedSkeleton = () => {
  const animatedValue = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        styles.container,
        globalStyles.cardSurface,
        { opacity: animatedValue },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: 320,
    aspectRatio: 16 / 9,
    marginRight: 16,
    marginLeft: 16,
    backgroundColor: colors.border,
  },
});
