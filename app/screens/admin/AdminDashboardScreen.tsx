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
import { Trash2 } from 'lucide-react-native';
import { Alert, Platform, Modal } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminDashboardScreen = () => {
  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();
  const navigation = useNavigation<NavigationProp>();
  
  const forms = useStore((s) => s.adminForms);
  const fetchForms = useStore((s) => s.fetchAdminForms);
  const deleteForm = useStore((s) => s.adminDeleteForm);
  const logout = useStore((s) => s.adminLogout);

  useEffect(() => {
    fetchForms();
  }, []);

  const handleLogout = () => {
    logout();
    navigation.replace('AdminLogin');
  };

  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [formToDelete, setFormToDelete] = React.useState<{id: string, title: string} | null>(null);

  const handleDelete = (id: string, title: string) => {
    if (Platform.OS === 'web') {
      setFormToDelete({ id, title });
      setDeleteModalVisible(true);
    } else {
      Alert.alert('Delete Form', `Are you sure you want to delete "${title}"?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteForm(id) },
      ]);
    }
  };

  const confirmDelete = () => {
    if (formToDelete) {
      deleteForm(formToDelete.id);
    }
    setDeleteModalVisible(false);
    setFormToDelete(null);
  };

  const renderItem = ({ item }: { item: any }) => (
    <Pressable
      style={[globalStyles.clayCard, styles.card]}
      onPress={() => navigation.navigate('AdminFormResponses', { formId: item.id, formTitle: item.title })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: item.status === 'open' ? colors.accentCyan : colors.textMuted }]}>
          <Text style={[styles.badgeText, { color: colors.backgroundCard }]}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={[styles.responsesText, { color: colors.textMuted }]}>
          {item.fields?.length || 0} fields
        </Text>
        <Pressable onPress={() => handleDelete(item.id, item.title)} hitSlop={10}>
          <Trash2 size={20} color="#FF4B4B" />
        </Pressable>
      </View>
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

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[globalStyles.clayCard, styles.modalContent]}>
            <Text style={styles.modalTitle}>Delete Form</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 24, textAlign: 'center' }}>
              Are you sure you want to delete "{formToDelete?.title}"?
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Button label="Cancel" variant="secondary" onPress={() => setDeleteModalVisible(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Delete" variant="primary" onPress={confirmDelete} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  responsesText: {
    fontSize: 14,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 8,
  }
});
