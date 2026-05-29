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

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
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
        {TABS.map((t) => (
          <button
            key={t.id}
            class="g-tab"
            role="tab"
            type="button"
            aria-selected={tab === t.id ? 'true' : 'false'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main class="g-main">
        {tab === 'prenotazioni' && <BookingsList />}
        {tab === 'candidature' && <ApplicationsList />}
        {tab === 'menu' && <MenuEditor />}
        {tab === 'eventi' && <EventsEditor />}
      </main>
    </div>
  );
}
