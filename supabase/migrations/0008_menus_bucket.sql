-- ─────────────────────────────────────────────────────────────────────────────
-- 0008 — Bucket pubblico `menus` per i PDF del Biblio Truck
--
-- I due menu della pagina "Biblio Truck" (food / drink) sono PDF caricabili e
-- sostituibili dall'app gestione. Stanno in un bucket PUBBLICO con chiavi
-- stabili (`food.pdf`, `drink.pdf`): sostituendo il file, il link sul sito
-- resta lo stesso ma serve il nuovo contenuto. La pagina pubblica li legge a
-- build-time (src/data/truckMenus.ts) con fallback ai PDF committati nel repo.
--
-- Lettura pubblica (anon) + scrittura solo proprietario autenticato, esattamente
-- come il bucket `posters`. Idempotente: si puo rieseguire senza errori.
-- ─────────────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('menus', 'menus', true)
on conflict (id) do nothing;

-- menus: lettura pubblica, scrittura proprietario.
drop policy if exists menus_public_read on storage.objects;
create policy menus_public_read on storage.objects
  for select using (bucket_id = 'menus');

drop policy if exists menus_owner_write on storage.objects;
create policy menus_owner_write on storage.objects
  for all to authenticated using (bucket_id = 'menus') with check (bucket_id = 'menus');
