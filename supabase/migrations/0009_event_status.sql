-- ─────────────────────────────────────────────────────────────────────────────
-- 0009 — Stato della serata: annullata / rimandata
--
-- Permette al gestore di segnalare, dall'area /gestione, che una serata è stata
-- ANNULLATA o RIMANDATA. Il sito pubblico (pagina eventi) mostra l'avviso in
-- rosso sull'annuncio dell'evento; i dati strutturati MusicEvent riflettono lo
-- stato (EventCancelled / EventPostponed) per Google.
--
--   status         'regular' (default) | 'cancelled' | 'postponed'
--   status_note    messaggio libero IT mostrato in rosso (es. "Rimandata al 18/5")
--   status_note_en stesso messaggio in EN (opzionale; se vuoto, ricade su IT)
--
-- Colonne leggibili da anon come il resto di events (il sito le legge a
-- build-time). Idempotente: si può rieseguire senza errori.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.events
  add column if not exists status text not null default 'regular',
  add column if not exists status_note text,
  add column if not exists status_note_en text;

-- Vincolo sui valori ammessi (aggiunto a parte così la migrazione resta
-- idempotente anche se il vincolo esiste già).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_status_check'
  ) then
    alter table public.events
      add constraint events_status_check
      check (status in ('regular', 'cancelled', 'postponed'));
  end if;
end$$;

-- Le righe esistenti diventano esplicitamente 'regular'.
update public.events set status = 'regular' where status is null;
