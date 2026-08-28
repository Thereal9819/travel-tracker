// Controllo di scrittura condiviso tra api/trips.js e api/milestones.js.
// Richiede un header x-api-key che combaci con la variabile d'ambiente
// API_SHARED_SECRET su Vercel. Le letture (GET) restano pubbliche come
// prima — solo POST/PUT/DELETE sono protette.
//
// Non è autenticazione reale: la stessa chiave vive anche nel bundle
// client-side pubblico di questo repo (vedi API_SHARED_SECRET in
// src/TravelTracker.jsx), quindi chiunque legga il codice sorgente la
// trova. Alza la soglia contro bot/scraper che colpiscono l'endpoint
// direttamente senza passare dal sito, non contro un attaccante mirato.
//
// Se API_SHARED_SECRET non è configurata su Vercel, il controllo fallisce
// chiuso (rifiuta tutte le scritture) invece di lasciarle passare — un
// segreto assente è un errore di configurazione, non un lasciapassare.
export function checkWriteAuth(req, res) {
  const expected = process.env.API_SHARED_SECRET;
  const provided = (req.headers || {})["x-api-key"];
  if (!expected || provided !== expected) {
    res.status(401).json({ error: "unauthorized" });
    return false;
  }
  return true;
}
