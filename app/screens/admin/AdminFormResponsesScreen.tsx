import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';
import { useStore } from '@/store';

type RouteProps = RouteProp<RootStackParamList, 'AdminFormResponses'>;

export const AdminFormResponsesScreen = () => {
  const route = useRoute<RouteProps>();
  const { formId, formTitle } = route.params;
  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();
  
  const responses = useStore((s) => s.adminResponses[formId] || []);
  const fetchResponses = useStore((s) => s.fetchAdminResponses);
  const adminForms = useStore((s) => s.adminForms);
  const isLoading = useStore((s) => s.isLoadingApplications);
  
  const currentForm = adminForms.find(f => f.id === formId);

  const getFieldLabel = (fieldId: string) => {
    if (!currentForm) return `Field ID: ${fieldId}`;
    const field = currentForm.fields?.find((f: any) => f.id === fieldId);
    return field ? field.label : `Field ID: ${fieldId}`;
  };

  useEffect(() => {
    fetchResponses(formId);
  }, [formId]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={[globalStyles.clayCard, styles.card]}>
      <Text style={styles.studentName}>{item.student_name} ({item.student_id})</Text>
      <Text style={styles.submittedAt}>
        Submitted: {new Date(item.submitted_at).toLocaleString()}
      </Text>
      <View style={styles.divider} />
      {item.answers?.map((ans: any) => (
        <View key={ans.field_id} style={styles.answerRow}>
          <Text style={styles.answerLabel}>{getFieldLabel(ans.field_id)}</Text>
          <Text style={styles.answerValue}>{ans.value}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScreenContainer>
      <Header title={`Responses: ${formTitle}`} showBack />
      {isLoading ? (
        <View style={styles.center}>
          <Text style={{ color: colors.textMuted }}>Loading responses...</Text>
        </View>
      ) : (
        <FlatList
          data={responses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: colors.textMuted }}>No responses yet.</Text>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 4,
  },
  submittedAt: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginBottom: 12,
  },
  answerRow: {
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'Montserrat_600SemiBold',
  },
  answerValue: {
    fontSize: 14,
    color: '#fff',
  }
});
