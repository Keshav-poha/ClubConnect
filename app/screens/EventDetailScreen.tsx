import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Linking, Platform, Share, Animated } from 'react-native';
import { ArrowLeft, Bookmark as BookmarkIcon } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { Image } from '@/components/Image';
import { DateTag } from '@/components/DateTag';
import { LocationTag } from '@/components/LocationTag';
import { IconButton } from '@/components/IconButton';
import { LightLeak } from '@/components/LightLeak';
import { Button } from '@/components/Button';
import { Tooltip } from '@/components/Tooltip';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { useStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { useResponsive } from '@/hooks/useResponsive';
import { useGlobalStyles } from '@/styles/global';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetail'>;

export const EventDetailScreen = ({ route, navigation }: Props) => {
  const { event } = route.params;
  const insets = useSafeAreaInsets();
  const checkBookmarked = useStore((s) => s.isBookmarked);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const showToast = useStore((s) => s.showToast);
  const { colors, borderRadius } = useTheme();
  const { isWideScreen } = useResponsive();
  const globalStyles = useGlobalStyles();
  
  const isBookmarked = checkBookmarked(event.id);
  const [showTooltip, setShowTooltip] = useState(false);
  const attendeeCount = useMemo(() => Math.floor(Math.random() * 500) + 50, [event.id]);

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
    showToast({
      message: isBookmarked ? 'Event removed from bookmarks' : 'Event saved to bookmarks',
      type: isBookmarked ? 'info' : 'success',
    });
  };

  const handleOpenInstagram = () => {
    if (event.instagram_url) {
      Linking.openURL(event.instagram_url).catch(() => {
        showToast({
          message: 'Could not open Instagram link.',
          type: 'error',
        });
      });
    } else {
      const clubHandle = event.club?.handle || '';
      if (clubHandle) {
        Linking.openURL(`https://instagram.com/${clubHandle}`).catch(() => {
          showToast({
            message: 'Could not open Instagram link.',
            type: 'error',
          });
        });
      } else {
        showToast({
          message: 'Instagram link not available.',
          type: 'error',
        });
      }
    }
  };

  const handleAddToCalendar = () => {
    const calUrl = Platform.OS === 'ios' ? 'calshow://' : 'content://com.android.calendar/time/';
    Linking.openURL(calUrl).catch(() => {
      showToast({
        message: 'Calendar integration not supported on this device.',
        type: 'error',
      });
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${event.title} hosted by ${event.club?.name || 'them'} on ${event.date}!`,
        url: `https://huggingface.co/spaces/AquaWit/ClubConnect`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 16), backgroundColor: colors.backgroundPrimary }]}>
        <IconButton Icon={ArrowLeft} onPress={() => navigation.goBack()} />
        <View style={styles.headerRight}>
          <IconButton 
            Icon={BookmarkIcon} 
            color={isBookmarked ? colors.accentCyan : colors.textPrimary} 
            onPress={handleBookmark}
            onLongPress={() => setShowTooltip(true)}
            onPressOut={() => setShowTooltip(false)}
          />
          <Tooltip label="Save Event" visible={showTooltip} position="bottom" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.contentWrapper, isWideScreen && styles.contentWrapperWide]}>
          <View style={styles.lightLeakContainer}>
             <LightLeak color={colors.accentCyan} />
          </View>

          {event.image_url ? (
            <Animated.View style={[
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              isWideScreen ? styles.imageContainerWide : styles.imageContainer
            ]}>
              <View style={[globalStyles.clayCard, styles.imageClayContainer]}>
                <Image
                  source={{ uri: event.image_url }}
                  style={[
                    styles.imageHeader, 
                    { borderRadius: borderRadius.md },
                    isWideScreen && styles.imageHeaderWide
                  ]}
                  resizeMode="cover"
                />
              </View>
            </Animated.View>
          ) : null}

          <View style={[styles.content, isWideScreen && styles.contentWide]}>
            <Animated.View style={[
              globalStyles.clayCard, 
              styles.infoPanel, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
              <Text variant="h1" style={[styles.title, { color: colors.textPrimary }]}>{event.title || 'Untitled Event'}</Text>
              
              <View style={styles.attendeesContainer}>
                <AnimatedNumber value={attendeeCount} duration={1500} />
                <Text variant="bodyMedium" color="textMuted" style={styles.attendeesLabel}>Attending</Text>
              </View>

              <View style={styles.tagsContainer}>
                <DateTag date={event.date} />
                {event.location ? <LocationTag location={event.location} /> : null}
              </View>

              <View style={[styles.clubContainer, { borderLeftColor: colors.accentCyan }]}>
                <Text variant="caption" color="textMuted">Hosted by</Text>
                <Text variant="h3">{event.club?.name}</Text>
              </View>

              {event.attendance ? (
                <View style={[styles.attendanceContainer, { borderLeftColor: colors.accentCyan }]}>
                  <Text variant="caption" color="textMuted">Eligibility & Attendance</Text>
                  <Text variant="h3">{event.attendance}</Text>
                </View>
              ) : null}

              <Text variant="body" color="textMuted" style={styles.description}>
                {event.description}
              </Text>
            </Animated.View>

            <Animated.View style={[
              globalStyles.clayCard, 
              styles.actionPanel,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
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
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 100, // Clearance for tab bar
  },
  contentWrapper: {
    position: 'relative',
    flexDirection: 'column',
  },
  contentWrapperWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 32,
    gap: 32,
  },
  imageContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  imageContainerWide: {
    flex: 1,
    maxWidth: 500,
  },
  imageClayContainer: {
    padding: 16, // Puffy border around image
  },
  imageHeader: {
    width: '100%',
    height: 280,
  },
  imageHeaderWide: {
    height: 400,
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
    paddingHorizontal: 16,
  },
  contentWide: {
    flex: 1,
    paddingHorizontal: 0,
  },
  infoPanel: {
    padding: 24,
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
  },
  attendeesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 24,
  },
  attendeesLabel: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  clubContainer: {
    marginBottom: 32,
    borderLeftWidth: 3,
    paddingLeft: 16,
  },
  attendanceContainer: {
    marginBottom: 32,
    borderLeftWidth: 3,
    paddingLeft: 16,
  },
  description: {
    lineHeight: 24,
  },
  actionPanel: {
    padding: 24,
    gap: 16,
  },
  actionButton: {
    width: '100%',
  },
});
