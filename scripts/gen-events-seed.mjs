// Genera supabase/migrations/0003_seed_events.sql dai JSON in src/content/eventi.
// Eseguire: node scripts/gen-events-seed.mjs
// Strumento di sviluppo: NON importato dal sito né dal bundle.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'src/content/eventi';
const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const qb = (v) => (v ? 'true' : 'false');

const rows = files.map((f, i) => {
  const e = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  return (
    `  (${q(e.artist)}, ${q(e.date.slice(0, 10))}, ${q(e.time)}, ${q(e.genre)}, ` +
    `${q(e.blurb ?? null)}, ${q(e.blurbEn ?? null)}, ${q(e.dateLabel ?? null)}, ${q(e.dateLabelEn ?? null)}, ` +
    `${q(e.poster)}, ${qb(e.published !== false)}, ${i})`
  );
});

const sql = `-- Biblio — SEED eventi dai JSON in src/content/eventi (generato da scripts/gen-events-seed.mjs).
-- Esegui DOPO 0001_init.sql. Idempotente: popola solo se la tabella è vuota,
-- così non sovrascrive gli eventi creati dal proprietario nella dashboard.
-- Le locandine restano i file esistenti in public/uploads/ (poster_url = path repo).

do $$
begin
  if not exists (select 1 from public.events) then

    insert into public.events
      (artist, date, time, genre, blurb, blurb_en, date_label, date_label_en, poster_url, published, sort_index)
    values
${rows.join(',\n')};

  end if;
end $$;
`;

writeFileSync('supabase/migrations/0003_seed_events.sql', sql);
console.log(`Scritto supabase/migrations/0003_seed_events.sql — ${rows.length} eventi.`);
