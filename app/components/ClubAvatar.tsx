import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from './Image';
import { Text } from './Text';
import { colors, borderRadius } from '@/theme';

interface ClubAvatarProps {
  url?: string;
  name: string;
  size?: number;
  style?: ViewStyle;
}

export const ClubAvatar = ({ url, name, size = 40, style }: ClubAvatarProps) => {
  const getInitials = () => name.substring(0, 2).toUpperCase();

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {url ? (
        <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
      ) : (
        <Text variant="bodyMedium" color="textPrimary" style={styles.initials}>
          {getInitials()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.pill, // Rounded avatar
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    fontSize: 14,
  },
});
