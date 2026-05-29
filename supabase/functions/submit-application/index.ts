// Edge Function: submit-application
// Riceve le candidature degli artisti dal form pubblico /artisti.
// Flusso: CORS → honeypot → Turnstile → validazione (campi + metadati file) →
//   insert (service role) → signed upload URL per ogni file → email → risposta.
//
// I file NON passano dalla function (sarebbero troppo grandi): la function
// emette URL di upload firmati verso il bucket privato `applications` e il
// client carica i file direttamente. Il client non ha accesso diretto né alla
// tabella né al bucket (RLS): solo i token firmati autorizzano l'upload.

import { createClient } from 'npm:@supabase/supabase-js@2';
import { handlePreflight, jsonResponse } from '../_shared/cors.ts';
import { verifyTurnstile } from '../_shared/turnstile.ts';
import { sendOwnerEmail, esc } from '../_shared/email.ts';

type FileMeta = { name?: string; size?: number; type?: string };

type Payload = {
  artist_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  lineup?: string;
  genre?: string;
  genre_other?: string;
  repertoire?: string;
  bio?: string;
  link1?: string;
  link2?: string;
  link3?: string;
  epk?: string;
  experience?: string;
  availability?: string;
  fee?: string;
  note?: string;
  files?: FileMeta[];
  lang?: string;
  _gotcha?: string;
  turnstileToken?: string;
};

const str = (v: unknown, max: number): string => String(v ?? '').trim().slice(0, max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_FILES = 5;
const MAX_BYTES = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'audio/mpeg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
]);
const ALLOWED_EXT = /\.(jpe?g|png|webp|pdf|mp3|m4a|wav)$/i;

/** Nome file sicuro: solo base name, caratteri innocui, estensione preservata. */
function safeName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? 'file';
  return base
    .normalize('NFKD')
    .replace(/[^\w.\- ]+/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'file';
}

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

  // 1) Honeypot.
  if (str(body._gotcha, 200)) {
    return jsonResponse(req, { ok: true }, 200);
  }

  // 2) Turnstile.
  const ip = req.headers.get('CF-Connecting-IP') ?? req.headers.get('x-forwarded-for');
  const ts = await verifyTurnstile(body.turnstileToken, ip);
  if (!ts.ok) {
    return jsonResponse(req, { ok: false, error: 'turnstile-failed' }, 403);
  }

  // 3) Validazione campi.
  const artistName = str(body.artist_name, 160);
  const contactName = str(body.contact_name, 160);
  const email = str(body.email, 200);
  const phone = str(body.phone, 60);
  const city = str(body.city, 120);
  const lineup = str(body.lineup, 40);
  const genre = str(body.genre, 40);
  const genreOther = str(body.genre_other, 80);
  const repertoire = str(body.repertoire, 40);
  const bio = str(body.bio, 2000);
  const link1 = str(body.link1, 500);
  const link2 = str(body.link2, 500);
  const link3 = str(body.link3, 500);
  const epk = str(body.epk, 500);
  const experience = str(body.experience, 2000);
  const availability = str(body.availability, 1000);
  const fee = str(body.fee, 200);
  const note = str(body.note, 2000);
  const lang = body.lang === 'en' ? 'en' : 'it';

  const errors: string[] = [];
  if (!artistName) errors.push('artist_name');
  if (!contactName) errors.push('contact_name');
  if (!email || !EMAIL_RE.test(email)) errors.push('email');
  if (!genre) errors.push('genre');
  if (genre === 'other' && !genreOther) errors.push('genre_other');
  if (!bio) errors.push('bio');
  if (!link1) errors.push('link1');
  if (errors.length) {
    return jsonResponse(req, { ok: false, error: 'validation', fields: errors }, 422);
  }

  // 4) Validazione metadati file (l'upload vero avviene dopo, lato client).
  const filesIn = Array.isArray(body.files) ? body.files.slice(0, MAX_FILES + 1) : [];
  if (filesIn.length > MAX_FILES) {
    return jsonResponse(req, { ok: false, error: 'too-many-files' }, 422);
  }
  for (const f of filesIn) {
    const nm = str(f?.name, 200);
    const size = Number(f?.size ?? 0);
    const type = str(f?.type, 100);
    if (!nm || !ALLOWED_EXT.test(nm)) {
      return jsonResponse(req, { ok: false, error: 'file-type', file: nm }, 422);
    }
    if (type && !ALLOWED_TYPES.has(type)) {
      return jsonResponse(req, { ok: false, error: 'file-type', file: nm }, 422);
    }
    if (!(size > 0) || size > MAX_BYTES) {
      return jsonResponse(req, { ok: false, error: 'file-size', file: nm }, 422);
    }
  }

  // 5) Genera id + percorsi file, poi insert con service role.
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const appId = crypto.randomUUID();
  const filePaths = filesIn.map((f, i) => `${appId}/${i}-${safeName(str(f?.name, 200))}`);

  const { error: insErr } = await admin.from('applications').insert({
    id: appId,
    artist_name: artistName,
    contact_name: contactName,
    email,
    phone: phone || null,
    city: city || null,
    lineup: lineup || null,
    genre,
    genre_other: genre === 'other' ? genreOther : null,
    repertoire: repertoire || null,
    bio,
    link1,
    link2: link2 || null,
    link3: link3 || null,
    epk: epk || null,
    experience: experience || null,
    availability: availability || null,
    fee: fee || null,
    note: note || null,
    file_paths: filePaths,
    lang,
  });

  if (insErr) {
    console.error('[submit-application] insert error:', insErr);
    return jsonResponse(req, { ok: false, error: 'db-error' }, 500);
  }

  // 6) URL di upload firmati per ogni file (il client caricherà direttamente).
  //    L'array resta allineato per indice con i file inviati: in caso di errore
  //    si inserisce un token vuoto (il client salta quell'elemento).
  const uploads: { path: string; token: string }[] = [];
  for (const path of filePaths) {
    const { data, error } = await admin.storage.from('applications').createSignedUploadUrl(path);
    if (error || !data) {
      console.error('[submit-application] signed upload url error:', error);
      uploads.push({ path, token: '' });
      continue;
    }
    uploads.push({ path, token: data.token });
  }

  // 7) Email di avviso al proprietario.
  const genreLabel = genre === 'other' ? `Altro — ${genreOther}` : genre;
  const subject = `Nuova candidatura artista — ${artistName}`;
  const html = `
    <h2 style="font-family:Georgia,serif">Nuova candidatura artista</h2>
    <table style="font-family:system-ui,sans-serif;font-size:14px;border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0;color:#777">Artista/Band</td><td><strong>${esc(artistName)}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#777">Referente</td><td>${esc(contactName)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#777">Email</td><td>${esc(email)}</td></tr>
      ${phone ? `<tr><td style="padding:4px 12px 4px 0;color:#777">Telefono</td><td>${esc(phone)}</td></tr>` : ''}
      ${city ? `<tr><td style="padding:4px 12px 4px 0;color:#777">Città</td><td>${esc(city)}</td></tr>` : ''}
      ${lineup ? `<tr><td style="padding:4px 12px 4px 0;color:#777">Formazione</td><td>${esc(lineup)}</td></tr>` : ''}
      <tr><td style="padding:4px 12px 4px 0;color:#777">Genere</td><td>${esc(genreLabel)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#777">Link</td><td>${esc(link1)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#777">File allegati</td><td>${filePaths.length}</td></tr>
    </table>
    <p style="font-family:system-ui,sans-serif;font-size:14px">${esc(bio)}</p>
    <p style="font-family:system-ui,sans-serif;font-size:12px;color:#999">
      Apri la candidatura (e scarica i file) dalla dashboard: https://masoninnovation.it/gestione/
    </p>`;
  await sendOwnerEmail({ subject, html, replyTo: email });

  return jsonResponse(req, { ok: true, applicationId: appId, uploads }, 200);
});
