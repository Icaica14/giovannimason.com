// Adapter delle News a build-time.
// Espone getNews(): NewsEntry[] (id + slug + dati) leggendo la tabella `news` di
// Supabase (anon read). Stesso modello degli eventi (src/data/eventiRemote.ts).
//
// Robusto: se Supabase non è configurato, o la tabella non esiste ancora (build
// prima della migration 0010), o il fetch fallisce, restituisce [] — la pagina
// News mostra lo stato vuoto e il sito continua a buildare senza errori.

import { supabasePublic } from '../lib/supabasePublic';
import { type NewsEntry, withSlugs } from './news';

type NewsRow = {
  id: string;
  title: string;
  title_en: string | null;
  body: string;
  body_en: string | null;
  images: string[] | null;
  cover_url: string | null;
  published: boolean;
  sort_index: number | null;
  created_at: string | null;
};

function rowToItem(row: NewsRow): { id: string; data: NewsEntry['data'] } {
  return {
    id: row.id,
    data: {
      title: row.title,
      titleEn: row.title_en ?? undefined,
      body: row.body,
      bodyEn: row.body_en ?? undefined,
      images: Array.isArray(row.images) ? row.images.filter(Boolean) : [],
      coverUrl: row.cover_url ?? undefined,
      published: row.published,
      createdAt: row.created_at ?? undefined,
    },
  };
}

/**
 * Tutte le news (pubblicate e bozze: il filtro `published` lo applicano le
 * pagine a valle con publishedNews()). Ordine: sort_index (se impostato),
 * poi le più recenti per prime. Build-time only.
 */
export async function getNews(): Promise<NewsEntry[]> {
  if (!supabasePublic) return [];

  try {
    const { data, error } = await supabasePublic
      .from('news')
      .select('*')
      .order('sort_index', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error || !data) {
      if (error) console.warn('[newsRemote] fetch news non riuscito (tabella assente?):', error.message);
      return [];
    }

    return withSlugs((data as NewsRow[]).map(rowToItem));
  } catch (e) {
    console.warn('[newsRemote] errore inatteso, nessuna news:', e);
    return [];
  }
}
