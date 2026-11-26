import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { AlertProvider } from '@/template';
import { AdoptionProvider } from '../contexts/AdoptionContext';
import { AppNavigator } from '../src/navigation/AppNavigator';
import { theme } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Fraunces_600SemiBold, Fraunces_700Bold });
  const ready = loaded || Boolean(error);
  useEffect(() => {
    // Preenchimento automático do navegador: mantém o campo branco, com bordas arredondadas e texto legível.
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.textContent = `input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus,input:-webkit-autofill:active{-webkit-box-shadow:0 0 0 1000px #FFFFFF inset !important;box-shadow:0 0 0 1000px #FFFFFF inset !important;-webkit-text-fill-color:#1B2620 !important;caret-color:#1B2620;border-radius:12px;transition:background-color 9999s ease-out 0s;}`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  useEffect(() => { if (ready) SplashScreen.hideAsync().catch(() => undefined); }, [ready]);
  if (!ready) return null;
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AdoptionProvider>
          <StatusBar style="dark" />
          <View style={styles.outer}>
            <View style={styles.app}>
              <AppNavigator />
            </View>
          </View>
        </AdoptionProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: theme.colors.muted, alignItems: 'center' },
  app: { flex: 1, width: '100%', maxWidth: theme.maxWidth, backgroundColor: theme.colors.background, overflow: 'hidden' },
});
