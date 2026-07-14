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

## Deploy online gratis (Vercel)
1. Carica questa cartella su un repository GitHub
2. Vai su vercel.com, accedi con GitHub, "Add New Project", scegli il repo
3. Vercel riconosce Vite in automatico: clicca Deploy
4. Ottieni un link pubblico tuo (es. travel-tracker-tuonome.vercel.app)

## Senza Google Sheets
Puoi anche non pubblicare nulla: usa il bottone "Importa CSV" nell'app
caricando il file scaricato da Drive (File > Scarica > CSV). Tutto privato.
