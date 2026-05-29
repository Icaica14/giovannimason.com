import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Client ANONIMO per le LETTURE a build-time (eventi, menu) e per gli invii dei
// form pubblici. La anon key è pubblica per design: il confine di sicurezza è la
// RLS lato Postgres, non la segretezza di questa chiave.
//
// Se le variabili non sono configurate (es. build prima dell'attivazione di
// Supabase) `supabasePublic` resta null, così gli adapter possono fare FALLBACK
// alla fonte dati attuale (src/data/menu.ts, content collection eventi) e il
// sito continua a buildare e funzionare.

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabasePublic: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
