// Edge Function: trigger-rebuild
// Innesca una nuova build del sito statico quando il proprietario pubblica
// contenuti (menu, eventi) dalla dashboard /gestione.
//
// Flusso: DB webhook Supabase (su INSERT/UPDATE/DELETE delle tabelle di
// contenuto) → questa function → POST /repos/<owner>/<repo>/dispatches con
// `event_type: content-changed` → il workflow deploy.yml (trigger
// repository_dispatch) ricostruisce e ripubblica il sito (~1-2 min).
//
// Il PAT GitHub (fine-grained, solo questo repo, Contents:read&write) è un
// SECRET della function: non viaggia mai verso il client. Un secret condiviso
// opzionale (`REBUILD_WEBHOOK_SECRET`) protegge l'endpoint da chiamate esterne.

const GITHUB_API = 'https://api.github.com';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'method-not-allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Secret condiviso opzionale: se configurato, l'header deve combaciare.
  const expectedSecret = Deno.env.get('REBUILD_WEBHOOK_SECRET');
  if (expectedSecret) {
    const got = req.headers.get('x-rebuild-secret') ?? '';
    if (got !== expectedSecret) {
      return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  const pat = Deno.env.get('GH_DISPATCH_PAT');
  const repo = Deno.env.get('GH_DISPATCH_REPO'); // es. 'Icaica14/giovannimason.com'
  if (!pat || !repo) {
    console.error('[trigger-rebuild] GH_DISPATCH_PAT o GH_DISPATCH_REPO non configurati.');
    return new Response(JSON.stringify({ ok: false, error: 'not-configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Il payload del webhook non ci serve: qualunque cambiamento → un rebuild.
  // Lo consumiamo (best-effort) solo per non lasciare il body in sospeso.
  try {
    await req.json();
  } catch {
    // body assente o non-JSON: ininfluente.
  }

  const res = await fetch(`${GITHUB_API}/repos/${repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'biblio-trigger-rebuild',
    },
    body: JSON.stringify({ event_type: 'content-changed' }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('[trigger-rebuild] dispatch fallito:', res.status, detail);
    return new Response(JSON.stringify({ ok: false, error: 'dispatch-failed', status: res.status }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 204 No Content è la risposta attesa di GitHub per un dispatch riuscito.
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
