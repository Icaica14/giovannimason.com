import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Client per il BROWSER usato dalla dashboard /gestione: gestisce login,
// sessione persistente e CRUD. Tutta l'autorizzazione è applicata dalla RLS
// lato Supabase sulla sessione autenticata — il bundle espone solo la anon key.

const url = import.meta.env.PUBLIC_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;

export const isConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Singleton del client browser. Restituisce null se Supabase non è configurato. */
export function getSupabase(): SupabaseClient | null {
  if (!isConfigured) return null;
  if (!client) {
    client = createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'biblio-gestione-auth',
      },
    });
  }
  return client;
}
