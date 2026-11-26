import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
const publicUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const publicAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
// Fase 1 usa exclusivamente adoptionService. Este cliente é uma fronteira para as próximas fases.
export const supabase = publicUrl && publicAnonKey ? createClient(publicUrl, publicAnonKey, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } }) : null;
