/**
 * Prenotazioni inbound — schede con pallino "non letto".
 * Placeholder di Fase 1: la logica (fetch da Supabase, schede, segna-letto,
 * elimina) arriva in Fase 2 insieme alla Edge Function submit-booking.
 */
export default function BookingsList() {
  return (
    <section>
      <h2 class="g-h2">Prenotazioni</h2>
      <p class="g-sub">Le richieste di prenotazione dal sito appariranno qui.</p>
      <div class="g-empty">Nessuna prenotazione per ora.</div>
    </section>
  );
}
