import { useEffect, useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';

/** Sezione del menu (struttura fissa in v1; editabile solo il prezzo di sezione). */
type Section = {
  id: string;
  chapter_id: string;
  chapter_title_it: string | null;
  title_it: string | null;
  default_price: string | null;
  render_as: 'rows' | 'items';
  sort_index: number;
};

/** Voce editabile, con stato client (chiave stabile, id persistito, dirty). */
type EditItem = {
  key: string;
  id: string | null;
  section_id: string;
  name: string;
  origin: string;
  profile_it: string;
  profile_en: string;
  desc_it: string;
  desc_en: string;
  price: string;
  sort_index: number;
  dirty: boolean;
};

const newKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `k-${Date.now()}-${Math.random()}`;

/** Stringa pulita o null per non sporcare il DB con campi vuoti. */
const orNull = (s: string): string | null => {
  const t = s.trim();
  return t ? t : null;
};

export default function MenuEditor() {
  const [sections, setSections] = useState<Section[]>([]);
  const [items, setItems] = useState<EditItem[]>([]);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function load() {
    const supabase = getSupabase();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    setOk(null);
    const [secRes, itemRes] = await Promise.all([
      supabase
        .from('menu_sections')
        .select('id,chapter_id,chapter_title_it,title_it,default_price,render_as,sort_index')
        .order('sort_index', { ascending: true }),
      supabase.from('menu_items').select('*').order('sort_index', { ascending: true }),
    ]);
    setLoading(false);
    if (secRes.error || itemRes.error) {
      setError('Impossibile caricare il menu.');
      return;
    }
    setSections((secRes.data as Section[]) ?? []);
    setItems(
      ((itemRes.data as any[]) ?? []).map((r): EditItem => ({
        key: r.id,
        id: r.id,
        section_id: r.section_id,
        name: r.name ?? '',
        origin: r.origin ?? '',
        profile_it: r.profile_it ?? '',
        profile_en: r.profile_en ?? '',
        desc_it: r.desc_it ?? '',
        desc_en: r.desc_en ?? '',
        price: r.price ?? '',
        sort_index: r.sort_index ?? 0,
        dirty: false,
      })),
    );
    setDeletedIds([]);
    setDirtySections(new Set());
  }

  useEffect(() => {
    load();
  }, []);

  const hasChanges =
    items.some((i) => i.dirty) || deletedIds.length > 0 || dirtySections.size > 0;

  function patchItem(key: string, patch: Partial<EditItem>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch, dirty: true } : i)));
    setOk(null);
  }

  function addItem(sectionId: string) {
    const inSection = items.filter((i) => i.section_id === sectionId);
    const nextSort = inSection.reduce((m, i) => Math.max(m, i.sort_index), -1) + 1;
    setItems((prev) => [
      ...prev,
      {
        key: newKey(),
        id: null,
        section_id: sectionId,
        name: '',
        origin: '',
        profile_it: '',
        profile_en: '',
        desc_it: '',
        desc_en: '',
        price: '',
        sort_index: nextSort,
        dirty: true,
      },
    ]);
    setOk(null);
  }

  function removeItem(key: string) {
    const item = items.find((i) => i.key === key);
    if (!item) return;
    if (item.id && !confirm('Eliminare questa voce dal menu?')) return;
    if (item.id) setDeletedIds((prev) => [...prev, item.id as string]);
    setItems((prev) => prev.filter((i) => i.key !== key));
    setOk(null);
  }

  function setSectionPrice(sectionId: string, value: string) {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, default_price: value } : s)));
    setDirtySections((prev) => new Set(prev).add(sectionId));
    setOk(null);
  }

  async function save() {
    const supabase = getSupabase();
    if (!supabase) return;

    // Validazione: ogni voce deve avere un nome.
    if (items.some((i) => !i.name.trim())) {
      setError('Ogni voce deve avere un nome. Completa o rimuovi le voci vuote.');
      return;
    }

    setSaving(true);
    setError(null);
    setOk(null);

    try {
      // 1) Eliminazioni.
      if (deletedIds.length) {
        const { error } = await supabase.from('menu_items').delete().in('id', deletedIds);
        if (error) throw error;
      }

      // 2) Prezzi di sezione modificati.
      for (const sectionId of dirtySections) {
        const sec = sections.find((s) => s.id === sectionId);
        const { error } = await supabase
          .from('menu_sections')
          .update({ default_price: orNull(sec?.default_price ?? '') })
          .eq('id', sectionId);
        if (error) throw error;
      }

      // 3) Voci nuove e modificate.
      for (const it of items.filter((i) => i.dirty)) {
        const payload = {
          section_id: it.section_id,
          name: it.name.trim(),
          origin: orNull(it.origin),
          profile_it: orNull(it.profile_it),
          profile_en: orNull(it.profile_en),
          desc_it: orNull(it.desc_it),
          desc_en: orNull(it.desc_en),
          price: orNull(it.price),
          sort_index: it.sort_index,
        };
        if (it.id) {
          const { error } = await supabase.from('menu_items').update(payload).eq('id', it.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('menu_items').insert(payload);
          if (error) throw error;
        }
      }

      // Ricarica per riallineare gli id e ripulire i flag dirty.
      await load();
      setOk('Modifiche salvate. Il sito pubblico si aggiornerà tra 1-2 minuti.');
    } catch (e) {
      console.error('[MenuEditor] save error:', e);
      setError('Salvataggio non riuscito. Riprova.');
    } finally {
      setSaving(false);
    }
  }

  // Capitoli in ordine di prima apparizione.
  const chapters: { id: string; title: string; sections: Section[] }[] = [];
  const byChapter = new Map<string, { id: string; title: string; sections: Section[] }>();
  for (const s of sections) {
    let c = byChapter.get(s.chapter_id);
    if (!c) {
      c = { id: s.chapter_id, title: s.chapter_title_it ?? s.chapter_id, sections: [] };
      byChapter.set(s.chapter_id, c);
      chapters.push(c);
    }
    c.sections.push(s);
  }

  return (
    <section>
      <div class="me-bar">
        <div>
          <h2 class="g-h2">Menu</h2>
          <p class="g-sub">Aggiungi, modifica o rimuovi voci e prezzi. Le sezioni sono fisse.</p>
        </div>
        <button class="g-btn" type="button" onClick={save} disabled={!hasChanges || saving}>
          {saving ? 'Salvataggio…' : 'Salva modifiche'}
        </button>
      </div>

      {error && <div class="g-msg g-msg-err">{error}</div>}
      {ok && <div class="g-msg g-msg-ok">{ok}</div>}
      {loading && <div class="g-center">Caricamento…</div>}

      {!loading &&
        chapters.map((chapter) => (
          <div key={chapter.id} class="me-chapter">
            <h3 class="me-chapter-title">{chapter.title}</h3>

            {chapter.sections.map((section) => {
              const secItems = items
                .filter((i) => i.section_id === section.id)
                .sort((a, b) => a.sort_index - b.sort_index);
              const isRows = section.render_as === 'rows';
              return (
                <div key={section.id} class="me-section">
                  <header class="me-section-head">
                    <h4>{section.title_it ?? section.id}</h4>
                    <label class="me-price-label">
                      Prezzo sezione (€)
                      <input
                        class="g-input me-price-input"
                        type="text"
                        inputMode="decimal"
                        value={section.default_price ?? ''}
                        placeholder="—"
                        onInput={(e) => setSectionPrice(section.id, (e.target as HTMLInputElement).value)}
                      />
                    </label>
                  </header>

                  <div class="me-items">
                    {secItems.map((it) => (
                      <div key={it.key} class="me-item">
                        <div class="me-row-main">
                          <input
                            class="g-input me-name"
                            type="text"
                            value={it.name}
                            placeholder={isRows ? 'Nome (es. Friulano)' : 'Nome voce'}
                            onInput={(e) => patchItem(it.key, { name: (e.target as HTMLInputElement).value })}
                          />
                          {!isRows && (
                            <input
                              class="g-input me-origin"
                              type="text"
                              value={it.origin}
                              placeholder="Origine (es. (UK))"
                              onInput={(e) => patchItem(it.key, { origin: (e.target as HTMLInputElement).value })}
                            />
                          )}
                          <input
                            class="g-input me-price"
                            type="text"
                            inputMode="decimal"
                            value={it.price}
                            placeholder={section.default_price ? `€ ${section.default_price}` : '€'}
                            onInput={(e) => patchItem(it.key, { price: (e.target as HTMLInputElement).value })}
                          />
                          <button
                            class="g-btn g-btn-danger g-btn-sm me-del"
                            type="button"
                            title="Elimina voce"
                            onClick={() => removeItem(it.key)}
                          >
                            ✕
                          </button>
                        </div>

                        {!isRows && (
                          <div class="me-row-detail">
                            <input
                              class="g-input"
                              type="text"
                              value={it.profile_it}
                              placeholder="Profilo IT (riga corta)"
                              onInput={(e) => patchItem(it.key, { profile_it: (e.target as HTMLInputElement).value })}
                            />
                            <input
                              class="g-input"
                              type="text"
                              value={it.profile_en}
                              placeholder="Profile EN (short line)"
                              onInput={(e) => patchItem(it.key, { profile_en: (e.target as HTMLInputElement).value })}
                            />
                            <textarea
                              class="g-textarea"
                              value={it.desc_it}
                              placeholder="Descrizione IT"
                              onInput={(e) => patchItem(it.key, { desc_it: (e.target as HTMLTextAreaElement).value })}
                            />
                            <textarea
                              class="g-textarea"
                              value={it.desc_en}
                              placeholder="Description EN"
                              onInput={(e) => patchItem(it.key, { desc_en: (e.target as HTMLTextAreaElement).value })}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button class="g-btn g-btn-ghost g-btn-sm" type="button" onClick={() => addItem(section.id)}>
                    + Aggiungi voce
                  </button>
                </div>
              );
            })}
          </div>
        ))}

      {!loading && sections.length === 0 && !error && (
        <div class="g-empty">
          Nessuna sezione di menu. Esegui prima il seed delle tabelle <code>menu_sections</code> /{' '}
          <code>menu_items</code> su Supabase.
        </div>
      )}
    </section>
  );
}
