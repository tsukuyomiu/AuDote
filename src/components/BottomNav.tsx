import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdoption } from '../../hooks/useAdoption';
import { fonts, shadow, theme } from '../theme';

type IconName = ComponentProps<typeof Ionicons>['name'];
type Route = '/feed' | '/favorites' | '/my-pets' | '/profile';

const tabs: Array<{ route: Route; label: string; icon: IconName; active: IconName }> = [
  { route: '/feed', label: 'Início', icon: 'compass-outline', active: 'compass' },
  { route: '/favorites', label: 'Favoritos', icon: 'heart-outline', active: 'heart' },
  { route: '/my-pets', label: 'Meus animais', icon: 'paw-outline', active: 'paw' },
  { route: '/profile', label: 'Perfil', icon: 'person-outline', active: 'person' },
];

/** Barra de navegação inferior das telas principais. As rotas são as mesmas já existentes no app. */
export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { data } = useAdoption();
  const renderTab = (tab: (typeof tabs)[number]) => {
    const active = pathname === tab.route;
    return (
      <Pressable
        key={tab.route}
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
        onPress={() => { if (!active) router.replace(tab.route); }}
        style={({ pressed }) => [styles.tab, pressed ? styles.pressed : null]}
      >
        <View style={[styles.pill, active ? styles.pillActive : null]}>
          <Ionicons name={active ? tab.active : tab.icon} size={22} color={active ? theme.colors.primaryDark : theme.colors.faint} />
        </View>
        <Text numberOfLines={1} style={[styles.label, active ? styles.labelActive : null]}>{tab.label}</Text>
      </Pressable>
    );
  };
  return (
    <View style={[styles.bar, shadow.bar, { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) }]} accessibilityRole="tablist">
      {tabs.slice(0, 2).map(renderTab)}
      <View style={styles.fabSlot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cadastrar animal"
          onPress={() => router.push(data.signedIn ? '/publish' : '/login')}
          style={({ pressed }) => [styles.fab, shadow.lift, pressed ? styles.fabPressed : null]}
        >
          <Ionicons name="add" size={30} color={theme.colors.white} />
        </Pressable>
      </View>
      {tabs.slice(2).map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.spacing.sm, paddingHorizontal: theme.spacing.xs },
  tab: { flex: 1, alignItems: 'center', gap: 2, minHeight: 52 },
  pill: { width: 56, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: theme.colors.primarySoft },
  label: { fontSize: 11, fontFamily: fonts.medium, color: theme.colors.faint },
  labelActive: { color: theme.colors.primaryDark, fontFamily: fonts.bold },
  fabSlot: { width: 72, alignItems: 'center' },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: -26, borderWidth: 4, borderColor: theme.colors.surface },
  fabPressed: { transform: [{ scale: 0.94 }] },
  pressed: { opacity: 0.7 },
});
