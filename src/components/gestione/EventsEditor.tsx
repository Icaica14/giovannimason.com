import { useEffect, useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';
import { genreLabel, venueLabel, VENUE_DEFAULT } from '../../data/eventi';

/** Riga evento come arriva da Supabase. */
type EventRow = {
  id: string;
  artist: string;
  date: string;
  time: string;
  genre: string;
  blurb: string | null;
  blurb_en: string | null;
  date_label: string | null;
  date_label_en: string | null;
  poster_url: string;
  venue: string | null;
  published: boolean;
  sort_index: number | null;
};

/** Bozza editabile nel drawer (campi sempre stringa per gli input controllati). */
type Draft = {
  id: string | null;
  artist: string;
  date: string;
  time: string;
  genre: string;
  blurb: string;
  blurb_en: string;
  date_label: string;
  date_label_en: string;
  poster_url: string;
  venue: string;
  published: boolean;
};

const GENRES = Object.entries(genreLabel) as [string, { it: string; en: string }][];
const VENUES = Object.entries(venueLabel) as [string, { it: string; en: string }][];

const POSTER_MAX = 8 * 1024 * 1024; // 8MB
const POSTER_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const orNull = (s: string): string | null => {
  const t = s.trim();
  return t ? t : null;
};

const safeName = (name: string): string =>
  (name.split(/[\\/]/).pop() ?? 'poster')
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'poster';

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const fmtDate = (iso: string): string => {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
};

const todayISO = (): string => new Date().toISOString().slice(0, 10);

function emptyDraft(): Draft {
  return {
    id: null,
    artist: '',
    date: todayISO(),
    time: '21:00',
    genre: 'jazz',
    blurb: '',
    blurb_en: '',
    date_label: '',
    date_label_en: '',
    poster_url: '',
    venue: VENUE_DEFAULT,
    published: true,
  };
}

export default function EventsEditor() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string>('');

  async function load() {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: false });
    setLoading(false);
    if (error) {
      setError('Impossibile caricare gli eventi.');
      return;
    }
    setRows((data as EventRow[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setDraft(emptyDraft());
    setPosterFile(null);
    setPosterPreview('');
    setFormError(null);
    setOk(null);
  }

  function openEdit(row: EventRow) {
    setDraft({
      id: row.id,
      artist: row.artist,
      date: row.date.slice(0, 10),
      time: row.time,
      genre: row.genre,
      blurb: row.blurb ?? '',
      blurb_en: row.blurb_en ?? '',
      date_label: row.date_label ?? '',
      date_label_en: row.date_label_en ?? '',
      poster_url: row.poster_url,
      venue: row.venue || VENUE_DEFAULT,
      published: row.published,
    });
    setPosterFile(null);
    setPosterPreview(row.poster_url);
    setFormError(null);
    setOk(null);
  }

  function closeDrawer() {
    if (posterPreview.startsWith('blob:')) URL.revokeObjectURL(posterPreview);
    setDraft(null);
    setPosterFile(null);
    setPosterPreview('');
    setFormError(null);
  }

  function patch(p: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }

  function onPosterChange(file: File | undefined) {
    if (!file) return;
    if (!POSTER_TYPES.has(file.type)) {
      setFormError('La locandina deve essere JPG, PNG o WebP.');
      return;
    }
    if (file.size > POSTER_MAX) {
      setFormError('La locandina supera 8MB.');
      return;
    }
    setFormError(null);
    if (posterPreview.startsWith('blob:')) URL.revokeObjectURL(posterPreview);
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  }

  async function save() {
    const supabase = getSupabase();
    if (!supabase || !draft) return;

    if (!draft.artist.trim() || !draft.date || !draft.time.trim() || !draft.genre) {
      setFormError('Compila artista, data, orario e genere.');
      return;
    }
    if (!draft.poster_url && !posterFile) {
      setFormError('Carica una locandina.');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const id = draft.id ?? newId();

      // Upload locandina (solo se ne è stata scelta una nuova).
      let posterUrl = draft.poster_url;
      if (posterFile) {
        const path = `${id}/${safeName(posterFile.name)}`;
        const { error: upErr } = await supabase.storage
          .from('posters')
          .upload(path, posterFile, { upsert: true, contentType: posterFile.type });
        if (upErr) throw upErr;
        posterUrl = supabase.storage.from('posters').getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        artist: draft.artist.trim(),
        date: draft.date,
        time: draft.time.trim(),
        genre: draft.genre,
        blurb: orNull(draft.blurb),
        blurb_en: orNull(draft.blurb_en),
        date_label: orNull(draft.date_label),
        date_label_en: orNull(draft.date_label_en),
        poster_url: posterUrl,
        venue: draft.venue || VENUE_DEFAULT,
        published: draft.published,
      };

      if (draft.id) {
        const { error } = await supabase.from('events').update(payload).eq('id', draft.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert({ id, ...payload });
        if (error) throw error;
      }

      await load();
      closeDrawer();
      setOk('Evento salvato. Il sito pubblico si aggiornerà tra 1-2 minuti.');
    } catch (e) {
      console.error('[EventsEditor] save error:', e);
      setFormError('Salvataggio non riuscito. Riprova.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const supabase = getSupabase();
    if (!supabase || !draft?.id) return;
    if (!confirm('Eliminare questo evento? L’azione è definitiva.')) return;
    setSaving(true);
    const { error } = await supabase.from('events').delete().eq('id', draft.id);
    setSaving(false);
    if (error) {
      setFormError('Eliminazione non riuscita.');
      return;
    }
    await load();
    closeDrawer();
    setOk('Evento eliminato. Il sito pubblico si aggiornerà tra 1-2 minuti.');
  }

  const today = todayISO();
  const day = (ev: EventRow) => ev.date.slice(0, 10);
  const upcoming = rows.filter((ev) => day(ev) >= today).sort((a, b) => (day(a) < day(b) ? -1 : 1));
  const past = rows.filter((ev) => day(ev) < today).sort((a, b) => (day(a) < day(b) ? 1 : -1));

  const card = (ev: EventRow) => (
    <article
      key={ev.id}
      class="g-card ev-card"
      onClick={() => openEdit(ev)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEdit(ev);
        }
      }}
    >
      {ev.poster_url && <img class="ev-thumb" src={ev.poster_url} alt="" loading="lazy" />}
      <div class="ev-card-body">
        <h3 class="g-card-title">{ev.artist}</h3>
        <div class="g-card-meta">
          <span>{fmtDate(ev.date)}</span>
          <span>{ev.time}</span>
          <span>{genreLabel[ev.genre as keyof typeof genreLabel]?.it ?? ev.genre}</span>
        </div>
        <div class="g-chiprow">
          <span class="g-chip">{venueLabel[(ev.venue as keyof typeof venueLabel) || VENUE_DEFAULT]?.it ?? venueLabel[VENUE_DEFAULT].it}</span>
          {!ev.published && <span class="g-chip g-chip-warn">Bozza</span>}
        </div>
      </div>
    </article>
  );

  return (
    <section>
      <div class="me-bar">
        <div>
          <h2 class="g-h2">Eventi</h2>
          <p class="g-sub">
            {rows.length === 0 ? 'Crea il primo evento con locandina.' : `${rows.length} eventi in programma`}
          </p>
        </div>
        <button class="g-btn" type="button" onClick={openNew}>
          + Nuovo evento
        </button>
      </div>

      {error && <div class="g-msg g-msg-err">{error}</div>}
      {ok && <div class="g-msg g-msg-ok">{ok}</div>}
      {loading && <div class="g-center">Caricamento…</div>}

      {!loading && rows.length === 0 && !error && (
        <div class="g-empty">Nessun evento. Usa “Nuovo evento” per crearne uno.</div>
      )}

      {upcoming.length > 0 && (
        <>
          <h3 class="ev-group-title">In programma</h3>
          <div class="g-cards">{upcoming.map(card)}</div>
        </>
      )}

      {past.length > 0 && (
        <>
          <hr class="ev-divider" />
          <h3 class="ev-group-title ev-group-past">Eventi passati</h3>
          <div class="g-cards">{past.map(card)}</div>
        </>
      )}

      {draft && (
        <div class="g-overlay" onClick={closeDrawer}>
          <div class="g-drawer" onClick={(e) => e.stopPropagation()}>
            <h3>{draft.id ? 'Modifica evento' : 'Nuovo evento'}</h3>

            {formError && <div class="g-msg g-msg-err">{formError}</div>}

            <div class="g-field">
              <label>Artista / Titolo</label>
              <input
                class="g-input"
                type="text"
                value={draft.artist}
                onInput={(e) => patch({ artist: (e.target as HTMLInputElement).value })}
              />
            </div>

            <div class="ev-form-grid">
              <div class="g-field">
                <label>Data</label>
                <input
                  class="g-input"
                  type="date"
                  value={draft.date}
                  onInput={(e) => patch({ date: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Orario</label>
                <input
                  class="g-input"
                  type="text"
                  placeholder="21:00"
                  value={draft.time}
                  onInput={(e) => patch({ time: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Genere</label>
                <select
                  class="g-select"
                  value={draft.genre}
                  onChange={(e) => patch({ genre: (e.target as HTMLSelectElement).value })}
                >
                  {GENRES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label.it}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div class="g-field">
              <label>Luogo</label>
              <select
                class="g-select"
                value={draft.venue}
                onChange={(e) => patch({ venue: (e.target as HTMLSelectElement).value })}
              >
                {VENUES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label.it}
                  </option>
                ))}
              </select>
            </div>

            <div class="g-field">
              <label>Descrizione IT</label>
              <textarea
                class="g-textarea"
                value={draft.blurb}
                onInput={(e) => patch({ blurb: (e.target as HTMLTextAreaElement).value })}
              />
            </div>
            <div class="g-field">
              <label>Descrizione EN (opzionale)</label>
              <textarea
                class="g-textarea"
                value={draft.blurb_en}
                onInput={(e) => patch({ blurb_en: (e.target as HTMLTextAreaElement).value })}
              />
            </div>

            <div class="ev-form-grid">
              <div class="g-field">
                <label>Etichetta data IT (override, opzionale)</label>
                <input
                  class="g-input"
                  type="text"
                  placeholder="es. Giovedì 23 aprile"
                  value={draft.date_label}
                  onInput={(e) => patch({ date_label: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Etichetta data EN (override, opzionale)</label>
                <input
                  class="g-input"
                  type="text"
                  placeholder="e.g. Thursday 23 April"
                  value={draft.date_label_en}
                  onInput={(e) => patch({ date_label_en: (e.target as HTMLInputElement).value })}
                />
              </div>
            </div>

            <div class="g-field">
              <label>Locandina</label>
              {posterPreview && <img class="ev-poster-preview" src={posterPreview} alt="Anteprima locandina" />}
              <input
                class="g-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => onPosterChange((e.target as HTMLInputElement).files?.[0])}
              />
            </div>

            <label class="ev-check">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => patch({ published: (e.target as HTMLInputElement).checked })}
              />
              Pubblicato (visibile sul sito)
            </label>

            <div class="g-drawer-actions">
              <button class="g-btn" type="button" onClick={save} disabled={saving}>
                {saving ? 'Salvataggio…' : 'Salva'}
              </button>
              {draft.id && (
                <button class="g-btn g-btn-danger" type="button" onClick={remove} disabled={saving}>
                  Elimina
                </button>
              )}
              <button class="g-btn g-btn-ghost" type="button" onClick={closeDrawer} disabled={saving}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
