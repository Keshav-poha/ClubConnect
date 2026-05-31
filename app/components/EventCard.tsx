import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Event } from '@/types';
import { Text } from './Text';
import { Image } from './Image';
import { DateTag } from './DateTag';
import { LocationTag } from './LocationTag';
import { ClubAvatar } from './ClubAvatar';
import { Badge } from './Badge';
import { globalStyles } from '@/styles/global';
import { triggerLightHaptic } from '@/utils/haptics';
import { colors } from '@/theme';

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
        {event.image_url ? (
          <Image
            source={{ uri: event.image_url }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : null}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            {event.club && (
              <View style={styles.clubInfo}>
                <ClubAvatar name={event.club.name} url={event.club.avatar_url} size={24} style={styles.clubAvatar} />
                <Text variant="bodyMedium" color="textPrimary" style={styles.clubName}>
                  {event.club.name}
                </Text>
              </View>
            )}
            {event.is_featured && (
              <Badge label="Featured" variant="accent" />
            )}
          </View>
          
          <Text variant="h3" style={styles.title} numberOfLines={2}>
            {event.title || 'Untitled Event'}
          </Text>
          
          <Text variant="body" color="textMuted" style={styles.description} numberOfLines={3}>
            {event.description}
          </Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.tagsContainer}>
              <DateTag date={event.date} />
              {event.location ? <LocationTag location={event.location} /> : null}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clubAvatar: {
    marginRight: 0,
  },
  clubName: {
    fontSize: 14,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
