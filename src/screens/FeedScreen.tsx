import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAdoption } from '../../hooks/useAdoption';
import { usePetFeed } from '../hooks/usePetFeed';
import { Button, Chip, EmptyState, ErrorMessage, IconButton, LoadingState, Logo, Screen, SectionHeader, Sheet } from '../components/Base';
import { PetCard } from '../components/PetCard';
import { FilterPanel } from '../components/FilterPanel';
import { ProfileMenu } from '../components/ProfileMenu';
import { emptyFilters } from '../types';
import { fonts, labels, regions, theme } from '../theme';

const categories = [
  { value: '', label: 'Todos', emoji: '🐾' },
  { value: 'dog', label: 'Cães', emoji: '🐶' },
  { value: 'cat', label: 'Gatos', emoji: '🐱' },
  { value: 'bird', label: 'Aves', emoji: '🐦' },
];

export function FeedScreen() {
  const router = useRouter();
  const app = useAdoption();
  const feed = usePetFeed();
  const [menu, setMenu] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const { filters } = feed;

  const active = useMemo(() => {
    const items: Array<{ key: string; label: string; clear: () => void }> = [];
    const single = (key: 'species' | 'age_group' | 'sex' | 'size', text: Record<string, string>) => {
      if (filters[key]) items.push({ key, label: text[filters[key]], clear: () => feed.setFilters({ ...filters, [key]: '' }) });
    };
    single('species', labels.species);
    single('age_group', labels.age);
    single('sex', labels.sex);
    single('size', labels.size);
    if (filters.region) items.push({ key: 'region', label: filters.region, clear: () => feed.setFilters({ ...filters, region: '' }) });
    filters.traits.forEach(trait => items.push({ key: trait, label: labels.traits[trait], clear: () => feed.setFilters({ ...filters, traits: filters.traits.filter(item => item !== trait) }) }));
    return items;
  }, [filters, feed]);

  const searching = Boolean(feed.query.trim()) || active.length > 0;
  const highlights = useMemo(() => (searching ? [] : feed.pets.filter(pet => pet.status === 'available').slice(0, 6)), [feed.pets, searching]);
  const firstName = app.data.profile?.display_name?.split(' ')[0];
  const resetAll = () => { feed.setQuery(''); feed.setFilters({ ...emptyFilters, traits: [] }); };
  const pickRegion = (region: string) => { feed.setFilters({ ...filters, region }); setRegionOpen(false); };

  const head = (
    <View style={styles.headerContent}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Selecionar região. Atual: ${filters.region || 'Distrito Federal'}`} onPress={() => setRegionOpen(true)} style={({ pressed }) => [styles.region, pressed ? styles.pressed : null]}>
          <View style={styles.regionIcon}><Ionicons name="location" size={18} color={theme.colors.primaryDark} /></View>
          <View style={styles.regionBody}>
            <Text style={styles.regionHint}>{firstName ? `Olá, ${firstName}` : 'Adotar em'}</Text>
            <View style={styles.regionRow}>
              <Text numberOfLines={1} style={styles.regionText}>{filters.region || 'Distrito Federal'}</Text>
              <Ionicons name="chevron-down" size={15} color={theme.colors.text} />
            </View>
          </View>
        </Pressable>
        <IconButton filled name="person-outline" label="Abrir menu de perfil" onPress={() => setMenu(true)} />
      </View>

      <Text style={styles.headline}>Encontre seu novo companheiro</Text>

      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={20} color={theme.colors.faint} />
          <TextInput accessibilityLabel="Buscar um animal" placeholder="Buscar pelo nome do animal" placeholderTextColor={theme.colors.faint} value={feed.query} onChangeText={feed.setQuery} returnKeyType="search" style={styles.searchInput} />
          {feed.query ? <IconButton name="close-circle" color={theme.colors.faint} label="Limpar busca" onPress={() => feed.setQuery('')} /> : null}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={active.length ? `Abrir filtros, ${active.length} ativos` : 'Abrir filtros'} onPress={() => setFilterOpen(true)} style={({ pressed }) => [styles.filterButton, active.length ? styles.filterActive : null, pressed ? styles.pressed : null]}>
          <Ionicons name="options" size={22} color={active.length ? theme.colors.white : theme.colors.primaryDark} />
          {active.length ? <View style={styles.filterCount}><Text style={styles.filterCountText}>{active.length}</Text></View> : null}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.categories}>
        {categories.map(item => {
          const selected = filters.species === item.value;
          return (
            <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ selected }} onPress={() => feed.setFilters({ ...filters, species: selected && item.value ? '' : item.value })} style={({ pressed }) => [styles.category, pressed ? styles.pressed : null]}>
              <View style={[styles.categoryIcon, selected ? styles.categorySelected : null]}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.categoryText, selected ? styles.categoryTextSelected : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {active.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.activeRow}>
          {active.map(item => (
            <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={`Remover filtro ${item.label}`} onPress={item.clear} style={({ pressed }) => [styles.activeChip, pressed ? styles.pressed : null]}>
              <Text style={styles.activeText}>{item.label}</Text>
              <Ionicons name="close" size={14} color={theme.colors.primaryDark} />
            </Pressable>
          ))}
          <Pressable accessibilityRole="button" onPress={resetAll} style={styles.clearAll}><Text style={styles.clearText}>Limpar tudo</Text></Pressable>
        </ScrollView>
      ) : null}

      <ErrorMessage />

      {highlights.length >= 3 && !app.loading ? (
        <View style={styles.rail}>
          <SectionHeader title="Esperando por você" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bleed} contentContainerStyle={styles.railContent}>
            {highlights.map(pet => <PetCard key={pet.id} pet={pet} width={176} />)}
          </ScrollView>
        </View>
      ) : null}

      {!searching ? (
        <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.banner}>
          <View style={styles.bannerBody}>
            <Text style={styles.bannerTitle}>Tem alguém esperando por um lar.</Text>
            <Text style={styles.bannerText}>Cadastre um animal e mude uma história.</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Cadastrar animal" onPress={() => router.push(app.data.signedIn ? '/publish' : '/login')} style={({ pressed }) => [styles.bannerButton, pressed ? styles.pressed : null]}>
              <Text style={styles.bannerButtonText}>Cadastrar animal</Text>
              <Ionicons name="arrow-forward" size={16} color={theme.colors.primaryDark} />
            </Pressable>
          </View>
          <View style={styles.bannerLogo}><Logo white mark size={72} /></View>
        </LinearGradient>
      ) : null}

      <SectionHeader title={searching ? 'Resultados' : 'Um novo começo'} action={<Text style={styles.count}>{feed.pets.length} {feed.pets.length === 1 ? 'animal' : 'animais'}</Text>} />
    </View>
  );

  return (
    <Screen scroll={false} nav>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={app.loading ? [] : feed.pets}
        numColumns={2}
        keyExtractor={pet => pet.id}
        renderItem={({ item }) => <PetCard pet={item} />}
        ListHeaderComponent={head}
        ListFooterComponent={<View style={styles.footer}><Text style={styles.slogan}>Transforme uma espera em um lar.</Text></View>}
        ListEmptyComponent={
          app.loading ? <LoadingState /> : (
            <EmptyState
              icon={app.error ? 'cloud-offline-outline' : 'search-outline'}
              title={app.error ? 'Não conseguimos carregar' : 'Nenhum companheiro por aqui'}
              message={app.error ? 'Tente carregar novamente os dados locais.' : 'Experimente outra região ou limpe os filtros para conhecer mais animais.'}
              action={<Button title={app.error ? 'Tentar novamente' : 'Limpar busca e filtros'} onPress={() => { if (app.error) void app.reload(); else resetAll(); }} />}
            />
          )
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      <FilterPanel visible={filterOpen} filters={filters} pets={feed.basePets} query={feed.query} onClose={() => setFilterOpen(false)} onApply={feed.setFilters} />
      <ProfileMenu visible={menu} onClose={() => setMenu(false)} />
      <Sheet visible={regionOpen} title="Onde você quer adotar?" onClose={() => setRegionOpen(false)}>
        <View style={styles.regionChips}>
          <Chip title="Todo o Distrito Federal" icon="map-outline" selected={!filters.region} onPress={() => pickRegion('')} />
          {regions.map(region => <Chip key={region} title={region} selected={filters.region === region} onPress={() => pickRegion(region)} />)}
        </View>
      </Sheet>
    </Screen>
  );
}

const EDGE = theme.spacing.md;
const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingHorizontal: EDGE - 6, paddingBottom: theme.spacing.lg },
  headerContent: { paddingHorizontal: 6, gap: theme.spacing.md, paddingBottom: theme.spacing.sm, paddingTop: theme.spacing.xs },
  bleed: { marginHorizontal: -EDGE, flexGrow: 0 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  region: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center', minHeight: 48, flexShrink: 1 },
  regionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  regionBody: { flexShrink: 1 },
  regionHint: { color: theme.colors.subtle, fontSize: theme.font.caption, fontFamily: fonts.medium },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regionText: { color: theme.colors.text, fontSize: theme.font.body, fontFamily: fonts.bold, flexShrink: 1 },
  headline: { fontSize: 32, lineHeight: 38, fontFamily: fonts.displayBold, color: theme.colors.text, letterSpacing: -0.8 },
  searchRow: { flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'center' },
  search: { flex: 1, minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, backgroundColor: theme.colors.surface, borderRadius: theme.radius.pill, paddingLeft: theme.spacing.md, paddingRight: theme.spacing.xs, borderWidth: 1.5, borderColor: theme.colors.border },
  searchInput: { flex: 1, minWidth: 0, minHeight: 50, fontSize: theme.font.body, fontFamily: fonts.regular, color: theme.colors.text, includeFontPadding: false },
  filterButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  filterActive: { backgroundColor: theme.colors.primary },
  filterCount: { position: 'absolute', top: -2, right: -2, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.honey, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: theme.colors.background },
  filterCountText: { fontSize: 11, fontFamily: fonts.bold, color: theme.colors.text },
  categories: { paddingHorizontal: EDGE, gap: theme.spacing.md },
  category: { alignItems: 'center', gap: 6, minWidth: 64 },
  categoryIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' },
  categorySelected: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
  emoji: { fontSize: 28 },
  categoryText: { fontSize: theme.font.small, fontFamily: fonts.medium, color: theme.colors.subtle },
  categoryTextSelected: { color: theme.colors.primaryDark, fontFamily: fonts.bold },
  activeRow: { paddingHorizontal: EDGE, gap: theme.spacing.sm, alignItems: 'center' },
  activeChip: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: theme.radius.pill, backgroundColor: theme.colors.primarySoft },
  activeText: { color: theme.colors.primaryDark, fontSize: theme.font.small, fontFamily: fonts.semibold },
  clearAll: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 },
  clearText: { color: theme.colors.subtle, fontSize: theme.font.small, fontFamily: fonts.bold, textDecorationLine: 'underline' },
  rail: { gap: theme.spacing.xs },
  railContent: { paddingHorizontal: EDGE, paddingVertical: theme.spacing.sm, gap: theme.spacing.md - 2 },
  banner: { borderRadius: theme.radius.card + 4, padding: theme.spacing.lg, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, overflow: 'hidden' },
  bannerBody: { flex: 1, gap: 6 },
  bannerTitle: { color: theme.colors.white, fontSize: theme.font.section, lineHeight: 28, fontFamily: fonts.displayBold },
  bannerText: { color: 'rgba(255,255,255,0.86)', fontSize: theme.font.small, fontFamily: fonts.regular, lineHeight: 20 },
  bannerButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.pill, backgroundColor: theme.colors.white, marginTop: theme.spacing.sm },
  bannerButtonText: { color: theme.colors.primaryDark, fontSize: theme.font.small, fontFamily: fonts.bold },
  bannerLogo: { opacity: 0.9 },
  count: { color: theme.colors.subtle, fontSize: theme.font.small, fontFamily: fonts.medium },
  regionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  footer: { padding: theme.spacing.md, gap: theme.spacing.sm, alignItems: 'center' },
  slogan: { color: theme.colors.faint, fontSize: theme.font.small, fontFamily: fonts.display },
  pressed: { opacity: 0.75 },
});
