import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Filter, FeTurbulence, Rect } from 'react-native-svg';

export const FilmGrain = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      <Svg height="100%" width="100%">
        <Filter id="noise">
          <FeTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </Filter>
        <Rect width="100%" height="100%" filter="url(#noise)" opacity="0.04" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // Ensure it's on top
    opacity: 0.5, // Adjust overall blend
  },
});
