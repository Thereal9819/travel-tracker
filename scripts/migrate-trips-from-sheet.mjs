// Script one-off per copiare i viaggi già presenti nel foglio Google
// pubblicato nel nuovo database Turso, tramite l'endpoint pubblico
// /api/trips (nessuna credenziale Turso locale necessaria).
//
// Uso:
//   node scripts/migrate-trips-from-sheet.mjs
//     Dry-run (default): scarica e analizza il CSV, mostra quanti viaggi
//     verrebbero migrati, NON invia nulla.
//
//   node scripts/migrate-trips-from-sheet.mjs --live --url https://travel-tracker-theta-five.vercel.app
//     Esegue davvero la migrazione: invia una POST /api/trips per
//     ciascun viaggio valido verso l'URL indicato.

import { parseCSV, csvRowToTripPayload } from "./lib/csv-trips.mjs";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT7B6hyYzOpRWCqo6fGJjCYBCu5BGBPtPnr9Nlnd17kRQuqi4Q0qu98pO3-g_oXQ2VfpAlTCS9XoUu4/pub?gid=31953161&single=true&output=csv";

const args = process.argv.slice(2);
const isLive = args.includes("--live");
const urlIndex = args.indexOf("--url");
const targetUrl = urlIndex !== -1 ? args[urlIndex + 1] : null;

async function main() {
  console.log(`Scarico il CSV da: ${SHEET_CSV_URL}`);
  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) throw new Error(`Impossibile scaricare il CSV: HTTP ${res.status}`);
  const text = await res.text();

  const rows = parseCSV(text).filter((r) => r.length > 1);
  const payloads = [];
  const rejected = [];
  for (const row of rows) {
    const payload = csvRowToTripPayload(row);
    if (payload) payloads.push(payload);
    else rejected.push(row);
  }

  // Stesse tre condizioni obbligatorie applicate da validateFields() in
  // api/trips.js: countryA3, countryRaw e dateStart non vuoti. Un paese
  // riconosciuto non basta se manca la data (parseDate ritorna "" per
  // celle non parsabili/vuote) — la POST fallirebbe comunque con 400.
  const isReady = (p) => Boolean(p.countryA3 && p.countryRaw && p.dateStart);
  const readyPayloads = payloads.filter(isReady);
  const incompletePayloads = payloads.filter((p) => !isReady(p));

  console.log(`Righe totali nel CSV: ${rows.length}`);
  console.log(`Viaggi validi (paese riconosciuto): ${payloads.length}`);
  console.log(`Righe scartate (paese non riconosciuto): ${rejected.length}`);
  if (rejected.length > 0) {
    console.log("Dettaglio righe scartate (paese non riconosciuto):");
    rejected.forEach((r) => console.log(`  - ${JSON.stringify(r.slice(0, 5))}`));
  }
  console.log(`Viaggi pronti per la migrazione (tutti i campi obbligatori presenti): ${readyPayloads.length}`);
  console.log(
    `Viaggi con paese riconosciuto ma campo obbligatorio mancante (es. data mancante): ${incompletePayloads.length}`
  );

  if (!isLive) {
    console.log("\nDRY RUN — nessun dato inviato. Anteprima dei primi 3 viaggi pronti:");
    console.log(JSON.stringify(readyPayloads.slice(0, 3), null, 2));
    console.log("\nPer eseguire davvero la migrazione:");
    console.log("  node scripts/migrate-trips-from-sheet.mjs --live --url <url-del-sito>");
    return;
  }

  if (!targetUrl) {
    throw new Error("--live richiede anche --url <url-del-sito>, es. https://travel-tracker-theta-five.vercel.app");
  }

  console.log(`\nInvio ${readyPayloads.length} viaggi a ${targetUrl}/api/trips ...`);
  let success = 0,
    failed = 0;
  for (const payload of readyPayloads) {
    try {
      const r = await fetch(`${targetUrl}/api/trips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const body = await r.text();
        console.error(`FALLITO (HTTP ${r.status}): ${payload.countryRaw} - ${payload.city} — ${body}`);
        failed++;
      } else {
        success++;
      }
    } catch (err) {
      console.error(`FALLITO (errore rete): ${payload.countryRaw} - ${payload.city} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\nMigrazione completata: ${success} riusciti, ${failed} falliti su ${readyPayloads.length} totali.`);
  if (incompletePayloads.length > 0) {
    console.log(
      `Nota: ${incompletePayloads.length} viaggi con paese riconosciuto ma campo obbligatorio mancante non sono stati inviati (vedi conteggio sopra).`
    );
  }
}

main().catch((err) => {
  console.error("ERRORE:", err.message);
  process.exit(1);
});
