// Apps Script per la pagina Milestone di Travel Tracker.
//
// SETUP (una tantum):
// 1. Apri il Google Sheet dei viaggi (lo stesso di viaggi.csv).
// 2. Estensioni > Apps Script.
// 3. Cancella il contenuto di default e incolla questo file.
// 4. Salva (icona dischetto), dai un nome al progetto se richiesto.
// 5. Distribuisci > Nuova distribuzione > tipo "App web".
//    - Esegui come: Me
//    - Chi ha accesso: Chiunque
// 6. Autorizza l'accesso quando richiesto (è il tuo stesso account Google).
// 7. Copia l'URL che termina in /exec.
// 8. Incollalo in src/TravelTracker.jsx nella costante MILESTONE_API_URL.
//
// Ogni volta che modifichi questo script devi ridistribuirlo (Distribuisci >
// Gestisci distribuzioni > matita > Nuova versione) perché l'URL /exec resti valido.

function doGet(e) {
  const ids = getIds_();
  return json_({ checked: ids });
}

function doPost(e) {
  if (!e || !e.postData) return json_({ checked: getIds_() });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet_();
    const body = JSON.parse(e.postData.contents);
    const ids = getIds_();
    const idx = ids.indexOf(body.id);
    if (body.checked && idx === -1) sheet.appendRow([body.id]);
    if (!body.checked && idx !== -1) sheet.deleteRow(idx + 1);
    return json_({ checked: getIds_() });
  } finally {
    lock.releaseLock();
  }
}

function getIds_() {
  const sheet = getSheet_();
  const last = sheet.getLastRow();
  if (!last) return [];
  return sheet.getRange(1, 1, last, 1).getValues().map((r) => String(r[0])).filter(Boolean);
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName("Milestone") || ss.insertSheet("Milestone");
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
