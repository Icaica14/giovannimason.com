import { useEffect, useState } from 'preact/hooks';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '../../lib/supabaseClient';
import LoginPanel from './LoginPanel';
import BookingsList from './BookingsList';
import ApplicationsList from './ApplicationsList';
import MenuEditor from './MenuEditor';
import EventsEditor from './EventsEditor';

type TabId = 'prenotazioni' | 'candidature' | 'menu' | 'eventi';

const TABS: { id: TabId; label: string }[] = [
  { id: 'prenotazioni', label: 'Prenotazioni' },
  { id: 'candidature', label: 'Candidature' },
  { id: 'menu', label: 'Menu' },
  { id: 'eventi', label: 'Eventi' },
];

/**
 * Radice della dashboard /gestione.
 * - Gate di autenticazione: mostra il login finché non c'è una sessione valida.
 * - Navigazione a tab tra le quattro aree gestionali.
 * - Logout.
 * Tutta l'autorizzazione vera è applicata dalla RLS di Supabase: questa UI è
 * solo comodità, non un confine di sicurezza.
 */
export default function Dashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabId>('prenotazioni');
  const [counts, setCounts] = useState<{ prenotazioni: number; candidature: number }>({
    prenotazioni: 0,
    candidature: 0,
  });

  /** Conta gli inbound non letti per i badge sui tab (query HEAD leggere). */
  async function refreshCounts() {
    const supabase = getSupabase();
    if (!supabase) return;
    const [b, a] = await Promise.all([
      supabase.from('bookings').select('id', { count: 'exact', head: true }).is('read_at', null),
      supabase.from('applications').select('id', { count: 'exact', head: true }).is('read_at', null),
    ]);
    setCounts({ prenotazioni: b.count ?? 0, candidature: a.count ?? 0 });
  }

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session) refreshCounts();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) refreshCounts();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
  }

  if (!ready) {
    return <div class="g-center">Caricamento…</div>;
  }

  if (!session) {
    return <LoginPanel />;
  }

  return (
    <div class="g-wrap">
      <header class="g-header">
        <div class="g-brand">
          Biblio
          <small>Gestione</small>
        </div>
        <div class="g-userbox">
          <span>{session.user.email}</span>
          <button class="g-btn g-btn-ghost g-btn-sm" type="button" onClick={logout}>
            Esci
          </button>
        </div>
      </header>

      <nav class="g-tabs" role="tablist" aria-label="Aree gestionali">
        {TABS.map((t) => {
          const badge =
            t.id === 'prenotazioni' ? counts.prenotazioni : t.id === 'candidature' ? counts.candidature : 0;
          return (
            <button
              key={t.id}
              class="g-tab"
              role="tab"
              type="button"
              aria-selected={tab === t.id ? 'true' : 'false'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {badge > 0 && <span class="g-badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <main class="g-main">
        {tab === 'prenotazioni' && <BookingsList onUnreadChange={refreshCounts} />}
        {tab === 'candidature' && <ApplicationsList />}
        {tab === 'menu' && <MenuEditor />}
        {tab === 'eventi' && <EventsEditor />}
      </main>
    </div>
  );
}
