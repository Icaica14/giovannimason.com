# Biblio — sito ufficiale

Sito del locale **Biblio** (Treviso): bar antiquario con cicchetti gourmet, drink d'autore, vini e musica dal vivo tre sere a settimana.

Stack: **Astro 5** (output statico, deploy ovunque) · i18n integrato IT/EN · ottimizzazione immagini automatica.

## Sviluppo locale

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
npm run preview  # serve dist/
```

Richiede **Node ≥ 18** (testato su Node 25).

## Struttura

```
src/
├── assets/img/      foto del locale (ottimizzate da Astro)
├── components/      Hero, Nav, Footer, EventCard, …
├── content/         content collections (eventi)
├── i18n/            stringhe UI italiane e inglesi
├── layouts/         layout di base condiviso
├── pages/           rotte IT (index, menu, eventi, prenota, contatti)
│   └── en/          rotte EN equivalenti
└── styles/          global.css (palette Ambra & Ottone)
public/              file statici copiati pari pari (favicon, PDF menu)
```

## Lingue

- **IT** è la lingua predefinita: rotte `/`, `/menu/`, `/eventi/`, `/prenota/`, `/contatti/`
- **EN** sotto prefisso: `/en/`, `/en/menu/`, `/en/eventi/`, `/en/prenota/`, `/en/contatti/`

Lo switch lingua nel nav punta sempre alla pagina equivalente (mappa in `src/i18n/ui.ts → routeMap`).

## Deploy

Output statico in `dist/`. Pubblicabile ovunque: GitHub Pages, Netlify, Vercel, hosting tradizionale.

Per **GitHub Pages** con dominio custom:
1. In `astro.config.mjs` aggiornare `site:` con il dominio finale.
2. `npm run build`.
3. Pubblicare il contenuto di `dist/` sul branch `gh-pages` (o configurare GitHub Actions).

## Convenzioni

- Tutto ciò che è scritto sul sito passa da `src/i18n/ui.ts` per restare bilingue coerente.
- Foto del locale in `src/assets/img/` (Astro le ottimizza in WebP/AVIF responsive).
- Locandine eventi in `src/assets/img/locandine/`.
