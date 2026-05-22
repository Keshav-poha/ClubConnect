import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer, Text, Image, DateTag, LocationTag, IconButton, LightLeak } from '@/components';
import { colors, typography } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

export const EventDetailScreen = ({ route, navigation }: Props) => {
  const { event } = route.params;
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    // In the future this will sync with local storage or backend
    setIsBookmarked(!isBookmarked);
  };

  const handleOpenInstagram = () => {
    const clubHandle = event.club.name.toLowerCase().replace(/\s+/g, '');
    const url = `instagram://user?username=${clubHandle}`;
    Linking.openURL(url).catch(() => {
      // Fallback to web browser if app is not installed
      Linking.openURL(`https://instagram.com/${clubHandle}`);
    });
  };

  return (
    <ScreenContainer style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={event.image_url} style={styles.heroImage} />
          
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
            <Text variant="h1" style={styles.title}>{event.title}</Text>
            
            <View style={styles.metaRow}>
              <DateTag date={event.date} time={event.time} />
              <LocationTag location={event.location} />
            </View>

            <View style={styles.clubContainer}>
              <Text variant="small" color="textMuted">Hosted by</Text>
              <Text variant="h3">{event.club.name}</Text>
            </View>

            <Text variant="body" color="textSecondary" style={styles.description}>
              {event.description}
            </Text>

            <View style={styles.actionContainer}>
              <Button 
                label="View on Instagram" 
                variant="outline" 
                onPress={handleOpenInstagram} 
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
  },
});
