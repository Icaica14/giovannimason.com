// ─────────────────────────────────────────────────────────────────────────────
// Indicizzazione motori di ricerca.
//
// Il sito gira TEMPORANEAMENTE sul dominio personale (masoninnovation.it), che
// NON e' il dominio definitivo del cliente. Per non far costruire a Google
// autorita' sul dominio sbagliato (e non creare debito di migrazione), finche'
// siamo sul dominio temporaneo emettiamo
//     <meta name="robots" content="noindex, nofollow">
// su tutte le pagine pubbliche (vedi src/layouts/Base.astro).
//
// AL GO-LIVE sul dominio DEFINITIVO del cliente:
//   1. mettere SITE_INDEXABLE = true qui sotto;
//   2. aggiornare `site` in astro.config.mjs e public/CNAME col dominio nuovo;
//   3. impostare i 301 dal vecchio dominio + change-of-address in Search Console.
// Da quel momento tutta la SEO on-page gia' pronta entra in gioco "da pulito".
// ─────────────────────────────────────────────────────────────────────────────
export const SITE_INDEXABLE = false;
