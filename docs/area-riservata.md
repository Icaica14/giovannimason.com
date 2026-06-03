# Area riservata "Gestione" — guida

La dashboard **Gestione** è il pannello privato del proprietario di Biblio. Da
un'unica pagina web permette di:

- vedere e gestire le **prenotazioni** dei tavoli;
- ricevere e consultare le **candidature degli artisti** (coi materiali allegati);
- tenere l'**anagrafica artisti** (chi ha suonato, schede, valutazioni);
- **pubblicare e modificare gli eventi** (con locandina e luogo);
- **modificare il menù** (voci, prezzi, descrizioni IT/EN) e i menù PDF del Truck.

Si raggiunge da **`/gestione/`** (oggi `https://masoninnovation.it/gestione/`) ed è
protetta da **email e password**. Non c'è niente da installare: funziona dal
browser, su computer, tablet o telefono. Quando si pubblica o si modifica un
contenuto, il **sito si ricostruisce da solo** in pochi minuti.

> **Sicurezza.** Accesso e permessi sono garantiti **interamente da Supabase**
> (Row Level Security). Nel sito non è scritta nessuna password e non viaggia
> nessun segreto: la chiave pubblica inclusa nelle pagine è pubblica per
> definizione, il confine di sicurezza è il database.

> **Nota.** Questa guida sostituisce la vecchia area `/admin/` (TinaCMS), che
> verrà dismessa. Da oggi si usa solo `/gestione/`.

---

## Parte 1 — Configurazione iniziale (la fa il proprietario del sito, una volta sola)

### 1A. Creare l'accesso del gestore

L'app si appoggia a **Supabase** (il servizio che gestisce login e database). La
registrazione libera è **disattivata**: solo gli account creati a mano possono
entrare.

1. Vai su <https://supabase.com> → progetto **Biblio** → **Authentication → Users**.
2. **Add user → Create new user**: inserisci **email** e una **password**
   provvisoria. Spunta **"Auto Confirm User"** così l'accesso è subito valido.
3. Comunica al gestore email e password (idealmente da cambiare al primo accesso).
4. Per **revocare** l'accesso: stessa schermata → elimina l'utente.

Con questo, il **login e tutta la gestione dati** (prenotazioni, eventi, menu,
candidature) funzionano già. Le integrazioni del punto 1B servono solo per:
anti-spam sui form, email di avviso e aggiornamento automatico del sito.

### 1B. Integrazioni: anti-spam, email di avviso, aggiornamento automatico

Fanno funzionare i **form pubblici** del sito (prenotazione e candidatura) e il
**"pubblico → il sito si aggiorna da solo"**. Servono tre account gratuiti e
alcune chiavi. **Nessuna chiave va incollata nel codice**: si inseriscono nei
*Secrets* (di Supabase o di GitHub), che non finiscono mai nelle pagine pubbliche.

I segreti vivono in due posti:

- **GitHub** — repo del sito `Icaica14/giovannimason.com` → *Settings → Secrets
  and variables → Actions*: solo la **site key** pubblica di Turnstile, che serve
  in fase di build.
- **Supabase** — progetto Biblio → *Edge Functions → Secrets* (oppure da terminale
  `supabase secrets set NOME=valore`): tutto il resto (valori sensibili lato server).

#### (i) Turnstile — anti-spam Cloudflare (gratis)

1. Crea un widget su <https://dash.cloudflare.com> → **Turnstile** → *Add site*
   (dominio: `masoninnovation.it`; al go-live aggiungi il dominio definitivo).
2. Ottieni **Site Key** (pubblica) e **Secret Key** (privata).
3. Inseriscile:

   | Chiave | Dove | Nome del segreto |
   |---|---|---|
   | Site Key (pubblica) | GitHub → Actions secrets | `PUBLIC_TURNSTILE_SITE_KEY` |
   | Secret Key (privata) | Supabase → Edge Function secrets | `TURNSTILE_SECRET_KEY` |

#### (ii) Resend — email di avviso al proprietario (gratis fino a ~3.000/mese)

Manda un'email quando arriva una prenotazione o una candidatura.

1. Crea un account su <https://resend.com> e **verifica il dominio** del mittente
   (record SPF/DKIM nel DNS). Per le prove puoi intanto usare il dominio di test
   di Resend.
2. Crea una **API Key**.
3. Inserisci in **Supabase** (Edge Function secrets):

   | Nome | Valore |
   |---|---|
   | `RESEND_API_KEY` | la API key di Resend |
   | `NOTIFY_FROM` | mittente, es. `Biblio <noreply@tuo-dominio>` (sul dominio verificato) |
   | `NOTIFY_TO` | l'email dove ricevere gli avvisi (es. quella del locale) |

#### (iii) GitHub PAT — aggiornamento automatico del sito

Quando pubblichi un evento o cambi il menu, il sito si ricostruisce da solo: un
webhook di Supabase chiama la function `trigger-rebuild`, che avvia la build su
GitHub.

1. Crea un **Fine-grained Personal Access Token**:
   <https://github.com/settings/tokens?type=beta> → *Generate new token*.
   - **Repository access**: solo `Icaica14/giovannimason.com`.
   - **Permissions → Contents: Read and write** (basta questo).
   - Scadenza: max 1 anno (poi va rigenerato — vedi promemoria in fondo).
2. Inserisci in **Supabase** (Edge Function secrets):

   | Nome | Valore |
   |---|---|
   | `GH_DISPATCH_PAT` | il token appena creato |
   | `GH_DISPATCH_REPO` | `Icaica14/giovannimason.com` |
   | `REBUILD_WEBHOOK_SECRET` | una stringa lunga a caso (la riusi al punto (iv)) |

#### (iv) Deploy delle function e webhook del database

Una volta sola, da terminale nella cartella del progetto (Supabase CLI già
collegato al progetto):

```bash
supabase functions deploy submit-booking
supabase functions deploy submit-application
supabase functions deploy trigger-rebuild
```

Poi crea il **Database Webhook** che avvia il rebuild: Supabase →
*Database → Webhooks → Create a new hook*:

- **Tabelle**: `events`, `menu_items`, `menu_sections`.
- **Eventi**: *Insert, Update, Delete*.
- **Tipo**: *HTTP Request → POST* verso la function `trigger-rebuild`
  (`https://<progetto>.supabase.co/functions/v1/trigger-rebuild`).
- **Header**: `x-rebuild-secret: <lo stesso valore di REBUILD_WEBHOOK_SECRET>`.

> Dopo aver aggiunto/aggiornato i Secrets su **GitHub**, rilancia una build
> (tab **Actions** → *Run workflow*) perché la **site key** di Turnstile entri
> nel sito. I secrets di **Supabase**, invece, hanno effetto subito.

### Riepilogo segreti

| Nome | Dove va | A cosa serve |
|---|---|---|
| `PUBLIC_TURNSTILE_SITE_KEY` | GitHub (Actions) | widget anti-spam nei form |
| `TURNSTILE_SECRET_KEY` | Supabase | verifica anti-spam lato server |
| `RESEND_API_KEY` | Supabase | invio email di avviso |
| `NOTIFY_FROM` | Supabase | mittente email (dominio verificato) |
| `NOTIFY_TO` | Supabase | destinatario degli avvisi |
| `GH_DISPATCH_PAT` | Supabase | avvio del rebuild del sito |
| `GH_DISPATCH_REPO` | Supabase | repo da ricostruire (`Icaica14/giovannimason.com`) |
| `REBUILD_WEBHOOK_SECRET` | Supabase + header del webhook | protegge l'endpoint di rebuild |

`PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` sono **già** configurati.
`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` sono forniti **in automatico** alle
function: non vanno impostati a mano.

---

## Parte 2 — Uso quotidiano (da girare al gestore)

### Entrare

1. Vai su **`https://masoninnovation.it/gestione/`**.
2. Inserisci **email e password**.

### Installarla come app (consigliato)

Per averla come un programma, con la sua icona:

- **Computer (Chrome/Edge)**: apri `/gestione/`, clicca l'icona **"Installa"**
  nella barra dell'indirizzo (a destra). Compare un'icona sul desktop e l'app si
  apre in una finestra dedicata.
- **Mac (Safari)**: menu *Condividi → Aggiungi al Dock*.
- **iPhone / Android**: *Condividi → Aggiungi a Home*.

In alternativa basta un **segnalibro**.

### Cosa trovi nella dashboard

- **Prenotazioni** — le richieste dei tavoli, in schede. Un **pallino rosso**
  segnala quelle **non lette**; si spegne all'apertura. Puoi rispondere al volo
  via **WhatsApp**.
- **Candidature** — le proposte degli artisti, coi materiali allegati (audio,
  foto, PDF) scaricabili. Pallino rosso = nuova.
- **Artisti** — l'anagrafica: chi ha suonato, schede, valutazioni e note delle serate.
- **Eventi** — crea/modifica le serate (artista, data, ora, genere, **luogo**
  Bistrot o Giardinetti, **locandina**). Divise tra *In programma* ed *Eventi
  passati*. Pubblichi → il sito si aggiorna da solo.
- **Menu** — modifica voci, prezzi e descrizioni (IT/EN) per sezione; più i
  **menù PDF del Truck**.

### Note utili

- Dopo "**Salva**", il sito pubblico si aggiorna in **1-2 minuti**.
- Per nascondere un evento senza cancellarlo, mettilo in **Bozza** (togli la
  spunta "pubblicato").
- **Inglese**: scrivi in italiano; se non c'è traduzione, il sito EN mostra
  l'italiano. I campi *…in inglese* (opzionali) servono per tradurre.

---

## Sicurezza in breve

- Accesso protetto da **email + password Supabase**. Nessuna password è scritta nel sito.
- I permessi sono imposti dal database (**RLS**): un visitatore non può leggere
  prenotazioni/candidature né modificare eventi/menu.
- I file delle candidature stanno in uno **storage privato**: si scaricano solo
  dalla dashboard, con link temporanei.
- Le chiavi sensibili (Resend, PAT GitHub, Turnstile secret) vivono **solo nei
  Secrets** di Supabase/GitHub: mai nelle pagine pubbliche.
- **Promemoria rotazione**: il PAT GitHub scade (≤ 1 anno). Quando scade, il
  rebuild automatico smette di funzionare: rigenera il token e aggiorna
  `GH_DISPATCH_PAT`.
- **Al go-live sul dominio definitivo**: l'indirizzo diventa
  `dominio-cliente/gestione/`; reimposta segnalibro/PWA e aggiungi il nuovo
  dominio in Turnstile e nel mittente Resend.
