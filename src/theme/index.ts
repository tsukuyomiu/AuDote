import { Platform, ViewStyle } from 'react-native';

/**
 * Identidade visual AuDote.
 * Verde-folha como cor de confiança, mel como cor de carinho, coral reservado ao coração (favoritar).
 * Títulos em Fraunces (serifada macia, acolhedora) e interface em Inter (legível em telas pequenas).
 */
export const theme = {
  colors: {
    primary: '#3F6B45',
    primaryDark: '#2A4B31',
    primarySoft: '#E3EBD6',
    sage: '#9BAE7E',
    background: '#F6F7F1',
    surface: '#FFFFFF',
    text: '#1B2620',
    subtle: '#5B6657',
    faint: '#8A9485',
    border: '#E1E6D8',
    danger: '#B3372F',
    dangerSoft: '#FBE9E6',
    honey: '#F0A93B',
    honeySoft: '#FCEFD3',
    coral: '#E5604D',
    overlay: 'rgba(16,26,18,0.52)',
    muted: '#EDF0E4',
    white: '#FFFFFF',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radius: { field: 14, card: 20, sheet: 28, pill: 999 },
  font: { caption: 12, small: 14, body: 16, lead: 18, section: 22, title: 30, hero: 40 },
  maxWidth: 480,
};

/** Famílias tipográficas carregadas em app/_layout.tsx. */
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
};

const shadowColor = '#1F3322';
/** Sombras suaves com tom esverdeado, em vez do cinza genérico. */
export const shadow: Record<'card' | 'lift' | 'bar', ViewStyle> = {
  card: Platform.select<ViewStyle>({
    ios: { shadowColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14 },
    android: { elevation: 2 },
    default: { shadowColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14 },
  }) as ViewStyle,
  lift: Platform.select<ViewStyle>({
    ios: { shadowColor, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.16, shadowRadius: 22 },
    android: { elevation: 6 },
    default: { shadowColor, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.16, shadowRadius: 22 },
  }) as ViewStyle,
  bar: Platform.select<ViewStyle>({
    ios: { shadowColor, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.08, shadowRadius: 16 },
    android: { elevation: 10 },
    default: { shadowColor, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.08, shadowRadius: 16 },
  }) as ViewStyle,
};

export const labels = {
  species: { dog: 'Cão', cat: 'Gato', bird: 'Ave' },
  sex: { male: 'Macho', female: 'Fêmea' },
  size: { small: 'Pequeno', medium: 'Médio', large: 'Grande' },
  age: { puppy: 'Filhote', young: 'Jovem', adult: 'Adulto', senior: 'Idoso' },
  status: { available: 'Disponível', adopted: 'Adotado', unavailable: 'Indisponível' },
  traits: { castrated: 'Castrado', vaccinated: 'Vacinado', good_with_dogs: 'Convive com cães', good_with_cats: 'Convive com gatos', affectionate: 'Carinhoso' },
};
export const regions = ['Brasília', 'Ceilândia', 'Taguatinga', 'Guará', 'Gama', 'Lago Sul', 'Samambaia', 'Águas Claras', 'Planaltina'];
export const assets = {
  logoWhite: 'https://cdn-ai.onspace.ai/onspace/files/4ZBRBBnhRXevouHvU33qEa/logo-branca.png',
  logoBlack: 'https://cdn-ai.onspace.ai/onspace/files/BiHRxKRbpyJixa7WSTov53/logo-preta.png',
};
