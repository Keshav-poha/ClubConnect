import React, { useState } from 'react';
import { Image as RNImage, ImageProps as RNImageProps, View, StyleSheet } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';
import { LoadingIndicator } from './LoadingIndicator';
import { colors } from '@/theme';

interface ImageProps extends RNImageProps {
  fallbackUrl?: string;
}

export const Image = ({ style, source, fallbackUrl, ...props }: ImageProps) => {
  const isSourceValid = source && typeof source === 'object' && 'uri' in source && source.uri;
  const uri = isSourceValid ? source.uri : null;

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset loading and error states only when the actual URI changes
  React.useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [uri]);

  let imageSource = source;
  // Removed unauthenticated weserv.nl proxy for security and privacy

  const handleLoadEnd = () => setIsLoading(false);
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <View style={[styles.container, style]}>
      {(!isSourceValid || hasError) ? (
        <View style={styles.placeholderContainer}>
          <ImageIcon color={colors.textMuted} size={32} />
        </View>
      ) : (
        <RNImage
          source={imageSource}
          style={StyleSheet.absoluteFillObject}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          {...props}
        />
      )}
      {isLoading && isSourceValid && !hasError && (
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
    position: 'relative',
  },
  placeholderContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#161616',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
  },
});
