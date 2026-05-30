import { useEffect, useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';

/** Riga prenotazione come arriva da Supabase. */
type Booking = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  booking_date: string; // YYYY-MM-DD
  booking_time: string;
  guests: string;
  note: string | null;
  event_label: string | null;
  lang: string;
  read_at: string | null; // NULL = non letta → pallino
  status: string;
  created_at: string;
};

const fmtDate = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
};

const fmtReceived = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) +
    ' · ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Numero in formato wa.me: solo cifre, con prefisso internazionale.
 * Gestisce "+39 333…", "0039 333…" e numeri italiani senza prefisso ("333…").
 * Ritorna null se non sembra un numero valido (in tal caso niente bottone WhatsApp).
 */
const waNumber = (raw: string | null): string | null => {
  if (!raw) return null;
  let d = raw.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (/^3\d{8,9}$/.test(d)) d = '39' + d; // cellulare IT senza prefisso
  return d.length >= 8 ? d : null;
};

/** Link "Rispondi su WhatsApp" con messaggio precompilato, o null se manca il numero. */
const waLink = (b: Booking): string | null => {
  const num = waNumber(b.phone);
  if (!num) return null;
  const nome = (b.name || '').trim().split(/\s+/)[0] || '';
  const msg =
    `Ciao ${nome}, grazie per la richiesta di prenotazione al Biblio ` +
    `per ${fmtDate(b.booking_date)} alle ${b.booking_time} (${b.guests} persone). `;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
};

export default function BookingsList({ onUnreadChange }: { onUnreadChange?: () => void }) {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Booking | null>(null);

  async function load() {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setError('Impossibile caricare le prenotazioni.');
      return;
    }
    setRows((data as Booking[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    const now = new Date().toISOString();
    setRows((prev) => prev.map((r) => (r.id === id && !r.read_at ? { ...r, read_at: now } : r)));
    await supabase.from('bookings').update({ read_at: now, status: 'read' }).eq('id', id);
    onUnreadChange?.();
  }

  function openCard(b: Booking) {
    setSelected(b);
    if (!b.read_at) markRead(b.id);
  }

  async function remove(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!confirm('Eliminare questa prenotazione? L’azione è definitiva.')) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
    await supabase.from('bookings').delete().eq('id', id);
    onUnreadChange?.();
  }

  const unread = rows.filter((r) => !r.read_at).length;

  return (
    <section>
      <h2 class="g-h2">Prenotazioni</h2>
      <p class="g-sub">
        {rows.length === 0
          ? 'Le richieste di prenotazione dal sito appariranno qui.'
          : `${rows.length} richieste · ${unread} da leggere`}
      </p>

      {error && <div class="g-msg g-msg-err">{error}</div>}
      {loading && <div class="g-center">Caricamento…</div>}

      {!loading && rows.length === 0 && !error && (
        <div class="g-empty">Nessuna prenotazione per ora.</div>
      )}

      <div class="g-cards">
        {rows.map((b) => (
          <article
            key={b.id}
            class={`g-card${b.read_at ? '' : ' is-unread'}`}
            onClick={() => openCard(b)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCard(b);
              }
            }}
          >
            {!b.read_at && <span class="g-dot" aria-label="Non letta" />}
            <h3 class="g-card-title">{b.name}</h3>
            <div class="g-card-meta">
              <span>{fmtDate(b.booking_date)}</span>
              <span>ore {b.booking_time}</span>
              <span>{b.guests} pers</span>
            </div>
            {b.event_label && (
              <div class="g-chiprow">
                <span class="g-chip">{b.event_label}</span>
              </div>
            )}
          </article>
        ))}
      </div>

      {selected && (
        <div class="g-overlay" onClick={() => setSelected(null)}>
          <div class="g-drawer" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.name}</h3>
            <p class="g-sub">Ricevuta il {fmtReceived(selected.created_at)}</p>

            <dl class="g-dl">
              <dt>Data</dt>
              <dd>{fmtDate(selected.booking_date)}</dd>
              <dt>Ora</dt>
              <dd>{selected.booking_time}</dd>
              <dt>Persone</dt>
              <dd>{selected.guests}</dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
              </dd>
              {selected.phone && (
                <>
                  <dt>Telefono</dt>
                  <dd>
                    <a href={`tel:${selected.phone}`}>{selected.phone}</a>
                  </dd>
                </>
              )}
              {selected.event_label && (
                <>
                  <dt>Serata</dt>
                  <dd>{selected.event_label}</dd>
                </>
              )}
              {selected.note && (
                <>
                  <dt>Note</dt>
                  <dd>{selected.note}</dd>
                </>
              )}
            </dl>

            <div class="g-drawer-actions">
              {waLink(selected) ? (
                <a
                  class="g-btn g-btn-wa"
                  href={waLink(selected)!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Rispondi su WhatsApp
                </a>
              ) : (
                <a class="g-btn" href={`mailto:${selected.email}`}>
                  Rispondi via email
                </a>
              )}
              <button class="g-btn g-btn-danger" type="button" onClick={() => remove(selected.id)}>
                Elimina
              </button>
              <button class="g-btn g-btn-ghost" type="button" onClick={() => setSelected(null)}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
