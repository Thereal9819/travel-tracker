# Travel Tracker

App per visualizzare i tuoi viaggi su una mappa mondiale interattiva.

## Avvio in locale
1. Installa Node.js (https://nodejs.org, versione LTS)
2. Nella cartella del progetto:
   npm install
   npm run dev
3. Apri l'indirizzo mostrato (di solito http://localhost:5173)

## Collegare Google Sheets (dati live)
1. Sul foglio Google (SENZA colonna Costo) fai:
   File > Condividi > Pubblica sul web > scegli il foglio > formato CSV > Pubblica
2. Copia l'URL che finisce con  /pub?output=csv
3. Apri  src/TravelTracker.jsx  e in cima imposta:
     const SHEET_CSV_URL = "...il tuo URL...";
     const USE_SHEET = true;
4. Salva. L'app leggerà i viaggi dal foglio a ogni caricamento.

## Collegare le Milestone (database Turso)
Lo stato "visitato" delle Milestone si salva su un database Turso, letto e
scritto tramite una funzione serverless inclusa nel progetto
(`api/milestones.js`) — nessun foglio Google richiesto per questa parte.

1. Vai su https://turso.tech, crea un account/accedi, crea un nuovo
   database (es. chiamalo `travel-tracker`).
2. Dalla pagina del database copia:
   - il **Database URL** (inizia con `libsql://...`)
   - un **Auth Token** (crealo se non ne hai già uno)
3. Vai sul progetto `travel-tracker` su https://vercel.com, poi
   Settings > Environment Variables, e aggiungi:
   - `TURSO_DATABASE_URL` = il Database URL copiato al passo 2
   - `TURSO_AUTH_TOKEN` = l'Auth Token copiato al passo 2
4. Rideploya il progetto (Vercel > Deployments > "..." sull'ultimo
   deploy > Redeploy) perché le nuove variabili vengano usate.

Da quel momento `/api/milestones` risponde usando quel database — non
serve toccare `src/TravelTracker.jsx`, `MILESTONE_API_URL` punta già a
`/api/milestones` di default. La tabella nel database si crea da sola al
primo utilizzo.

Se le variabili d'ambiente non sono ancora impostate, la pagina Milestone
funziona comunque: spunte e puntini sulla mappa restano attivi nella
sessione corrente, solo senza salvataggio permanente (l'indicatore di
sincronizzazione nella pagina Milestone mostra lo stato di errore).

## Deploy online gratis (Vercel)
1. Carica questa cartella su un repository GitHub
2. Vai su vercel.com, accedi con GitHub, "Add New Project", scegli il repo
3. Vercel riconosce Vite in automatico: clicca Deploy
4. Ottieni un link pubblico tuo (es. travel-tracker-tuonome.vercel.app)

## Senza Google Sheets
Puoi anche non pubblicare nulla: usa il bottone "Importa CSV" nell'app
caricando il file scaricato da Drive (File > Scarica > CSV). Tutto privato.
