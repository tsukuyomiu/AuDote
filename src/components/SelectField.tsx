import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sheet } from './Base';
import { fonts, theme } from '../theme';

interface SelectFieldProps {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (value: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${options[value] || 'Selecione'}`} onPress={() => setOpen(true)} style={({ pressed }) => [styles.field, pressed ? styles.pressed : null]}>
        <Text style={[styles.value, !options[value] ? styles.placeholder : null]}>{options[value] || 'Selecione'}</Text>
        <Ionicons name="chevron-down" size={18} color={theme.colors.subtle} />
      </Pressable>
      <Sheet visible={open} title={label.replace(' *', '')} onClose={() => setOpen(false)}>
        <View style={styles.options}>
          {Object.entries(options).map(([key, text]) => {
            const selected = value === key;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => { onChange(key); setOpen(false); }}
                style={({ pressed }) => [styles.option, selected ? styles.selected : null, pressed ? styles.pressed : null]}
              >
                <Text style={[styles.optionText, selected ? styles.optionTextSelected : null]}>{text}</Text>
                {selected ? <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: theme.font.small, color: theme.colors.text, fontFamily: fonts.semibold },
  field: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.md, borderRadius: theme.radius.field, borderWidth: 1.5, borderColor: theme.colors.border, gap: theme.spacing.sm },
  value: { fontSize: theme.font.body, fontFamily: fonts.regular, color: theme.colors.text, flex: 1 },
  placeholder: { color: theme.colors.faint },
  options: { gap: 6 },
  option: { minHeight: 52, paddingHorizontal: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: theme.radius.field, backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border },
  selected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
  optionText: { fontSize: theme.font.body, fontFamily: fonts.medium, color: theme.colors.text },
  optionTextSelected: { fontFamily: fonts.bold, color: theme.colors.primaryDark },
  pressed: { opacity: 0.7 },
});
