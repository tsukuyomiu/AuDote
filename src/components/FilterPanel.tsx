import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Chip, Sheet, ui } from './Base';
import { emptyFilters, Pet, PetFilters, Trait } from '../types';
import { labels, regions } from '../theme';
import { useFilterPreview } from '../hooks/useFilterPreview';

interface FilterPanelProps {
  visible: boolean;
  filters: PetFilters;
  pets: Pet[];
  query: string;
  onClose: () => void;
  onApply: (filters: PetFilters) => void;
}

export function FilterPanel({ visible, filters, pets, query, onClose, onApply }: FilterPanelProps) {
  const [draft, setDraft] = useState<PetFilters>(filters);
  useEffect(() => { if (visible) setDraft({ ...filters, traits: [...filters.traits] }); }, [visible, filters]);
  const count = useFilterPreview(pets, query, draft);
  const group = (title: string, key: 'species' | 'age_group' | 'sex' | 'size' | 'region', options: Record<string, string>) => (
    <View style={ui.block}>
      <Text style={ui.section}>{title}</Text>
      <View style={ui.wrap}>
        <Chip title="Todos" selected={!draft[key]} onPress={() => setDraft({ ...draft, [key]: '' })} />
        {Object.entries(options).map(([value, label]) => (
          <Chip key={value} title={label} selected={draft[key] === value} onPress={() => setDraft({ ...draft, [key]: value })} />
        ))}
      </View>
    </View>
  );
  return (
    <Sheet
      visible={visible}
      title="Filtros"
      onClose={onClose}
      footer={
        <>
          <Button title={`Ver ${count} ${count === 1 ? 'animal' : 'animais'}`} onPress={() => { onApply(draft); onClose(); }} />
          <Button title="Limpar filtros" ghost onPress={() => setDraft({ ...emptyFilters, traits: [] })} />
        </>
      }
    >
      {group('Espécie', 'species', labels.species)}
      {group('Idade', 'age_group', labels.age)}
      {group('Sexo', 'sex', labels.sex)}
      {group('Porte', 'size', labels.size)}
      {group('Localização', 'region', Object.fromEntries(regions.map(region => [region, region])))}
      <View style={ui.block}>
        <Text style={ui.section}>Características</Text>
        <View style={ui.wrap}>
          {Object.entries(labels.traits).map(([value, label]) => (
            <Chip
              key={value}
              title={label}
              selected={draft.traits.includes(value as Trait)}
              onPress={() => setDraft({ ...draft, traits: draft.traits.includes(value as Trait) ? draft.traits.filter(trait => trait !== value) : [...draft.traits, value as Trait] })}
            />
          ))}
        </View>
      </View>
    </Sheet>
  );
}
