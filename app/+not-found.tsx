import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Base';
import { fonts, theme } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Ionicons name="paw" size={44} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Página não encontrada</Text>
        <Text style={styles.message}>Parece que este caminho se perdeu por aí. Vamos voltar para quem está esperando por um lar?</Text>
        <View style={styles.action}>
          <Button title="Voltar ao início" icon="home-outline" onPress={() => router.replace('/')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, gap: theme.spacing.sm },
  icon: { width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.sm },
  title: { fontSize: theme.font.title, fontFamily: fonts.displayBold, color: theme.colors.text, textAlign: 'center' },
  message: { fontSize: theme.font.body, fontFamily: fonts.regular, color: theme.colors.subtle, textAlign: 'center', lineHeight: 24, maxWidth: 320 },
  action: { alignSelf: 'stretch', marginTop: theme.spacing.md },
});
