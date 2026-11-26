import { ReactNode, useRef, useState } from 'react';
import { FlatList, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '@/template';
import { usePetDetail } from '../hooks/usePetDetail';
import { Button, Chip, EmptyState, ErrorMessage, FormField, Header, IconButton, Screen, Sheet, ui } from '../components/Base';
import { FavoriteButton } from '../components/FavoriteButton';
import { fonts, labels, shadow, theme } from '../theme';
import { formatPhone } from '../utils/validation';

const GALLERY_HEIGHT = 400;

function Stat({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={theme.colors.primary} />
      <Text numberOfLines={1} style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoBlock({ icon, title, children }: { icon: keyof typeof Ionicons.glyphMap; title: string; children: ReactNode }) {
  return (
    <View style={styles.info}>
      <View style={styles.infoHead}>
        <View style={styles.infoIcon}><Ionicons name={icon} size={18} color={theme.colors.primaryDark} /></View>
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const detail = usePetDetail(id);
  const { showAlert } = useAlert();
  const [interestOpen, setInterestOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [photo, setPhoto] = useState(0);
  const gallery = useRef<FlatList<string>>(null);
  const { pet, guardian } = detail;
  const width = Math.min(windowWidth, theme.maxWidth);

  if (!pet) return <Screen><Header title="Animal" /><EmptyState icon="search-outline" title="Animal não encontrado" message="Este anúncio não está nos dados locais. Volte para conhecer outros animais." /></Screen>;

  const favorite = detail.data.favorites.some(item => item.pet_id === pet.id && item.user_id === detail.data.profile?.id);
  const available = pet.status === 'available';
  const photos = pet.photo_urls.length ? pet.photo_urls : [''];
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/feed'));

  const openWhatsApp = async () => {
    const digits = detail.contact!.replace(/\D/g, '');
    const phone = digits.length <= 11 ? `55${digits}` : digits;
    try {
      await Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(`Olá! Tenho interesse em adotar ${pet.name}.`)}`);
    } catch {
      showAlert('Não foi possível abrir o WhatsApp', 'Confira se o aplicativo está instalado ou tente pelo navegador.');
    }
  };

  const cta = detail.interested ? null : (
    <View style={[styles.cta, shadow.bar]}>
      <Button
        title={available ? 'Quero adotar' : labels.status[pet.status]}
        icon={available ? 'heart' : undefined}
        disabled={!available || detail.busy}
        onPress={() => (detail.data.signedIn ? setInterestOpen(true) : router.push('/login'))}
      />
    </View>
  );

  return (
    <Screen bleed scroll={false} footer={cta}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View>
            <View style={{ height: GALLERY_HEIGHT, backgroundColor: theme.colors.muted }}>
              <FlatList
                ref={gallery}
                horizontal
                pagingEnabled
                data={photos}
                keyExtractor={(url, index) => `${url}-${index}`}
                showsHorizontalScrollIndicator={false}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                onMomentumScrollEnd={event => setPhoto(Math.round(event.nativeEvent.contentOffset.x / width))}
                renderItem={({ item }) => <Image source={{ uri: item }} style={{ width, height: GALLERY_HEIGHT }} contentFit="cover" transition={250} accessibilityLabel={`Foto de ${pet.name}`} />}
              />
              <LinearGradient colors={['rgba(16,26,18,0.5)', 'transparent']} style={styles.topFade} pointerEvents="none" />
              <View style={[styles.topBar, { top: insets.top + theme.spacing.sm }]}>
                <IconButton filled name="arrow-back" label="Voltar" onPress={goBack} />
                <FavoriteButton size={44} name={pet.name} favorite={favorite} disabled={detail.busy} onPress={() => (detail.data.signedIn ? void detail.toggleFavorite(pet.id) : router.push('/login'))} />
              </View>
              {photos.length > 1 ? (
                <View style={styles.dots} accessibilityLabel={`Foto ${photo + 1} de ${photos.length}`}>
                  {photos.map((_, index) => (
                    <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Ver foto ${index + 1}`} hitSlop={8} onPress={() => { setPhoto(index); gallery.current?.scrollToIndex({ index, animated: true }); }}>
                      <View style={[styles.dot, photo === index ? styles.dotActive : null]} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.sheet}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{pet.name}</Text>
                <View style={[styles.sexBadge, { backgroundColor: pet.sex === 'male' ? '#E3EEF7' : '#F8E4EC' }]}>
                  <Ionicons name={pet.sex === 'male' ? 'male' : 'female'} size={20} color={pet.sex === 'male' ? '#4A7BA8' : '#C0587A'} accessibilityLabel={labels.sex[pet.sex]} />
                </View>
              </View>
              <View style={ui.row}>
                <Ionicons name="location" size={16} color={theme.colors.primary} />
                <Text style={styles.location}>{pet.region} · {pet.city}</Text>
              </View>
              {!available ? <View style={ui.wrap}><Chip title={labels.status[pet.status]} icon="information-circle" tone="warn" /></View> : null}

              <View style={styles.stats}>
                <Stat icon="calendar-outline" value={pet.age_text} label="Idade" />
                <Stat icon="resize-outline" value={labels.size[pet.size]} label="Porte" />
                <Stat icon="paw-outline" value={labels.species[pet.species]} label="Espécie" />
              </View>

              <View style={ui.wrap}>
                <Chip title={pet.behavior.startsWith('Calmo') ? 'Calmo' : 'Sociável'} icon="sparkles" tone="honey" />
                <Chip title={labels.age[pet.age_group]} />
                <Chip title={labels.sex[pet.sex]} />
                {pet.traits.map(trait => <Chip key={trait} title={labels.traits[trait]} icon="checkmark-circle" />)}
              </View>

              <InfoBlock icon="book-outline" title={`Sobre ${pet.name}`}><Text style={ui.body}>{pet.description}</Text></InfoBlock>
              <InfoBlock icon="medkit-outline" title="Saúde e cuidados"><Text style={ui.body}>{pet.health_notes || 'Consulte o responsável para conhecer os cuidados.'}</Text></InfoBlock>
              <InfoBlock icon="happy-outline" title="Comportamento"><Text style={ui.body}>{pet.behavior || 'Conheça o animal e converse com o responsável.'}</Text></InfoBlock>

              <View style={styles.guardian}>
                <View style={styles.guardianAvatar}><Ionicons name="shield-checkmark" size={24} color={theme.colors.primaryDark} /></View>
                <View style={styles.guardianInfo}>
                  <Text style={ui.caption}>Responsável</Text>
                  <Text style={styles.guardianName}>{guardian?.organization_name || guardian?.display_name || 'Carregando responsável...'}</Text>
                  <Text style={ui.caption}>Adoção responsável no Distrito Federal</Text>
                </View>
              </View>

              <ErrorMessage />
              {detail.interested ? (
                <View style={styles.interest}>
                  <View style={ui.row}>
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                    <Text style={styles.infoTitle}>Interesse registrado</Text>
                  </View>
                  {detail.contact ? (
                    <>
                      <Text style={ui.body}>Contato do anúncio: {formatPhone(detail.contact)}</Text>
                      <Button title="Conversar pelo WhatsApp" icon="logo-whatsapp" onPress={openWhatsApp} />
                    </>
                  ) : (
                    <Text style={ui.body}>Contato não configurado na demonstração. Nenhum telefone fictício será exibido.</Text>
                  )}
                </View>
              ) : null}
              {!available ? <Text style={ui.body}>Este anúncio está {labels.status[pet.status].toLowerCase()} e não aceita novos interesses.</Text> : null}
            </View>
          </View>
      </ScrollView>
      <Sheet
        visible={interestOpen}
        title={`Um lar para ${pet.name}`}
        onClose={() => setInterestOpen(false)}
        footer={<Button title="Registrar interesse" icon="heart" busy={detail.busy} onPress={async () => { if (await detail.registerInterest(pet.id, message)) setInterestOpen(false); }} />}
      >
        <Text style={ui.body}>Adotar é um compromisso de cuidado por toda a vida. Seu interesse será registrado apenas neste dispositivo.</Text>
        <FormField label="Mensagem para o responsável (opcional)" value={message} onChangeText={setMessage} multiline placeholder="Conte um pouco sobre o lar que você pode oferecer." />
        <ErrorMessage />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: theme.spacing.lg },
  topFade: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  topBar: { position: 'absolute', left: theme.spacing.md, right: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dots: { position: 'absolute', bottom: 44, alignSelf: 'center', flexDirection: 'row', gap: 6, backgroundColor: 'rgba(16,26,18,0.35)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: theme.radius.pill },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.55)' },
  dotActive: { width: 20, backgroundColor: theme.colors.white },
  sheet: { marginTop: -theme.spacing.lg, backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.sheet, borderTopRightRadius: theme.radius.sheet, padding: theme.spacing.lg, gap: theme.spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  name: { flex: 1, fontSize: 38, lineHeight: 44, fontFamily: fonts.displayBold, color: theme.colors.text, letterSpacing: -1 },
  sexBadge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  location: { fontSize: theme.font.body, fontFamily: fonts.medium, color: theme.colors.subtle },
  stats: { flexDirection: 'row', gap: theme.spacing.sm },
  stat: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.radius.field + 2, borderWidth: 1, borderColor: theme.colors.border, paddingVertical: theme.spacing.md, paddingHorizontal: theme.spacing.sm, alignItems: 'center', gap: 4 },
  statValue: { fontSize: theme.font.body, fontFamily: fonts.bold, color: theme.colors.text },
  statLabel: { fontSize: theme.font.caption, fontFamily: fonts.medium, color: theme.colors.subtle },
  info: { gap: theme.spacing.sm },
  infoHead: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  infoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontSize: theme.font.lead, fontFamily: fonts.display, color: theme.colors.text },
  guardian: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md },
  guardianAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  guardianInfo: { flex: 1 },
  guardianName: { color: theme.colors.text, fontSize: theme.font.body, fontFamily: fonts.bold },
  interest: { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.card, padding: theme.spacing.lg, gap: theme.spacing.md },
  cta: { backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },
});
