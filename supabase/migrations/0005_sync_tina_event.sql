-- Biblio — migrazione 0005
-- Sincronizza in Supabase l'evento aggiunto dal proprietario via TinaCMS dopo il
-- seed iniziale (0003), così non sparisce quando il sito passa a leggere gli
-- eventi da Supabase a build-time.
--
-- Evento: "Figli delle Stelle" (30/05/2026) ai Giardinetti di Sant'Andrea.
-- La locandina è in public/uploads/ (entra in produzione col merge del branch),
-- quindi poster_url resta un path del repo.
--
-- Esegui PRIMA del merge su main (SQL Editor → New query → incolla → Run).
-- Idempotente: si può rieseguire senza creare duplicati.

insert into public.events
  (id, artist, date, time, genre, blurb, poster_url, venue, published, sort_index)
values
  ('d0000000-0000-4000-a000-00000000fde1',
   'Figli delle Stelle',
   '2026-05-30',
   'Dalle 18:00 fino a tardi',
   'songwriter',
   E'Inconfondibile serata che ci porta i dolci ricordi dell''estate scorsa ✨\nCon dj Pier ai Giardinetti di Sant''Andrea',
   '/uploads/Screenshot 2026-05-29 at 01.15.31.png',
   'giardinetti',
   true,
   null)
on conflict (id) do nothing;
