-- ─────────────────────────────────────────────────────────────────────────────
-- 0012 — Impostazioni del sito (toggle carosello Biblio Truck in home)
--
-- Tabella SINGLETON `site_settings` (una sola riga, id = 1) per le preferenze del
-- sito modificabili dal pannello /gestione → sezione "Biblio Truck". Prima
-- impostazione: mostrare o no il CAROSELLO Biblio Truck nella hero della home,
-- così d'inverno lo si può spegnere e in estate riaccendere.
--
-- Il sito è statico: il valore è letto a BUILD-TIME (anon read, src/data/
-- siteSettings.ts) e renderizzato nell'HTML. La scrittura è solo del proprietario
-- autenticato (RLS), come eventi/menu/news.
--
-- Esegui nel SQL Editor del progetto Supabase. Idempotente: rieseguibile.
-- DOPO l'esecuzione, aggiungi un Database Webhook su UPDATE (e INSERT) della
-- tabella `site_settings` → Edge Function `trigger-rebuild` (identico a quelli di
-- events/menu_items/news), così cambiare l'interruttore rigenera il sito (~1-2 min).
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.site_settings (
  id                     smallint primary key default 1,
  -- Carosello Biblio Truck in home: true = hero a carosello (Biblio + Truck);
  -- false = hero statica del solo bar Biblio (nessun carosello/frecce/pallini).
  truck_carousel_active  boolean not null default true,
  updated_at             timestamptz,
  -- Vincola la tabella a un'unica riga: è un contenitore di impostazioni globali.
  constraint site_settings_singleton check (id = 1)
);

-- Riga unica di default (carosello attivo). Non sovrascrive se già presente.
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- updated_at automatico ad ogni UPDATE (funzione creata in 0001).
drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS — lettura pubblica (build-time), scrittura solo proprietario autenticato.
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.site_settings enable row level security;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings for select using (true);

drop policy if exists site_settings_owner_all on public.site_settings;
create policy site_settings_owner_all on public.site_settings
  for all to authenticated using (true) with check (true);
