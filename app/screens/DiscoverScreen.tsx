import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { ScreenContainer, Text, EmptyState } from '@/components';
import { colors, typography } from '@/theme';
import { globalStyles } from '@/styles/global';

export const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <ScreenContainer style={styles.container}>
      <Text variant="h1" style={styles.headerTitle}>Discover</Text>
      
      <View style={[styles.searchContainer, globalStyles.brutalistBorder]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search clubs, events..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.content}>
        <EmptyState 
          title="Search" 
          message="Type to find upcoming campus events and clubs."
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  headerTitle: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: colors.backgroundCard,
  },
  searchInput: {
    height: 56,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontFamily: typography.fonts.mono,
    fontSize: typography.sizes.base,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
