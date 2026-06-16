// CORS condiviso fra le Edge Functions.
// I form pubblici girano su bibliotreviso.com; le function su *.supabase.co
// (cross-origin), quindi serve gestire la preflight OPTIONS e gli header.

const ALLOWED_ORIGINS = new Set<string>([
  'https://bibliotreviso.com',
  'https://www.bibliotreviso.com',
  // Dominio temporaneo precedente (in transizione, rimovibile a regime):
  'https://masoninnovation.it',
  'https://www.masoninnovation.it',
  // Anteprime/sviluppo locale:
  'http://localhost:4321',
  'http://localhost:3000',
]);

/** Header CORS calcolati sull'Origin della richiesta (echo se in allowlist). */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? '';
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : 'https://bibliotreviso.com';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/** Risponde alla preflight OPTIONS. Restituisce null se non è una preflight. */
export function handlePreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) });
  }
  return null;
}

/** Helper per rispondere in JSON con gli header CORS già applicati. */
export function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  });
}
