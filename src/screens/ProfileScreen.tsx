import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAlert } from '@/template';
import { useAdoption } from '../../hooks/useAdoption';
import { useMedia } from '../hooks/useMedia';
import { Button, EmptyState, ErrorMessage, FormField, ListRow, LoadingState, Screen, SectionHeader, Sheet, ui } from '../components/Base';
import { PetCard } from '../components/PetCard';
import { fonts, theme } from '../theme';
import { formatPhone } from '../utils/validation';

type EditField = 'full_name' | 'email' | 'phone' | 'address' | 'password';
const fieldLabels: Record<EditField, string> = { full_name: 'Nome completo', email: 'E-mail', phone: 'Telefone', address: 'Endereço (privado)', password: 'Alterar senha' };
const fieldIcons = { full_name: 'person-outline', email: 'mail-outline', phone: 'call-outline', address: 'lock-closed-outline' } as const;

export function ProfileScreen() {
  const router = useRouter();
  const app = useAdoption();
  const media = useMedia();
  const { showAlert } = useAlert();
  const [editing, setEditing] = useState<EditField | null>(null);
  const [value, setValue] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const profile = app.data.profile;
  const favorites = app.data.pets.filter(pet => app.data.favorites.some(item => item.pet_id === pet.id && item.user_id === profile?.id));
  const mine = app.data.pets.filter(pet => pet.owner_id === profile?.id);

  function open(field: EditField) {
    app.clearError();
    setValue(field === 'password' ? '' : field === 'phone' ? formatPhone(profile?.phone ?? '') : profile?.[field] ?? '');
    setConfirmation('');
    setEditing(field);
  }

  async function save() {
    if (!editing) return;
    const ok = editing === 'password' ? await app.resetPassword(value, confirmation) : await app.updateProfile(editing === 'full_name' ? { full_name: value, display_name: value } : { [editing]: value });
    if (ok) {
      const field = editing;
      setEditing(null);
      if (field === 'email') showAlert('E-mail atualizado localmente', 'A confirmação por e-mail do Supabase será conectada na Fase 2.');
      if (field === 'password') showAlert('Demonstração concluída', 'Nenhuma senha foi alterada em um servidor.');
    }
  }

  return (
    <Screen nav>
      <Text style={styles.pageTitle}>Perfil</Text>
      {app.loading ? (
        <LoadingState />
      ) : !app.data.signedIn || !profile ? (
        <EmptyState icon="person-circle-outline" title="Seu espaço no AuDote" message="Entre para editar seu perfil e acompanhar seus anúncios." action={<Button title="Entrar" onPress={() => router.push('/login')} />} />
      ) : (
        <>
          <View style={styles.hero}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Selecionar foto do perfil"
              onPress={async () => { const photos = await media.pick(); if (photos[0]) await app.updateProfile({ avatar_url: photos[0] }); }}
              style={({ pressed }) => [styles.avatarButton, pressed ? styles.pressed : null]}
            >
              {profile.avatar_url ? <Image source={{ uri: profile.avatar_url }} contentFit="cover" transition={200} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarEmpty]}><Text style={styles.initial}>{(profile.display_name || profile.full_name || '?').trim().charAt(0).toUpperCase()}</Text></View>}
              <View style={styles.camera}><Ionicons name="camera" size={16} color={theme.colors.white} /></View>
            </Pressable>
            <Text style={styles.name}>{profile.display_name || profile.full_name}</Text>
            <Text style={ui.caption}>{profile.email}</Text>
            <Text style={ui.caption}>Toque na foto para alterar · arquivo local</Text>
            <View style={styles.stats}>
              <View style={styles.stat}><Text style={styles.statValue}>{favorites.length}</Text><Text style={styles.statLabel}>favoritos</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.stat}><Text style={styles.statValue}>{mine.length}</Text><Text style={styles.statLabel}>anúncios</Text></View>
              <View style={styles.statDivider} />
              <View style={styles.stat}><Text style={styles.statValue}>{app.data.interests.filter(item => item.user_id === profile.id).length}</Text><Text style={styles.statLabel}>interesses</Text></View>
            </View>
          </View>
          {media.mediaError ? <Text style={styles.error}>{media.mediaError}</Text> : null}

          <SectionHeader title="Animais favoritados" action={favorites.length ? <Pressable accessibilityRole="button" onPress={() => router.push('/favorites')} hitSlop={8}><Text style={styles.seeAll}>Ver todos</Text></Pressable> : undefined} />
          {favorites.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.rail}>
              {favorites.map(pet => <PetCard key={pet.id} pet={pet} width={160} />)}
            </ScrollView>
          ) : (
            <View style={styles.noFavorites}>
              <Ionicons name="heart-outline" size={22} color={theme.colors.primary} />
              <Text style={[ui.caption, styles.flex]}>Toque no coração dos cards para guardar seus futuros companheiros.</Text>
            </View>
          )}

          <SectionHeader title="Informações pessoais" />
          <View style={styles.group}>
            {(['full_name', 'email', 'phone', 'address'] as const).map((field, index) => (
              <View key={field} style={index ? styles.separated : null}>
                <ListRow icon={fieldIcons[field]} title={(field === 'phone' ? formatPhone(profile.phone) : profile[field]) || 'Não informado'} subtitle={fieldLabels[field]} accessibilityLabel={`Editar ${fieldLabels[field]}`} onPress={() => open(field)} />
              </View>
            ))}
          </View>
          <Text style={ui.caption}>Seu endereço e o telefone do perfil nunca são exibidos no card público do responsável.</Text>

          <SectionHeader title="Atalhos e segurança" />
          <View style={styles.group}>
            <ListRow icon="paw-outline" title="Meus animais" subtitle="Gerencie seus anúncios" onPress={() => router.push('/my-pets')} />
            <View style={styles.separated}><ListRow icon="heart-outline" title="Favoritos" subtitle="Quem conquistou seu coração" onPress={() => router.push('/favorites')} /></View>
            <View style={styles.separated}><ListRow icon="key-outline" title="Alterar senha" onPress={() => open('password')} /></View>
          </View>

          <ErrorMessage />
          <Button
            title="Sair"
            danger
            icon="log-out-outline"
            busy={app.busy}
            onPress={() => showAlert('Sair da sessão?', 'Seus dados demonstrativos continuarão neste dispositivo.', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: async () => { if (await app.signOut()) router.replace('/'); } }])}
          />
        </>
      )}
      <Sheet
        visible={Boolean(editing)}
        title={editing ? fieldLabels[editing] : 'Editar perfil'}
        onClose={() => { setEditing(null); app.clearError(); }}
        footer={<Button title="Salvar" busy={app.busy} onPress={() => void save()} />}
      >
        {editing === 'email' ? <Text style={ui.caption}>Atualização local nesta fase. Na integração real, o novo e-mail exigirá confirmação.</Text> : null}
        {editing === 'address' ? <Text style={ui.caption}>Informação privada. Use apenas um dado demonstrativo nesta fase.</Text> : null}
        <FormField
          label={editing ? fieldLabels[editing] : 'Valor'}
          value={value}
          onChangeText={setValue}
          phone={editing === 'phone'}
          keyboardType={editing === 'email' ? 'email-address' : editing === 'phone' ? 'phone-pad' : 'default'}
          autoComplete={editing === 'email' ? 'email' : editing === 'full_name' ? 'name' : editing === 'password' ? 'new-password' : 'off'}
          autoCapitalize={editing === 'email' ? 'none' : 'sentences'}
          password={editing === 'password'}
          multiline={editing === 'address'}
        />
        {editing === 'password' ? <FormField label="Confirmar nova senha" password autoComplete="new-password" value={confirmation} onChangeText={setConfirmation} /> : null}
        <ErrorMessage />
      </Sheet>
    </Screen>
  );
}

const EDGE = theme.spacing.md;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  pageTitle: { fontSize: 34, lineHeight: 40, fontFamily: fonts.displayBold, color: theme.colors.text, letterSpacing: -0.8 },
  hero: { alignItems: 'center', gap: 4, backgroundColor: theme.colors.surface, borderRadius: theme.radius.card + 4, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.lg },
  avatarButton: { width: 104, height: 104, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.sm },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarEmpty: { backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 40, fontFamily: fonts.displayBold, color: theme.colors.primaryDark },
  camera: { position: 'absolute', bottom: 2, right: 2, width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary, borderWidth: 3, borderColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: theme.font.section + 2, fontFamily: fonts.displayBold, color: theme.colors.text, textAlign: 'center' },
  stats: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: theme.font.section, fontFamily: fonts.displayBold, color: theme.colors.primaryDark },
  statLabel: { fontSize: theme.font.caption, fontFamily: fonts.medium, color: theme.colors.subtle },
  statDivider: { width: 1, height: 28, backgroundColor: theme.colors.border },
  bleed: { marginHorizontal: -EDGE, flexGrow: 0 },
  rail: { paddingHorizontal: EDGE, paddingVertical: theme.spacing.xs, gap: theme.spacing.sm + 4 },
  seeAll: { color: theme.colors.primary, fontSize: theme.font.small, fontFamily: fonts.bold },
  noFavorites: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.field, padding: theme.spacing.md },
  group: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.border, overflow: 'hidden' },
  separated: { borderTopWidth: 1, borderTopColor: theme.colors.border },
  error: { color: theme.colors.danger, fontSize: theme.font.small, fontFamily: fonts.medium },
  pressed: { opacity: 0.8 },
});
