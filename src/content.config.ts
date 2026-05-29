import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Eventi: una scheda JSON per serata, editabile dall'area riservata (TinaCMS).
// L'italiano è il campo primario; i campi *En sono opzionali e, se vuoti,
// l'inglese ricade sull'italiano (vedi tx()/autoDateLabel in src/data/eventi.ts).
const eventi = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/eventi' }),
  schema: z.object({
    artist: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}/), // ISO; il date-picker di Tina può aggiungere l'ora
    time: z.string(),
    genre: z.enum(['jazz', 'blues', 'soul', 'indie', 'songwriter', 'reading', 'workshop']),
    blurb: z.string().optional(),
    blurbEn: z.string().optional(),
    dateLabel: z.string().optional(),   // override IT (solo per casi tipo "Gio 23 + Ven 24")
    dateLabelEn: z.string().optional(), // override EN
    poster: z.string(),                 // path pubblico, es. /uploads/locandine-3.webp
    venue: z.string().optional(),       // luogo: 'biblio-bistrot' | 'giardinetti' (default bistrot)
    published: z.boolean().default(true),
  }),
});

export const collections = { eventi };
