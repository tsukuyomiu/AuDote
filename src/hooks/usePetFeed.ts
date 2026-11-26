import { useMemo, useState } from 'react';
import { useAdoption } from '../../hooks/useAdoption';
import { filterPets } from '../services/adoptionService';
import { emptyFilters, PetFilters } from '../types';
export function usePetFeed(mode: 'feed' | 'favorites' | 'mine' = 'feed') {
  const { data } = useAdoption();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<PetFilters>({ ...emptyFilters, traits: [] });
  const basePets = useMemo(() => mode === 'favorites' ? data.pets.filter(pet => data.favorites.some(item => item.pet_id === pet.id && item.user_id === data.profile?.id)) : mode === 'mine' ? data.pets.filter(pet => pet.owner_id === data.profile?.id) : data.pets, [data, mode]);
  const pets = useMemo(() => filterPets(basePets, query, filters), [basePets, query, filters]);
  return { pets, basePets, query, setQuery, filters, setFilters };
}
