import { useContext } from 'react';
import { AdoptionContext } from '../contexts/AdoptionContext';
export function useAdoption() { const context = useContext(AdoptionContext); if (!context) throw new Error('AdoptionProvider não foi configurado.'); return context; }
