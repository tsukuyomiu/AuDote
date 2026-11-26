import { useMemo } from 'react';
import { filterPets } from '../services/adoptionService';
import { Pet, PetFilters } from '../types';
export function useFilterPreview(pets: Pet[], query: string, filters: PetFilters) { return useMemo(() => filterPets(pets, query, filters).length, [pets, query, filters]); }
