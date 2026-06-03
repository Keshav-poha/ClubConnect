import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';
import { useStore } from '@/store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminDashboardScreen = () => {
  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();
  const navigation = useNavigation<NavigationProp>();
  
  const forms = useStore((s) => s.adminForms);
  const fetchForms = useStore((s) => s.fetchAdminForms);
  const logout = useStore((s) => s.adminLogout);

  useEffect(() => {
    fetchForms();
  }, []);

  const handleLogout = () => {
    logout();
    navigation.replace('AdminLogin');
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={[globalStyles.clayCard, styles.card]}
      onPress={() => navigation.navigate('AdminFormResponses', { formId: item.id, formTitle: item.title })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'open' ? colors.accentCyan : colors.textMuted }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.responsesText}>
        {item.fields?.length || 0} fields
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <Header 
        title="Dashboard" 
        rightElement={
          <Pressable onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={{ color: colors.textMuted }}>Logout</Text>
          </Pressable>
        }
      />
      <FlatList
        data={forms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ color: colors.textMuted }}>You haven't created any forms yet.</Text>
          </View>
        }
      />
      <View style={styles.footer}>
        <Button 
          label="Create New Form" 
          onPress={() => navigation.navigate('AdminCreateForm')} 
          variant="primary" 
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    color: '#080808',
    textTransform: 'uppercase',
  },
  responsesText: {
    fontSize: 14,
    color: '#888',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  logoutBtn: {
    padding: 8,
  }
});
