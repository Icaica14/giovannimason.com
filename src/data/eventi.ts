// Helper degli eventi. Gli eventi NON sono più hardcoded qui: vivono come schede
// JSON in src/content/eventi/, editabili dall'area riservata (vedi src/content.config.ts).
// Questo modulo espone solo tipi, etichette di genere e funzioni di presentazione.

import type { Lang } from '../i18n/ui';
import type { CollectionEntry } from 'astro:content';

export type Bilingual = { it: string; en: string };

export type EventGenre =
  | 'jazz' | 'blues' | 'soul' | 'indie' | 'songwriter'
  | 'reading' | 'workshop' | 'sport' | 'altro';

// Etichette del badge di genere (fisse, non editabili dal manager).
export const genreLabel: Record<EventGenre, Bilingual> = {
  jazz:       { it: 'Giovedì Jazz',       en: 'Thursday Jazz' },
  blues:      { it: 'Blues',              en: 'Blues' },
  soul:       { it: 'Pop & Soul',         en: 'Pop & Soul' },
  indie:      { it: 'Indie',              en: 'Indie' },
  songwriter: { it: 'Voci emergenti',     en: 'Emerging voices' },
  reading:    { it: 'Reading',            en: 'Reading' },
  workshop:   { it: 'Workshop',           en: 'Workshop' },
  sport:      { it: 'Sport',              en: 'Sport' },
  altro:      { it: 'Altro',              en: 'Other' },
};

export function tx(node: Bilingual, lang: Lang): string {
  return node[lang] ?? node.it;
}

// Luoghi dei concerti. Sono nomi propri: identici in IT/EN.
export type EventVenue = 'biblio-bistrot' | 'giardinetti';
export const VENUE_DEFAULT: EventVenue = 'biblio-bistrot';
export const venueLabel: Record<EventVenue, Bilingual> = {
  'biblio-bistrot': { it: 'Biblio Bistrot',              en: 'Biblio Bistrot' },
  'giardinetti':    { it: 'Giardinetti di Sant’Andrea',  en: 'Giardinetti di Sant’Andrea' },
};
// Etichetta luogo localizzata, con fallback robusto al Bistrot.
export function eventVenue(e: EventData, lang: Lang): string {
  const key = (e.venue as EventVenue) || VENUE_DEFAULT;
  return tx(venueLabel[key] ?? venueLabel[VENUE_DEFAULT], lang);
}

export type EventData = CollectionEntry<'eventi'>['data'];

// Forma minima usata dalle funzioni di presentazione/split: id + data.
// Sia gli entry della content collection (CollectionEntry<'eventi'>) sia gli
// oggetti costruiti dall'adapter remoto (eventiRemote.getEvents) sono assegnabili
// a questo tipo: così gli helper restano puri e funzionano con entrambe le fonti.
export type EventEntry = { id: string; data: EventData };

// Etichetta data localizzata e derivata dalla data ISO (es. "Giovedì 23 aprile").
// Il manager non la digita: basta scegliere la data.
const dateFmt: Record<Lang, Intl.DateTimeFormat> = {
  it: new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }),
  en: new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
};
export function autoDateLabel(dateISO: string, lang: Lang): string {
  const d = new Date(`${dateISO.slice(0, 10)}T12:00:00`); // mezzogiorno: nessuna sorpresa di fuso
  const s = dateFmt[lang].format(d);
  return s.charAt(0).toUpperCase() + s.slice(1); // maiuscola iniziale (it: giovedì → Giovedì)
}

const weekdayFmt: Record<Lang, Intl.DateTimeFormat> = {
  it: new Intl.DateTimeFormat('it-IT', { weekday: 'long' }),
  en: new Intl.DateTimeFormat('en-GB', { weekday: 'long' }),
};
const dayMonthFmt: Record<Lang, Intl.DateTimeFormat> = {
  it: new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long' }),
  en: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }),
};
// Solo giorno della settimana (es. "Giovedì") — usato dai chip della prenota.
export function autoWeekday(dateISO: string, lang: Lang): string {
  const s = weekdayFmt[lang].format(new Date(`${dateISO.slice(0, 10)}T12:00:00`));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
// Solo giorno + mese (es. "30 aprile") — usato dai chip della prenota.
export function autoShortDate(dateISO: string, lang: Lang): string {
  return dayMonthFmt[lang].format(new Date(`${dateISO.slice(0, 10)}T12:00:00`));
}

// Override manuale solo per casi speciali (doppie serate); altrimenti auto.
export function eventDateLabel(e: EventData, lang: Lang): string {
  if (lang === 'en') return e.dateLabelEn ?? e.dateLabel ?? autoDateLabel(e.date, 'en');
  return e.dateLabel ?? autoDateLabel(e.date, 'it');
}

// Blurb: IT primario, EN opzionale con fallback su IT.
export function eventBlurb(e: EventData, lang: Lang): string | undefined {
  if (!e.blurb && !e.blurbEn) return undefined;
  return lang === 'en' ? (e.blurbEn ?? e.blurb) : e.blurb;
}

// Stato della serata: normale, annullata o rimandata.
export type EventStatus = 'regular' | 'cancelled' | 'postponed';
// Etichetta automatica dello stato (mostrata in rosso sull'annuncio).
export const statusLabel: Record<'cancelled' | 'postponed', Bilingual> = {
  cancelled: { it: 'Annullata', en: 'Cancelled' },
  postponed: { it: 'Rimandata', en: 'Postponed' },
};
// Stato robusto, con fallback a 'regular' se il dato manca (es. colonna assente).
export function eventStatus(e: EventData): EventStatus {
  const s = (e as { status?: string }).status;
  return s === 'cancelled' || s === 'postponed' ? s : 'regular';
}
// Messaggio libero dello stato: IT primario, EN opzionale con fallback su IT.
export function eventStatusNote(e: EventData, lang: Lang): string | undefined {
  const it = (e as { statusNote?: string }).statusNote;
  const en = (e as { statusNoteEn?: string }).statusNoteEn;
  const v = lang === 'en' ? (en ?? it) : it;
  return v && v.trim() ? v : undefined;
}

// Suddivide gli eventi pubblicati in "in arrivo" e "passati" rispetto a today (ISO),
// ordinati per data discendente. today è passato come stringa per evitare TZ surprise.
export function splitEventi(entries: EventEntry[], today: string) {
  const day = (e: EventEntry) => e.data.date.slice(0, 10);
  const published = entries
    .filter((e) => e.data.published !== false)
    .sort((a, b) => (day(a) < day(b) ? 1 : -1));
  const upcoming = published.filter((e) => day(e) >= today);
  const past     = published.filter((e) => day(e) < today);
  return { upcoming, past };
}

// Prossime serate live (pubblicate, data ≥ oggi), in ordine crescente. Usata dai
// chip della pagina prenota, così si aggiornano da sole quando il manager pubblica.
export function upcomingLive(
  entries: EventEntry[],
  today: string,
  limit = 6,
) {
  return entries
    .filter((e) => e.data.published !== false && e.data.date.slice(0, 10) >= today)
    .sort((a, b) => (a.data.date.slice(0, 10) < b.data.date.slice(0, 10) ? -1 : 1))
    .slice(0, limit);
}
