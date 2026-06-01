import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, Animated, Platform } from 'react-native';
import { Event } from '@/types';
import { Text } from './Text';
import { Image } from './Image';
import { DateTag } from './DateTag';
import { LocationTag } from './LocationTag';
import { ClubAvatar } from './ClubAvatar';
import { Badge } from './Badge';
import { useGlobalStyles } from '@/styles/global';
import { triggerLightHaptic } from '@/utils/haptics';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
  style?: ViewStyle;
}

export const EventCard = ({ event, onPress, style }: EventCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const globalStyles = useGlobalStyles();
  const { colors, borderRadius } = useTheme();
  const { isWideScreen } = useResponsive();

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
    <Animated.View style={[{ opacity: fadeAnim, flex: 1 }, isWideScreen && styles.flexContainer]}>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          pressed ? globalStyles.clayCardPressed : globalStyles.clayCard,
          style,
        ]}
      >
        <View style={styles.content}>
          {event.image_url ? (
            <Image
              source={{ uri: event.image_url }}
              style={[styles.cardImage, { borderRadius: borderRadius.sm }]}
              resizeMode="cover"
            />
          ) : null}
          
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
          
          <Text variant="body" color="textMuted" style={styles.description} numberOfLines={isWideScreen ? 4 : 3}>
            {event.description}
          </Text>
          
          <View style={styles.metaSpacer} />

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
  flexContainer: {
    height: '100%',
  },
  container: {
    marginBottom: 24,
    flex: 1,
    ...Platform.select({
      web: {
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      } as any,
    }),
  },
  content: {
    padding: 16,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cardImage: {
    width: '100%',
    height: 180,
    marginBottom: 16,
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
    flex: 1,
  },
  clubAvatar: {
    marginRight: 0,
  },
  clubName: {
    fontSize: 14,
    flexShrink: 1,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    lineHeight: 22,
  },
  metaSpacer: {
    flex: 1,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
