// Genera supabase/migrations/0002_seed_menu.sql dal menu statico (src/data/menu.ts).
// Eseguire: node scripts/gen-menu-seed.mjs
// È uno strumento di sviluppo: NON viene importato dal sito né dal bundle.

import { build } from 'esbuild';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const tmp = join(mkdtempSync(join(tmpdir(), 'menuseed-')), 'menu.mjs');
await build({
  entryPoints: ['src/data/menu.ts'],
  bundle: true,
  format: 'esm',
  outfile: tmp,
  logLevel: 'silent',
});
const { menu } = await import(`file://${tmp}`);

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);

const sectionRows = [];
const itemRows = [];
let sectionSort = 0;

for (const chapter of menu) {
  for (const section of chapter.sections) {
    const renderAs = section.items ? 'items' : 'rows';
    sectionRows.push(
      `  (${q(section.id)}, ${q(chapter.id)}, ${q(chapter.title.it)}, ${q(chapter.title.en)}, ` +
        `${q(chapter.intro?.it ?? null)}, ${q(chapter.intro?.en ?? null)}, ` +
        `${q(section.title.it)}, ${q(section.title.en)}, ${q(section.intro?.it ?? null)}, ${q(section.intro?.en ?? null)}, ` +
        `${q(section.defaultPrice ?? null)}, ${q(renderAs)}, ${sectionSort})`,
    );
    sectionSort += 1;

    let itemSort = 0;
    if (section.rows) {
      for (const row of section.rows) {
        itemRows.push(
          `  (${q(section.id)}, ${q(row.label)}, null, null, null, ` +
            `${q(row.desc?.it ?? null)}, ${q(row.desc?.en ?? null)}, ${q(row.price ?? null)}, ${itemSort})`,
        );
        itemSort += 1;
      }
    } else if (section.items) {
      for (const item of section.items) {
        itemRows.push(
          `  (${q(section.id)}, ${q(item.name)}, ${q(item.origin ?? null)}, ` +
            `${q(item.profile?.it ?? null)}, ${q(item.profile?.en ?? null)}, ` +
            `${q(item.desc?.it ?? null)}, ${q(item.desc?.en ?? null)}, ${q(item.price ?? null)}, ${itemSort})`,
        );
        itemSort += 1;
      }
    }
  }
}

const sql = `-- Biblio — SEED del menu da src/data/menu.ts (generato da scripts/gen-menu-seed.mjs).
-- Esegui DOPO 0001_init.sql. Idempotente: popola solo se le tabelle sono vuote,
-- così non sovrascrive le modifiche fatte dal proprietario nella dashboard.

do $$
begin
  if not exists (select 1 from public.menu_sections) then

    insert into public.menu_sections
      (id, chapter_id, chapter_title_it, chapter_title_en, chapter_intro_it, chapter_intro_en,
       title_it, title_en, intro_it, intro_en, default_price, render_as, sort_index)
    values
${sectionRows.join(',\n')};

    insert into public.menu_items
      (section_id, name, origin, profile_it, profile_en, desc_it, desc_en, price, sort_index)
    values
${itemRows.join(',\n')};

  end if;
end $$;
`;

writeFileSync('supabase/migrations/0002_seed_menu.sql', sql);
console.log(
  `Scritto supabase/migrations/0002_seed_menu.sql — ${sectionRows.length} sezioni, ${itemRows.length} voci.`,
);
