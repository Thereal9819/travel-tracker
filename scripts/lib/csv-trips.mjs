// Logica pura di conversione CSV → oggetti viaggio, estratta per essere
// testabile senza dover eseguire l'app React. Usata da
// migrate-trips-from-sheet.mjs per la migrazione una tantum dei viaggi
// dal foglio Google al database Turso (via l'endpoint /api/trips).
// Copia della stessa logica già presente in src/TravelTracker.jsx.

import { NAME_TO_A3 } from "../../src/countries.js";

export function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (inQ) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ",") { row.push(field); field = ""; }
      else if (ch === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (ch === "\r") { /* skip */ }
      else field += ch;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function splitPosto(posto) {
  if (!posto) return { city: "", rest: "" };
  const parts = posto.split(/\s[-–:]\s|\s[-–]\s?/);
  const city = (parts[0] || "").trim();
  return { city, rest: posto.trim() };
}

export function parseDate(s) {
  if (!s) return "";
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const yr = y.length === 2 ? "20" + y : y;
    return `${yr}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return String(s).trim();
}

// Converte una riga CSV [Nazione, Regione, Posto, Visitato dal, Visitato
// al, Costo] in un payload pronto per POST /api/trips (senza il campo
// costo, per decisione esplicita). Ritorna null se il paese non è
// riconosciuto (stesso comportamento già esistente lato client oggi).
export function csvRowToTripPayload(row) {
  const [naz, reg, posto, dal, al] = row;
  const a3 = NAME_TO_A3[(naz || "").trim().toLowerCase()] || null;
  if (!a3) return null;
  const { city, rest } = splitPosto(posto);
  return {
    countryA3: a3,
    countryRaw: naz,
    region: reg || "",
    city,
    notes: rest,
    dateStart: parseDate(dal),
    dateEnd: parseDate(al),
  };
}
