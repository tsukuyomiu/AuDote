import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, ErrorMessage, FormField, ui } from './Base';
import { SelectField } from './SelectField';
import { usePetForm } from '../hooks/usePetForm';
import { fonts, labels, regions, theme } from '../theme';
import { PetDraft, Trait } from '../types';
import { formatPhone } from '../utils/validation';

interface PetFormProps { form: ReturnType<typeof usePetForm>; onSubmit: () => void; onCancel: () => void; editing: boolean; }

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hint ? <Text style={ui.caption}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function PetForm({ form, onSubmit, onCancel, editing }: PetFormProps) {
  const { draft, setField } = form;
  const full = draft.photo_urls.length >= 5;
  return (
    <View style={styles.form}>
      <Text style={ui.caption}>Campos com * são obrigatórios. Apenas região e cidade aparecem no anúncio; nunca informe o endereço exato.</Text>

      <Section title="Fotos do animal *" hint="Até 5 fotos.">
        <View style={styles.photoGrid}>
          {draft.photo_urls.map((url, index) => (
            <View key={`${url}-${index}`} style={styles.photoWrap}>
              <Image source={{ uri: url }} contentFit="cover" transition={200} style={styles.photo} />
              {index === 0 ? <View style={styles.cover}><Text style={styles.coverText}>Capa</Text></View> : null}
              <Pressable accessibilityRole="button" accessibilityLabel={`Remover foto ${index + 1}`} hitSlop={6} onPress={() => form.removePhoto(index)} style={styles.remove}>
                <Ionicons name="close" size={16} color={theme.colors.white} />
              </Pressable>
            </View>
          ))}
          {!full ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Selecionar fotos"
              accessibilityState={{ busy: form.selecting }}
              disabled={form.selecting}
              onPress={() => void form.addPhotos()}
              style={({ pressed }) => [styles.addPhoto, pressed ? styles.pressed : null]}
            >
              {form.selecting ? <ActivityIndicator color={theme.colors.primary} /> : <Ionicons name="camera-outline" size={28} color={theme.colors.primary} />}
              <Text style={styles.addText}>{draft.photo_urls.length ? 'Adicionar' : 'Escolher fotos'}</Text>
            </Pressable>
          ) : null}
        </View>
        {!draft.photo_urls.length ? <Text style={ui.caption}>Uma boa foto ajuda a encontrar um lar.</Text> : null}
        {form.mediaError ? <Text style={styles.error}>{form.mediaError}</Text> : null}
      </Section>

      <Section title="Sobre o animal">
        <FormField label="Nome do animal *" placeholder="Nome" value={draft.name} onChangeText={value => setField('name', value)} />
        <SelectField label="Espécie *" value={draft.species} options={labels.species} onChange={value => setField('species', value as PetDraft['species'])} />
        <FormField label="Raça" placeholder="Ex.: sem raça definida" value={draft.breed} onChangeText={value => setField('breed', value)} />
        <SelectField label="Porte *" value={draft.size} options={labels.size} onChange={value => setField('size', value as PetDraft['size'])} />
        <SelectField label="Sexo *" value={draft.sex} options={labels.sex} onChange={value => setField('sex', value as PetDraft['sex'])} />
        <SelectField label="Faixa de idade *" value={draft.age_group} options={labels.age} onChange={value => setField('age_group', value as PetDraft['age_group'])} />
        <FormField label="Idade aproximada *" placeholder="Ex.: 1 ano, 6 meses" value={draft.age_text} onChangeText={value => setField('age_text', value)} />
      </Section>

      <Section title="Localização e contato">
        <SelectField label="Região *" value={draft.region} options={Object.fromEntries(regions.map(region => [region, region]))} onChange={value => setField('region', value)} />
        <FormField label="Telefone de contato *" icon="call-outline" phone placeholder="(61) 99999-9999" value={formatPhone(draft.contact_phone)} onChangeText={value => setField('contact_phone', value)} />
        <View style={styles.note}>
          <Ionicons name="lock-closed" size={15} color={theme.colors.primaryDark} />
          <Text style={[ui.caption, styles.noteText]}>O contato do anúncio só é revelado após o registro de interesse.</Text>
        </View>
      </Section>

      <Section title="A história dele">
        <FormField label="Biografia *" placeholder="Conte a história e as necessidades do animal." multiline value={draft.description} onChangeText={value => setField('description', value)} />
        <FormField label="Saúde e cuidados" placeholder="Vacinas, castração, tratamentos e cuidados." multiline value={draft.health_notes} onChangeText={value => setField('health_notes', value)} />
        <FormField label="Comportamento" placeholder="Temperamento e adaptação com outros animais." multiline value={draft.behavior} onChangeText={value => setField('behavior', value)} />
      </Section>

      <Section title="Características">
        <View style={ui.wrap}>
          {Object.entries(labels.traits).map(([value, label]) => (
            <Chip key={value} title={label} selected={draft.traits.includes(value as Trait)} onPress={() => form.toggleTrait(value as Trait)} />
          ))}
        </View>
      </Section>

      {editing ? (
        <Section title="Status do anúncio" hint="Animais adotados ou indisponíveis não aceitam novos interesses.">
          <SelectField label="Status do anúncio" value={draft.status} options={labels.status} onChange={value => setField('status', value as PetDraft['status'])} />
        </Section>
      ) : null}

      <ErrorMessage />
      <Button title={editing ? 'Salvar alterações' : 'Publicar animal'} icon={editing ? 'checkmark' : 'paw'} busy={form.busy} onPress={onSubmit} />
      <Button title="Cancelar" ghost onPress={onCancel} />
    </View>
  );
}

const PHOTO = 104;
const styles = StyleSheet.create({
  form: { gap: theme.spacing.md },
  section: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.border, padding: theme.spacing.md, gap: theme.spacing.md },
  sectionHead: { gap: 2 },
  sectionTitle: { fontSize: theme.font.lead, fontFamily: fonts.display, color: theme.colors.text },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  photoWrap: { width: PHOTO, height: PHOTO, borderRadius: theme.radius.field, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  cover: { position: 'absolute', left: 6, bottom: 6, backgroundColor: 'rgba(16,26,18,0.7)', borderRadius: theme.radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  coverText: { color: theme.colors.white, fontSize: 11, fontFamily: fonts.bold },
  remove: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(16,26,18,0.7)', alignItems: 'center', justifyContent: 'center' },
  addPhoto: { width: PHOTO, height: PHOTO, borderRadius: theme.radius.field, borderWidth: 2, borderStyle: 'dashed', borderColor: theme.colors.sage, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6 },
  addText: { color: theme.colors.primaryDark, fontSize: theme.font.caption, fontFamily: fonts.bold, textAlign: 'center' },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.field, padding: theme.spacing.sm + 4 },
  noteText: { flex: 1, color: theme.colors.primaryDark },
  error: { color: theme.colors.danger, fontSize: theme.font.small, fontFamily: fonts.medium },
  pressed: { opacity: 0.7 },
});
