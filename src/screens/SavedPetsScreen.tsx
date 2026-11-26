import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAdoption } from '../../hooks/useAdoption';
import { usePetFeed } from '../hooks/usePetFeed';
import { Button, EmptyState, ErrorMessage, IconButton, LoadingState, Screen, ui } from '../components/Base';
import { PetCard } from '../components/PetCard';
import { ProfileMenu } from '../components/ProfileMenu';
import { fonts, theme } from '../theme';

interface SavedPetsScreenProps { mode: 'favorites' | 'mine'; }

export function SavedPetsScreen({ mode }: SavedPetsScreenProps) {
  const router = useRouter();
  const app = useAdoption();
  const feed = usePetFeed(mode);
  const [menu, setMenu] = useState(false);
  const mine = mode === 'mine';
  const signedIn = app.data.signedIn;
  return (
    <Screen scroll={false} nav>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        numColumns={2}
        data={signedIn && !app.loading ? feed.pets : []}
        keyExtractor={pet => pet.id}
        renderItem={({ item }) => <PetCard pet={item} editable={mine} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.titleBody}>
                <Text style={styles.title}>{mine ? 'Meus animais' : 'Favoritos'}</Text>
                <Text style={ui.body}>{mine ? 'Cada anúncio é uma chance de encontrar um lar.' : 'Aqueles que conquistaram seu coração.'}</Text>
              </View>
              <IconButton filled name="person-outline" label="Abrir perfil" onPress={() => setMenu(true)} />
            </View>
            {mine && signedIn ? <Button title="Cadastrar animal" icon="add" onPress={() => router.push('/publish')} /> : null}
            {signedIn ? <Text style={styles.count}>{feed.pets.length} {mine ? (feed.pets.length === 1 ? 'anúncio' : 'anúncios') : (feed.pets.length === 1 ? 'favorito' : 'favoritos')}</Text> : null}
            <ErrorMessage />
          </View>
        }
        ListEmptyComponent={
          app.loading ? <LoadingState /> : (
            <EmptyState
              icon={!signedIn ? 'log-in-outline' : mine ? 'paw-outline' : 'heart-outline'}
              title={!signedIn ? 'Entre para continuar' : mine ? 'Seu primeiro anúncio começa aqui' : 'Seu coração ainda tem espaço'}
              message={!signedIn ? 'Acesse a sessão demonstrativa para ver seus animais e favoritos.' : mine ? 'Cadastre um animal, conte sua história e ajude a encontrar uma família.' : 'Toque no coração dos cards para guardar seus futuros companheiros.'}
              action={<Button title={!signedIn ? 'Entrar' : mine ? 'Cadastrar animal' : 'Conhecer os animais'} onPress={() => router.push(!signedIn ? '/login' : mine ? '/publish' : '/feed')} />}
            />
          )
        }
        showsVerticalScrollIndicator={false}
      />
      <ProfileMenu visible={menu} onClose={() => setMenu(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingHorizontal: theme.spacing.md - 6, paddingBottom: theme.spacing.lg },
  header: { paddingHorizontal: 6, gap: theme.spacing.md, paddingBottom: theme.spacing.sm, paddingTop: theme.spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.sm },
  titleBody: { flex: 1, gap: 4 },
  title: { fontSize: 34, lineHeight: 40, fontFamily: fonts.displayBold, color: theme.colors.text, letterSpacing: -0.8 },
  count: { color: theme.colors.subtle, fontSize: theme.font.small, fontFamily: fonts.medium },
  footer: { padding: theme.spacing.md },
});
