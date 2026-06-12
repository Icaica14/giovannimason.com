// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';

// Dominio di pubblicazione. Servito da GitHub Pages tramite il repo
// Icaica14/giovannimason.com con CNAME masoninnovation.it (vedi public/CNAME).
// Il dominio è usato per: canonical URL, hreflang, og:image, sitemap.xml, robots.txt.
export default defineConfig({
  site: 'https://masoninnovation.it',
  // base: '/',  // se metti il sito in https://utente.github.io/biblio/, decommenta e usa '/biblio'
  // Pagina iniziale del dominio = Biblio Truck. La Home resta su /home/ (e /en/home/),
  // raggiungibile da nav/brand/footer. Redirect statici (meta-refresh + canonical).
  redirects: {
    '/': '/biblio-truck/',
    '/en/': '/en/biblio-truck/',
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
