/**
 * Candidature artisti — schede-profilo con pallino "non letto" e file scaricabili.
 * Placeholder di Fase 1: la logica (fetch, schede, download via signed URL,
 * segna-letto, stato) arriva in Fase 3 insieme a submit-application.
 */
export default function ApplicationsList() {
  return (
    <section>
      <h2 class="g-h2">Candidature</h2>
      <p class="g-sub">Le candidature degli artisti dal sito appariranno qui.</p>
      <div class="g-empty">Nessuna candidatura per ora.</div>
    </section>
  );
}
