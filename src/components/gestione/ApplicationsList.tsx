import { useEffect, useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';

/** Riga candidatura come arriva da Supabase. */
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

/** Numero in formato wa.me (come BookingsList): cifre + prefisso internazionale. */
const waNumber = (raw: string | null): string | null => {
  if (!raw) return null;
  let d = raw.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (/^3\d{8,9}$/.test(d)) d = '39' + d;
  return d.length >= 8 ? d : null;
};
/** Link "Scrivi su WhatsApp" con messaggio precompilato, o null se manca il numero. */
const waLink = (a: Application): string | null => {
  const num = waNumber(a.phone);
  if (!num) return null;
  const nome = (a.contact_name || a.artist_name || '').trim().split(/\s+/)[0] || '';
  const msg = `Ciao ${nome}, ti scrivo dal Biblio riguardo alla candidatura di ${a.artist_name}. `;
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
};

const fmtReceived = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

const genreText = (a: Application): string =>
  a.genre === 'other' ? `Altro — ${a.genre_other ?? ''}` : (GENRE_LABEL[a.genre] ?? a.genre);

const fileName = (path: string): string => path.split('/').pop() ?? path;

const orNull = (s: string | null): string | null => {
  const t = (s ?? '').trim();
  return t ? t : null;
};

export default function ApplicationsList({ onUnreadChange }: { onUnreadChange?: () => void }) {
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // draft = copia editabile della candidatura aperta nel drawer.
  const [draft, setDraft] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);

  async function load() {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setError('Impossibile caricare le candidature.');
      return;
    }
    setRows((data as Application[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  /** Segna letto/non letto. La marcatura è manuale: la fa il gestore quando vuole. */
  async function setRead(id: string, makeRead: boolean) {
    const supabase = getSupabase();
    if (!supabase) return;
    const next = makeRead ? new Date().toISOString() : null;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read_at: next } : r)));
    setDraft((d) => (d && d.id === id ? { ...d, read_at: next } : d));
    await supabase.from('applications').update({ read_at: next }).eq('id', id);
    onUnreadChange?.();
  }

  function openCard(a: Application) {
    // Aprire la scheda NON la segna letta: il gestore lo decide col toggle.
    setDraft({ ...a });
    setFormError(null);
    setFormOk(null);
  }

  function closeDrawer() {
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
    setRows((prev) => prev.map((r) => (r.id === draft.id ? ({ ...r, ...payload } as Application) : r)));
    setFormOk('Modifiche salvate.');
    onUnreadChange?.();
  }

  async function remove() {
    const supabase = getSupabase();
    if (!supabase || !draft) return;
    if (!confirm('Eliminare questa candidatura? L’azione è definitiva.')) return;
    // Rimuove anche i file dal bucket privato (best-effort).
    if (draft.file_paths?.length) {
      await supabase.storage.from('applications').remove(draft.file_paths);
    }
    const id = draft.id;
    setRows((prev) => prev.filter((r) => r.id !== id));
    closeDrawer();
    await supabase.from('applications').delete().eq('id', id);
    onUnreadChange?.();
  }

  /** Apre un file in una nuova scheda tramite signed URL temporaneo (~60 min). */
  async function openFile(path: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error } = await supabase.storage
      .from('applications')
      .createSignedUrl(path, 60 * 60);
    if (error || !data) {
      alert('Impossibile generare il link al file.');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  const unread = rows.filter((r) => !r.read_at).length;

  return (
    <section>
      <h2 class="g-h2">Candidature</h2>
      <p class="g-sub">
        {rows.length === 0
          ? 'Le candidature degli artisti dal sito appariranno qui.'
          : `${rows.length} candidature · ${unread} da leggere`}
      </p>

      {error && <div class="g-msg g-msg-err">{error}</div>}
      {loading && <div class="g-center">Caricamento…</div>}

      {!loading && rows.length === 0 && !error && (
        <div class="g-empty">Nessuna candidatura per ora.</div>
      )}

      <div class="g-cards">
        {rows.map((a) => (
          <article
            key={a.id}
            class={`g-card${a.read_at ? '' : ' is-unread'}`}
            onClick={() => openCard(a)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openCard(a);
              }
            }}
          >
            {!a.read_at && <span class="g-dot" aria-label="Non letta" />}
            <h3 class="g-card-title">{a.artist_name}</h3>
            <div class="g-card-meta">
              <span>{genreText(a)}</span>
              {a.lineup && <span>{a.lineup}</span>}
              {a.city && <span>{a.city}</span>}
            </div>
            <div class="g-chiprow">
              <button
                class={`g-readtoggle${a.read_at ? ' is-read' : ''}`}
                type="button"
                aria-pressed={a.read_at ? 'true' : 'false'}
                title={a.read_at ? 'Segna come non letto' : 'Segna come letto'}
                onClick={(e) => {
                  e.stopPropagation();
                  setRead(a.id, !a.read_at);
                }}
              >
                {a.read_at ? '✓ Letto' : 'Non letto'}
              </button>
              {a.file_paths.length > 0 && <span class="g-chip">{a.file_paths.length} file</span>}
              <span class="g-chip">{a.contact_name}</span>
            </div>
          </article>
        ))}
      </div>

      {draft && (
        <div class="g-overlay" onClick={closeDrawer}>
          <div class="g-drawer" onClick={(e) => e.stopPropagation()}>
            <h3>Scheda candidatura</h3>
            <p class="g-sub">Ricevuta il {fmtReceived(draft.created_at)} · puoi modificare e salvare i dati</p>

            {formError && <div class="g-msg g-msg-err">{formError}</div>}
            {formOk && <div class="g-msg g-msg-ok">{formOk}</div>}

            <div class="g-field">
              <label>Artista / Band</label>
              <input
                class="g-input"
                type="text"
                value={draft.artist_name}
                onInput={(e) => patch({ artist_name: (e.target as HTMLInputElement).value })}
              />
            </div>

            <div class="g-grid-2">
              <div class="g-field">
                <label>Referente</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.contact_name}
                  onInput={(e) => patch({ contact_name: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Email</label>
                <input
                  class="g-input"
                  type="email"
                  value={draft.email}
                  onInput={(e) => patch({ email: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Telefono</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.phone ?? ''}
                  onInput={(e) => patch({ phone: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Città</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.city ?? ''}
                  onInput={(e) => patch({ city: (e.target as HTMLInputElement).value })}
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
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {draft.genre === 'other' && (
                <div class="g-field">
                  <label>Genere (Altro)</label>
                  <input
                    class="g-input"
                    type="text"
                    value={draft.genre_other ?? ''}
                    onInput={(e) => patch({ genre_other: (e.target as HTMLInputElement).value })}
                  />
                </div>
              )}
              <div class="g-field">
                <label>Formazione</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.lineup ?? ''}
                  onInput={(e) => patch({ lineup: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Cachet</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.fee ?? ''}
                  onInput={(e) => patch({ fee: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Disponibilità</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.availability ?? ''}
                  onInput={(e) => patch({ availability: (e.target as HTMLInputElement).value })}
                />
              </div>
            </div>

            <div class="g-field">
              <label>Bio</label>
              <textarea
                class="g-textarea"
                value={draft.bio}
                onInput={(e) => patch({ bio: (e.target as HTMLTextAreaElement).value })}
              />
            </div>
            <div class="g-field">
              <label>Repertorio</label>
              <textarea
                class="g-textarea"
                value={draft.repertoire ?? ''}
                onInput={(e) => patch({ repertoire: (e.target as HTMLTextAreaElement).value })}
              />
            </div>
            <div class="g-field">
              <label>Esperienza</label>
              <textarea
                class="g-textarea"
                value={draft.experience ?? ''}
                onInput={(e) => patch({ experience: (e.target as HTMLTextAreaElement).value })}
              />
            </div>
            <div class="g-field">
              <label>Note</label>
              <textarea
                class="g-textarea"
                value={draft.note ?? ''}
                onInput={(e) => patch({ note: (e.target as HTMLTextAreaElement).value })}
              />
            </div>

            <div class="g-grid-2">
              <div class="g-field">
                <label>Link principale</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.link1}
                  onInput={(e) => patch({ link1: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Link 2</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.link2 ?? ''}
                  onInput={(e) => patch({ link2: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>Link 3</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.link3 ?? ''}
                  onInput={(e) => patch({ link3: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="g-field">
                <label>EPK / Press kit</label>
                <input
                  class="g-input"
                  type="text"
                  value={draft.epk ?? ''}
                  onInput={(e) => patch({ epk: (e.target as HTMLInputElement).value })}
                />
              </div>
            </div>

            {/* Anteprima link cliccabili */}
            {[draft.link1, draft.link2, draft.link3, draft.epk].some((l) => !!l && l.trim()) && (
              <div class="g-files">
                {[draft.link1, draft.link2, draft.link3, draft.epk]
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

            {/* File caricati: download via signed URL temporaneo */}
            {draft.file_paths.length > 0 && (
              <div class="g-files">
                {draft.file_paths.map((p) => (
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
                {saving ? 'Salvataggio…' : 'Salva modifiche'}
              </button>
              {waLink(draft) && (
                <a
                  class="g-btn g-btn-wa"
                  href={waLink(draft)!}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Scrivi su WhatsApp
                </a>
              )}
              <a class="g-btn g-btn-ghost" href={`mailto:${draft.email}`}>
                Email
              </a>
              <button
                class="g-btn g-btn-ghost"
                type="button"
                onClick={() => setRead(draft.id, !draft.read_at)}
                disabled={saving}
              >
                {draft.read_at ? 'Segna come non letto' : 'Segna come letto'}
              </button>
              <button class="g-btn g-btn-danger" type="button" onClick={remove} disabled={saving}>
                Elimina
              </button>
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
