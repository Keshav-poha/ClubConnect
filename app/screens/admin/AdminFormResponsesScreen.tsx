import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { ClayTextInput } from '@/components/Form/ClayTextInput';
import { Button } from '@/components/Button';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalStyles } from '@/styles/global';
import { useStore } from '@/store';

type RouteProps = RouteProp<RootStackParamList, 'AdminFormResponses'>;

const ResponseCard = ({ item, getFieldLabel, formId }: any) => {
  const { colors } = useTheme();
  const globalStyles = useGlobalStyles();
  const updateScore = useStore((s) => s.adminUpdateResponseScore);
  const showToast = useStore((s) => s.showToast);
  
  const [scoreText, setScoreText] = useState(item.score != null ? item.score.toString() : '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveScore = async () => {
    const parsed = parseInt(scoreText, 10);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      showToast({ message: 'Score must be between 0 and 100', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      await updateScore(formId, item.id, parsed);
      showToast({ message: 'Score saved!', type: 'success' });
    } catch (e: any) {
      showToast({ message: e.message || 'Failed to save', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[globalStyles.clayCard, styles.card]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{item.student_name}</Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>ID: {item.student_id}</Text>
        </View>
        {item.score != null && (
          <View style={[styles.badge, { backgroundColor: colors.accentCyan + '20' }]}>
            <Text style={{ color: colors.accentCyan, fontSize: 12, fontFamily: 'Montserrat_700Bold' }}>
              Score: {item.score}
            </Text>
          </View>
        )}
      </View>
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

      <View style={styles.divider} />
      
      <View style={styles.scoringRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <ClayTextInput
            value={scoreText}
            onChangeText={setScoreText}
            placeholder="Score (0-100)"
            keyboardType="numeric"
          />
        </View>
        <Button 
          label={isSaving ? 'Saving...' : 'Save Score'} 
          onPress={handleSaveScore} 
          disabled={isSaving || !scoreText.trim()}
        />
      </View>
    </View>
  );
};

export const AdminFormResponsesScreen = () => {
  const route = useRoute<RouteProps>();
  const { formId, formTitle } = route.params;
  const { colors } = useTheme();
  
  const responses = useStore((s) => s.adminResponses[formId] || []);
  const fetchResponses = useStore((s) => s.fetchAdminResponses);
  const adminForms = useStore((s) => s.adminForms);
  const isLoading = useStore((s) => s.isLoadingApplications);
  
  const [sortByRank, setSortByRank] = useState(false);

  const currentForm = adminForms.find(f => f.id === formId);

  const getFieldLabel = (fieldId: string) => {
    if (!currentForm) return `Field ID: ${fieldId}`;
    const field = currentForm.fields?.find((f: any) => f.id === fieldId);
    return field ? field.label : `Field ID: ${fieldId}`;
  };

  useEffect(() => {
    fetchResponses(formId);
  }, [formId]);

  const displayedResponses = [...responses];
  if (sortByRank) {
    displayedResponses.sort((a, b) => {
      const scoreA = a.score != null ? a.score : -1;
      const scoreB = b.score != null ? b.score : -1;
      return scoreB - scoreA;
    });
  }

  return (
    <ScreenContainer>
      <Header title={`Responses: ${formTitle}`} showBack />
      
      <View style={styles.filterRow}>
        <Pressable 
          style={[styles.filterBtn, !sortByRank && { backgroundColor: colors.accentCyan }]}
          onPress={() => setSortByRank(false)}
        >
          <Text style={{ color: !sortByRank ? colors.backgroundPrimary : colors.textPrimary, fontSize: 12 }}>
            Recent First
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.filterBtn, sortByRank && { backgroundColor: colors.accentCyan }]}
          onPress={() => setSortByRank(true)}
        >
          <Text style={{ color: sortByRank ? colors.backgroundPrimary : colors.textPrimary, fontSize: 12 }}>
            Top Rankers
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentCyan} />
        </View>
      ) : (
        <FlatList
          data={displayedResponses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ResponseCard item={item} getFieldLabel={getFieldLabel} formId={formId} />
          )}
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
    paddingBottom: 40,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
  },
  card: {
    padding: 16,
  },
  studentName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  submittedAt: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 12,
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
  },
  scoringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  }
});
