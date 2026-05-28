import { defineConfig } from 'tinacms';

// Branch su cui TinaCloud committa il contenuto (il repo di deploy usa "main").
const branch =
  process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || 'main';

export default defineConfig({
  branch,
  // In locale (tinacms dev) questi restano vuoti e Tina usa il backend locale.
  // In produzione vengono iniettati dai GitHub Secrets in fase di build.
  clientId: process.env.TINA_PUBLIC_CLIENT_ID ?? '',
  token: process.env.TINA_TOKEN ?? '',

  build: {
    outputFolder: 'admin', // /admin servito staticamente da GitHub Pages
    publicFolder: 'public',
  },
  media: {
    tina: {
      mediaRoot: 'uploads', // le locandine vengono caricate in public/uploads
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'eventi',
        label: 'Eventi',
        path: 'src/content/eventi',
        format: 'json',
        ui: {
          // Nome file leggibile: artista-AAAA-MM-GG
          filename: {
            readonly: false,
            slugify: (values: { artist?: string; date?: string }) => {
              const day = (values?.date ?? '').slice(0, 10);
              const artist = (values?.artist ?? 'evento')
                .toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
              return day ? `${artist}-${day}` : artist;
            },
          },
        },
        defaultItem: () => ({ published: true, time: '20:00', genre: 'jazz' }),
        fields: [
          {
            type: 'string',
            name: 'artist',
            label: 'Artista o titolo della serata',
            required: true,
            isTitle: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Data',
            required: true,
            ui: { dateFormat: 'DD/MM/YYYY' },
          },
          {
            type: 'string',
            name: 'time',
            label: 'Orario',
            description: 'Es. "20:00" oppure "18:30 – 20:30".',
            required: true,
          },
          {
            type: 'string',
            name: 'genre',
            label: 'Genere',
            required: true,
            options: [
              { value: 'jazz', label: 'Jazz (Giovedì Jazz)' },
              { value: 'blues', label: 'Blues' },
              { value: 'soul', label: 'Pop & Soul' },
              { value: 'indie', label: 'Indie' },
              { value: 'songwriter', label: 'Voci emergenti' },
              { value: 'reading', label: 'Reading' },
              { value: 'workshop', label: 'Workshop' },
            ],
          },
          {
            type: 'image',
            name: 'poster',
            label: 'Locandina',
            required: true,
            description: 'Carica l’immagine della locandina (formato verticale consigliato).',
          },
          {
            type: 'string',
            name: 'blurb',
            label: 'Descrizione',
            description: 'Una riga sotto il nome (formazione, generi, dettagli).',
            ui: { component: 'textarea' },
          },
          {
            type: 'boolean',
            name: 'published',
            label: 'Pubblicato sul sito',
            description: 'Togli la spunta per salvare una bozza non visibile.',
          },
          {
            type: 'string',
            name: 'blurbEn',
            label: 'Descrizione in inglese (opzionale)',
            description: 'Se vuota, sul sito inglese viene mostrata la descrizione italiana.',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'dateLabel',
            label: 'Etichetta data personalizzata (opzionale)',
            description:
              'Solo per casi speciali tipo doppie serate, es. "Giovedì 23 + Venerdì 24 aprile". Altrimenti lascia vuoto: viene generata in automatico dalla data.',
          },
          {
            type: 'string',
            name: 'dateLabelEn',
            label: 'Etichetta data personalizzata in inglese (opzionale)',
          },
        ],
      },
    ],
  },
});
