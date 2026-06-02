import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '@/store';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Header } from '@/components/Header';
import { ClubAvatar } from '@/components/ClubAvatar';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ApplicationsDirectoryScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const { typography } = require('@/theme');
  const globalStyles = useGlobalStyles();
  
  const clubs = useStore((s) => s.clubs);
  const fetchClubs = useStore((s) => s.fetchClubs);
  
  useEffect(() => {
    if (clubs.length === 0) {
      fetchClubs();
    }
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={[globalStyles.clayButton, styles.clubCard]}
      onPress={() => navigation.navigate('SocietyApplicationsList', { 
        societyId: item.id, 
        societyName: item.name 
      })}
    >
      <ClubAvatar url={item.avatar_url} name={item.name} size={60} />
      <View style={styles.clubInfo}>
        <Text style={[styles.clubName, { color: colors.textPrimary, fontFamily: typography.h3.fontFamily }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.clubHandle, { color: colors.textMuted, fontFamily: typography.body.fontFamily }]} numberOfLines={1}>
          @{item.handle}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <Header title="Applications" />
      <View style={styles.content}>
        <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: typography.body.fontFamily }]}>
          Select a society to view their open applications.
        </Text>
        <FlatList
          data={clubs}
          keyExtractor={(item) => String(item.id || item.handle)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ListEmptyComponent={
            <EmptyState 
              title="No Societies Found" 
              message="Check back later for open applications." 
            />
          }
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 100, // Clearance for tab bar
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clubCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  clubName: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  clubHandle: {
    fontSize: 12,
  },
});
