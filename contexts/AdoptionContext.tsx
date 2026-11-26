import { createContext, ReactNode, useCallback, useEffect, useState } from 'react';
import { adoptionService } from '../src/services/adoptionService';
import { createDemoSnapshot } from '../src/services/demoData';
import { AppSnapshot, PetDraft, Profile } from '../src/types';
type SignupInput = Parameters<typeof adoptionService.signUp>[0];
interface AdoptionContextValue { data: AppSnapshot; loading: boolean; busy: boolean; error: string; clearError: () => void; reload: () => Promise<void>; signIn: (email: string, password: string) => Promise<boolean>; signUp: (input: SignupInput) => Promise<boolean>; signOut: () => Promise<boolean>; updateProfile: (input: Partial<Pick<Profile, 'full_name' | 'display_name' | 'email' | 'phone' | 'address' | 'avatar_url'>>) => Promise<boolean>; toggleFavorite: (id: string) => Promise<boolean>; savePet: (draft: PetDraft, id?: string) => Promise<boolean>; deletePet: (id: string) => Promise<boolean>; registerInterest: (id: string, message: string) => Promise<boolean>; sendCode: (email: string) => Promise<boolean>; verifyCode: (code: string) => Promise<boolean>; resetPassword: (password: string, confirmation: string) => Promise<boolean>; }
export const AdoptionContext = createContext<AdoptionContextValue | undefined>(undefined);
export function AdoptionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppSnapshot>(createDemoSnapshot);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const reload = useCallback(async () => { setLoading(true); setError(''); try { setData(await adoptionService.initialize()); } catch { setError('Não foi possível carregar os dados locais. Tente novamente.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void reload(); }, [reload]);
  const execute = useCallback(async (task: () => Promise<AppSnapshot | void>) => { setBusy(true); setError(''); try { const next = await task(); if (next) setData(next); return true; } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível concluir. Tente novamente.'); return false; } finally { setBusy(false); } }, []);
  return <AdoptionContext.Provider value={{ data, loading, busy, error, clearError: () => setError(''), reload, signIn: (email, password) => execute(() => adoptionService.signIn(email, password)), signUp: input => execute(() => adoptionService.signUp(input)), signOut: () => execute(() => adoptionService.signOut()), updateProfile: input => execute(() => adoptionService.updateProfile(input)), toggleFavorite: id => execute(() => adoptionService.toggleFavorite(id)), savePet: (draft, id) => execute(() => adoptionService.savePet(draft, id)), deletePet: id => execute(() => adoptionService.deletePet(id)), registerInterest: (id, message) => execute(() => adoptionService.registerInterest(id, message)), sendCode: email => execute(() => adoptionService.sendRecoveryCode(email)), verifyCode: code => execute(() => adoptionService.verifyRecoveryCode(code)), resetPassword: (password, confirmation) => execute(() => adoptionService.resetPassword(password, confirmation)) }}>{children}</AdoptionContext.Provider>;
}
