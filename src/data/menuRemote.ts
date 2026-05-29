// Adapter del menu a build-time.
// Ricostruisce la struttura MenuChapter[] (capitoli → sezioni → rows|items) a
// partire dalle tabelle piatte di Supabase `menu_sections` + `menu_items`.
//
// La logica di rendering e gli helper bilingui (`tx`) restano in src/data/menu.ts:
// qui cambia SOLO la fonte dati. Se Supabase non è configurato o il fetch
// fallisce, si ricade sul menu statico così il sito continua a buildare con
// l'ultimo contenuto noto nel repo.

import {
  menu as staticMenu,
  type MenuChapter,
  type MenuSection,
  type MenuItem,
  type MenuRow,
  type Bilingual,
} from './menu';
import { supabasePublic } from '../lib/supabasePublic';

type SectionRow = {
  id: string;
  chapter_id: string;
  chapter_title_it: string | null;
  chapter_title_en: string | null;
  chapter_intro_it: string | null;
  chapter_intro_en: string | null;
  title_it: string | null;
  title_en: string | null;
  intro_it: string | null;
  intro_en: string | null;
  default_price: string | null;
  render_as: 'rows' | 'items';
  sort_index: number;
};

type ItemRow = {
  id: string;
  section_id: string;
  name: string;
  origin: string | null;
  profile_it: string | null;
  profile_en: string | null;
  desc_it: string | null;
  desc_en: string | null;
  price: string | null;
  sort_index: number;
};

/** Bilingue da due colonne nullable: `en` ricade su `it`, `it` ricade su ''. */
function bi(it: string | null | undefined, en: string | null | undefined): Bilingual {
  const itVal = it ?? '';
  return { it: itVal, en: en ?? itVal };
}

/** Bilingue opzionale: undefined quando entrambe le colonne sono vuote. */
function biOpt(it: string | null | undefined, en: string | null | undefined): Bilingual | undefined {
  if (!it && !en) return undefined;
  return bi(it, en);
}

const orEmpty = (v: string | null | undefined): string | undefined => (v ? v : undefined);

/**
 * Restituisce il menu completo per il rendering pubblico.
 * Build-time only: usato dalle pagine statiche /menu e /en/menu.
 */
export async function getMenu(): Promise<MenuChapter[]> {
  if (!supabasePublic) return staticMenu;

  const [secRes, itemRes] = await Promise.all([
    supabasePublic.from('menu_sections').select('*').order('sort_index', { ascending: true }),
    supabasePublic.from('menu_items').select('*').order('sort_index', { ascending: true }),
  ]);

  const sections = secRes.data as SectionRow[] | null;
  const items = itemRes.data as ItemRow[] | null;

  // Fallback robusto: qualunque errore o tabella vuota → menu statico del repo.
  if (secRes.error || itemRes.error || !sections || sections.length === 0) {
    if (secRes.error || itemRes.error) {
      console.warn('[menuRemote] fetch fallito, uso il menu statico:', secRes.error ?? itemRes.error);
    }
    return staticMenu;
  }

  // Voci raggruppate per sezione (già ordinate per sort_index dalla query).
  const itemsBySection = new Map<string, ItemRow[]>();
  for (const it of items ?? []) {
    const arr = itemsBySection.get(it.section_id) ?? [];
    arr.push(it);
    itemsBySection.set(it.section_id, arr);
  }

  // Sezioni in ordine → capitoli, preservando il primo ordine d'apparizione.
  const chapters: MenuChapter[] = [];
  const byChapterId = new Map<string, MenuChapter>();

  for (const s of sections) {
    let chapter = byChapterId.get(s.chapter_id);
    if (!chapter) {
      chapter = {
        id: s.chapter_id,
        title: bi(s.chapter_title_it, s.chapter_title_en),
        intro: biOpt(s.chapter_intro_it, s.chapter_intro_en),
        sections: [],
      };
      byChapterId.set(s.chapter_id, chapter);
      chapters.push(chapter);
    }

    const sectionItems = itemsBySection.get(s.id) ?? [];
    const section: MenuSection = {
      id: s.id,
      title: bi(s.title_it, s.title_en),
      intro: biOpt(s.intro_it, s.intro_en),
      defaultPrice: orEmpty(s.default_price),
    };

    if (s.render_as === 'rows') {
      section.rows = sectionItems.map((it): MenuRow => ({
        label: it.name,
        price: orEmpty(it.price),
        desc: biOpt(it.desc_it, it.desc_en),
      }));
    } else {
      section.items = sectionItems.map((it): MenuItem => ({
        name: it.name,
        origin: orEmpty(it.origin),
        profile: biOpt(it.profile_it, it.profile_en),
        desc: biOpt(it.desc_it, it.desc_en),
        price: orEmpty(it.price),
      }));
    }

    chapter.sections.push(section);
  }

  return chapters;
}
