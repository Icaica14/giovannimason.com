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
 * Sezione "Biblio Truck" della dashboard:
 *  1. Interruttore del CAROSELLO Biblio Truck nella hero della home
 *     (riga `site_settings`, letta a build-time da src/data/siteSettings.ts):
 *     spegnibile d'inverno, riaccendibile in estate.
 *  2. Upload/sostituzione dei due menu PDF (food / drink) nel bucket `menus`.
 */
export default function TruckMenus() {
  const [current, setCurrent] = useState<Current>({ food: null, drink: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Slot | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const inputs = { food: useRef<HTMLInputElement>(null), drink: useRef<HTMLInputElement>(null) };

  // Stato del carosello Truck. null = non ancora caricato; missing = tabella
  // site_settings assente (migrazione 0012 non applicata).
  const [carousel, setCarousel] = useState<boolean | null>(null);
  const [carouselBusy, setCarouselBusy] = useState(false);
  const [carouselMissing, setCarouselMissing] = useState(false);

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

  /** Carica lo stato del carosello dalla riga singola di site_settings. */
  async function loadCarousel() {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase
      .from('site_settings')
      .select('truck_carousel_active')
      .eq('id', 1)
      .maybeSingle();
    if (error) {
      // Tabella assente (migrazione non applicata) o non leggibile.
      setCarouselMissing(true);
      return;
    }
    setCarouselMissing(false);
    setCarousel((data?.truck_carousel_active ?? true) as boolean);
  }

  /** Accende/spegne il carosello e persiste su Supabase (upsert riga id=1). */
  async function toggleCarousel() {
    const supabase = getSupabase();
    if (!supabase || carousel === null || carouselBusy) return;
    const next = !carousel;
    setCarouselBusy(true);
    setMsg(null);
    const { error } = await supabase
      .from('site_settings')
      .upsert({ id: 1, truck_carousel_active: next }, { onConflict: 'id' });
    setCarouselBusy(false);
    if (error) {
      setMsg({ kind: 'err', text: `Salvataggio non riuscito: ${error.message}` });
      return;
    }
    setCarousel(next);
    setMsg({
      kind: 'ok',
      text: next
        ? 'Carosello Biblio Truck attivato: sarà visibile in home al prossimo aggiornamento del sito (~2 min).'
        : 'Carosello Biblio Truck spento: la home mostrerà solo il bar Biblio al prossimo aggiornamento (~2 min).',
    });
  }

  useEffect(() => {
    load();
    loadCarousel();
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

  const carouselDesc = carouselMissing
    ? 'Per gestirlo da qui esegui la migrazione 0012 su Supabase.'
    : carousel === null
      ? 'Caricamento…'
      : carousel
        ? 'Attivo: la home mostra il carosello (bar Biblio + Biblio Truck).'
        : 'Spento: la home mostra solo il bar Biblio, senza carosello.';

  return (
    <section>
      <h2 class="g-h2">Biblio Truck</h2>
      <p class="g-sub">Gestisci il carosello Biblio Truck in home e i menu in PDF della pagina dedicata.</p>

      {msg && <div class={`g-msg ${msg.kind === 'ok' ? 'g-msg-ok' : 'g-msg-err'}`}>{msg.text}</div>}

      {/* 1. Interruttore del carosello in home */}
      <div class="g-setting" style="margin-bottom:1.8rem;">
        <div class="g-setting-text">
          <h3>Carosello Biblio Truck in home</h3>
          <p>{carouselDesc}</p>
        </div>
        <button
          type="button"
          class="g-switch"
          role="switch"
          aria-checked={carousel ? 'true' : 'false'}
          aria-label="Carosello Biblio Truck in home"
          disabled={carousel === null || carouselBusy || carouselMissing}
          onClick={toggleCarousel}
        />
      </div>

      {/* 2. Menu PDF */}
      <h3 class="g-card-title" style="margin:0 0 .15rem;">Menu in PDF</h3>
      <p class="g-sub">Carica un nuovo file per sostituire quello online.</p>

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
