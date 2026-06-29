-- Biblio — Autorizzazione ADMIN per l'app gestione + blindatura RLS
-- Esegui questo file UNA VOLTA nel SQL Editor del progetto Supabase
-- (Dashboard → SQL Editor → New query → incolla → Run). Idempotente.
--
-- PERCHÉ. Fino a questa migrazione TUTTE le policy di scrittura erano
--   "for all to authenticated using (true)": bastava UNA SESSIONE AUTENTICATA
--   QUALSIASI per leggere/scrivere eventi, menu, news, prenotazioni e
--   candidature (PII: contatti artisti + file privati). "Sessione valida"
--   equivaleva a "permesso admin". Questo è il rischio che chiudiamo qui.
--
-- COSA FA.
--   1. Tabella public.admin_users = whitelist di chi può entrare in gestione.
--   2. Funzione public.is_admin() = true solo se l'utente corrente è un admin attivo.
--   3. Seed: promuove ad admin gli account auth GIÀ esistenti (= il proprietario).
--   4. Riscrive OGNI policy di scrittura: da "qualsiasi autenticato" → "solo admin".
--      Le letture pubbliche (necessarie al build statico del sito) restano invariate.
--
-- DOPO: una sessione autenticata NON basta più. Serve essere in admin_users
--   con is_active = true. I nuovi signup NON sono admin in automatico.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Whitelist amministratori
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS attiva e NESSUNA policy per anon/authenticated: il client browser non può
-- leggere né modificare questa tabella. Vi accedono solo il service_role
-- (SQL Editor / Edge Functions) e la funzione SECURITY DEFINER qui sotto.
alter table public.admin_users enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) is_admin(): l'utente corrente è un admin attivo?
--    SECURITY DEFINER → può leggere admin_users pur essendo bloccata via RLS.
--    auth.uid() resta quello del CHIAMANTE (deriva dal JWT della richiesta).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and is_active = true
  );
$$;

-- Esposta come RPC solo agli autenticati (per l'utente anon ritorna comunque false).
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Seed: promuove ad admin gli account auth GIÀ esistenti.
--    Il progetto ha un solo account (il proprietario) → diventa admin e non
--    resta chiuso fuori. I signup successivi NON sono admin in automatico.
--    >>> VERIFICA dopo il Run:  select * from public.admin_users;
--        Deve contenere SOLO la tua email. Rimuovi righe non tue se presenti.
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.admin_users (user_id, email, is_active)
select id, email, true
from auth.users
on conflict (user_id) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4) Riscrittura delle policy di SCRITTURA: solo admin.
--    NB: le policy "*_public_read" (events/menu/news/site_settings) NON si toccano:
--    servono al fetch a build-time del sito pubblico (ruolo anon).
-- ─────────────────────────────────────────────────────────────────────────────

-- events
drop policy if exists events_owner_all on public.events;
drop policy if exists events_admin_all on public.events;
create policy events_admin_all on public.events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- menu_sections
drop policy if exists menu_sections_owner_all on public.menu_sections;
drop policy if exists menu_sections_admin_all on public.menu_sections;
create policy menu_sections_admin_all on public.menu_sections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- menu_items
drop policy if exists menu_items_owner_all on public.menu_items;
drop policy if exists menu_items_admin_all on public.menu_items;
create policy menu_items_admin_all on public.menu_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- bookings (PII: nessuna lettura pubblica, solo admin)
drop policy if exists bookings_owner_all on public.bookings;
drop policy if exists bookings_admin_all on public.bookings;
create policy bookings_admin_all on public.bookings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- applications (PII: nessuna lettura pubblica, solo admin)
drop policy if exists applications_owner_all on public.applications;
drop policy if exists applications_admin_all on public.applications;
create policy applications_admin_all on public.applications
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- event_reviews (0007)
drop policy if exists event_reviews_owner_all on public.event_reviews;
drop policy if exists event_reviews_admin_all on public.event_reviews;
create policy event_reviews_admin_all on public.event_reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- news (0010)
drop policy if exists news_owner_all on public.news;
drop policy if exists news_admin_all on public.news;
create policy news_admin_all on public.news
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- site_settings (0012)
drop policy if exists site_settings_owner_all on public.site_settings;
drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5) Storage: scrittura sui bucket solo admin. Le letture pubbliche dei bucket
--    pubblici (posters/menus/news) restano. 'applications' resta privato.
-- ─────────────────────────────────────────────────────────────────────────────

-- posters (0001) — bucket pubblico in lettura, scrittura solo admin
drop policy if exists posters_owner_write on storage.objects;
drop policy if exists posters_admin_write on storage.objects;
create policy posters_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'posters' and public.is_admin())
  with check (bucket_id = 'posters' and public.is_admin());

-- applications (0001) — bucket PRIVATO: lettura/scrittura/eliminazione solo admin
drop policy if exists app_files_owner_all on storage.objects;
drop policy if exists app_files_admin_all on storage.objects;
create policy app_files_admin_all on storage.objects
  for all to authenticated
  using (bucket_id = 'applications' and public.is_admin())
  with check (bucket_id = 'applications' and public.is_admin());

-- menus (0008) — bucket pubblico in lettura, scrittura solo admin
drop policy if exists menus_owner_write on storage.objects;
drop policy if exists menus_admin_write on storage.objects;
create policy menus_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'menus' and public.is_admin())
  with check (bucket_id = 'menus' and public.is_admin());

-- news (0010) — bucket pubblico in lettura, scrittura solo admin
drop policy if exists news_files_owner_write on storage.objects;
drop policy if exists news_files_admin_write on storage.objects;
create policy news_files_admin_write on storage.objects
  for all to authenticated
  using (bucket_id = 'news' and public.is_admin())
  with check (bucket_id = 'news' and public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- GESTIONE ADMIN (eseguire a mano nel SQL Editor quando serve)
--
--   Vedere gli admin:
--     select * from public.admin_users;
--
--   Aggiungere un admin (per email di un account auth già esistente):
--     insert into public.admin_users (user_id, email, is_active)
--     select id, email, true from auth.users where email = 'nuovo@esempio.it'
--     on conflict (user_id) do update set is_active = true;
--
--   Sospendere un admin senza eliminarlo:
--     update public.admin_users set is_active = false where email = 'tizio@esempio.it';
--
--   Rimuovere un admin:
--     delete from public.admin_users where email = 'tizio@esempio.it';
-- ─────────────────────────────────────────────────────────────────────────────
