import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Share, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer, Text, Image, DateTag, LocationTag, IconButton, LightLeak, Button } from '@/components';
import { useStore } from '@/store';
import { colors, typography } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

export const EventDetailScreen = ({ route, navigation }: Props) => {
  const { event } = route.params;
  const { isBookmarked: checkBookmarked, toggleBookmark } = useStore();
  
  const isBookmarked = checkBookmarked(event.id);

  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1.1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, scaleAnim]);

  const handleBookmark = () => {
    toggleBookmark(event);
  };

  const handleOpenInstagram = () => {
    const clubHandle = event.club.name.toLowerCase().replace(/\s+/g, '');
    const url = `instagram://user?username=${clubHandle}`;
    Linking.openURL(url).catch(() => {
      // Fallback to web browser if app is not installed
      Linking.openURL(`https://instagram.com/${clubHandle}`);
    });
  };

  const handleAddToCalendar = () => {
    // Basic cross platform calendar deep link
    const calUrl = Platform.OS === 'ios' ? 'calshow://' : 'content://com.android.calendar/time/';
    Linking.openURL(calUrl).catch(() => {
      console.warn('Calendar not supported');
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${event.title} hosted by ${event.club.name} on ${event.date}!`,
        url: `https://clubconnect.app/event/${event.id}`, // Placeholder
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.heroImageWrapper, { transform: [{ scale: scaleAnim }] }]}>
            <Image source={event.image_url} style={styles.heroImage} />
          </Animated.View>
          
          <View style={styles.headerControls}>
            <View style={styles.iconButtonWrapper}>
              <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.iconButtonWrapper}>
              <IconButton 
                icon="bookmark" 
                color={isBookmarked ? colors.accent : colors.textPrimary} 
                onPress={handleBookmark} 
              />
            </View>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.lightLeakContainer}>
             <LightLeak color={colors.primary} intensity={0.15} />
          </View>

          <View style={styles.content}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Text variant="h1" style={styles.title}>{event.title}</Text>
            </Animated.View>
            
            <Animated.View style={[styles.metaRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <DateTag date={event.date} time={event.time} />
              <LocationTag location={event.location} />
            </Animated.View>

            <Animated.View style={[styles.clubContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <Text variant="small" color="textMuted">Hosted by</Text>
              <Text variant="h3">{event.club.name}</Text>
            </View>

            <Text variant="body" color="textSecondary" style={styles.description}>
              {event.description}
            </Text>

            <View style={styles.actionContainer}>
              <Button 
                label="Add to Calendar" 
                variant="primary" 
                onPress={handleAddToCalendar} 
                style={styles.actionButton}
              />
              <Button 
                label="View on Instagram" 
                variant="outline" 
                onPress={handleOpenInstagram} 
              />
              <Button 
                label="Share Event" 
                variant="outline" 
                onPress={handleShare} 
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0, // override ScreenContainer padding for full-bleed image
    paddingHorizontal: 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
    overflow: 'hidden', // to contain scale
  },
  heroImageWrapper: {
    width: '100%',
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerControls: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconButtonWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
  },
  contentWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  lightLeakContainer: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: '150%',
    height: '150%',
    opacity: 0.5,
  },
  content: {
    padding: 24,
  },
  title: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  clubContainer: {
    marginBottom: 32,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingLeft: 16,
  },
  description: {
    lineHeight: 24,
  },
  actionContainer: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});
