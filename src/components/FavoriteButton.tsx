import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { shadow, theme } from '../theme';

interface FavoriteButtonProps {
  name: string;
  favorite: boolean;
  disabled?: boolean;
  onPress: () => void;
  size?: number;
}

/** Coração sobre a foto: faz um pequeno "pulo" ao favoritar e dá retorno tátil. */
export function FavoriteButton({ name, favorite, disabled = false, onPress, size = 40 }: FavoriteButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (favorite) Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, speed: 40, bounciness: 14 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
  }, [favorite, scale]);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={favorite ? `Remover ${name} dos favoritos` : `Favoritar ${name}`}
      accessibilityState={{ selected: favorite }}
      disabled={disabled}
      hitSlop={6}
      onPress={() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined); onPress(); }}
      style={[styles.button, shadow.card, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={size * 0.52} color={favorite ? theme.colors.coral : theme.colors.text} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({ button: { backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' } });
