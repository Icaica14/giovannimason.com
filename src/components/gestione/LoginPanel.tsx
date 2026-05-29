import { useState } from 'preact/hooks';
import { getSupabase } from '../../lib/supabaseClient';

/**
 * Pannello di login della dashboard /gestione.
 * Email + password → supabase.auth.signInWithPassword.
 * Il signup è disabilitato lato Supabase: esiste un solo account (il proprietario).
 * Al successo, l'evento onAuthStateChange in Dashboard rileva la sessione.
 */
export default function LoginPanel() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: Event) {
    e.preventDefault();
    setError(null);

    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase non è configurato. Contatta l’amministratore.');
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);

    if (error) {
      // Messaggio specifico per causa: il generico "credenziali non valide"
      // nascondeva problemi reali (es. account creato ma email non confermata).
      const code = (error as { code?: string }).code ?? '';
      const msg = error.message ?? '';
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
    // La sessione viene gestita da onAuthStateChange in Dashboard.
  }

  return (
    <div class="g-login">
      <div class="g-brand">
        Biblio
        <small>Gestione</small>
      </div>

      <form onSubmit={onSubmit} novalidate>
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
      </form>
    </div>
  );
}
