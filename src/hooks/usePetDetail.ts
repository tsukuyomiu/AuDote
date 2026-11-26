import { useEffect, useState } from 'react';
import { useAdoption } from '../../hooks/useAdoption';
import { adoptionService } from '../services/adoptionService';
import { PublicProfile } from '../types';
export function usePetDetail(id: string) {
  const app = useAdoption();
  const pet = app.data.pets.find(item => item.id === id);
  const [guardian, setGuardian] = useState<PublicProfile | null>(null);
  const [contact, setContact] = useState<string | null>(null);
  const interested = app.data.interests.some(item => item.pet_id === id && item.user_id === app.data.profile?.id);
  useEffect(() => { let active = true; setContact(null); if (pet) { void adoptionService.getPublicGuardian(pet.owner_id).then(value => { if (active) setGuardian(value); }); if (interested && app.data.signedIn) void adoptionService.getContact(id).then(value => { if (active) setContact(value); }).catch(() => { if (active) setContact(null); }); } return () => { active = false; }; }, [pet?.owner_id, id, interested, app.data.profile, app.data.signedIn]);
  return { ...app, pet, guardian, contact, interested };
}
