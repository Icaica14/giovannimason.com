// Edge Function: submit-booking
// Riceve le richieste di prenotazione dal form pubblico /prenota.
// Flusso: CORS → honeypot → Turnstile → validazione → insert (service role) → email.
// Il client non ha accesso diretto alla tabella `bookings` (RLS), quindi
// l'insert avviene qui con la service role key (auto-iniettata da Supabase).

import { createClient } from 'npm:@supabase/supabase-js@2';
import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { verifyTurnstile } from '../_shared/turnstile.ts';
import { sendOwnerEmail, esc } from '../_shared/email.ts';

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  guests?: string;
  note?: string;
  event?: string;
  lang?: string;
  _gotcha?: string;
  turnstileToken?: string;
};

const str = (v: unknown, max: number): string => String(v ?? '').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  if (req.method !== 'POST') {
    return jsonResponse(req, { ok: false, error: 'method-not-allowed' }, 405);
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(req, { ok: false, error: 'invalid-json' }, 400);
  }

  // 1) Honeypot: se compilato, è un bot. Rispondi 200 per non dargli segnali.
  if (str(body._gotcha, 200)) {
    return jsonResponse(req, { ok: true }, 200);
  }

  // 2) Turnstile anti-spam.
  const ip = req.headers.get('CF-Connecting-IP') ?? req.headers.get('x-forwarded-for');
  const ts = await verifyTurnstile(body.turnstileToken, ip);
  if (!ts.ok) {
    return jsonResponse(req, { ok: false, error: 'turnstile-failed' }, 403);
  }

  // 3) Validazione.
  const name = str(body.name, 120);
  const email = str(body.email, 200);
  const phone = str(body.phone, 60);
  const date = str(body.date, 10);
  const time = str(body.time, 20);
  const guests = str(body.guests, 20);
  const note = str(body.note, 2000);
  const eventLabel = str(body.event, 200);
  const lang = body.lang === 'en' ? 'en' : 'it';

  const errors: string[] = [];
  if (!name) errors.push('name');
  if (!email || !EMAIL_RE.test(email)) errors.push('email');
  if (!date || !DATE_RE.test(date) || Number.isNaN(Date.parse(date))) errors.push('date');
  if (!time) errors.push('time');
  if (!guests) errors.push('guests');
  if (errors.length) {
    return jsonResponse(req, { ok: false, error: 'validation', fields: errors }, 422);
  }

  // 4) Insert con service role (bypassa RLS). I default inbound (read_at,
  //    status, created_at) sono forzati anche dal trigger lato DB.
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin.from('bookings').insert({
    name,
    email,
    phone: phone || null,
    booking_date: date,
    booking_time: time,
    guests,
    note: note || null,
    event_label: eventLabel || null,
    lang,
  });

  if (error) {
    console.error('[submit-booking] insert error:', error);
    return jsonResponse(req, { ok: false, error: 'db-error' }, 500);
  }

  // 5) Email di avviso al proprietario (best-effort, non blocca la risposta).
  const subject = `Nuova prenotazione — ${name} (${guests} pax, ${date} ${time})`;
  const html = `
    <h2 style="font-family:Georgia,serif">Nuova prenotazione</h2>
    <table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0;color:#777">Nome</td><td><strong>${esc(name)}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#777">Email</td><td>${esc(email)}</td></tr>
      ${phone ? `<tr><td style="padding:4px 12px 4px 0;color:#777">Telefono</td><td>${esc(phone)}</td></tr>` : ''}
      <tr><td style="padding:4px 12px 4px 0;color:#777">Data</td><td>${esc(date)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#777">Ora</td><td>${esc(time)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#777">Persone</td><td>${esc(guests)}</td></tr>
      ${eventLabel ? `<tr><td style="padding:4px 12px 4px 0;color:#777">Serata</td><td>${esc(eventLabel)}</td></tr>` : ''}
      ${note ? `<tr><td style="padding:4px 12px 4px 0;color:#777">Note</td><td>${esc(note)}</td></tr>` : ''}
    </table>
    <p style="font-family:system-ui,sans-serif;font-size:12px;color:#999">
      Gestisci dalla dashboard: https://masoninnovation.it/gestione/
    </p>`;
  await sendOwnerEmail({ subject, html, replyTo: email });

  return jsonResponse(req, { ok: true }, 200);
});
