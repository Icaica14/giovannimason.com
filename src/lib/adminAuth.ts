import { getSupabase } from './supabaseClient';

// Autorizzazione admin dell'app /gestione, in un punto solo.
//
// IMPORTANTE: il confine di sicurezza vero NON è qui. È la RLS di Supabase:
// ogni tabella/bucket consente scrittura solo se public.is_admin() è true
// (migrazione 0013). Questo helper interroga la STESSA verità — la funzione
// SECURITY DEFINER is_admin() lato database — così la UI riflette ciò che la
// RLS comunque impone. Una sessione valida non basta: serve essere un admin
// attivo in public.admin_users.

export type AdminCheck = 'admin' | 'denied' | 'error';

/**
 * L'utente autenticato corrente è un admin attivo?
 * - 'admin'  → autorizzato (in admin_users, is_active = true)
 * - 'denied' → autenticato ma NON autorizzato
 * - 'error'  → impossibile verificare (rete, oppure migrazione 0013 non ancora
 *              applicata). Fail-closed: in caso di dubbio non si concede l'accesso.
 */
export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = getSupabase();
  if (!supabase) return 'error';
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return 'error';
  return data === true ? 'admin' : 'denied';
}
