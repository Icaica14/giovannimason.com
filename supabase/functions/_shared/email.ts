// Invio email di avviso al proprietario via Resend.
// Comportamento di transizione: se RESEND_API_KEY non è configurato, l'invio
// viene saltato (con avviso a log) senza far fallire la richiesta — la riga
// è comunque salvata nel DB e visibile in dashboard.
//
// Variabili d'ambiente (secret della function):
//   RESEND_API_KEY   chiave API Resend
//   NOTIFY_FROM      mittente verificato, es. "Biblio <avvisi@masoninnovation.it>"
//   NOTIFY_TO        destinatario (proprietario), es. "biblio.bookcafe@gmail.com"

const RESEND_URL = 'https://api.resend.com/emails';

export async function sendOwnerEmail(opts: {
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY assente: invio saltato.');
    return;
  }

  const from = Deno.env.get('NOTIFY_FROM') ?? 'Biblio <onboarding@resend.dev>';
  const to = Deno.env.get('NOTIFY_TO') ?? 'biblio.bookcafe@gmail.com';

  try {
    const res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error('[email] Resend ha risposto', res.status, body);
    }
  } catch (err) {
    console.error('[email] errore di rete:', err);
  }
}

/** Escapa testo utente per inserirlo in sicurezza nell'HTML dell'email. */
export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
