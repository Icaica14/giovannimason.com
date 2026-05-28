# Area riservata — guida

L'area riservata permette al gestore del locale di **pubblicare nuovi eventi** e tenere
il sito aggiornato senza toccare codice. Si raggiunge da `https://masoninnovation.it/admin/`
ed è protetta da **email e password**: solo le persone invitate possono entrare.

Quando si pubblica o si modifica un evento, il sistema salva la scheda nel repository e il
sito si **ricostruisce da solo** in pochi minuti. Non serve installare nulla sul computer:
funziona dal browser.

---

## Parte 1 — Configurazione iniziale (una volta sola)

Questa parte la fa **il proprietario del sito**, non il gestore. Servono ~10 minuti.
L'area riservata si appoggia a **TinaCloud** (il servizio gratuito che gestisce login e
salvataggi). Il piano gratuito include 2 utenti: più che sufficiente.

### 1. Crea il progetto su TinaCloud
1. Vai su <https://app.tina.io> e accedi con l'account **GitHub** che possiede il repository del sito (`Icaica14/giovannimason.com`).
2. Crea un nuovo progetto ("**Create Project**" → "**Import your site**").
3. Collega il repository **`Icaica14/giovannimason.com`** e seleziona il branch **`main`**.
4. Al termine TinaCloud mostra due valori. Tienili a portata di mano:
   - **Client ID**
   - **Token** (chiamato anche "Read Only Token" / "Content Token" — usa il token con permessi di scrittura generato per il progetto)

> ⚠️ Il **Token** è una password: non incollarlo in chat, email o file pubblici.

### 2. Aggiungi i due segreti su GitHub
1. Apri il repository su GitHub: **Settings → Secrets and variables → Actions**.
2. "**New repository secret**" e crea questi due segreti (i nomi devono essere identici):

   | Nome del segreto         | Valore                      |
   |--------------------------|-----------------------------|
   | `TINA_PUBLIC_CLIENT_ID`  | il **Client ID** del punto 1 |
   | `TINA_TOKEN`             | il **Token** del punto 1     |

3. Salva.

> Finché questi due segreti non esistono, il sito si pubblica comunque normalmente:
> semplicemente la pagina `/admin/` non c'è ancora. Appena vengono aggiunti, al primo
> aggiornamento del sito l'area riservata si attiva da sola.

### 3. Attiva l'area riservata
Vai nel tab **Actions** di GitHub, apri l'ultimo workflow "**Deploy to GitHub Pages**" e premi
"**Re-run all jobs**" (oppure aspetta il prossimo aggiornamento del sito). Quando finisce,
`https://masoninnovation.it/admin/` è online.

### 4. Invita il gestore
1. Su <https://app.tina.io>, dentro il progetto, vai su **Collaborators / Users**.
2. Invita il gestore con la sua **email**: riceverà un invito per impostare la propria password.
3. Da quel momento entra da solo su `https://masoninnovation.it/admin/`.

---

## Parte 2 — Uso quotidiano (per il gestore)

### Entrare
1. Vai su **`https://masoninnovation.it/admin/`**.
2. Inserisci **email e password** (quelle impostate dall'invito).

### Pubblicare un nuovo evento
1. Apri la sezione **Eventi** e premi **"Create New"** (crea nuovo).
2. Compila i campi:
   - **Artista o titolo della serata** — es. _"Quartetto Blue Note"_.
   - **Data** — scegli il giorno dal calendario. L'etichetta sul sito (es. _"Giovedì 23 aprile"_) viene scritta **in automatico**: non serve digitarla.
   - **Orario** — es. _"20:00"_.
   - **Genere** — scegli dall'elenco (Jazz, Blues, Pop & Soul, Indie, Voci emergenti, Reading, Workshop). Determina il badge colorato sulla scheda.
   - **Locandina** — carica l'immagine (formato verticale consigliato). Viene caricata nella libreria del sito.
   - **Descrizione** — una riga sotto il nome (formazione, dettagli).
   - **Pubblicato sul sito** — lascia la spunta per renderlo visibile; **togli la spunta** per tenerlo come bozza non visibile.
3. Premi **"Save"**. Dopo qualche minuto l'evento compare sul sito (pagina **Eventi** e, se è una data futura, anche tra le serate prenotabili).

### Note utili
- **Inglese**: scrivi tutto in italiano. Sul sito inglese i testi vengono mostrati in italiano se non c'è una traduzione. Se vuoi, puoi compilare i campi opzionali _"Descrizione in inglese"_ per avere la versione tradotta.
- **Doppie serate / casi speciali**: di norma la data si scrive da sola. Solo per casi particolari (es. _"Giovedì 23 + Venerdì 24 aprile"_) usa il campo opzionale _"Etichetta data personalizzata"_.
- **Modificare o togliere un evento**: riapri la scheda dalla sezione Eventi, cambia i campi e salva. Per nasconderlo senza cancellarlo, togli la spunta **"Pubblicato sul sito"**.
- **Eventi passati**: restano visibili nella sezione "Serate passate"; non serve cancellarli.

---

## Sicurezza in breve
- L'accesso è protetto da **email + password gestite da TinaCloud** (non c'è nessuna password scritta nel sito).
- Il **Token** vive solo nei segreti di GitHub: non è mai esposto al pubblico né incluso nelle pagine del sito.
- Ogni pubblicazione resta tracciata nella cronologia del repository (si può sempre vedere chi ha cambiato cosa e tornare indietro).
- Per revocare l'accesso a una persona, rimuovila dai **Collaborators** su <https://app.tina.io>.
