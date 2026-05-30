-- ─────────────────────────────────────────────────────────────────────────────
-- 0007 — Recensioni private delle esibizioni (event_reviews)
--
-- Voto (1-5) e commento del proprietario su ogni esibizione (riga di events).
-- PRIVATE: tabella separata da events apposta. La tabella events e leggibile
-- da anon (il sito pubblico la legge a build-time); il commento e una nota
-- interna del gestore e NON deve mai finire nel sito. Tenendola in una tabella
-- a parte con sola policy authenticated, anon non puo leggerla.
--
-- Idempotente: si puo rieseguire senza errori.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.event_reviews (
  event_id    uuid primary key references public.events(id) on delete cascade,
  rating      smallint check (rating is null or (rating between 1 and 5)),
  comment     text,
  updated_at  timestamptz not null default now()
);

-- Aggiorna updated_at ad ogni modifica (riusa la funzione gia definita in 0001,
-- con fallback se non esiste).
do $$
begin
  if exists (select 1 from pg_proc where proname = 'set_updated_at') then
    drop trigger if exists event_reviews_set_updated_at on public.event_reviews;
    create trigger event_reviews_set_updated_at
      before update on public.event_reviews
      for each row execute function public.set_updated_at();
  end if;
end$$;

-- RLS: solo il proprietario autenticato puo leggere/scrivere. Nessuna policy
-- anon ⇒ le note restano private.
alter table public.event_reviews enable row level security;

drop policy if exists event_reviews_owner_all on public.event_reviews;
create policy event_reviews_owner_all on public.event_reviews
  for all to authenticated using (true) with check (true);
