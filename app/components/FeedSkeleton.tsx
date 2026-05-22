import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { globalStyles } from '@/styles/global';
import { colors } from '@/theme';

export const FeedSkeleton = () => {
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
    <View style={styles.container}>
      {[1, 2, 3].map((key) => (
        <Animated.View
          key={key}
          style={[
            styles.card,
            globalStyles.cardSurface,
            { opacity: animatedValue },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
});
