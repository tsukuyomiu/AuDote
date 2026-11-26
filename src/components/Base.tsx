import { ComponentProps, memo, ReactNode, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { assets, fonts, shadow, theme } from '../theme';
import { useAdoption } from '../../hooks/useAdoption';
import { formatPhone } from '../utils/validation';
import { BottomNav } from './BottomNav';

type IconName = ComponentProps<typeof Ionicons>['name'];

/* ───────────────────────────── Botões ───────────────────────────── */

interface ButtonProps {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  /** Botão discreto, sem fundo. */
  ghost?: boolean;
  /** Ação destrutiva (ex.: sair). */
  danger?: boolean;
  disabled?: boolean;
  busy?: boolean;
  icon?: IconName;
  /** Fundo claro sobre superfícies escuras (hero e telas de marca). */
  onDark?: boolean;
}

export const Button = memo(function Button({ title, onPress, secondary = false, ghost = false, danger = false, disabled = false, busy = false, icon, onDark = false }: ButtonProps) {
  const filled = !secondary && !ghost && !danger;
  const textColor = filled ? theme.colors.white : danger ? theme.colors.danger : onDark ? theme.colors.white : theme.colors.primaryDark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        filled ? [styles.buttonFilled, shadow.card] : null,
        secondary ? (onDark ? styles.buttonOnDark : styles.buttonSecondary) : null,
        ghost ? styles.buttonGhost : null,
        danger ? styles.buttonDanger : null,
        disabled || busy ? styles.disabled : null,
        pressed ? styles.pressed : null,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={ui.row}>
          {icon ? <Ionicons name={icon} size={19} color={textColor} /> : null}
          <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
});

interface IconButtonProps {
  name: IconName;
  onPress: () => void;
  label: string;
  color?: string;
  /** Círculo com fundo, ideal para ações flutuantes. */
  filled?: boolean;
  badge?: boolean;
}

export const IconButton = memo(function IconButton({ name, onPress, label, color = theme.colors.text, filled = false, badge = false }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, filled ? [styles.iconFilled, shadow.card] : null, pressed ? styles.pressed : null]}
    >
      <Ionicons name={name} size={filled ? 22 : 25} color={color} />
      {badge ? <View style={styles.badge} /> : null}
    </Pressable>
  );
});

/* ───────────────────────────── Campos ───────────────────────────── */

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: IconName;
  password?: boolean;
  /** Mantido por compatibilidade: todos os campos agora usam fundo claro. */
  white?: boolean;
  /** Campo de telefone: aplica a máscara (DDD) 99999-9999 enquanto digita. */
  phone?: boolean;
}

export function FormField({ label, icon, password = false, phone = false, white: _white = false, onFocus, onBlur, onChangeText, ...props }: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, props.multiline ? styles.fieldMultiline : null, focused ? styles.fieldFocused : null]}>
        {icon ? <Ionicons name={icon} size={19} color={focused ? theme.colors.primary : theme.colors.faint} /> : null}
        <TextInput
          placeholderTextColor={theme.colors.faint}
          autoComplete="off"
          {...(phone ? { keyboardType: 'phone-pad' as const, autoComplete: 'tel' as const, textContentType: 'telephoneNumber' as const, maxLength: 15 } : null)}
          {...props}
          onChangeText={phone && onChangeText ? text => onChangeText(formatPhone(text)) : onChangeText}
          accessibilityLabel={label}
          secureTextEntry={password && !visible}
          onFocus={event => { setFocused(true); onFocus?.(event); }}
          onBlur={event => { setFocused(false); onBlur?.(event); }}
          style={[styles.input, props.multiline ? styles.multiline : null, props.style]}
        />
        {password ? <IconButton name={visible ? 'eye-off-outline' : 'eye-outline'} color={theme.colors.subtle} label={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisible(!visible)} /> : null}
      </View>
    </View>
  );
}

interface ChipProps {
  title: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** Tag compacta sobre fundo escuro (usada sobre fotos). */
  tone?: 'default' | 'honey' | 'warn';
}

export const Chip = memo(function Chip({ title, selected = false, onPress, icon, tone = 'default' }: ChipProps) {
  const iconColor = selected ? theme.colors.white : theme.colors.primaryDark;
  if (!onPress) {
    return (
      <View style={[styles.tag, tone === 'honey' ? styles.tagHoney : null, tone === 'warn' ? styles.tagWarn : null]}>
        {icon ? <Ionicons name={icon} size={14} color={tone === 'warn' ? theme.colors.danger : theme.colors.primaryDark} /> : null}
        <Text style={[styles.tagText, tone === 'warn' ? { color: theme.colors.danger } : null]}>{title}</Text>
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected ? styles.selectedChip : null, pressed ? styles.pressed : null]}
    >
      {icon ? <Ionicons name={icon} size={17} color={iconColor} /> : null}
      <Text style={[styles.chipText, selected ? styles.selectedText : null]}>{title}</Text>
    </Pressable>
  );
});

/* ───────────────────────────── Estrutura de tela ───────────────────────────── */

interface ScreenProps {
  children: ReactNode;
  /** Fundo verde da marca (abertura, login e cadastro). */
  green?: boolean;
  scroll?: boolean;
  /** Mostra a barra de navegação inferior. */
  nav?: boolean;
  /** Conteúdo começa sob a barra de status (galerias de foto). */
  bleed?: boolean;
  /** Conteúdo preso abaixo da área rolável (ex.: botão fixo). */
  footer?: ReactNode;
}

export function Screen({ children, green = false, scroll = true, nav = false, bleed = false, footer }: ScreenProps) {
  const edges = bleed ? (nav ? [] : ['bottom' as const]) : nav ? ['top' as const] : ['top' as const, 'bottom' as const];
  return (
    <SafeAreaView edges={edges} style={[styles.screen, green ? styles.green : null]}>
      <StatusBar style={green ? 'light' : 'dark'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {scroll ? (
          <ScrollView style={styles.flex} contentContainerStyle={[styles.content, nav ? styles.contentWithNav : null]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          children
        )}
      </KeyboardAvoidingView>
      {footer}
      {nav ? <BottomNav /> : null}
    </SafeAreaView>
  );
}

interface HeaderProps {
  title?: string;
  back?: boolean;
  right?: ReactNode;
}

export function Header({ title, back = true, right }: HeaderProps) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      {back ? <IconButton filled name="arrow-back" label="Voltar" onPress={() => (router.canGoBack() ? router.back() : router.replace('/feed'))} /> : <View style={styles.iconButton} />}
      <Text numberOfLines={1} style={styles.headerTitle}>{title ?? 'AuDote!'}</Text>
      {right ?? <IconButton filled name="home-outline" label="Ir para início" onPress={() => router.replace('/feed')} />}
    </View>
  );
}

interface LogoProps {
  white?: boolean;
  size?: number;
  /** Oculta o nome ao lado, mostrando só o símbolo. */
  mark?: boolean;
  /** Nome em linha ao lado do símbolo. */
  inline?: boolean;
}

export function Logo({ white = false, size = 100, mark = false, inline = false }: LogoProps) {
  return (
    <View style={[styles.logo, inline ? styles.logoInline : null]}>
      <Image source={{ uri: white ? assets.logoWhite : assets.logoBlack }} style={{ width: size, height: size }} contentFit="contain" transition={200} accessibilityLabel="Logo AuDote, cão e gato" />
      {mark ? null : <Text style={[styles.brand, inline ? { fontSize: size * 0.5 } : null, white ? styles.whiteText : null]}>AuDote!</Text>}
    </View>
  );
}

/* ───────────────────────────── Sheet (painel inferior) ───────────────────────────── */

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Área fixa na base do painel (botões principais). */
  footer?: ReactNode;
}

export function Sheet({ visible, title, onClose, children, footer }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Fechar painel" accessibilityRole="button" style={styles.scrim} onPress={onClose} />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{title}</Text>
              <IconButton name="close" color={theme.colors.subtle} label="Fechar" onPress={onClose} />
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              {children}
            </ScrollView>
            {footer ? <View style={styles.sheetFooter}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

/* ───────────────────────────── Estados: vazio, carregando, erro ───────────────────────────── */

interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
  icon?: IconName;
}

export const EmptyState = memo(function EmptyState({ title, message, action, icon = 'paw' }: EmptyStateProps) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={34} color={theme.colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.description}>{message}</Text>
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
});

/** Bloco que pulsa suavemente enquanto o conteúdo carrega. */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.55)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.55, duration: 700, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[styles.skeleton, style, { opacity }]} />;
}

export function LoadingState() {
  return (
    <View style={styles.loading} accessibilityRole="progressbar" accessibilityLabel="Carregando animais">
      <View style={styles.skeletonRow}>
        {[0, 1].map(item => (
          <View key={item} style={styles.skeletonCard}>
            <Skeleton style={styles.skeletonImage} />
            <Skeleton style={styles.skeletonLine} />
            <Skeleton style={[styles.skeletonLine, { width: '60%' }]} />
          </View>
        ))}
      </View>
      <Text style={styles.description}>Preparando novos encontros...</Text>
    </View>
  );
}

export function ErrorMessage() {
  const { error, clearError } = useAdoption();
  return error ? (
    <Pressable accessibilityRole="alert" accessibilityLabel={`${error}. Toque para fechar.`} onPress={clearError} style={styles.error}>
      <Ionicons name="alert-circle" color={theme.colors.danger} size={20} />
      <Text style={styles.errorText}>{error}</Text>
      <Ionicons name="close" color={theme.colors.danger} size={18} />
    </Pressable>
  ) : null;
}

/** Título de seção com ação opcional à direita. */
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

/** Linha de lista tocável com ícone (perfil e atalhos). */
export function ListRow({ icon, title, subtitle, onPress, accessibilityLabel }: { icon: IconName; title: string; subtitle?: string; onPress: () => void; accessibilityLabel?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title} onPress={onPress} style={({ pressed }) => [styles.listRow, pressed ? styles.rowPressed : null]}>
      <View style={styles.listIcon}>
        <Ionicons name={icon} size={20} color={theme.colors.primaryDark} />
      </View>
      <View style={styles.listText}>
        <Text numberOfLines={1} style={styles.listTitle}>{title}</Text>
        {subtitle ? <Text numberOfLines={1} style={ui.caption}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.faint} />
    </Pressable>
  );
}

/* ───────────────────────────── Estilos compartilhados ───────────────────────────── */

export const ui = StyleSheet.create({
  title: { fontSize: theme.font.title, fontFamily: fonts.display, color: theme.colors.text, includeFontPadding: false, letterSpacing: -0.4, lineHeight: 38 },
  section: { fontSize: theme.font.lead, fontFamily: fonts.bold, color: theme.colors.text },
  body: { fontSize: theme.font.body, fontFamily: fonts.regular, color: theme.colors.subtle, lineHeight: 25 },
  caption: { fontSize: theme.font.small, fontFamily: fonts.regular, color: theme.colors.subtle, lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  block: { gap: theme.spacing.md },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, padding: theme.spacing.lg, gap: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border },
  link: { color: theme.colors.primaryDark, fontFamily: fonts.bold, fontSize: theme.font.small, paddingVertical: theme.spacing.md, textAlign: 'center' },
  spacer: { height: theme.spacing.lg },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: theme.colors.background },
  green: { backgroundColor: theme.colors.primaryDark },
  content: { padding: theme.spacing.md, gap: theme.spacing.md, paddingBottom: theme.spacing.xl },
  contentWithNav: { paddingBottom: theme.spacing.lg },

  button: { minHeight: 52, borderRadius: theme.radius.pill, justifyContent: 'center', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm },
  buttonFilled: { backgroundColor: theme.colors.primary },
  buttonSecondary: { backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border },
  buttonOnDark: { backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
  buttonGhost: { backgroundColor: 'transparent', minHeight: 44 },
  buttonDanger: { backgroundColor: theme.colors.dangerSoft, borderWidth: 1.5, borderColor: '#F0C8C2' },
  buttonText: { fontSize: theme.font.body, fontFamily: fonts.bold },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  rowPressed: { backgroundColor: theme.colors.muted },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  iconFilled: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  badge: { position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: 5, backgroundColor: theme.colors.coral, borderWidth: 1.5, borderColor: theme.colors.surface },

  fieldWrap: { gap: 6 },
  label: { color: theme.colors.text, fontSize: theme.font.small, fontFamily: fonts.semibold },
  field: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.field, borderWidth: 1.5, borderColor: theme.colors.border, paddingHorizontal: theme.spacing.md, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, minHeight: 52 },
  fieldMultiline: { alignItems: 'flex-start', paddingTop: 2 },
  fieldFocused: { borderColor: theme.colors.primary, backgroundColor: theme.colors.white },
  input: { flex: 1, minWidth: 0, minHeight: 48, fontSize: theme.font.body, fontFamily: fonts.regular, color: theme.colors.text, paddingVertical: theme.spacing.sm, includeFontPadding: false, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null) },
  multiline: { minHeight: 112, textAlignVertical: 'top', lineHeight: 24, paddingTop: 12 },

  chip: { minHeight: 44, borderRadius: theme.radius.pill, paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
  selectedChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text, fontSize: theme.font.small, fontFamily: fonts.semibold },
  selectedText: { color: theme.colors.white },
  tag: { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tagHoney: { backgroundColor: theme.colors.honeySoft },
  tagWarn: { backgroundColor: theme.colors.dangerSoft },
  tagText: { fontSize: theme.font.small, fontFamily: fonts.semibold, color: theme.colors.primaryDark },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, gap: theme.spacing.sm },
  headerTitle: { fontSize: theme.font.lead, color: theme.colors.text, fontFamily: fonts.display, flex: 1, textAlign: 'center' },
  logo: { alignItems: 'center', gap: theme.spacing.sm },
  logoInline: { flexDirection: 'row', gap: theme.spacing.xs },
  brand: { fontSize: theme.font.hero, fontFamily: fonts.displayBold, color: theme.colors.text, letterSpacing: -1 },
  whiteText: { color: theme.colors.white },

  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.overlay },
  modalContainer: { width: '100%', maxWidth: theme.maxWidth, maxHeight: '92%' },
  sheet: { backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.sheet, borderTopRightRadius: theme.radius.sheet, paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.sm, flexShrink: 1 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: theme.colors.border, marginBottom: theme.spacing.xs },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: theme.spacing.sm },
  sheetTitle: { fontSize: theme.font.section, fontFamily: fonts.display, color: theme.colors.text, flexShrink: 1 },
  sheetContent: { gap: theme.spacing.md, paddingBottom: theme.spacing.md, paddingTop: theme.spacing.xs },
  sheetFooter: { gap: theme.spacing.sm, paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border },

  empty: { paddingVertical: theme.spacing.xl, paddingHorizontal: theme.spacing.lg, alignItems: 'center', gap: theme.spacing.sm },
  emptyIcon: { width: 76, height: 76, borderRadius: 38, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.xs },
  emptyTitle: { fontSize: theme.font.section, fontFamily: fonts.display, color: theme.colors.text, textAlign: 'center' },
  emptyAction: { alignSelf: 'stretch', marginTop: theme.spacing.sm },
  description: { color: theme.colors.subtle, fontSize: theme.font.body, fontFamily: fonts.regular, lineHeight: 24, textAlign: 'center' },
  loading: { paddingHorizontal: theme.spacing.xs, paddingTop: theme.spacing.sm, gap: theme.spacing.md },
  skeletonRow: { flexDirection: 'row', gap: theme.spacing.md },
  skeletonCard: { flex: 1, gap: theme.spacing.sm },
  skeleton: { backgroundColor: theme.colors.muted, borderRadius: theme.radius.field },
  skeletonImage: { width: '100%', aspectRatio: 0.82, borderRadius: theme.radius.card },
  skeletonLine: { height: 14, width: '85%' },

  error: { backgroundColor: theme.colors.dangerSoft, padding: theme.spacing.md, borderRadius: theme.radius.field, flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, borderWidth: 1, borderColor: '#F0C8C2' },
  errorText: { color: theme.colors.danger, flex: 1, fontSize: theme.font.small, fontFamily: fonts.medium, lineHeight: 20 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm },
  sectionTitle: { fontSize: theme.font.section, fontFamily: fonts.display, color: theme.colors.text, letterSpacing: -0.2 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, minHeight: 64, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm },
  listIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  listText: { flex: 1, gap: 1 },
  listTitle: { fontSize: theme.font.body, fontFamily: fonts.semibold, color: theme.colors.text },
});
