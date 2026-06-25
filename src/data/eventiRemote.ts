// Adapter degli eventi a build-time.
// Espone getEvents(): la stessa forma { id, data } degli entry della content
// collection, così EventiList e BookingForm usano gli helper puri di
// src/data/eventi.ts (splitEventi, upcomingLive, eventDateLabel…) senza
// modifiche: cambia SOLO la fonte dati.
//
// Fonte primaria: tabella `events` di Supabase (anon read). Se Supabase non è
// configurato o il fetch fallisce, fallback alla content collection `eventi`
// (i JSON nel repo), così il sito continua a buildare con l'ultimo stato noto.

import { getCollection } from 'astro:content';
import { supabasePublic } from '../lib/supabasePublic';
import { withEventSlugs } from './eventi';
import type { EventData, EventEntry, EventEntryWithSlug, EventGenre } from './eventi';

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
  // Stato serata (colonne aggiunte in 0009; opzionali per tollerare DB non migrato).
  status?: string | null;
  status_note?: string | null;
  status_note_en?: string | null;
};

function rowToEntry(row: EventRow): EventEntry {
  const status = row.status === 'cancelled' || row.status === 'postponed' ? row.status : 'regular';
  const data: EventData = {
    artist: row.artist,
    date: row.date,
    time: row.time,
    genre: row.genre as EventGenre,
    blurb: row.blurb ?? undefined,
    blurbEn: row.blurb_en ?? undefined,
    dateLabel: row.date_label ?? undefined,
    dateLabelEn: row.date_label_en ?? undefined,
    poster: row.poster_url,
    venue: row.venue ?? undefined,
    published: row.published,
    status,
    statusNote: row.status_note ?? undefined,
    statusNoteEn: row.status_note_en ?? undefined,
  };
  return { id: row.id, data };
}

/**
 * Tutti gli eventi per il rendering pubblico (pubblicati e non: il filtro
 * `published` è applicato dagli helper splitEventi/upcomingLive a valle).
 * Build-time only.
 */
export async function getEvents(): Promise<EventEntryWithSlug[]> {
  // Slug assegnati alla fonte unica: lista e pagina dettaglio condividono gli stessi.
  return withEventSlugs(await loadEvents());
}

async function loadEvents(): Promise<EventEntry[]> {
  if (!supabasePublic) return getCollection('eventi');

  const { data, error } = await supabasePublic
    .from('events')
    .select('*')
    .order('date', { ascending: false });

  if (error || !data || data.length === 0) {
    if (error) console.warn('[eventiRemote] fetch fallito, uso la content collection:', error);
    return getCollection('eventi');
  }

  return (data as EventRow[]).map(rowToEntry);
}
