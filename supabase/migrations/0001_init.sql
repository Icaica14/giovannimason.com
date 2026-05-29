-- Biblio — schema gestionale unico (Supabase)
-- Esegui questo file UNA VOLTA nel SQL Editor del progetto Supabase
-- (Dashboard → SQL Editor → New query → incolla → Run).
-- Idempotente: si può rieseguire senza errori.
--
-- Sicurezza: RLS attiva ovunque.
--  - events / menu_*  : leggibili da chiunque (anon) per il fetch a build-time del sito;
--                       scrivibili solo dal proprietario autenticato.
--  - bookings / applications : NESSUN accesso diretto anon. Gli invii dai form pubblici
--                       passano da Edge Function con service_role (che bypassa RLS).
--                       Solo il proprietario autenticato può leggere/aggiornare/eliminare.

-- ─────────────────────────────────────────────────────────────────────────────
-- Funzioni di supporto
-- ─────────────────────────────────────────────────────────────────────────────

-- Aggiorna updated_at ad ogni UPDATE.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Difesa in profondità sugli INBOUND: a prescindere da cosa arriva,
-- una nuova riga è sempre "non letta", stato 'new', creata adesso.
create or replace function public.force_inbound_defaults()
returns trigger language plpgsql as $$
begin
  new.read_at := null;
  new.status := 'new';
  new.created_at := now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- EVENTI  (sostituirà src/content/eventi/*.json)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  artist        text not null,
  date          date not null,
  time          text not null,
  genre         text not null
                check (genre in ('jazz','blues','soul','indie','songwriter','reading','workshop')),
  blurb         text,
  blurb_en      text,
  date_label    text,
  date_label_en text,
  poster_url    text not null,
  published     boolean not null default true,
  sort_index    int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz
);

-- ─────────────────────────────────────────────────────────────────────────────
-- MENU — sezioni fisse (seed) + voci editabili
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.menu_sections (
  id                text primary key,            -- es. 'vini-bianchi', 'negroni-gin', 'cucina-list'
  chapter_id        text not null,
  chapter_title_it  text,
  chapter_title_en  text,
  chapter_intro_it  text,
  chapter_intro_en  text,
  title_it          text,
  title_en          text,
  intro_it          text,
  intro_en          text,
  default_price     text,
  render_as         text not null default 'items' check (render_as in ('rows','items')),
  sort_index        int not null default 0
);

create table if not exists public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  section_id  text not null references public.menu_sections(id) on delete cascade,
  name        text not null,
  origin      text,
  profile_it  text,
  profile_en  text,
  desc_it     text,
  desc_en     text,
  price       text,
  sort_index  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);
create index if not exists menu_items_section_idx on public.menu_items (section_id, sort_index);

-- ─────────────────────────────────────────────────────────────────────────────
-- PRENOTAZIONI (INBOUND)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  booking_date  date not null,
  booking_time  text not null,
  guests        text not null,
  note          text,
  event_label   text,
  lang          text not null default 'it',
  read_at       timestamptz,             -- NULL = non letta → pallino rosso
  status        text not null default 'new',
  created_at    timestamptz not null default now()
);
create index if not exists bookings_unread_idx on public.bookings (created_at desc) where read_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- CANDIDATURE ARTISTI (INBOUND)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  artist_name   text not null,
  contact_name  text not null,
  email         text not null,
  phone         text,
  city          text,
  lineup        text,
  genre         text not null,           -- jazz|blues|soul|songwriter|indie|classical|other
  genre_other   text,                    -- testo libero quando genre = 'other'
  repertoire    text,
  bio           text not null,
  link1         text not null,
  link2         text,
  link3         text,
  epk           text,
  experience    text,
  availability  text,
  fee           text,
  note          text,
  file_paths    text[] not null default '{}',  -- chiavi oggetti nel bucket privato 'applications'
  lang          text not null default 'it',
  read_at       timestamptz,             -- NULL = non letta → pallino rosso
  status        text not null default 'new',
  created_at    timestamptz not null default now()
);
create index if not exists applications_unread_idx on public.applications (created_at desc) where read_at is null;

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger
-- ─────────────────────────────────────────────────────────────────────────────
drop trigger if exists trg_events_updated on public.events;
create trigger trg_events_updated before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists trg_menu_items_updated on public.menu_items;
create trigger trg_menu_items_updated before update on public.menu_items
  for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_inbound on public.bookings;
create trigger trg_bookings_inbound before insert on public.bookings
  for each row execute function public.force_inbound_defaults();

drop trigger if exists trg_applications_inbound on public.applications;
create trigger trg_applications_inbound before insert on public.applications
  for each row execute function public.force_inbound_defaults();

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.events        enable row level security;
alter table public.menu_sections enable row level security;
alter table public.menu_items    enable row level security;
alter table public.bookings      enable row level security;
alter table public.applications  enable row level security;

-- Contenuto pubblico: lettura per tutti, scrittura solo proprietario autenticato.
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events for select using (true);
drop policy if exists events_owner_all on public.events;
create policy events_owner_all on public.events for all to authenticated using (true) with check (true);

drop policy if exists menu_sections_public_read on public.menu_sections;
create policy menu_sections_public_read on public.menu_sections for select using (true);
drop policy if exists menu_sections_owner_all on public.menu_sections;
create policy menu_sections_owner_all on public.menu_sections for all to authenticated using (true) with check (true);

drop policy if exists menu_items_public_read on public.menu_items;
create policy menu_items_public_read on public.menu_items for select using (true);
drop policy if exists menu_items_owner_all on public.menu_items;
create policy menu_items_owner_all on public.menu_items for all to authenticated using (true) with check (true);

-- Inbound: solo proprietario autenticato. Nessuna policy anon ⇒ anon non legge né scrive.
-- (Gli insert avvengono via Edge Function con service_role, che bypassa la RLS.)
drop policy if exists bookings_owner_all on public.bookings;
create policy bookings_owner_all on public.bookings for all to authenticated using (true) with check (true);

drop policy if exists applications_owner_all on public.applications;
create policy applications_owner_all on public.applications for all to authenticated using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE — bucket
--   posters       : pubblico (locandine eventi nuove)
--   applications  : privato  (materiali candidature; download solo via signed URL)
-- ─────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('posters', 'posters', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('applications', 'applications', false)
on conflict (id) do nothing;

-- posters: lettura pubblica, scrittura proprietario.
drop policy if exists posters_public_read on storage.objects;
create policy posters_public_read on storage.objects
  for select using (bucket_id = 'posters');
drop policy if exists posters_owner_write on storage.objects;
create policy posters_owner_write on storage.objects
  for all to authenticated using (bucket_id = 'posters') with check (bucket_id = 'posters');

-- applications: nessun accesso anon. Solo il proprietario autenticato legge/elimina.
-- Gli upload dei candidati avvengono via signed upload URL emessi dalla Edge Function
-- (service_role), quindi non serve una policy di insert per anon.
drop policy if exists app_files_owner_all on storage.objects;
create policy app_files_owner_all on storage.objects
  for all to authenticated using (bucket_id = 'applications') with check (bucket_id = 'applications');
