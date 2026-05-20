import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Event } from '@/types';
import { Image } from './Image';
import { Text } from './Text';
import { DateTag } from './DateTag';
import { LocationTag } from './LocationTag';
import { ClubAvatar } from './ClubAvatar';
import { globalStyles } from '@/styles/global';

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
  style?: ViewStyle;
}

export const EventCard = ({ event, onPress, style }: EventCardProps) => {
  return (
    <Pressable
      onPress={() => onPress?.(event)}
      style={({ pressed }) => [
        styles.container,
        globalStyles.cardSurface,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Content will be styled in the next commit */}
      <Image source={{ uri: event.image_url }} style={styles.image} />
      <View style={styles.content}>
        <Text variant="h2" numberOfLines={2}>{event.title}</Text>
        <Text variant="body" color="textMuted" numberOfLines={2}>{event.description}</Text>
        <View style={styles.metaContainer}>
          <DateTag date={event.date} />
          <LocationTag location={event.location} />
          {event.club && (
            <ClubAvatar name={event.club.name} url={event.club.avatar_url} />
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    borderWidth: 1,
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
  },
  metaContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
