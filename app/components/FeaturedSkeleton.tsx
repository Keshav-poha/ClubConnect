import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useGlobalStyles } from '@/styles/global';
import { useTheme } from '@/hooks/useTheme';

export const FeaturedSkeleton = () => {
  const animatedValue = React.useRef(new Animated.Value(0.3)).current;
  const globalStyles = useGlobalStyles();
  const { colors } = useTheme();

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
        globalStyles.clayCard,
        { backgroundColor: colors.border, opacity: animatedValue },
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
  },
});
