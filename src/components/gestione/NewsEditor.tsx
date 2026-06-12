import { useEffect, useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';

/** Riga news come arriva da Supabase. */
type NewsRow = {
  id: string;
  title: string;
  title_en: string | null;
  body: string;
  body_en: string | null;
  images: string[] | null;
  cover_url: string | null;
  published: boolean;
  created_at: string | null;
};

/** Immagine nel drawer: già su Supabase (url) oppure nuova da caricare (file). */
type ImgItem =
  | { kind: 'url'; url: string }
  | { kind: 'file'; file: File; preview: string };

/** Bozza editabile nel drawer. */
type Draft = {
  id: string | null;
  title: string;
  title_en: string;
  body: string;
  body_en: string;
  images: ImgItem[]; // lista unificata e ordinata
  coverIndex: number; // indice dell'anteprima in `images`; -1 = nessuna
  published: boolean;
};

const IMG_MAX = 8 * 1024 * 1024; // 8MB per immagine
const IMG_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGES = 20;

const orNull = (s: string): string | null => {
  const t = s.trim();
  return t ? t : null;
};

const safeName = (name: string): string =>
  (name.split(/[\\/]/).pop() ?? 'img')
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'img';

const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const fmtDate = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
};

const imgCount = (n: number): string =>
  n === 0 ? 'Nessuna immagine' : n === 1 ? '1 immagine' : `${n} immagini`;

const itemUrl = (it: ImgItem): string => (it.kind === 'url' ? it.url : it.preview);

function emptyDraft(): Draft {
  return { id: null, title: '', title_en: '', body: '', body_en: '', images: [], coverIndex: -1, published: true };
}

export default function NewsEditor() {
  const [rows, setRows] = useState<NewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    setLoading(false);
    if (error) {
      setError('Impossibile caricare le news.');
      return;
    }
    setRows((data as NewsRow[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function revokePreviews(d: Draft | null) {
    if (!d) return;
    d.images.forEach((it) => {
      if (it.kind === 'file') URL.revokeObjectURL(it.preview);
    });
  }

  function openNew() {
    setDraft(emptyDraft());
    setFormError(null);
    setOk(null);
  }

  function openEdit(row: NewsRow) {
    const imgs: ImgItem[] = (row.images ?? []).filter(Boolean).map((url) => ({ kind: 'url', url }));
    let coverIndex = -1;
    if (row.cover_url) coverIndex = imgs.findIndex((it) => it.kind === 'url' && it.url === row.cover_url);
    if (coverIndex < 0 && imgs.length > 0) coverIndex = 0;
    setDraft({
      id: row.id,
      title: row.title,
      title_en: row.title_en ?? '',
      body: row.body,
      body_en: row.body_en ?? '',
      images: imgs,
      coverIndex,
      published: row.published,
    });
    setFormError(null);
    setOk(null);
  }

  function closeDrawer() {
    revokePreviews(draft);
    setDraft(null);
    setFormError(null);
  }

  function patch(p: Partial<Draft>) {
    setDraft((d) => (d ? { ...d, ...p } : d));
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const accepted: ImgItem[] = [];
    let err: string | null = null;
    for (const file of Array.from(files)) {
      if (!IMG_TYPES.has(file.type)) {
        err = 'Le immagini devono essere JPG, PNG o WebP.';
        continue;
      }
      if (file.size > IMG_MAX) {
        err = `"${file.name}" supera 8MB.`;
        continue;
      }
      accepted.push({ kind: 'file', file, preview: URL.createObjectURL(file) });
    }
    setFormError(err);
    if (accepted.length === 0) return;
    setDraft((d) => {
      if (!d) return d;
      const images = [...d.images, ...accepted].slice(0, MAX_IMAGES);
      return { ...d, images, coverIndex: d.coverIndex < 0 ? 0 : d.coverIndex };
    });
  }

  function removeImage(idx: number) {
    setDraft((d) => {
      if (!d) return d;
      const it = d.images[idx];
      if (it && it.kind === 'file') URL.revokeObjectURL(it.preview);
      const images = d.images.filter((_, i) => i !== idx);
      let coverIndex = d.coverIndex;
      if (images.length === 0) coverIndex = -1;
      else if (idx === d.coverIndex) coverIndex = 0;
      else if (idx < d.coverIndex) coverIndex = d.coverIndex - 1;
      return { ...d, images, coverIndex };
    });
  }

  async function save() {
    const supabase = getSupabase();
    if (!supabase || !draft) return;
    if (!draft.title.trim() || !draft.body.trim()) {
      setFormError('Inserisci almeno il titolo e il testo della news.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const id = draft.id ?? newId();

      // Carica le nuove immagini mantenendo l'ordine della lista; le esistenti
      // restano col loro URL.
      const finalUrls: string[] = [];
      for (const it of draft.images) {
        if (it.kind === 'url') {
          finalUrls.push(it.url);
          continue;
        }
        const path = `${id}/${newId().slice(0, 8)}-${safeName(it.file.name)}`;
        const { error: upErr } = await supabase.storage
          .from('news')
          .upload(path, it.file, { upsert: true, contentType: it.file.type });
        if (upErr) throw upErr;
        finalUrls.push(supabase.storage.from('news').getPublicUrl(path).data.publicUrl);
      }

      const coverUrl =
        draft.coverIndex >= 0 && draft.coverIndex < finalUrls.length
          ? finalUrls[draft.coverIndex]
          : finalUrls[0] ?? null;

      const payload = {
        title: draft.title.trim(),
        title_en: orNull(draft.title_en),
        body: draft.body.trim(),
        body_en: orNull(draft.body_en),
        images: finalUrls,
        cover_url: coverUrl,
        published: draft.published,
      };

      if (draft.id) {
        const { error } = await supabase.from('news').update(payload).eq('id', draft.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('news').insert({ id, ...payload });
        if (error) throw error;
      }

      await load();
      closeDrawer();
      setOk('News salvata. Il sito pubblico si aggiornerà tra 1-2 minuti.');
    } catch (e) {
      console.error('[NewsEditor] save error:', e);
      setFormError('Salvataggio non riuscito. Riprova.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    const supabase = getSupabase();
    if (!supabase || !draft?.id) return;
    if (!confirm('Eliminare questa news? L’azione è definitiva.')) return;
    setSaving(true);
    const { error } = await supabase.from('news').delete().eq('id', draft.id);
    setSaving(false);
    if (error) {
      setFormError('Eliminazione non riuscita.');
      return;
    }
    await load();
    closeDrawer();
    setOk('News eliminata. Il sito pubblico si aggiornerà tra 1-2 minuti.');
  }

  const card = (row: NewsRow) => {
    const cover = row.cover_url || (row.images && row.images[0]) || '';
    return (
      <article
        key={row.id}
        class="g-card ev-card"
        onClick={() => openEdit(row)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openEdit(row);
          }
        }}
      >
        {cover ? (
          <img class="ev-thumb" src={cover} alt="" loading="lazy" />
        ) : (
          <span class="ev-thumb news-thumb-empty" aria-hidden="true">—</span>
        )}
        <div class="ev-card-body">
          <h3 class="g-card-title">{row.title}</h3>
          <div class="g-card-meta">
            <span>{fmtDate(row.created_at)}</span>
            <span>{imgCount(row.images?.length ?? 0)}</span>
          </div>
          <div class="g-chiprow">{!row.published && <span class="g-chip g-chip-warn">Bozza</span>}</div>
        </div>
      </article>
    );
  };

  return (
    <section>
      <div class="me-bar">
        <div>
          <h2 class="g-h2">News</h2>
          <p class="g-sub">{rows.length === 0 ? 'Pubblica la prima notizia.' : `${rows.length} news`}</p>
        </div>
        <button class="g-btn" type="button" onClick={openNew}>
          + Nuova news
        </button>
      </div>

      {error && <div class="g-msg g-msg-err">{error}</div>}
      {ok && <div class="g-msg g-msg-ok">{ok}</div>}
      {loading && <div class="g-center">Caricamento…</div>}

      {!loading && rows.length === 0 && !error && (
        <div class="g-empty">Nessuna news. Usa “Nuova news” per pubblicarne una.</div>
      )}

      {rows.length > 0 && <div class="g-cards">{rows.map(card)}</div>}

      {draft && (
        <div class="g-overlay" onClick={closeDrawer}>
          <div class="g-drawer" onClick={(e) => e.stopPropagation()}>
            <h3>{draft.id ? 'Modifica news' : 'Nuova news'}</h3>

            {formError && <div class="g-msg g-msg-err">{formError}</div>}

            <div class="g-field">
              <label>Titolo</label>
              <input
                class="g-input"
                type="text"
                value={draft.title}
                onInput={(e) => patch({ title: (e.target as HTMLInputElement).value })}
              />
            </div>
            <div class="g-field">
              <label>Titolo EN (opzionale)</label>
              <input
                class="g-input"
                type="text"
                value={draft.title_en}
                onInput={(e) => patch({ title_en: (e.target as HTMLInputElement).value })}
              />
            </div>

            <div class="g-field">
              <label>Testo</label>
              <textarea
                class="g-textarea g-textarea-tall"
                value={draft.body}
                onInput={(e) => patch({ body: (e.target as HTMLTextAreaElement).value })}
              />
              <p class="news-field-hint">Lascia una riga vuota fra un paragrafo e l’altro.</p>
            </div>
            <div class="g-field">
              <label>Testo EN (opzionale)</label>
              <textarea
                class="g-textarea g-textarea-tall"
                value={draft.body_en}
                onInput={(e) => patch({ body_en: (e.target as HTMLTextAreaElement).value })}
              />
            </div>

            <div class="g-field">
              <label>Immagini</label>
              <p class="news-field-hint">
                Tocca la <strong>stella ★</strong> per scegliere l’immagine di anteprima (quella mostrata nella lista
                news). Se non scegli nulla, usiamo la prima. JPG, PNG o WebP, max 8MB l’una.
              </p>
              {draft.images.length > 0 && (
                <div class="news-img-grid">
                  {draft.images.map((it, idx) => (
                    <div class={`news-img-item${idx === draft.coverIndex ? ' is-cover' : ''}`}>
                      <img class="news-img-thumb" src={itemUrl(it)} alt="" />
                      <button
                        type="button"
                        class="news-img-star"
                        aria-label={idx === draft.coverIndex ? 'Immagine di anteprima' : 'Scegli come anteprima'}
                        aria-pressed={idx === draft.coverIndex}
                        onClick={() => patch({ coverIndex: idx })}
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        class="news-img-remove"
                        aria-label="Rimuovi immagine"
                        onClick={() => removeImage(idx)}
                      >
                        ×
                      </button>
                      {idx === draft.coverIndex && <span class="news-img-cover-tag">Anteprima</span>}
                    </div>
                  ))}
                </div>
              )}
              <input
                class="g-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => {
                  addFiles((e.target as HTMLInputElement).files);
                  (e.target as HTMLInputElement).value = '';
                }}
              />
            </div>

            <label class="ev-check">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => patch({ published: (e.target as HTMLInputElement).checked })}
              />
              Pubblicata (visibile sul sito)
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
