import { useState } from 'react';
import { useAdoption } from '../../hooks/useAdoption';
import { PetDraft, Trait } from '../types';
import { useMedia } from './useMedia';
export function usePetForm(id?: string) {
  const app = useAdoption(); const media = useMedia(); const pet = app.data.pets.find(item => item.id === id); const contact = app.data.contacts.find(item => item.pet_id === id);
  const [draft, setDraft] = useState<PetDraft>(() => ({ name: pet?.name ?? '', species: pet?.species ?? 'dog', breed: pet?.breed ?? '', sex: pet?.sex ?? 'male', size: pet?.size ?? 'small', age_group: pet?.age_group ?? 'young', age_text: pet?.age_text ?? '', region: pet?.region ?? '', city: pet?.city ?? 'Brasília', description: pet?.description ?? '', health_notes: pet?.health_notes ?? '', behavior: pet?.behavior ?? '', traits: pet?.traits ?? [], photo_urls: pet?.photo_urls ?? [], status: pet?.status ?? 'available', contact_phone: contact?.contact_phone ?? '' }));
  function setField<K extends keyof PetDraft>(key: K, value: PetDraft[K]) { setDraft(current => ({ ...current, [key]: value })); }
  function toggleTrait(trait: Trait) { setDraft(current => ({ ...current, traits: current.traits.includes(trait) ? current.traits.filter(item => item !== trait) : [...current.traits, trait] })); }
  async function addPhotos() { const photos = await media.pick(true); if (photos.length) setDraft(current => ({ ...current, photo_urls: [...current.photo_urls, ...photos].slice(0, 5) })); }
  function removePhoto(index: number) { setDraft(current => ({ ...current, photo_urls: current.photo_urls.filter((_, position) => position !== index) })); }
  return { ...app, ...media, draft, setField, toggleTrait, addPhotos, removePhoto, pet, save: () => app.savePet(draft, id) };
}
