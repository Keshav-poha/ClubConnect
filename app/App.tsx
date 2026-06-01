import { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';

import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { 
  Montserrat_400Regular, 
  Montserrat_500Medium, 
  Montserrat_600SemiBold, 
  Montserrat_700Bold 
} from '@expo-google-fonts/montserrat';
import { 
  Poppins_600SemiBold, 
  Poppins_700Bold 
} from '@expo-google-fonts/poppins';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { RootNavigator } from './navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './theme';

import { Platform } from 'react-native';

// Inject global styles for Web to ensure root container takes full height
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      min-height: 100dvh;
      width: 100vw;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
    }
  `;
  document.head.appendChild(style);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Poppins_600SemiBold,
    Poppins_700Bold,
    JetBrainsMono_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.backgroundPrimary,
      text: colors.textPrimary,
    },
  };

  return (
    <SafeAreaProvider style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer theme={MyTheme}>
        <RootNavigator />
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
