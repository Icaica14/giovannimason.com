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
import type { EventData, EventEntry, EventGenre } from './eventi';

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
  published: boolean;
  sort_index: number | null;
};

function rowToEntry(row: EventRow): EventEntry {
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
    published: row.published,
  };
  return { id: row.id, data };
}

/**
 * Tutti gli eventi per il rendering pubblico (pubblicati e non: il filtro
 * `published` è applicato dagli helper splitEventi/upcomingLive a valle).
 * Build-time only.
 */
export async function getEvents(): Promise<EventEntry[]> {
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
