-- ─────────────────────────────────────────────────────────────────────────────
-- 0011 — Nuovi generi evento: 'sport' e 'altro'
--
-- La tabella `events` ha un CHECK sul campo `genre`. Per poter salvare serate con
-- i nuovi generi "Sport" e "Altro" dal pannello, va aggiornato il vincolo.
-- Esegui nel SQL Editor del progetto Supabase. Idempotente: rieseguibile.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.events drop constraint if exists events_genre_check;
alter table public.events add constraint events_genre_check
  check (genre in ('jazz','blues','soul','indie','songwriter','reading','workshop','sport','altro'));
