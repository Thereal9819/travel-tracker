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

## Collegare le Milestone (Google Apps Script)
1. Apri il Google Sheet dei viaggi (lo stesso di viaggi.csv), poi
   Estensioni > Apps Script.
2. Cancella il contenuto di default e incolla il codice di
   apps-script/milestone.gs (in questo repository).
3. Salva, poi Distribuisci > Nuova distribuzione > tipo "App web".
   - Esegui come: Me
   - Chi ha accesso: Chiunque
4. Autorizza l'accesso quando richiesto (è il tuo stesso account Google).
5. Copia l'URL che termina con  /exec
6. Apri  src/TravelTracker.jsx  e in cima imposta:
     const MILESTONE_API_URL = "...il tuo URL...";
7. Salva. Le milestone spuntate si sincronizzano da quel momento con un
   nuovo foglio "Milestone" nello stesso file.

Se lasci `MILESTONE_API_URL` vuota, la pagina Milestone funziona comunque:
spunte e puntini sulla mappa restano attivi, solo senza salvataggio tra un
caricamento e l'altro della pagina.

## Deploy online gratis (Vercel)
1. Carica questa cartella su un repository GitHub
2. Vai su vercel.com, accedi con GitHub, "Add New Project", scegli il repo
3. Vercel riconosce Vite in automatico: clicca Deploy
4. Ottieni un link pubblico tuo (es. travel-tracker-tuonome.vercel.app)

## Senza Google Sheets
Puoi anche non pubblicare nulla: usa il bottone "Importa CSV" nell'app
caricando il file scaricato da Drive (File > Scarica > CSV). Tutto privato.
