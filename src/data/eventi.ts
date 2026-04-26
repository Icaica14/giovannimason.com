// Eventi di Biblio — origine unica, ordinata per data discendente.
// Le locandine sono importate come asset Astro per ottimizzazione automatica.

import type { Lang } from '../i18n/ui';
import type { ImageMetadata } from 'astro';

import poster1  from '../assets/img/locandine/locandine-1.png';   // Dual Sparks
import poster2  from '../assets/img/locandine/locandine-2.png';   // Devil Misses Flowers
import poster3  from '../assets/img/locandine/locandine-3.png';   // Trabucco/Alfonso + Psychoosteria
import poster4  from '../assets/img/locandine/locandine-4.png';   // Linda
import poster5  from '../assets/img/locandine/locandine-5.png';   // Workshop pittura
import poster6  from '../assets/img/locandine/locandine-6.png';   // Reading Gallazzi
import poster7  from '../assets/img/locandine/locandine-7.png';   // Di Gioia/Pellegrino + The Reply
import poster8  from '../assets/img/locandine/locandine-8.png';   // Quai des Brumes
import poster9  from '../assets/img/locandine/locandine-9.png';   // Reckless Blues Band
import poster10 from '../assets/img/locandine/locandine-10.png';  // Gaia
import poster11 from '../assets/img/locandine/locandine-11.png';  // Camilla
import poster12 from '../assets/img/locandine/locandine-12.png';  // Calgaro
import poster13 from '../assets/img/locandine/locandine-13.png';  // Emma
import poster14 from '../assets/img/locandine/locandine-14.png';  // Bosco

export type Bilingual = { it: string; en: string };

export type EventGenre =
  | 'jazz' | 'blues' | 'soul' | 'indie' | 'songwriter'
  | 'reading' | 'workshop';

export type EventItem = {
  id: string;
  artist: string;
  /** ISO date (or earliest of a 2-night billing) — usato per l\u2019ordinamento */
  date: string;
  /** Etichetta data IT/EN da mostrare in card */
  dateLabel: Bilingual;
  /** Ora / range orario (es. "20:00", "18:30–20:30") */
  time: string;
  genre: EventGenre;
  /** Riga descrittiva sotto l\u2019artista (formazione, generi, "voci emergenti", ecc.) */
  blurb?: Bilingual;
  poster: ImageMetadata;
};

// Etichette del badge di genere
export const genreLabel: Record<EventGenre, Bilingual> = {
  jazz:       { it: 'Giovedì Jazz',       en: 'Thursday Jazz' },
  blues:      { it: 'Blues',              en: 'Blues' },
  soul:       { it: 'Pop & Soul',         en: 'Pop & Soul' },
  indie:      { it: 'Indie',              en: 'Indie' },
  songwriter: { it: 'Voci emergenti',     en: 'Emerging voices' },
  reading:    { it: 'Reading',            en: 'Reading' },
  workshop:   { it: 'Workshop',           en: 'Workshop' },
};

// In ordine cronologico inverso (i più recenti / futuri prima).
// Oggi è 2026-04-26.
export const eventi: EventItem[] = [
  {
    id: 'gallazzi-2026-04-29',
    artist: 'Dario Gallazzi',
    date: '2026-04-29',
    dateLabel: { it: 'Mercoledì 29 aprile',    en: 'Wednesday 29 April' },
    time: '19:00',
    genre: 'reading',
    blurb: {
      it: 'Reading di poesia orale: «Nasci calamaro, muori frittura».',
      en: 'Spoken-poetry reading: "Nasci calamaro, muori frittura".',
    },
    poster: poster6,
  },
  {
    id: 'dual-sparks-2026-04-26',
    artist: 'Dual Sparks',
    date: '2026-04-26',
    dateLabel: { it: 'Domenica 26 aprile',     en: 'Sunday 26 April' },
    time: '18:30',
    genre: 'songwriter',
    blurb: {
      it: 'Acoustic duo della domenica: chitarre, voci, repertorio internazionale.',
      en: 'Sunday acoustic duo: guitars, voices, international songbook.',
    },
    poster: poster1,
  },
  {
    id: 'devil-misses-flowers-2026-04-25',
    artist: 'Devil Misses Flowers',
    date: '2026-04-25',
    dateLabel: { it: 'Sabato 25 aprile',       en: 'Saturday 25 April' },
    time: '20:30',
    genre: 'indie',
    blurb: {
      it: 'Serata indie: la band sale al primo piano per un set elettrico.',
      en: 'Indie night — the band takes the upstairs stage for an electric set.',
    },
    poster: poster2,
  },
  {
    id: 'biblio-live-2026-04-23',
    artist: 'Marco Trabucco & Matteo Alfonso · Psychoosteria',
    date: '2026-04-23',
    dateLabel: { it: 'Giovedì 23 + Venerdì 24 aprile', en: 'Thu 23 + Fri 24 April' },
    time: '20:00',
    genre: 'jazz',
    blurb: {
      it: 'Doppia serata Biblio Live: contrabbasso e piano giovedì, Psychoosteria venerdì.',
      en: 'Biblio Live double bill: double bass + piano on Thursday, Psychoosteria on Friday.',
    },
    poster: poster3,
  },
  {
    id: 'linda-2026-04-19',
    artist: 'Linda',
    date: '2026-04-19',
    dateLabel: { it: 'Domenica 19 aprile',     en: 'Sunday 19 April' },
    time: '19:00',
    genre: 'songwriter',
    blurb: {
      it: 'OnTheCorner — voce e chitarra, il pomeriggio della domenica si allunga.',
      en: 'OnTheCorner — voice and guitar, a Sunday afternoon set that stretches into evening.',
    },
    poster: poster4,
  },
  {
    id: 'workshop-camarin-2026-04-15',
    artist: 'Filippo Camarin',
    date: '2026-04-15',
    dateLabel: { it: 'Mercoledì 15 aprile',    en: 'Wednesday 15 April' },
    time: '18:30 – 20:30',
    genre: 'workshop',
    blurb: {
      it: 'Workshop di pittura esperienziale a cura di Filippo Camarin.',
      en: 'Experiential painting workshop with Filippo Camarin.',
    },
    poster: poster5,
  },
  {
    id: 'di-gioia-pellegrino-da-ros-2026-04-09',
    artist: 'Di Gioia · Pellegrino · Da Ros',
    date: '2026-04-09',
    dateLabel: { it: 'Giovedì 9 aprile',       en: 'Thursday 9 April' },
    time: '20:00',
    genre: 'jazz',
    blurb: {
      it: 'Sax contralto, contrabbasso e batteria. Un trio sui binari del jazz contemporaneo.',
      en: 'Alto sax, double bass and drums — a trio on the rails of contemporary jazz.',
    },
    poster: poster7,
  },
  {
    id: 'the-reply-2026-04-10',
    artist: 'The Reply',
    date: '2026-04-10',
    dateLabel: { it: 'Venerdì 10 aprile',      en: 'Friday 10 April' },
    time: '20:00',
    genre: 'soul',
    blurb: {
      it: 'Pop & Soul: voce piena e ritmica calda per chiudere la settimana.',
      en: 'Pop & Soul: full voice and warm groove to close out the week.',
    },
    poster: poster7,
  },
  {
    id: 'quai-des-brumes-2026-03-19',
    artist: 'Quai des Brumes',
    date: '2026-03-19',
    dateLabel: { it: 'Giovedì 19 marzo',       en: 'Thursday 19 March' },
    time: '20:00',
    genre: 'jazz',
    blurb: {
      it: 'Federico Benedetti, Tolga During, Roberto Bartoli — clarinetto, chitarra, contrabbasso.',
      en: 'Federico Benedetti, Tolga During, Roberto Bartoli — clarinet, guitar, double bass.',
    },
    poster: poster8,
  },
  {
    id: 'reckless-blues-band-2026-03-20',
    artist: 'Reckless Blues Band',
    date: '2026-03-20',
    dateLabel: { it: 'Venerdì 20 marzo',       en: 'Friday 20 March' },
    time: '20:00',
    genre: 'blues',
    blurb: {
      it: 'Il blues spinto della band del venerdì: il bancone si muove.',
      en: 'The Friday blues band turned up — the counter starts moving.',
    },
    poster: poster9,
  },
  {
    id: 'gaia-2026-03-15',
    artist: 'Gaia',
    date: '2026-03-15',
    dateLabel: { it: 'Domenica 15 marzo',      en: 'Sunday 15 March' },
    time: '18:00',
    genre: 'songwriter',
    blurb: {
      it: 'OnTheCorner — voce e chitarra al tramonto della domenica.',
      en: 'OnTheCorner — voice and guitar at Sunday sunset.',
    },
    poster: poster10,
  },
  {
    id: 'camilla-2025-03-15',
    artist: 'Camilla',
    date: '2025-03-15',
    dateLabel: { it: 'Sabato 15 marzo',        en: 'Saturday 15 March' },
    time: '18:00',
    genre: 'songwriter',
    blurb: {
      it: 'OnTheCorner — sera di musica acustica, una voce sola e il microfono.',
      en: 'OnTheCorner — an acoustic evening, one voice and the mic.',
    },
    poster: poster11,
  },
  {
    id: 'bosco-2026-02-22',
    artist: 'Bosco in full band',
    date: '2026-02-22',
    dateLabel: { it: 'Domenica 22 febbraio',   en: 'Sunday 22 February' },
    time: '18:30 – 20:30',
    genre: 'songwriter',
    blurb: {
      it: 'Bosco in formazione completa: chitarra, voce e band al primo piano.',
      en: 'Bosco in full band: guitar, voice and full lineup upstairs.',
    },
    poster: poster14,
  },
  {
    id: 'calgaro-biblio-rythmic-2026-02-19',
    artist: 'Michele Calgaro & The Biblio Rythmic Ensemble',
    date: '2026-02-19',
    dateLabel: { it: 'Giovedì 19 febbraio',    en: 'Thursday 19 February' },
    time: '20:00',
    genre: 'jazz',
    blurb: {
      it: 'Chitarra, contrabbasso (Massimiliano Gajo), batteria (Giovanni Gatto).',
      en: 'Guitar, double bass (Massimiliano Gajo), drums (Giovanni Gatto).',
    },
    poster: poster12,
  },
  {
    id: 'emma-2026-02-15',
    artist: 'Emma',
    date: '2026-02-15',
    dateLabel: { it: 'Domenica 15 febbraio',   en: 'Sunday 15 February' },
    time: '18:00',
    genre: 'songwriter',
    blurb: {
      it: 'OnTheCorner — voce intima fra le librerie.',
      en: 'OnTheCorner — an intimate voice among the bookshelves.',
    },
    poster: poster13,
  },
];

export function tx(node: Bilingual, lang: Lang): string {
  return node[lang] ?? node.it;
}

// Suddivide gli eventi in "in arrivo" (futuri rispetto a today) e "passati".
// today è passato come ISO string per evitare TZ surprise.
export function splitEventi(today: string) {
  const upcoming = eventi.filter((e) => e.date >= today);
  const past     = eventi.filter((e) => e.date < today);
  return { upcoming, past };
}
