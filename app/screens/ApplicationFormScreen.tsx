import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from '@/components/Text';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useStore } from '@/store';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { DynamicField } from '@/components/Form/DynamicField';
import { useTheme } from '@/hooks/useTheme';

type RouteProps = RouteProp<RootStackParamList, 'ApplicationForm'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ApplicationFormScreen = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { applicationId } = route.params;
  const { colors } = useTheme();
  const { typography } = require('@/theme');

  const applications = useStore((s) => s.applications);
  const submitApp = useStore((s) => s.submitApplication);
  const showToast = useStore((s) => s.showToast);

  const application = applications.find((a) => a.id === applicationId);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!application) {
    return (
      <ScreenContainer>
        <Header title="Error" showBack />
        <View style={styles.center}>
          <Text style={{ color: colors.textPrimary }}>Application not found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    application.fields.forEach((field) => {
      if (
        field.required &&
        (!formData[field.id] ||
          (typeof formData[field.id] === 'string' && formData[field.id].trim() === ''))
      ) {
        newErrors[field.id] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitApp(applicationId, formData);
      showToast({ message: 'Application submitted successfully!', type: 'success' });
      navigation.goBack();
    } catch (error: any) {
      showToast({ message: error.message || 'Failed to submit', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <Header title={application.title} showBack />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={[
              styles.description,
              { color: colors.textMuted, fontFamily: typography.body.fontFamily },
            ]}
          >
            {application.description}
          </Text>

          <View style={styles.formContainer}>
            {application.fields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={formData[field.id]}
                onChange={(val) => handleChange(field.id, val)}
                error={errors[field.id]}
              />
            ))}
          </View>

          <View style={styles.submitContainer}>
            <Button
              label={isSubmitting ? 'Submitting...' : 'Submit Application'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 32,
  },
  formContainer: {
    gap: 16,
  },
  submitContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  submitBtn: {
    width: '100%',
  },
});
