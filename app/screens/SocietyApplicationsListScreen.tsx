import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '@/store';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';
import { Clock, ChevronRight } from 'lucide-react-native';

type RouteProps = RouteProp<RootStackParamList, 'SocietyApplicationsList'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SocietyApplicationsListScreen = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { societyId, societyName } = route.params;
  const { colors } = useTheme();
  const { typography } = require('@/theme');
  const globalStyles = useGlobalStyles();

  const applications = useStore((s) => s.applications);
  const isLoading = useStore((s) => s.isLoadingApplications);
  const fetchApps = useStore((s) => s.fetchApplicationsBySociety);

  useEffect(() => {
    fetchApps(societyId);
  }, [societyId]);

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={[globalStyles.clayCard, styles.appCard]}
      onPress={() => navigation.navigate('ApplicationForm', { applicationId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text
          style={[
            styles.appTitle,
            { color: colors.textPrimary, fontFamily: typography.h2.fontFamily },
          ]}
        >
          {item.title}
        </Text>
        {item.status === 'open' && (
          <View style={[styles.statusBadge, { backgroundColor: colors.accentGreen + '20' }]}>
            <Text
              style={[
                styles.statusText,
                { color: colors.accentGreen, fontFamily: typography.bodyMedium.fontFamily },
              ]}
            >
              OPEN
            </Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.appDescription,
          { color: colors.textMuted, fontFamily: typography.body.fontFamily },
        ]}
      >
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.deadlineRow}>
          <Clock size={14} color={colors.textMuted} />
          <Text
            style={[
              styles.deadlineText,
              { color: colors.textMuted, fontFamily: typography.bodyMedium.fontFamily },
            ]}
          >
            {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'No deadline'}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.accentCyan} />
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <Header title={societyName} showBack />
      <View style={styles.content}>
        <Text
          style={[
            styles.subtitle,
            { color: colors.textPrimary, fontFamily: typography.h2.fontFamily },
          ]}
        >
          Active Applications
        </Text>

        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <FlatList
            data={applications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <EmptyState
                title="No Open Applications"
                message="This society currently has no active forms."
              />
            }
          />
        )}
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
    fontSize: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: 40,
    gap: 16,
  },
  appCard: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 18,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  appDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deadlineText: {
    fontSize: 12,
  },
});
