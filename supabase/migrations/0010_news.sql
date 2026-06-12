-- ─────────────────────────────────────────────────────────────────────────────
-- 0010 — News / novità (pagina pubblica "News" + sezione gestione)
--
-- Una tabella `news` per gli articoli che il proprietario pubblica dall'app di
-- gestione. Ogni news ha titolo + testo (IT primario, EN opzionale con fallback
-- su IT, come gli eventi), una o più immagini e un'immagine di anteprima scelta.
--
-- Modello identico agli EVENTI: leggibile da `anon` per il fetch a build-time del
-- sito, scrivibile solo dal proprietario autenticato (RLS). Le immagini stanno in
-- un bucket PUBBLICO `news` (come `posters`/`menus`): l'app carica i file, salva
-- gli URL pubblici in `images[]` e l'URL dell'anteprima in `cover_url`.
--
-- Esegui nel SQL Editor del progetto Supabase. Idempotente: rieseguibile.
-- Dopo l'esecuzione, aggiungi un Database Webhook su INSERT/UPDATE/DELETE della
-- tabella `news` → Edge Function `trigger-rebuild` (come per eventi/menu), così
-- pubblicare una news rigenera il sito statico (~1-2 min).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.news (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  title_en    text,
  body        text not null,
  body_en     text,
  -- URL pubblici delle immagini nel bucket 'news', nell'ordine di caricamento.
  images      text[] not null default '{}',
  -- Immagine di anteprima scelta (un URL fra `images`). Se NULL, il sito usa la
  -- prima immagine; se non ce ne sono, un placeholder coerente col design.
  cover_url   text,
  published   boolean not null default true,
  sort_index  int,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);
create index if not exists news_published_idx on public.news (created_at desc) where published;

-- updated_at automatico ad ogni UPDATE (funzione creata in 0001).
drop trigger if exists trg_news_updated on public.news;
create trigger trg_news_updated before update on public.news
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — lettura pubblica, scrittura solo proprietario autenticato.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.news enable row level security;

drop policy if exists news_public_read on public.news;
create policy news_public_read on public.news for select using (true);

drop policy if exists news_owner_all on public.news;
create policy news_owner_all on public.news for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE — bucket pubblico `news` (immagini degli articoli).
-- Lettura pubblica (anon) + scrittura solo proprietario, come `posters`/`menus`.
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('news', 'news', true)
on conflict (id) do nothing;

drop policy if exists news_files_public_read on storage.objects;
create policy news_files_public_read on storage.objects
  for select using (bucket_id = 'news');

drop policy if exists news_files_owner_write on storage.objects;
create policy news_files_owner_write on storage.objects
  for all to authenticated using (bucket_id = 'news') with check (bucket_id = 'news');
