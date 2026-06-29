import { useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';

/**
 * Pannello di accesso della dashboard /gestione.
 * - 'login'  → email + password (supabase.auth.signInWithPassword).
 * - 'forgot' → email → supabase.auth.resetPasswordForEmail(redirectTo) per
 *              ricevere il link che porta a /gestione/reset-password.
 * Il signup pubblico è disabilitato lato Supabase: nessuna auto-registrazione.
 * L'autorizzazione admin vera è verificata altrove (checkAdmin + RLS): un login
 * riuscito non implica accesso se l'account non è in admin_users.
 */

type Mode = 'login' | 'forgot';

export default function LoginPanel() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function switchMode(m: Mode) {
    setMode(m);
    setError(null);
    setInfo(null);
  }

  async function onLogin(e: Event) {
    e.preventDefault();
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase non è configurato. Contatta l’amministratore.');
      return;
    }

    setBusy(true);
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (signErr) {
      // Messaggio specifico per causa: il generico "credenziali non valide"
      // nascondeva problemi reali (es. account creato ma email non confermata).
      const code = (signErr as { code?: string }).code ?? '';
      const msg = signErr.message ?? '';
      if (code === 'email_not_confirmed' || /not confirmed/i.test(msg)) {
        setError('Account non ancora confermato. Confermalo in Supabase (Authentication → Users) e riprova.');
      } else if (code === 'invalid_credentials' || /invalid login/i.test(msg)) {
        setError('Email o password non corretti.');
      } else if (/rate limit|too many/i.test(msg)) {
        setError('Troppi tentativi. Attendi un minuto e riprova.');
      } else {
        setError(`Accesso non riuscito: ${msg || 'errore sconosciuto'}.`);
      }
      return;
    }
    // La sessione (e la verifica admin) sono gestite da Dashboard.
  }

  async function onForgot(e: Event) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase non è configurato. Contatta l’amministratore.');
      return;
    }
    const addr = email.trim();
    if (!addr) {
      setError('Inserisci la tua email.');
      return;
    }

    setBusy(true);
    // redirectTo deve puntare alla pagina reset password reale (con slash finale,
    // così su GitHub Pages non scatta il redirect 301 che potrebbe perdere il token).
    const redirectTo = `${window.location.origin}/gestione/reset-password/`;
    const { error: rErr } = await supabase.auth.resetPasswordForEmail(addr, { redirectTo });
    setBusy(false);

    if (rErr && /rate limit|too many/i.test(rErr.message ?? '')) {
      setError('Troppi tentativi. Attendi un minuto e riprova.');
      return;
    }
    if (rErr) {
      setError('Si è verificato un problema. Riprova più tardi.');
      return;
    }
    // Messaggio generico: non rivela se l'email esiste o è autorizzata.
    setInfo('Se l’email è autorizzata, riceverai un link per reimpostare la password.');
  }

  return (
    <div class="g-login">
      <div class="g-brand">
        Biblio
        <small>Gestione</small>
      </div>

      {mode === 'login' ? (
        <form onSubmit={onLogin} novalidate>
          <div class="g-field">
            <label for="login-email">Email</label>
            <input
              id="login-email"
              class="g-input"
              type="email"
              autocomplete="username"
              required
              value={email}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            />
          </div>

          <div class="g-field">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              class="g-input"
              type="password"
              autocomplete="current-password"
              required
              value={password}
              onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            />
          </div>

          {error && <div class="g-msg g-msg-err">{error}</div>}

          <button class="g-btn" type="submit" disabled={busy}>
            {busy ? 'Accesso…' : 'Entra'}
          </button>

          <p class="g-login-foot">
            <button type="button" class="g-linkbtn" onClick={() => switchMode('forgot')}>
              Password dimenticata?
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={onForgot} novalidate>
          <p class="g-login-text">
            Inserisci la tua email: ti invieremo un link per reimpostare la password.
          </p>
          <div class="g-field">
            <label for="forgot-email">Email</label>
            <input
              id="forgot-email"
              class="g-input"
              type="email"
              autocomplete="username"
              required
              value={email}
              onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            />
          </div>

          {error && <div class="g-msg g-msg-err">{error}</div>}
          {info && <div class="g-msg g-msg-ok">{info}</div>}

          <button class="g-btn" type="submit" disabled={busy}>
            {busy ? 'Invio…' : 'Invia link di reset'}
          </button>

          <p class="g-login-foot">
            <button type="button" class="g-linkbtn" onClick={() => switchMode('login')}>
              ← Torna al login
            </button>
          </p>
        </form>
      )}
    </div>
  );
}
