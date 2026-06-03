import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { ClayTextInput } from '@/components/Form/ClayTextInput';
import { ClayDropdown } from '@/components/Form/ClayDropdown';
import { ClayCheckbox } from '@/components/Form/ClayCheckbox';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminCreateFormScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const createForm = useStore((s) => s.adminCreateForm);
  const showToast = useStore((s) => s.showToast);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [fields, setFields] = useState<any[]>([]);

  const addField = () => {
    setFields([...fields, { type: 'text', label: '', required: false, options: '' }]);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index][key] = value;
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title) {
      showToast({ message: 'Title is required', type: 'error' });
      return;
    }

    try {
      let parsedDeadline = undefined;
      if (deadline.trim()) {
        const d = new Date(deadline.trim() + 'T23:59:59Z');
        if (isNaN(d.getTime())) {
          showToast({ message: 'Invalid deadline format. Use YYYY-MM-DD', type: 'error' });
          return;
        }
        parsedDeadline = d.toISOString();
      }

      await createForm({
        title,
        description,
        deadline: parsedDeadline,
        fields,
      });
      showToast({ message: 'Form created!', type: 'success' });
      navigation.goBack();
    } catch (err: any) {
      showToast({ message: err.message || 'Failed to create form', type: 'error' });
    }
  };

  return (
    <ScreenContainer>
      <Header title="Create Form" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Form Title</Text>
        <ClayTextInput value={title} onChangeText={setTitle} placeholder="e.g. Core Team Recruitment" />
        
        <View style={{ height: 16 }} />
        <Text style={styles.label}>Description</Text>
        <ClayTextInput 
          value={description} 
          onChangeText={setDescription} 
          placeholder="Form description" 
          multiline 
          style={{ height: 100 }}
        />

        <View style={{ height: 16 }} />
        <Text style={styles.label}>Deadline (Optional)</Text>
        <ClayTextInput value={deadline} onChangeText={setDeadline} placeholder="YYYY-MM-DD" />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Fields</Text>
          <Button label="+ Add Field" onPress={addField} variant="secondary" />
        </View>

        {fields.map((field, index) => (
          <View key={index} style={[styles.fieldCard, { backgroundColor: colors.backgroundCard }]}>
            <View style={styles.fieldRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.smallLabel}>Field Label</Text>
                <ClayTextInput 
                  value={field.label} 
                  onChangeText={(val: string) => updateField(index, 'label', val)} 
                  placeholder="e.g. Your Name" 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.smallLabel}>Type</Text>
                <ClayDropdown
                  value={field.type}
                  onChange={(val: string) => updateField(index, 'type', val)}
                  options={['text', 'dropdown', 'checkbox']}
                />
              </View>
            </View>
            {field.type === 'dropdown' && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.smallLabel}>Options (comma separated)</Text>
                <ClayTextInput 
                  value={field.options} 
                  onChangeText={(val: string) => updateField(index, 'options', val)} 
                  placeholder="Option 1, Option 2" 
                />
              </View>
            )}
            <View style={{ marginTop: 12 }}>
              <ClayCheckbox 
                label="Required field?" 
                checked={field.required} 
                onChange={(checked) => updateField(index, 'required', checked)} 
              />
            </View>
            <Pressable onPress={() => removeField(index)} style={styles.removeBtn}>
              <Text style={{ color: '#FF4B4B', fontSize: 12 }}>Remove Field</Text>
            </Pressable>
          </View>
        ))}

        <Button label="Save Form" onPress={handleSave} variant="primary" style={{ marginTop: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  fieldCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  fieldRow: {
    flexDirection: 'row',
  },
  smallLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  removeBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
  }
});
