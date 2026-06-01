import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { colors } from '@/theme';

export const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h2">Privacy Policy</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text variant="body" color="textMuted" style={styles.paragraph}>
            We collect information you provide directly to us when you create an account, update your profile, use the interactive features of the app, or communicate with us.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>2. How We Use Information</Text>
          <Text variant="body" color="textMuted" style={styles.paragraph}>
            We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect ClubConnect and our users.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>3. Sharing of Information</Text>
          <Text variant="body" color="textMuted" style={styles.paragraph}>
            We do not share your personal information with third parties except as described in this privacy policy or with your consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>4. Data Security</Text>
          <Text variant="body" color="textMuted" style={styles.paragraph}>
            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>5. Contact Us</Text>
          <Text variant="body" color="textMuted" style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at aquawit22@gmail.com.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  paragraph: {
    lineHeight: 24,
  },
});
