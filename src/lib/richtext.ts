// Mini rich-text SICURO per i testi scritti dal gestore (descrizioni eventi,
// corpo news). Unico markup consentito: il GRASSETTO con `**testo**`.
// Tutto il resto viene ESCAPATO, quindi non c'è rischio XSS anche se il gestore
// (o un dato malevolo) inserisce tag HTML: vengono mostrati come testo.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converte il testo in HTML sicuro con solo il grassetto: `**testo**` → <strong>.
 * I ritorni a capo restano nel testo (vanno resi con `white-space: pre-line`).
 */
export function boldToHtml(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

/** Rimuove i marcatori del grassetto: per estratti/anteprime in puro testo
 *  (descrizioni SEO, card) dove i `**` non devono comparire. */
export function stripBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1');
}
