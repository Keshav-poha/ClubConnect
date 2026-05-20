import React, { useState } from 'react';
import { Image as RNImage, ImageProps as RNImageProps, View, StyleSheet } from 'react-native';
import { LoadingIndicator } from './LoadingIndicator';
import { colors } from '@/theme';

interface ImageProps extends RNImageProps {
  fallbackUrl?: string;
}

export const Image = ({ style, source, fallbackUrl, ...props }: ImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <RNImage
        source={hasError && fallbackUrl ? { uri: fallbackUrl } : source}
        style={StyleSheet.absoluteFillObject}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        {...props}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="small" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    overflow: 'hidden',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
  },
});
