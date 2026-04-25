// @ts-check
import { defineConfig } from 'astro/config';

// IMPORTANT: aggiornare `site` con il dominio finale del locale
// (es. https://biblio-treviso.it). Per testare in locale lascialo pure così.
export default defineConfig({
  site: 'https://biblio-treviso.example',
  // base: '/',  // se metti il sito in https://utente.github.io/biblio/, decommenta e usa '/biblio'
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: false, // /it senza prefisso, EN sotto /en
    },
  },
  build: {
    format: 'directory',
  },
  image: {
    // Astro ottimizza automaticamente le immagini in src/assets
    // (responsive, webp/avif). Quelle in /public restano tali e quali.
  },
});
