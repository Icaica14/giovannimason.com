import { useEffect, useMemo, useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';

/**
 * Anagrafica / storico artisti.
 * Unisce due fonti in un unico registro:
 *  - le CANDIDATURE (tabella applications): scheda completa e modificabile;
 *  - le ESIBIZIONI (tabella events): chi è già passato dal palco del Biblio.
 * Gli artisti vengono accorpati per nome (normalizzato). Elenco alfabetico,
 * filtrabile; il clic su una riga apre il profilo completo dell'artista.
 */

/** Candidatura come arriva da Supabase (stessa forma di ApplicationsList). */
type Application = {
  id: string;
  artist_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  lineup: string | null;
  genre: string;
  genre_other: string | null;
  repertoire: string | null;
  bio: string;
  link1: string;
  link2: string | null;
  link3: string | null;
  epk: string | null;
  experience: string | null;
  availability: string | null;
  fee: string | null;
  note: string | null;
  file_paths: string[];
  lang: string;
  read_at: string | null;
  status: string;
  created_at: string;
};

/** Esibizione (riga della tabella events ridotta ai campi utili). */
type Performance = {
  id: string;
  artist: string;
  date: string; // YYYY-MM-DD
  genre: string;
  venue: string;
  poster_url: string | null;
  /** Valutazione 1-5 (note PRIVATE: da tabella event_reviews, mai esposte ad anon). */
  rating: number | null;
  comment: string | null;
};

/** Voce del registro: un artista con la sua scheda (se esiste) e le esibizioni. */
type Artist = {
  key: string; // nome normalizzato, per accorpare candidature ed eventi
  name: string;
  application: Application | null;
  genreKey: string; // chiave genere per il filtro
  genreLabel: string;
  city: string | null;
  performances: Performance[];
};

const GENRE_LABEL: Record<string, string> = {
  jazz: 'Jazz',
  blues: 'Blues',
  soul: 'Soul / Pop',
  songwriter: 'Cantautorato',
  indie: 'Indie / Rock',
  classical: 'Classica / acustica',
  other: 'Altro',
};
const GENRES = Object.entries(GENRE_LABEL);

/** Genere evento → genere candidatura (per filtro/etichetta coerenti). */
const EVENT_GENRE_TO_APP: Record<string, string> = {
  jazz: 'jazz',
  blues: 'blues',
  soul: 'soul',
  indie: 'indie',
  songwriter: 'songwriter',
  reading: 'other',
  workshop: 'other',
};
const EVENT_GENRE_LABEL: Record<string, string> = {
  jazz: 'Jazz',
  blues: 'Blues',
  soul: 'Soul',
  indie: 'Indie / Rock',
  songwriter: 'Cantautorato',
  reading: 'Reading',
  workshop: 'Workshop',
};

const VENUE_LABEL: Record<string, string> = {
  'biblio-bistrot': 'Biblio Bistrot',
  giardinetti: 'Giardinetti di Sant’Andrea',
};
const venueLabel = (slug: string): string => VENUE_LABEL[slug] ?? slug;

/** Normalizza il nome per accorpare (minuscole, senza accenti, spazi compatti). */
const normKey = (raw: string): string =>
  (raw || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const genreText = (a: Application): string => {
  if (a.genre !== 'other') return GENRE_LABEL[a.genre] ?? a.genre;
  const extra = (a.genre_other ?? '').trim();
  return extra ? `Altro — ${extra}` : 'Altro';
};

const fmtDay = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
};

const fileName = (path: string): string => path.split('/').pop() ?? path;
const orNull = (s: string | null): string | null => {
  const t = (s ?? '').trim();
  return t ? t : null;
};

/** Numero in formato wa.me (cfr. BookingsList): cifre + prefisso internazionale. */
const waNumber = (raw: string | null): string | null => {
  if (!raw) return null;
  let d = raw.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (/^3\d{8,9}$/.test(d)) d = '39' + d;
  return d.length >= 8 ? d : null;
};
const waLink = (a: Application): string | null => {
  const num = waNumber(a.phone);
  if (!num) return null;
  const nome = (a.contact_name || a.artist_name || '').trim().split(/\s+/)[0] || '';
  const msg = `Ciao ${nome}, ti scrivo dal Biblio riguardo a ${a.artist_name}. `;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
};

/** Media delle valutazioni (1-5) delle esibizioni, o null se nessuna recensita. */
const avgRating = (perfs: Performance[]): number | null => {
  const vals = perfs.map((p) => p.rating).filter((r): r is number => typeof r === 'number' && r >= 1 && r <= 5);
  if (vals.length === 0) return null;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
};

/** Stelline piene/vuote per un valore 1-5 (arrotondato per la visualizzazione). */
const stars = (value: number): string => {
  const full = Math.round(value);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
};

export default function ArtistsRegistry() {
  const [apps, setApps] = useState<Application[]>([]);
  const [events, setEvents] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtri
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'candidati' | 'esibiti'>('all');

  // selezione / editing
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);

  // recensioni per esibizione: bozze locali (event_id → voto/commento in editing)
  const [perfEdits, setPerfEdits] = useState<Record<string, { rating: number | null; comment: string | null }>>({});
  const [perfSavingId, setPerfSavingId] = useState<string | null>(null);
  const [perfSavedId, setPerfSavedId] = useState<string | null>(null);
  const [perfMsg, setPerfMsg] = useState<string | null>(null);

  async function load() {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const [a, e] = await Promise.all([
      supabase.from('applications').select('*').order('artist_name', { ascending: true }),
      supabase
        .from('events')
        .select('id, artist, date, genre, venue, poster_url')
        .order('date', { ascending: false }),
    ]);
    if (a.error || e.error) {
      setLoading(false);
      setError('Impossibile caricare il registro artisti.');
      return;
    }
    // Recensioni private (tabella event_reviews). Tollerante: se la tabella non
    // esiste ancora (migrazione 0007 non applicata) si prosegue senza recensioni.
    const reviews = new Map<string, { rating: number | null; comment: string | null }>();
    const r = await supabase.from('event_reviews').select('event_id, rating, comment');
    if (!r.error && r.data) {
      for (const row of r.data as { event_id: string; rating: number | null; comment: string | null }[]) {
        reviews.set(row.event_id, { rating: row.rating, comment: row.comment });
      }
    }
    const evts = ((e.data as Omit<Performance, 'rating' | 'comment'>[]) ?? []).map((ev) => {
      const rv = reviews.get(ev.id);
      return { ...ev, rating: rv?.rating ?? null, comment: rv?.comment ?? null } as Performance;
    });
    setLoading(false);
    setApps((a.data as Application[]) ?? []);
    setEvents(evts);
  }

  useEffect(() => {
    load();
  }, []);

  /** Costruisce il registro accorpando candidature ed esibizioni per nome. */
  const artists = useMemo<Artist[]>(() => {
    const map = new Map<string, Artist>();

    for (const app of apps) {
      const key = normKey(app.artist_name);
      map.set(key, {
        key,
        name: app.artist_name,
        application: app,
        genreKey: app.genre,
        genreLabel: genreText(app),
        city: app.city,
        performances: [],
      });
    }

    for (const ev of events) {
      const key = normKey(ev.artist);
      const existing = map.get(key);
      if (existing) {
        existing.performances.push(ev);
      } else {
        map.set(key, {
          key,
          name: ev.artist,
          application: null,
          genreKey: EVENT_GENRE_TO_APP[ev.genre] ?? 'other',
          genreLabel: EVENT_GENRE_LABEL[ev.genre] ?? ev.genre,
          city: null,
          performances: [ev],
        });
      }
    }

    const list = Array.from(map.values());
    for (const ar of list) {
      ar.performances.sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0));
    }
    list.sort((x, y) => x.name.localeCompare(y.name, 'it', { sensitivity: 'base' }));
    return list;
  }, [apps, events]);

  const filtered = useMemo<Artist[]>(() => {
    const q = normKey(query);
    return artists.filter((ar) => {
      if (genreFilter !== 'all' && ar.genreKey !== genreFilter) return false;
      if (sourceFilter === 'candidati' && !ar.application) return false;
      if (sourceFilter === 'esibiti' && ar.performances.length === 0) return false;
      if (q) {
        const hay = normKey(
          [
            ar.name,
            ar.city ?? '',
            ar.application?.contact_name ?? '',
            ar.application?.email ?? '',
            ar.genreLabel,
          ].join(' '),
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [artists, query, genreFilter, sourceFilter]);

  const selected = useMemo(
    () => artists.find((a) => a.key === selectedKey) ?? null,
    [artists, selectedKey],
  );

  // Quando cambia l'artista selezionato, prepara il draft modificabile.
  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    setDraft(selected.application ? { ...selected.application } : null);
    setFormError(null);
    setFormOk(null);
  }, [selectedKey]); // eslint-disable-line react-hooks/exhaustive-deps

  function openArtist(a: Artist) {
    setSelectedKey(a.key);
  }
  function backToList() {
    setSelectedKey(null);
    setDraft(null);
    setFormError(null);
    setFormOk(null);
  }

  function patch(p: Partial<Application>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
    setFormOk(null);
  }

  async function saveDraft() {
    const supabase = getSupabase();
    if (!supabase || !draft) return;
    if (!draft.artist_name.trim() || !draft.contact_name.trim() || !draft.email.trim()) {
      setFormError('Artista, referente ed email sono obbligatori.');
      return;
    }
    setSaving(true);
    setFormError(null);
    setFormOk(null);
    const payload = {
      artist_name: draft.artist_name.trim(),
      contact_name: draft.contact_name.trim(),
      email: draft.email.trim(),
      phone: orNull(draft.phone),
      city: orNull(draft.city),
      lineup: orNull(draft.lineup),
      genre: draft.genre,
      genre_other: draft.genre === 'other' ? orNull(draft.genre_other) : null,
      repertoire: orNull(draft.repertoire),
      bio: draft.bio.trim(),
      link1: draft.link1.trim(),
      link2: orNull(draft.link2),
      link3: orNull(draft.link3),
      epk: orNull(draft.epk),
      experience: orNull(draft.experience),
      availability: orNull(draft.availability),
      fee: orNull(draft.fee),
      note: orNull(draft.note),
    };
    const { error } = await supabase.from('applications').update(payload).eq('id', draft.id);
    setSaving(false);
    if (error) {
      setFormError('Salvataggio non riuscito. Riprova.');
      return;
    }
    const nextKey = normKey(payload.artist_name);
    setApps((prev) => prev.map((r) => (r.id === draft.id ? ({ ...r, ...payload } as Application) : r)));
    setSelectedKey(nextKey); // se il nome è cambiato, segui l'artista
    setFormOk('Scheda salvata.');
  }

  /** Valore in editing di un'esibizione: bozza locale se presente, altrimenti il salvato. */
  function perfValue(p: Performance): { rating: number | null; comment: string | null } {
    return perfEdits[p.id] ?? { rating: p.rating, comment: p.comment };
  }
  /** Aggiorna la bozza locale (voto o commento) senza scrivere sul DB. */
  function setPerfField(p: Performance, patch: { rating?: number | null; comment?: string | null }) {
    setPerfEdits((prev) => {
      const base = prev[p.id] ?? { rating: p.rating, comment: p.comment };
      return { ...prev, [p.id]: { ...base, ...patch } };
    });
    if (perfSavedId === p.id) setPerfSavedId(null);
    setPerfMsg(null);
  }
  /** True se la bozza differisce dal valore salvato (abilita il bottone Salva). */
  function perfDirty(p: Performance): boolean {
    const e = perfEdits[p.id];
    if (!e) return false;
    return e.rating !== p.rating || (e.comment ?? '') !== (p.comment ?? '');
  }

  /**
   * Salva voto/commento di una singola esibizione nella tabella privata
   * event_reviews (upsert sull'event_id), su clic del bottone Salva. Aggiorna lo
   * stato locale così la media in testata e nell'elenco si ricalcola senza ricaricare.
   */
  async function savePerf(p: Performance) {
    const supabase = getSupabase();
    if (!supabase) return;
    const val = perfValue(p);
    const row = {
      event_id: p.id,
      rating: val.rating,
      comment: (val.comment ?? '').trim() || null,
    };
    setPerfSavingId(p.id);
    setPerfSavedId(null);
    setPerfMsg(null);
    const { error } = await supabase.from('event_reviews').upsert(row, { onConflict: 'event_id' });
    setPerfSavingId(null);
    if (error) {
      setPerfMsg('Salvataggio della recensione non riuscito.');
      return;
    }
    setEvents((prev) =>
      prev.map((ev) => (ev.id === p.id ? { ...ev, rating: row.rating, comment: row.comment } : ev)),
    );
    setPerfEdits((prev) => {
      const next = { ...prev };
      delete next[p.id];
      return next;
    });
    setPerfSavedId(p.id);
  }

  /** Crea una scheda anagrafica per un artista presente solo come esibizione. */
  async function createAnagrafica() {
    const supabase = getSupabase();
    if (!supabase || !selected || selected.application) return;
    setSaving(true);
    setFormError(null);
    setFormOk(null);
    const seed = {
      artist_name: selected.name,
      contact_name: '',
      email: '',
      genre: selected.genreKey,
      bio: '',
      link1: '',
    };
    const { data, error } = await supabase.from('applications').insert(seed).select('*').single();
    if (error || !data) {
      setSaving(false);
      setFormError('Creazione scheda non riuscita. Riprova.');
      return;
    }
    // Il trigger inbound forza status='new'/non letta: l'artista ha già suonato,
    // quindi lo segno come gestito (Confermata, letta) per non sporcare i "da leggere".
    const fixed = { read_at: new Date().toISOString(), status: 'booked' };
    await supabase.from('applications').update(fixed).eq('id', data.id);
    const created = { ...(data as Application), ...fixed };
    setSaving(false);
    setApps((prev) => [...prev, created]);
    setDraft({ ...created });
    setFormOk('Scheda creata: completa i dati e salva.');
  }

  async function remove() {
    const supabase = getSupabase();
    if (!supabase || !draft) return;
    if (!confirm('Eliminare la scheda anagrafica di questo artista? Le esibizioni restano negli Eventi.')) return;
    if (draft.file_paths?.length) {
      await supabase.storage.from('applications').remove(draft.file_paths);
    }
    const id = draft.id;
    await supabase.from('applications').delete().eq('id', id);
    setApps((prev) => prev.filter((r) => r.id !== id));
    // Se l'artista esisteva solo come candidatura, esce dall'elenco; altrimenti
    // resta come "solo esibizioni". Torno all'elenco per evitare stati incoerenti.
    backToList();
  }

  async function openFile(path: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.storage.from('applications').createSignedUrl(path, 60 * 60);
    if (error || !data) {
      alert('Impossibile generare il link al file.');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  const totWithApp = artists.filter((a) => a.application).length;
  const totPlayed = artists.filter((a) => a.performances.length > 0).length;

  // ── Vista profilo ──────────────────────────────────────────────────────────
  if (selected) {
    const app = draft; // scheda modificabile (può essere null se non ancora creata)
    return (
      <section>
        <button class="g-btn g-btn-ghost g-btn-sm" type="button" onClick={backToList}>
          ← Torna all’elenco
        </button>

        <div class="g-profile-head">
          <h2 class="g-h2">{selected.name}</h2>
          <div class="g-chiprow">
            <span class="g-chip">{selected.genreLabel}</span>
            {selected.city && <span class="g-chip">{selected.city}</span>}
            {selected.performances.length > 0 && (
              <span class="g-chip">
                {selected.performances.length}{' '}
                {selected.performances.length === 1 ? 'esibizione' : 'esibizioni'}
              </span>
            )}
            {avgRating(selected.performances) !== null && (
              <span class="g-chip g-chip-star" title="Media valutazioni esibizioni">
                {stars(avgRating(selected.performances)!)} {avgRating(selected.performances)!.toFixed(1)}
              </span>
            )}
            <span class="g-chip">{selected.application ? 'Candidatura' : 'Solo esibizioni'}</span>
          </div>
        </div>

        {/* Esibizioni al Biblio */}
        {selected.performances.length > 0 && (
          <div class="g-profile-block">
            <h3 class="g-h3">Esibizioni al Biblio</h3>
            {perfMsg && <div class="g-msg g-msg-err">{perfMsg}</div>}
            <ul class="g-timeline">
              {selected.performances.map((p) => {
                const v = perfValue(p);
                const dirty = perfDirty(p);
                return (
                  <li key={p.id} class="g-perf">
                    <div class="g-perf-head">
                      <div>
                        <strong>{fmtDay(p.date)}</strong>
                        <span> · {venueLabel(p.venue)}</span>
                        <span class="g-chip g-chip-sm">{EVENT_GENRE_LABEL[p.genre] ?? p.genre}</span>
                      </div>
                      <label class="g-perf-rate">
                        <span>Valutazione</span>
                        <select
                          class="g-select g-select-sm"
                          value={v.rating ?? ''}
                          onChange={(e) => {
                            const raw = (e.target as HTMLSelectElement).value;
                            setPerfField(p, { rating: raw === '' ? null : Number(raw) });
                          }}
                        >
                          <option value="">— voto —</option>
                          <option value="1">★ 1</option>
                          <option value="2">★★ 2</option>
                          <option value="3">★★★ 3</option>
                          <option value="4">★★★★ 4</option>
                          <option value="5">★★★★★ 5</option>
                        </select>
                      </label>
                    </div>
                    <div class="g-field g-perf-edit">
                      <label>Commento sull’esibizione</label>
                      <textarea
                        class="g-textarea"
                        placeholder="Com’è andata la serata? Note per la prossima volta…"
                        value={v.comment ?? ''}
                        onInput={(e) => setPerfField(p, { comment: (e.target as HTMLTextAreaElement).value })}
                      />
                    </div>
                    <div class="g-perf-actions">
                      {perfSavedId === p.id && !dirty && (
                        <span class="g-perf-saved">✓ Salvato</span>
                      )}
                      <button
                        class="g-btn g-btn-sm"
                        type="button"
                        onClick={() => savePerf(p)}
                        disabled={!dirty || perfSavingId === p.id}
                      >
                        {perfSavingId === p.id ? 'Salvataggio…' : 'Salva'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Contatti rapidi */}
        {app && (app.phone || app.email) && (
          <div class="g-drawer-actions">
            {waLink(app) && (
              <a class="g-btn g-btn-wa" href={waLink(app)!} target="_blank" rel="noopener noreferrer">
                Scrivi su WhatsApp
              </a>
            )}
            {app.email && (
              <a class="g-btn g-btn-ghost" href={`mailto:${app.email}`}>
                Email
              </a>
            )}
          </div>
        )}

        {formError && <div class="g-msg g-msg-err">{formError}</div>}
        {formOk && <div class="g-msg g-msg-ok">{formOk}</div>}

        {/* Scheda anagrafica modificabile */}
        {!app ? (
          <div class="g-profile-block">
            <h3 class="g-h3">Scheda anagrafica</h3>
            <p class="g-sub">
              Questo artista risulta solo dalle esibizioni passate. Crea una scheda per registrare
              contatti, bio e materiali — diventerà modificabile come una candidatura.
            </p>
            <button class="g-btn" type="button" onClick={createAnagrafica} disabled={saving}>
              {saving ? 'Creazione…' : 'Crea scheda anagrafica'}
            </button>
          </div>
        ) : (
          <div class="g-profile-block">
            <h3 class="g-h3">Scheda anagrafica</h3>

            <div class="g-field">
              <label>Artista / Band</label>
              <input
                class="g-input"
                type="text"
                value={app.artist_name}
                onInput={(e) => patch({ artist_name: (e.target as HTMLInputElement).value })}
              />
            </div>

            <div class="g-grid-2">
              <div class="g-field">
                <label>Referente</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.contact_name}
                  onInput={(e) => patch({ contact_name: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Email</label>
                <input
                  class="g-input"
                  type="email"
                  value={app.email}
                  onInput={(e) => patch({ email: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Telefono</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.phone ?? ''}
                  onInput={(e) => patch({ phone: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Città</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.city ?? ''}
                  onInput={(e) => patch({ city: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Genere</label>
                <select
                  class="g-select"
                  value={app.genre}
                  onChange={(e) => patch({ genre: (e.target as HTMLSelectElement).value })}
                >
                  {GENRES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {app.genre === 'other' && (
                <div class="g-field">
                  <label>Genere (Altro)</label>
                  <input
                    class="g-input"
                    type="text"
                    value={app.genre_other ?? ''}
                    onInput={(e) => patch({ genre_other: (e.target as HTMLInputElement).value })}
                  />
                </div>
              )}
              <div class="g-field">
                <label>Formazione</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.lineup ?? ''}
                  onInput={(e) => patch({ lineup: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Cachet</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.fee ?? ''}
                  onInput={(e) => patch({ fee: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Disponibilità</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.availability ?? ''}
                  onInput={(e) => patch({ availability: (e.target as HTMLInputElement).value })}
                />
              </div>
            </div>

            <div class="g-field">
              <label>Bio</label>
              <textarea
                class="g-textarea"
                value={app.bio}
                onInput={(e) => patch({ bio: (e.target as HTMLTextAreaElement).value })}
              />
            </div>
            <div class="g-field">
              <label>Repertorio</label>
              <textarea
                class="g-textarea"
                value={app.repertoire ?? ''}
                onInput={(e) => patch({ repertoire: (e.target as HTMLTextAreaElement).value })}
              />
            </div>
            <div class="g-field">
              <label>Esperienza</label>
              <textarea
                class="g-textarea"
                value={app.experience ?? ''}
                onInput={(e) => patch({ experience: (e.target as HTMLTextAreaElement).value })}
              />
            </div>
            <div class="g-field">
              <label>Note</label>
              <textarea
                class="g-textarea"
                value={app.note ?? ''}
                onInput={(e) => patch({ note: (e.target as HTMLTextAreaElement).value })}
              />
            </div>

            <div class="g-grid-2">
              <div class="g-field">
                <label>Link principale</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.link1}
                  onInput={(e) => patch({ link1: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Link 2</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.link2 ?? ''}
                  onInput={(e) => patch({ link2: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Link 3</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.link3 ?? ''}
                  onInput={(e) => patch({ link3: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>EPK / Press kit</label>
                <input
                  class="g-input"
                  type="text"
                  value={app.epk ?? ''}
                  onInput={(e) => patch({ epk: (e.target as HTMLInputElement).value })}
                />
              </div>
            </div>

            {[app.link1, app.link2, app.link3, app.epk].some((l) => !!l && l.trim()) && (
              <div class="g-files">
                {[app.link1, app.link2, app.link3, app.epk]
                  .filter((l): l is string => !!l && l.trim().length > 0)
                  .map((l) => (
                    <div class="g-file" key={l}>
                      <a href={l} target="_blank" rel="noopener noreferrer">
                        ↗ {l}
                      </a>
                    </div>
                  ))}
              </div>
            )}

            {app.file_paths.length > 0 && (
              <div class="g-files">
                {app.file_paths.map((p) => (
                  <div class="g-file" key={p}>
                    <button class="g-btn g-btn-ghost g-btn-sm" type="button" onClick={() => openFile(p)}>
                      ⬇ {fileName(p)}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div class="g-drawer-actions">
              <button class="g-btn" type="button" onClick={saveDraft} disabled={saving}>
                {saving ? 'Salvataggio…' : 'Salva scheda'}
              </button>
              <button class="g-btn g-btn-danger" type="button" onClick={remove} disabled={saving}>
                Elimina scheda
              </button>
            </div>
          </div>
        )}
      </section>
    );
  }

  // ── Vista elenco ────────────────────────────────────────────────────────────
  return (
    <section>
      <h2 class="g-h2">Artisti</h2>
      <p class="g-sub">
        {artists.length === 0
          ? 'Qui trovi l’anagrafica di tutti gli artisti: candidature e chi è già passato dal palco.'
          : `${artists.length} artisti · ${totWithApp} con scheda · ${totPlayed} hanno suonato`}
      </p>

      {error && <div class="g-msg g-msg-err">{error}</div>}
      {loading && <div class="g-center">Caricamento…</div>}

      {!loading && (
        <div class="g-toolbar">
          <input
            class="g-input"
            type="search"
            placeholder="Cerca per nome, città, referente…"
            value={query}
            onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          />
          <select
            class="g-select"
            value={genreFilter}
            onChange={(e) => setGenreFilter((e.target as HTMLSelectElement).value)}
            aria-label="Filtra per genere"
          >
            <option value="all">Tutti i generi</option>
            {GENRES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            class="g-select"
            value={sourceFilter}
            onChange={(e) => setSourceFilter((e.target as HTMLSelectElement).value as typeof sourceFilter)}
            aria-label="Filtra per tipo"
          >
            <option value="all">Tutti</option>
            <option value="candidati">Con scheda</option>
            <option value="esibiti">Hanno suonato</option>
          </select>
        </div>
      )}

      {!loading && filtered.length === 0 && !error && (
        <div class="g-empty">Nessun artista corrisponde ai filtri.</div>
      )}

      {!loading && filtered.length > 0 && (
        <ul class="g-list">
          {filtered.map((ar) => (
            <li
              key={ar.key}
              class="g-list-row"
              onClick={() => openArtist(ar)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openArtist(ar);
                }
              }}
            >
              <div class="g-list-main">
                <span class="g-list-name">{ar.name}</span>
                <span class="g-list-meta">
                  {ar.genreLabel}
                  {` · ${ar.performances.length} ${ar.performances.length === 1 ? 'esibizione' : 'esibizioni'}`}
                </span>
              </div>
              <div class="g-list-side">
                {avgRating(ar.performances) !== null && (
                  <span class="g-chip g-chip-star g-chip-sm" title="Media valutazioni">
                    ★ {avgRating(ar.performances)!.toFixed(1)}
                  </span>
                )}
                <span class="g-list-arrow" aria-hidden="true">›</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
