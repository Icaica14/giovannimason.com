// ─────────────────────────────────────────────────────────────────────────────
// Indicizzazione motori di ricerca.
//
// GO-LIVE effettuato sul dominio definitivo del cliente: bibliotreviso.com.
// Il sito è ora INDICIZZABILE (niente più noindex). `site` in astro.config.mjs e
// public/CNAME puntano a bibliotreviso.com; inviare la sitemap a Google Search
// Console: https://bibliotreviso.com/sitemap-index.xml
//
// Storico: in precedenza il sito girava temporaneamente su masoninnovation.it con
// <meta name="robots" content="noindex,nofollow"> per non indicizzare il dominio
// provvisorio. Il flag qui sotto è letto da src/layouts/Base.astro.
// ─────────────────────────────────────────────────────────────────────────────
export const SITE_INDEXABLE = true;
