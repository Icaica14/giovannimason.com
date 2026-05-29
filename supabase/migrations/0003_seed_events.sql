-- Biblio — SEED eventi dai JSON in src/content/eventi (generato da scripts/gen-events-seed.mjs).
-- Esegui DOPO 0001_init.sql. Idempotente: popola solo se la tabella è vuota,
-- così non sovrascrive gli eventi creati dal proprietario nella dashboard.
-- Le locandine restano i file esistenti in public/uploads/ (poster_url = path repo).

do $$
begin
  if not exists (select 1 from public.events) then

    insert into public.events
      (artist, date, time, genre, blurb, blurb_en, date_label, date_label_en, poster_url, published, sort_index)
    values
  ('Marco Trabucco & Matteo Alfonso · Psychoosteria', '2026-04-23', '20:00', 'jazz', 'Doppia serata Biblio Live: contrabbasso e piano giovedì, Psychoosteria venerdì.', 'Biblio Live double bill: double bass + piano on Thursday, Psychoosteria on Friday.', 'Giovedì 23 + Venerdì 24 aprile', 'Thu 23 + Fri 24 April', '/uploads/locandine-3.webp', true, 0),
  ('Bosco in full band', '2026-02-22', '18:30 – 20:30', 'songwriter', 'Bosco in formazione completa: chitarra, voce e band al primo piano.', 'Bosco in full band: guitar, voice and full lineup upstairs.', null, null, '/uploads/locandine-14.webp', true, 1),
  ('Michele Calgaro & The Biblio Rhythmic Ensemble', '2026-02-19', '20:00', 'jazz', 'Chitarra, contrabbasso (Massimiliano Gajo), batteria (Giovanni Gatto).', 'Guitar, double bass (Massimiliano Gajo), drums (Giovanni Gatto).', null, null, '/uploads/locandine-12.webp', true, 2),
  ('Camilla', '2025-03-15', '18:00', 'songwriter', 'OnTheCorner, sera di musica acustica, una voce sola e il microfono.', 'OnTheCorner, an acoustic evening, one voice and the mic.', null, null, '/uploads/locandine-11.webp', true, 3),
  ('Devil Misses Flowers', '2026-04-25', '20:30', 'indie', 'Serata indie: la band sale al primo piano per un set elettrico.', 'Indie night, the band takes the upstairs stage for an electric set.', null, null, '/uploads/locandine-2.webp', true, 4),
  ('Di Gioia · Pellegrino · Da Ros', '2026-04-09', '20:00', 'jazz', 'Sax contralto, contrabbasso e batteria. Un trio sui binari del jazz contemporaneo.', 'Alto sax, double bass and drums, a trio on the rails of contemporary jazz.', null, null, '/uploads/locandine-7.webp', true, 5),
  ('Dual Sparks', '2026-04-26', '18:30', 'songwriter', 'Acoustic duo della domenica: chitarre, voci, repertorio internazionale.', 'Sunday acoustic duo: guitars, voices, international songbook.', null, null, '/uploads/locandine-1.webp', true, 6),
  ('Emma', '2026-02-15', '18:00', 'songwriter', 'OnTheCorner, voce intima fra le librerie.', 'OnTheCorner, an intimate voice among the bookshelves.', null, null, '/uploads/locandine-13.webp', true, 7),
  ('Gaia', '2026-03-15', '18:00', 'songwriter', 'OnTheCorner, voce e chitarra al tramonto della domenica.', 'OnTheCorner, voice and guitar at Sunday sunset.', null, null, '/uploads/locandine-10.webp', true, 8),
  ('Dario Gallazzi', '2026-04-29', '19:00', 'reading', 'Reading di poesia orale: «Nasci calamaro, muori frittura».', 'Spoken-poetry reading: "Nasci calamaro, muori frittura".', null, null, '/uploads/locandine-6.webp', true, 9),
  ('Linda', '2026-04-19', '19:00', 'songwriter', 'OnTheCorner, voce e chitarra, il pomeriggio della domenica si allunga.', 'OnTheCorner, voice and guitar, a Sunday afternoon set that stretches into evening.', null, null, '/uploads/locandine-4.webp', true, 10),
  ('Quai des Brumes', '2026-03-19', '20:00', 'jazz', 'Federico Benedetti, Tolga During, Roberto Bartoli, clarinetto, chitarra, contrabbasso.', 'Federico Benedetti, Tolga During, Roberto Bartoli, clarinet, guitar, double bass.', null, null, '/uploads/locandine-8.webp', true, 11),
  ('Reckless Blues Band', '2026-03-20', '20:00', 'blues', 'Il blues spinto della band del venerdì: il bancone si muove.', 'The Friday blues band turned up, the counter starts moving.', null, null, '/uploads/locandine-9.webp', true, 12),
  ('The Reply', '2026-04-10', '20:00', 'soul', 'Pop & Soul: voce piena e ritmica calda per chiudere la settimana.', 'Pop & Soul: full voice and warm groove to close out the week.', null, null, '/uploads/locandine-7.webp', true, 13),
  ('Filippo Camarin', '2026-04-15', '18:30 – 20:30', 'workshop', 'Workshop di pittura esperienziale a cura di Filippo Camarin.', 'Experiential painting workshop with Filippo Camarin.', null, null, '/uploads/locandine-5.webp', true, 14);

  end if;
end $$;
