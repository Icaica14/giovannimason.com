import { useEffect, useRef, useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';

// Bucket pubblico con chiavi stabili: sostituendo il file, il link sul sito
// (pagina Biblio Truck) punta sempre allo stesso URL ma serve il nuovo PDF.
const BUCKET = 'menus';
const MAX_MB = 20;

type Slot = 'food' | 'drink';
const SLOTS: { id: Slot; key: string; label: string }[] = [
  { id: 'food', key: 'food.pdf', label: 'Il nostro food' },
  { id: 'drink', key: 'drink.pdf', label: 'I nostri drink' },
];

type Current = { food: string | null; drink: string | null };

/**
 * Sezione "Biblio Truck" della dashboard: carica/sostituisce i due menu PDF
 * (food / drink) nel bucket pubblico `menus`. La pagina pubblica li legge a
 * build-time (src/data/truckMenus.ts) con fallback ai PDF del repo.
 */
export default function TruckMenus() {
  const [current, setCurrent] = useState<Current>({ food: null, drink: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Slot | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const inputs = { food: useRef<HTMLInputElement>(null), drink: useRef<HTMLInputElement>(null) };

  async function load() {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 100 });
    setLoading(false);
    if (error) {
      // Bucket non ancora creato: lo segnaliamo senza rompere la UI.
      setMsg({ kind: 'err', text: 'Bucket "menus" non trovato. Esegui la migrazione 0008 su Supabase.' });
      return;
    }
    const byName = new Map((data ?? []).map((f) => [f.name, f] as const));
    const urlOf = (key: string, updatedAt?: string | null) => {
      const base = supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
      return updatedAt ? `${base}?v=${encodeURIComponent(updatedAt)}` : base;
    };
    setCurrent({
      food: byName.has('food.pdf') ? urlOf('food.pdf', byName.get('food.pdf')?.updated_at) : null,
      drink: byName.has('drink.pdf') ? urlOf('drink.pdf', byName.get('drink.pdf')?.updated_at) : null,
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function upload(slot: Slot, key: string, file: File) {
    const supabase = getSupabase();
    if (!supabase) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setMsg({ kind: 'err', text: 'Il file deve essere un PDF.' });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setMsg({ kind: 'err', text: `Il PDF supera i ${MAX_MB}MB.` });
      return;
    }

    setBusy(slot);
    setMsg(null);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(key, file, { upsert: true, contentType: 'application/pdf' });
    setBusy(null);

    if (error) {
      setMsg({ kind: 'err', text: `Caricamento non riuscito: ${error.message}` });
      return;
    }
    if (inputs[slot].current) inputs[slot].current!.value = '';
    setMsg({ kind: 'ok', text: 'Menu aggiornato. Sarà online al prossimo aggiornamento del sito.' });
    load();
  }

  return (
    <section>
      <h2 class="g-h2">Biblio Truck</h2>
      <p class="g-sub">
        I menu in PDF della pagina “Biblio Truck”. Carica un nuovo file per sostituire quello online.
      </p>

      {msg && <div class={`g-msg ${msg.kind === 'ok' ? 'g-msg-ok' : 'g-msg-err'}`}>{msg.text}</div>}
      {loading && <div class="g-center">Caricamento…</div>}

      {!loading && (
        <div class="g-cards">
          {SLOTS.map((s) => (
            <article key={s.id} class="g-card">
              <h3 class="g-card-title">{s.label}</h3>
              <div class="g-card-meta">
                {current[s.id] ? (
                  <a href={current[s.id]!} target="_blank" rel="noopener noreferrer">
                    Vedi il PDF attuale →
                  </a>
                ) : (
                  <span>Nessun PDF caricato (è in uso quello di default).</span>
                )}
              </div>

              <div class="g-field" style="margin-top:.8rem;margin-bottom:0;">
                <label for={`truck-${s.id}`}>Sostituisci con un nuovo PDF</label>
                <input
                  ref={inputs[s.id]}
                  id={`truck-${s.id}`}
                  class="g-input"
                  type="file"
                  accept="application/pdf"
                  disabled={busy === s.id}
                  onChange={(e) => {
                    const f = (e.currentTarget as HTMLInputElement).files?.[0];
                    if (f) upload(s.id, s.key, f);
                  }}
                />
                {busy === s.id && <small style="color:var(--ink-mute);">Caricamento in corso…</small>}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
