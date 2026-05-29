// Verifica del token Cloudflare Turnstile lato server.
// Il client invia il token nel campo `turnstileToken`; qui lo si valida
// contro l'endpoint Cloudflare usando il SECRET (mai esposto al client).
//
// Comportamento di transizione: se TURNSTILE_SECRET_KEY non è configurato,
// la verifica viene saltata (con avviso a log) così il proprietario può
// collaudare prima di attivare Turnstile. In produzione il secret va impostato.

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: string | undefined | null,
  remoteIp?: string | null,
): Promise<{ ok: boolean; reason?: string }> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');

  // Non configurato → salta (transizione). Vedi nota sopra.
  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY assente: verifica saltata.');
    return { ok: true, reason: 'skipped' };
  }

  if (!token) {
    return { ok: false, reason: 'missing-token' };
  }

  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (remoteIp) form.append('remoteip', remoteIp);

  try {
    const res = await fetch(VERIFY_URL, { method: 'POST', body: form });
    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    if (data.success) return { ok: true };
    return { ok: false, reason: (data['error-codes'] ?? []).join(',') || 'failed' };
  } catch (err) {
    console.error('[turnstile] errore di rete:', err);
    return { ok: false, reason: 'network-error' };
  }
}
