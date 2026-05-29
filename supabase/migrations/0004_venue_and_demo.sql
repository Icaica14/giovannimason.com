-- Biblio — migrazione 0004
-- 1) Aggiunge il campo "luogo" agli eventi (Biblio Bistrot / Giardinetti di Sant'Andrea).
-- 2) Inserisce dati DIMOSTRATIVI (1 prenotazione + 3 candidature) così il proprietario
--    vede come appaiono prenotazioni e candidature in arrivo nella dashboard.
--
-- Esegui nel SQL Editor di Supabase (New query → incolla → Run).
-- Idempotente: si può rieseguire senza creare duplicati.
--
-- Per RIMUOVERE i dati demo quando non servono più, esegui il blocco in fondo.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) EVENTI: campo luogo
-- ─────────────────────────────────────────────────────────────────────────────
-- Slug del luogo: 'biblio-bistrot' (default) | 'giardinetti'.
alter table public.events
  add column if not exists venue text not null default 'biblio-bistrot';

-- Gli eventi storici erano tutti al Bistrot: normalizza eventuali NULL residui.
update public.events set venue = 'biblio-bistrot' where venue is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) DATI DEMO — prenotazione (INBOUND)
--    Nota: il trigger force_inbound_defaults() impone read_at=null / status='new'
--    all'INSERT, quindi le variazioni di stato/orario si applicano via UPDATE dopo.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.bookings
  (id, name, email, phone, booking_date, booking_time, guests, note, event_label, lang)
values
  ('d0000000-0000-4000-a000-0000000000b1',
   'Marco Bianchi', 'marco.bianchi@example.com', '+39 333 998 7766',
   (current_date + 7), '20:30', '4',
   'Se possibile un tavolo vicino al palco: festeggiamo un compleanno.',
   'Venerdì Live', 'it')
on conflict (id) do nothing;

-- Timestamp realistico (ricevuta 6 ore fa); resta NON letta → pallino rosso.
update public.bookings
  set created_at = now() - interval '6 hours'
  where id = 'd0000000-0000-4000-a000-0000000000b1';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) DATI DEMO — candidature artisti (INBOUND)
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.applications
  (id, artist_name, contact_name, email, phone, city, lineup,
   genre, genre_other, repertoire, bio, link1, link2, availability, fee, note, lang)
values
  -- (a) NUOVA, non letta → pallino rosso
  ('d0000000-0000-4000-a000-0000000000a1',
   'Trio Lagunare', 'Giulia Marchetti', 'giulia.marchetti@example.com',
   '+39 340 112 2334', 'Venezia', 'Piano, contrabbasso, batteria',
   'jazz', null,
   'Standard jazz e riletture di brani italiani d''autore.',
   'Trio nato al Conservatorio Benedetto Marcello, attivo dal 2022 nei jazz club del nord-est. Sonorità intime, adatte a una serata da bistrot.',
   'https://www.youtube.com/@triolagunare', 'https://open.spotify.com/artist/0demo',
   'Giovedì e venerdì sera', '250–350 € a serata',
   'Disponibili anche in formazione duo (piano + contrabbasso) per spazi piccoli.', 'it'),

  -- (b) già LETTA e CONTATTATA → niente pallino, chip di stato verde
  ('d0000000-0000-4000-a000-0000000000a2',
   'Elena Fontana', 'Elena Fontana', 'elena.fontana@example.com',
   '+39 347 556 7788', 'Treviso', 'Voce e chitarra',
   'songwriter', null,
   'Brani originali in italiano e qualche cover folk d''autore.',
   'Cantautrice trevigiana, due EP all''attivo. Repertorio acustico perfetto per gli aperitivi del giovedì.',
   'https://open.spotify.com/artist/1demo', null,
   'Weekend, preferibilmente sabato', 'Da concordare',
   null, 'it'),

  -- (c) NUOVA, genere "Altro" (campo libero compilato)
  ('d0000000-0000-4000-a000-0000000000a3',
   'Officina Sonora', 'Davide Pavan', 'davide.pavan@example.com',
   '+39 392 223 4455', 'Padova', 'Voce, chitarra, synth, percussioni',
   'other', 'Folk elettronico / world',
   'Set strumentale e cantato, atmosfere mediterranee e nord-europee.',
   'Progetto che fonde folk acustico ed elettronica leggera. Esperienza in festival e rassegne all''aperto: ideali per i Giardinetti.',
   'https://officinasonora.example.com', 'https://www.instagram.com/officinasonora',
   'Tutte le sere tranne il lunedì', '400 € a serata (full band)',
   'Portiamo service audio autonomo per spazi senza impianto.', 'it')
on conflict (id) do nothing;

-- Timestamp realistici + stato della candidatura (b) come "già gestita".
update public.applications set created_at = now() - interval '1 day'
  where id = 'd0000000-0000-4000-a000-0000000000a1';

update public.applications
  set created_at = now() - interval '5 days',
      read_at    = now() - interval '4 days',
      status     = 'contacted'
  where id = 'd0000000-0000-4000-a000-0000000000a2';

update public.applications set created_at = now() - interval '3 hours'
  where id = 'd0000000-0000-4000-a000-0000000000a3';

-- ─────────────────────────────────────────────────────────────────────────────
-- RIMOZIONE DATI DEMO (esegui SOLO quando vuoi ripulire)
-- ─────────────────────────────────────────────────────────────────────────────
-- delete from public.bookings     where id = 'd0000000-0000-4000-a000-0000000000b1';
-- delete from public.applications where id in (
--   'd0000000-0000-4000-a000-0000000000a1',
--   'd0000000-0000-4000-a000-0000000000a2',
--   'd0000000-0000-4000-a000-0000000000a3'
-- );
