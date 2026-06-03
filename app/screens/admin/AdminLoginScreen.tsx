import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { ClayTextInput } from '@/components/Form/ClayTextInput';
import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AdminLoginScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useStore((s) => s.adminLogin);
  const showToast = useStore((s) => s.showToast);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    setError('');

    try {
      setIsLoading(true);
      await login(username, password);
      showToast({ message: 'Login successful', type: 'success' });
      navigation.replace('AdminDashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={[styles.title, { color: colors.accentCyan }]}>Society Admin Portal</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Log in to manage your club's forms and applications.
          </Text>
          
          <ClayTextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
          />
          <View style={{ height: 16 }} />
          <ClayTextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
          />
          
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button 
            label={isLoading ? "Logging in..." : "Log In"} 
            onPress={handleLogin} 
            variant="primary" 
            style={styles.button}
            disabled={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  error: {
    color: '#FF4B4B',
    marginTop: 16,
    fontFamily: 'Montserrat_500Medium',
  },
  button: {
    width: '100%',
    marginTop: 24,
  }
});
