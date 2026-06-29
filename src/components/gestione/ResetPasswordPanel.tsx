import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';
import { checkAdmin } from '../../lib/adminAuth';

/**
 * Pagina /gestione/reset-password.
 *
 * Flow (Supabase Auth, implicit flow del progetto):
 *  1. l'utente clicca il link di recupero ricevuto via email;
 *  2. arriva qui con un token nell'hash (#…type=recovery) o, in PKCE, ?code=…;
 *  3. il client stabilisce la sessione di recovery (PASSWORD_RECOVERY);
 *  4. l'utente sceglie una nuova password → supabase.auth.updateUser({ password });
 *  5. SOLO DOPO si verifica l'autorizzazione admin (checkAdmin):
 *       - admin    → può entrare in gestione;
 *       - non admin → viene sloggato: password cambiata ma NESSUN accesso.
 *
 * "Sessione valida" non significa "permesso admin": il controllo resta esplicito.
 */

type Phase = 'verifying' | 'form' | 'invalid' | 'done-admin' | 'done-unauth' | 'done-neutral';

const MIN_LEN = 8;

function Shell({ children }: { children: ComponentChildren }) {
  return (
    <div class="g-center">
      <div class="g-login">
        <div class="g-brand">
          Biblio<small>Gestione</small>
        </div>
        <h1 class="g-login-title">Reimposta password</h1>
        {children}
      </div>
    </div>
  );
}

export default function ResetPasswordPanel() {
  const [phase, setPhase] = useState<Phase>('verifying');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stabilisce la sessione di recovery dal link email.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setPhase('invalid');
      return;
    }

    // Link scaduto/non valido: Supabase mette l'errore in query o nell'hash.
    const search = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    const errParam =
      search.get('error_code') ||
      search.get('error') ||
      hash.get('error_code') ||
      hash.get('error');
    if (errParam) {
      setPhase('invalid');
      return;
    }

    let settled = false;
    const ready = () => {
      if (!settled) {
        settled = true;
        setPhase('form');
      }
    };

    // Implicit flow: l'evento PASSWORD_RECOVERY arriva da onAuthStateChange.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (sess) ready();
    });

    (async () => {
      // PKCE/code flow: scambia il code per una sessione, se presente.
      const code = search.get('code');
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr) {
          setPhase('invalid');
          return;
        }
      }
      // Implicit flow: detectSessionInUrl elabora l'hash all'init del client.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        ready();
        return;
      }
      // Lascia un istante all'elaborazione automatica dell'hash, poi decidi.
      setTimeout(async () => {
        if (settled) return;
        const { data: d2 } = await supabase.auth.getSession();
        if (d2.session) ready();
        else setPhase('invalid');
      }, 1800);
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: Event) {
    e.preventDefault();
    setError(null);

    if (pw.length < MIN_LEN) {
      setError(`La password deve avere almeno ${MIN_LEN} caratteri.`);
      return;
    }
    if (pw !== pw2) {
      setError('Le due password non coincidono.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase non è configurato.');
      return;
    }

    setBusy(true);
    const { error: upErr } = await supabase.auth.updateUser({ password: pw });
    if (upErr) {
      setBusy(false);
      const msg = upErr.message ?? '';
      // Sessione di recovery scaduta nel frattempo → torna allo stato "link non valido".
      if (/expired|invalid|session|JWT/i.test(msg) || /not.*authenticat/i.test(msg)) {
        setPhase('invalid');
      } else if (/at least|weak|short|length/i.test(msg)) {
        setError('Password troppo debole. Usane una più lunga.');
      } else {
        setError(`Impossibile aggiornare la password: ${msg || 'errore sconosciuto'}.`);
      }
      return;
    }

    // Password aggiornata: ORA si verifica l'autorizzazione admin.
    const res = await checkAdmin();
    setBusy(false);
    if (res === 'admin') {
      setPhase('done-admin');
    } else if (res === 'denied') {
      // Sessione valida ma NON autorizzata: chiudi la sessione, nessun accesso.
      await supabase.auth.signOut();
      setPhase('done-unauth');
    } else {
      // 'error': autorizzazione non verificabile ora (rete o migrazione 0013
      // non ancora applicata). La password È aggiornata: nessun claim di
      // autorizzazione, si rimanda al login. Chiudi la sessione per sicurezza.
      await supabase.auth.signOut();
      setPhase('done-neutral');
    }
  }

  if (phase === 'verifying') {
    return (
      <Shell>
        <p class="g-login-text">Verifica del link di recupero in corso…</p>
      </Shell>
    );
  }

  if (phase === 'invalid') {
    return (
      <Shell>
        <div class="g-msg g-msg-err">
          Link non valido o scaduto. Richiedi un nuovo reset password.
        </div>
        <p class="g-login-foot">
          <a href="/gestione">← Torna al login</a> per richiederne uno nuovo.
        </p>
      </Shell>
    );
  }

  if (phase === 'done-admin') {
    return (
      <Shell>
        <div class="g-msg g-msg-ok">Password aggiornata con successo.</div>
        <a class="g-btn" href="/gestione">Vai alla gestione</a>
      </Shell>
    );
  }

  if (phase === 'done-unauth') {
    return (
      <Shell>
        <div class="g-msg g-msg-ok">Password aggiornata con successo.</div>
        <div class="g-msg g-msg-err">
          Questo account non è autorizzato ad accedere alla gestione.
        </div>
        <p class="g-login-foot">
          <a href="/">← Torna al sito</a>
        </p>
      </Shell>
    );
  }

  if (phase === 'done-neutral') {
    return (
      <Shell>
        <div class="g-msg g-msg-ok">Password aggiornata con successo.</div>
        <p class="g-login-text">Ora accedi dalla pagina di login della gestione.</p>
        <a class="g-btn" href="/gestione">Vai al login</a>
      </Shell>
    );
  }

  // phase === 'form'
  return (
    <Shell>
      <p class="g-login-text">Scegli una nuova password per il tuo account.</p>
      <form onSubmit={onSubmit} novalidate>
        <div class="g-field">
          <label for="rp-pw">Nuova password</label>
          <input
            id="rp-pw"
            class="g-input"
            type={show ? 'text' : 'password'}
            autocomplete="new-password"
            required
            minLength={MIN_LEN}
            value={pw}
            onInput={(e) => setPw((e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="g-field">
          <label for="rp-pw2">Conferma password</label>
          <input
            id="rp-pw2"
            class="g-input"
            type={show ? 'text' : 'password'}
            autocomplete="new-password"
            required
            minLength={MIN_LEN}
            value={pw2}
            onInput={(e) => setPw2((e.target as HTMLInputElement).value)}
          />
        </div>

        <button class="g-linkbtn g-pwtoggle" type="button" onClick={() => setShow((s) => !s)}>
          {show ? 'Nascondi' : 'Mostra'} password
        </button>

        {error && <div class="g-msg g-msg-err">{error}</div>}

        <button class="g-btn" type="submit" disabled={busy}>
          {busy ? 'Salvataggio…' : 'Reimposta password'}
        </button>
      </form>
      <p class="g-login-foot">
        <a href="/gestione">← Torna al login</a>
      </p>
    </Shell>
  );
}
