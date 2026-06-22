// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';

// Dominio di pubblicazione. Servito da GitHub Pages tramite il repo
// Icaica14/giovannimason.com con CNAME bibliotreviso.com (vedi public/CNAME).
// Il dominio è usato per: canonical URL, hreflang, og:image, sitemap.xml, robots.txt.
export default defineConfig({
  site: 'https://bibliotreviso.com',
  // base: '/',  // se metti il sito in https://utente.github.io/biblio/, decommenta e usa '/biblio'
  // Pagina iniziale del dominio (/) = Home del bar Biblio. La pagina Biblio Truck
  // vive su /biblio-truck/ (e /en/biblio-truck/), raggiungibile da nav e link.
  // Il vecchio /home/ — usato per un periodo come Home — reindirizza alla radice.
  redirects: {
    '/home/': '/',
    '/en/home/': '/en/',
  },
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: false, // /it senza prefisso, EN sotto /en
    },
  },
  integrations: [
    preact(),
    sitemap({
      // La dashboard gestore /gestione è privata: fuori dalla sitemap e dai crawler.
      filter: (page) => !page.includes('/gestione'),
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
