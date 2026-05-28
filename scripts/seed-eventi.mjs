// One-off: materialize the legacy src/data/eventi.ts array into per-event JSON
// files the CMS edits. IT is the primary field; the existing hand-written EN is
// preserved as optional *_En fields so the live English site doesn't regress.
// New events created in the CMS can leave the EN fields blank → EN falls back to IT.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const OUT = 'src/content/eventi';
await mkdir(OUT, { recursive: true });

// poster N -> /uploads/locandine-N.webp
const p = (n) => `/uploads/locandine-${n}.webp`;

const eventi = [
  { id: 'gallazzi-2026-04-29', artist: 'Dario Gallazzi', date: '2026-04-29', time: '19:00', genre: 'reading',
    blurb: 'Reading di poesia orale: «Nasci calamaro, muori frittura».',
    blurbEn: 'Spoken-poetry reading: "Nasci calamaro, muori frittura".', poster: p(6) },
  { id: 'dual-sparks-2026-04-26', artist: 'Dual Sparks', date: '2026-04-26', time: '18:30', genre: 'songwriter',
    blurb: 'Acoustic duo della domenica: chitarre, voci, repertorio internazionale.',
    blurbEn: 'Sunday acoustic duo: guitars, voices, international songbook.', poster: p(1) },
  { id: 'devil-misses-flowers-2026-04-25', artist: 'Devil Misses Flowers', date: '2026-04-25', time: '20:30', genre: 'indie',
    blurb: 'Serata indie: la band sale al primo piano per un set elettrico.',
    blurbEn: 'Indie night, the band takes the upstairs stage for an electric set.', poster: p(2) },
  { id: 'biblio-live-2026-04-23', artist: 'Marco Trabucco & Matteo Alfonso · Psychoosteria', date: '2026-04-23', time: '20:00', genre: 'jazz',
    blurb: 'Doppia serata Biblio Live: contrabbasso e piano giovedì, Psychoosteria venerdì.',
    blurbEn: 'Biblio Live double bill: double bass + piano on Thursday, Psychoosteria on Friday.',
    dateLabel: 'Giovedì 23 + Venerdì 24 aprile', dateLabelEn: 'Thu 23 + Fri 24 April', poster: p(3) },
  { id: 'linda-2026-04-19', artist: 'Linda', date: '2026-04-19', time: '19:00', genre: 'songwriter',
    blurb: 'OnTheCorner, voce e chitarra, il pomeriggio della domenica si allunga.',
    blurbEn: 'OnTheCorner, voice and guitar, a Sunday afternoon set that stretches into evening.', poster: p(4) },
  { id: 'workshop-camarin-2026-04-15', artist: 'Filippo Camarin', date: '2026-04-15', time: '18:30 – 20:30', genre: 'workshop',
    blurb: 'Workshop di pittura esperienziale a cura di Filippo Camarin.',
    blurbEn: 'Experiential painting workshop with Filippo Camarin.', poster: p(5) },
  { id: 'di-gioia-pellegrino-da-ros-2026-04-09', artist: 'Di Gioia · Pellegrino · Da Ros', date: '2026-04-09', time: '20:00', genre: 'jazz',
    blurb: 'Sax contralto, contrabbasso e batteria. Un trio sui binari del jazz contemporaneo.',
    blurbEn: 'Alto sax, double bass and drums, a trio on the rails of contemporary jazz.', poster: p(7) },
  { id: 'the-reply-2026-04-10', artist: 'The Reply', date: '2026-04-10', time: '20:00', genre: 'soul',
    blurb: 'Pop & Soul: voce piena e ritmica calda per chiudere la settimana.',
    blurbEn: 'Pop & Soul: full voice and warm groove to close out the week.', poster: p(7) },
  { id: 'quai-des-brumes-2026-03-19', artist: 'Quai des Brumes', date: '2026-03-19', time: '20:00', genre: 'jazz',
    blurb: 'Federico Benedetti, Tolga During, Roberto Bartoli, clarinetto, chitarra, contrabbasso.',
    blurbEn: 'Federico Benedetti, Tolga During, Roberto Bartoli, clarinet, guitar, double bass.', poster: p(8) },
  { id: 'reckless-blues-band-2026-03-20', artist: 'Reckless Blues Band', date: '2026-03-20', time: '20:00', genre: 'blues',
    blurb: 'Il blues spinto della band del venerdì: il bancone si muove.',
    blurbEn: 'The Friday blues band turned up, the counter starts moving.', poster: p(9) },
  { id: 'gaia-2026-03-15', artist: 'Gaia', date: '2026-03-15', time: '18:00', genre: 'songwriter',
    blurb: 'OnTheCorner, voce e chitarra al tramonto della domenica.',
    blurbEn: 'OnTheCorner, voice and guitar at Sunday sunset.', poster: p(10) },
  { id: 'camilla-2025-03-15', artist: 'Camilla', date: '2025-03-15', time: '18:00', genre: 'songwriter',
    blurb: 'OnTheCorner, sera di musica acustica, una voce sola e il microfono.',
    blurbEn: 'OnTheCorner, an acoustic evening, one voice and the mic.', poster: p(11) },
  { id: 'bosco-2026-02-22', artist: 'Bosco in full band', date: '2026-02-22', time: '18:30 – 20:30', genre: 'songwriter',
    blurb: 'Bosco in formazione completa: chitarra, voce e band al primo piano.',
    blurbEn: 'Bosco in full band: guitar, voice and full lineup upstairs.', poster: p(14) },
  { id: 'calgaro-biblio-rhythmic-2026-02-19', artist: 'Michele Calgaro & The Biblio Rhythmic Ensemble', date: '2026-02-19', time: '20:00', genre: 'jazz',
    blurb: 'Chitarra, contrabbasso (Massimiliano Gajo), batteria (Giovanni Gatto).',
    blurbEn: 'Guitar, double bass (Massimiliano Gajo), drums (Giovanni Gatto).', poster: p(12) },
  { id: 'emma-2026-02-15', artist: 'Emma', date: '2026-02-15', time: '18:00', genre: 'songwriter',
    blurb: 'OnTheCorner, voce intima fra le librerie.',
    blurbEn: 'OnTheCorner, an intimate voice among the bookshelves.', poster: p(13) },
];

for (const e of eventi) {
  const { id, ...rest } = e;
  const data = { published: true, ...rest };
  await writeFile(join(OUT, `${id}.json`), JSON.stringify(data, null, 2) + '\n');
  console.log(`wrote ${id}.json`);
}
console.log(`Done: ${eventi.length} event files in ${OUT}`);
