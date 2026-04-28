// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// IMPORTANT: aggiornare `site` con il dominio finale del locale
// (es. https://biblio-treviso.it). Il dominio è usato per:
//   - canonical URL
//   - hreflang
//   - og:image (URL assoluto)
//   - sitemap.xml
//   - robots.txt
// Lasciare il placeholder fino al go-live.
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
  integrations: [
    sitemap({
      // Mappa lingue per hreflang nel sitemap.
      i18n: {
        defaultLocale: 'it',
        locales: { it: 'it-IT', en: 'en-US' },
      },
    }),
  ],
  build: {
    format: 'directory',
  },
  image: {
    // Astro ottimizza automaticamente le immagini in src/assets
    // (responsive, webp/avif). Quelle in /public restano tali e quali.
  },
});
