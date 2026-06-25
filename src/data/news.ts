// Helper delle News. Tipi + funzioni di presentazione pure (nessuna fonte dati):
// la fonte è src/data/newsRemote.ts (Supabase a build-time). L'italiano è il
// campo primario; i campi *En sono opzionali e ricadono sull'italiano, esattamente
// come gli eventi (vedi eventBlurb in src/data/eventi.ts).

import type { Lang } from '../i18n/ui';
import { stripBold } from '../lib/richtext';

export type NewsData = {
  title: string;
  titleEn?: string;
  body: string;
  bodyEn?: string;
  /** URL pubblici delle immagini (bucket `news`), in ordine di caricamento. */
  images: string[];
  /** URL dell'immagine di anteprima scelta; se assente si usa images[0]. */
  coverUrl?: string;
  published: boolean;
  createdAt?: string;
};

// Una news pronta al rendering: id + slug (URL del dettaglio) + dati.
export type NewsEntry = { id: string; slug: string; data: NewsData };

/** Titolo localizzato: EN con fallback su IT. */
export function newsTitle(e: NewsData, lang: Lang): string {
  return lang === 'en' ? (e.titleEn?.trim() || e.title) : e.title;
}

/** Testo localizzato: EN con fallback su IT. */
export function newsBody(e: NewsData, lang: Lang): string {
  return lang === 'en' ? (e.bodyEn?.trim() || e.body) : e.body;
}

/** Spezza il testo in paragrafi (riga vuota = nuovo paragrafo). */
export function newsParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Estratto breve per la card: testo su una riga, troncato al limite di parole. */
export function newsExcerpt(e: NewsData, lang: Lang, max = 150): string {
  const flat = stripBold(newsBody(e, lang)).replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/** Immagine di anteprima: scelta dal manager → prima immagine → undefined (placeholder). */
export function newsCover(e: NewsData): string | undefined {
  if (e.coverUrl && e.coverUrl.trim()) return e.coverUrl;
  return e.images.find((u) => u && u.trim()) || undefined;
}

/** Slug URL da un testo: minuscolo, senza accenti, parole separate da trattino. */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // toglie i segni diacritici
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70)
    .replace(/-+$/g, '');
}

/**
 * Assegna a ogni news uno slug stabile e unico, derivato dal titolo (IT).
 * In caso di collisione aggiunge un suffisso numerico; se il titolo non produce
 * nulla di valido, ripiega su un frammento dell'id. L'ordine in ingresso (per
 * data, decrescente) rende gli slug deterministici fra una build e l'altra.
 */
export function withSlugs(items: { id: string; data: NewsData }[]): NewsEntry[] {
  const seen = new Map<string, number>();
  return items.map(({ id, data }) => {
    const base = slugify(data.title) || `news-${id.slice(0, 8)}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const slug = n === 0 ? base : `${base}-${n + 1}`;
    return { id, slug, data };
  });
}

/** Solo le news pubblicate (le bozze non compaiono sul sito). */
export function publishedNews(items: NewsEntry[]): NewsEntry[] {
  return items.filter((e) => e.data.published !== false);
}
