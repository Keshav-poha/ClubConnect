import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Event } from '@/types';
import { Image } from './Image';
import { Text } from './Text';
import { DateTag } from './DateTag';
import { LocationTag } from './LocationTag';
import { ClubAvatar } from './ClubAvatar';
import { globalStyles } from '@/styles/global';
import { triggerLightHaptic } from '@/utils/haptics';

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
  style?: ViewStyle;
}

export const EventCard = ({ event, onPress, style }: EventCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePress = () => {
    triggerLightHaptic();
    onPress?.(event);
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        globalStyles.cardSurface,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Image source={{ uri: event.image_url }} style={styles.image} />
      <View style={styles.content}>
        <Text variant="h3" style={styles.title} numberOfLines={2}>{event.title}</Text>
        <Text variant="body" color="textMuted" style={styles.description} numberOfLines={2}>{event.description}</Text>
        <View style={styles.metaContainer}>
          <DateTag date={event.date} />
          <LocationTag location={event.location} />
          {event.club && (
            <ClubAvatar name={event.club.name} url={event.club.avatar_url} />
          )}
        </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    marginBottom: 6,
  },
  description: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
});
