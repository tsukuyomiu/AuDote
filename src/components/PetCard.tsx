import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAlert } from '@/template';
import { useAdoption } from '../../hooks/useAdoption';
import { Pet } from '../types';
import { fonts, labels, shadow, theme } from '../theme';
import { FavoriteButton } from './FavoriteButton';

interface PetCardProps {
  pet: Pet;
  editable?: boolean;
  /** Largura fixa (carrosséis). Sem ela, o card ocupa a coluna da grade. */
  width?: number;
}

export const PetCard = memo(function PetCard({ pet, editable = false, width }: PetCardProps) {
  const router = useRouter();
  const { data, toggleFavorite, deletePet, busy } = useAdoption();
  const { showAlert } = useAlert();
  const favorite = data.favorites.some(item => item.user_id === data.profile?.id && item.pet_id === pet.id);
  const unavailable = pet.status !== 'available';
  return (
    <View style={[styles.card, width ? { width, flexGrow: 0, flexShrink: 0, flexBasis: 'auto', margin: 0 } : null, shadow.card]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Conhecer ${pet.name}, ${labels.species[pet.species]}, ${pet.region}`}
        onPress={() => router.push({ pathname: '/pet/[id]', params: { id: pet.id } })}
        style={({ pressed }) => [pressed ? styles.pressed : null]}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: pet.photo_urls[0] }} contentFit="cover" transition={250} style={[styles.image, unavailable ? styles.imageDim : null]} />
          <LinearGradient colors={['transparent', 'rgba(16,26,18,0.55)']} style={styles.fade} pointerEvents="none" />
          <View style={styles.regionTag} pointerEvents="none">
            <Ionicons name="location" size={12} color={theme.colors.white} />
            <Text numberOfLines={1} style={styles.regionText}>{pet.region}</Text>
          </View>
          {unavailable ? (
            <View style={styles.status}>
              <Text style={styles.statusText}>{labels.status[pet.status]}</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.name}>{pet.name}</Text>
            <Ionicons name={pet.sex === 'male' ? 'male' : 'female'} size={16} color={pet.sex === 'male' ? '#4A7BA8' : '#C0587A'} accessibilityLabel={labels.sex[pet.sex]} />
          </View>
          <Text numberOfLines={1} style={styles.caption}>{labels.species[pet.species]} · {pet.age_text}</Text>
        </View>
      </Pressable>
      <View style={styles.heart}>
        <FavoriteButton name={pet.name} favorite={favorite} disabled={busy} onPress={() => (data.signedIn ? void toggleFavorite(pet.id) : router.push('/login'))} />
      </View>
      {editable ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Editar ou alterar status de ${pet.name}`} onPress={() => router.push({ pathname: '/publish', params: { id: pet.id } })} style={({ pressed }) => [styles.edit, pressed ? styles.pressed : null]}>
          <Ionicons name="create-outline" size={16} color={theme.colors.primaryDark} />
          <Text style={styles.editText}>Editar / alterar status</Text>
        </Pressable>
      ) : null}
      {editable ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Excluir ${pet.name}`}
          disabled={busy}
          onPress={() => showAlert(`Excluir ${pet.name}?`, 'O anúncio será removido definitivamente, junto com favoritos e interesses ligados a ele. Essa ação não pode ser desfeita.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Excluir', style: 'destructive', onPress: () => { void deletePet(pet.id); } },
          ])}
          style={({ pressed }) => [styles.remove, pressed ? styles.pressed : null]}
        >
          <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
          <Text style={styles.removeText}>Excluir</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0, backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, overflow: 'hidden', margin: theme.spacing.sm / 2 + 2, borderWidth: 1, borderColor: theme.colors.border },
  imageWrap: { width: '100%', aspectRatio: 0.84 },
  image: { width: '100%', height: '100%', backgroundColor: theme.colors.muted },
  imageDim: { opacity: 0.55 },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 64 },
  regionTag: { position: 'absolute', left: 10, bottom: 8, right: 10, flexDirection: 'row', alignItems: 'center', gap: 3 },
  regionText: { color: theme.colors.white, fontSize: theme.font.caption, fontFamily: fonts.semibold, flexShrink: 1 },
  status: { position: 'absolute', left: 10, top: 10, backgroundColor: theme.colors.text, borderRadius: theme.radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { color: theme.colors.white, fontSize: theme.font.caption, fontFamily: fonts.bold },
  body: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 12, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  name: { color: theme.colors.text, fontSize: theme.font.lead, fontFamily: fonts.display, flexShrink: 1 },
  caption: { fontSize: theme.font.small, fontFamily: fonts.regular, color: theme.colors.subtle },
  heart: { position: 'absolute', top: 8, right: 8 },
  pressed: { opacity: 0.85 },
  edit: { minHeight: 48, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primarySoft, paddingHorizontal: theme.spacing.sm },
  remove: { minHeight: 48, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.dangerSoft, paddingHorizontal: theme.spacing.sm },
  removeText: { color: theme.colors.danger, fontFamily: fonts.bold, fontSize: theme.font.small, textAlign: 'center' },
  editText: { color: theme.colors.primaryDark, fontFamily: fonts.bold, fontSize: theme.font.small, textAlign: 'center' },
});
