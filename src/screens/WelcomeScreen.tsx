import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Logo } from '../components/Base';
import { fonts, theme } from '../theme';

/** Patinhas decorativas desenhadas em código (arte original, sem imagens de terceiros). */
const paws = [
  { top: 8, left: 62, size: 120, rotate: 18, opacity: 0.1 },
  { top: 20, left: 8, size: 64, rotate: -24, opacity: 0.12 },
  { top: 30, left: 70, size: 54, rotate: 32, opacity: 0.14 },
  { top: 38, left: 30, size: 92, rotate: -12, opacity: 0.08 },
  { top: 15, left: 40, size: 40, rotate: 10, opacity: 0.16 },
];

/** Abertura: fundo verde da marca com patinhas e a promessa do app. */
export function WelcomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark, '#1C3321']} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
      {paws.map((paw, index) => (
        <View key={index} pointerEvents="none" style={[styles.paw, { top: `${paw.top}%`, left: `${paw.left}%`, transform: [{ rotate: `${paw.rotate}deg` }] }]}>
          <Ionicons name="paw" size={paw.size} color={theme.colors.white} style={{ opacity: paw.opacity }} />
        </View>
      ))}
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.top}>
          <Logo white mark size={44} />
          <Text style={styles.brand}>AuDote!</Text>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.headline}>{'Transforme\numa espera\nem um lar.'}</Text>
          <Text style={styles.sub}>Conheça cães, gatos e aves que procuram uma família no Distrito Federal.</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Conhecer os animais" onPress={() => router.push('/feed')} style={({ pressed }) => [styles.primary, pressed ? styles.pressed : null]}>
              <Ionicons name="paw" size={20} color={theme.colors.primaryDark} />
              <Text style={styles.primaryText}>Conhecer os animais</Text>
            </Pressable>
            <View style={styles.row}>
              <View style={styles.half}><Button title="Entrar" secondary onDark onPress={() => router.push('/login')} /></View>
              <View style={styles.half}><Button title="Cadastre-se" secondary onDark onPress={() => router.push('/register')} /></View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.primaryDark },
  paw: { position: 'absolute' },
  safe: { flex: 1, justifyContent: 'space-between', paddingHorizontal: theme.spacing.lg },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: theme.spacing.md },
  brand: { color: theme.colors.white, fontSize: 26, fontFamily: fonts.displayBold, letterSpacing: -0.6 },
  bottom: { gap: theme.spacing.md, paddingBottom: theme.spacing.md },
  headline: { color: theme.colors.white, fontSize: 46, lineHeight: 50, fontFamily: fonts.displayBold, letterSpacing: -1 },
  sub: { color: 'rgba(255,255,255,0.88)', fontSize: theme.font.lead, lineHeight: 27, fontFamily: fonts.regular, maxWidth: 360 },
  actions: { gap: theme.spacing.sm + 2, marginTop: theme.spacing.sm },
  primary: { minHeight: 56, borderRadius: theme.radius.pill, backgroundColor: theme.colors.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing.sm },
  primaryText: { color: theme.colors.primaryDark, fontSize: theme.font.lead, fontFamily: fonts.bold },
  row: { flexDirection: 'row', gap: theme.spacing.sm + 2 },
  half: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
