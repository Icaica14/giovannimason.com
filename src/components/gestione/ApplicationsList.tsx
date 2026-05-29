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

const fmtReceived = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
};

const genreText = (a: Application): string =>
  a.genre === 'other' ? `Altro — ${a.genre_other ?? ''}` : (GENRE_LABEL[a.genre] ?? a.genre);

const fileName = (path: string): string => path.split('/').pop() ?? path;

export default function ApplicationsList({ onUnreadChange }: { onUnreadChange?: () => void }) {
  const [rows, setRows] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);

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

  async function markRead(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    const now = new Date().toISOString();
    setRows((prev) => prev.map((r) => (r.id === id && !r.read_at ? { ...r, read_at: now } : r)));
    await supabase.from('applications').update({ read_at: now, status: 'read' }).eq('id', id);
    onUnreadChange?.();
  }

  function openCard(a: Application) {
    setSelected(a);
    if (!a.read_at) markRead(a.id);
  }

  async function remove(id: string) {
    const supabase = getSupabase();
    if (!supabase) return;
    if (!confirm('Eliminare questa candidatura? L’azione è definitiva.')) return;
    // Rimuove anche i file dal bucket privato (best-effort).
    const app = rows.find((r) => r.id === id);
    if (app?.file_paths?.length) {
      await supabase.storage.from('applications').remove(app.file_paths);
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelected(null);
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
              {a.file_paths.length > 0 && (
                <span class="g-chip">
                  {a.file_paths.length} file
                </span>
              )}
              <span class="g-chip">{a.contact_name}</span>
            </div>
          </article>
        ))}
      </div>

      {selected && (
        <div class="g-overlay" onClick={() => setSelected(null)}>
          <div class="g-drawer" onClick={(e) => e.stopPropagation()}>
            <h3>{selected.artist_name}</h3>
            <p class="g-sub">Ricevuta il {fmtReceived(selected.created_at)}</p>

            <dl class="g-dl">
              <dt>Referente</dt>
              <dd>{selected.contact_name}</dd>
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
              {selected.city && (
                <>
                  <dt>Città</dt>
                  <dd>{selected.city}</dd>
                </>
              )}
              <dt>Genere</dt>
              <dd>{genreText(selected)}</dd>
              {selected.lineup && (
                <>
                  <dt>Formazione</dt>
                  <dd>{selected.lineup}</dd>
                </>
              )}
              {selected.repertoire && (
                <>
                  <dt>Repertorio</dt>
                  <dd>{selected.repertoire}</dd>
                </>
              )}
              {selected.fee && (
                <>
                  <dt>Cachet</dt>
                  <dd>{selected.fee}</dd>
                </>
              )}
              {selected.availability && (
                <>
                  <dt>Disponibilità</dt>
                  <dd>{selected.availability}</dd>
                </>
              )}
            </dl>

            <p class="g-card-body">{selected.bio}</p>
            {selected.experience && <p class="g-card-body">{selected.experience}</p>}
            {selected.note && <p class="g-card-body">{selected.note}</p>}

            {/* Link esterni */}
            <div class="g-files">
              {[selected.link1, selected.link2, selected.link3, selected.epk]
                .filter((l): l is string => !!l)
                .map((l) => (
                  <div class="g-file" key={l}>
                    <a href={l} target="_blank" rel="noopener noreferrer">
                      {l}
                    </a>
                  </div>
                ))}
            </div>

            {/* File caricati: download via signed URL temporaneo */}
            {selected.file_paths.length > 0 && (
              <div class="g-files">
                {selected.file_paths.map((p) => (
                  <div class="g-file" key={p}>
                    <button class="g-btn g-btn-ghost g-btn-sm" type="button" onClick={() => openFile(p)}>
                      ⬇ {fileName(p)}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div class="g-drawer-actions">
              <a class="g-btn" href={`mailto:${selected.email}`}>
                Rispondi via email
              </a>
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
