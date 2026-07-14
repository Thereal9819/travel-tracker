import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

/*
  Travel Tracker — single-file React app
  Schema allineato all'Excel: Nazione, Regione, Posto, Visitato dal/al, Costo.
  - Mappa mondiale interattiva (react-simple-maps + world-atlas TopoJSON via CDN)
  - Split automatico "città" dal campo Posto (best effort), testo completo sempre mostrato
  - Costo visibile solo nel dettaglio (fuori dalle statistiche)
  - Persistenza: stato in memoria + export/import JSON + import CSV Google Sheets

  === COLLEGARE IL TUO GOOGLE SHEET (fuori dalla chat) ===
  1. Google Sheets: File > Condividi > Pubblica sul web > (foglio) > CSV
  2. Incolla l'URL in SHEET_CSV_URL e metti USE_SHEET=true.
     Funziona solo se l'app gira in locale o su host (qui le chiamate di rete sono bloccate).
     In alternativa: bottone "Importa CSV" col file scaricato dal foglio.
*/

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// === COLLEGAMENTO LIVE A GOOGLE SHEETS ===
// 1. Pubblica il foglio: File > Condividi > Pubblica sul web > (foglio) > CSV
// 2. Incolla qui sotto l'URL .../pub?output=csv
// 3. Metti USE_SHEET = true
// Il foglio pubblicato NON deve contenere la colonna Costo (è pubblico).
// L'app legge le colonne: Nazione, Regione, Posto, Visitato dal, Visitato al [, Costo]
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT7B6hyYzOpRWCqo6fGJjCYBCu5BGBPtPnr9Nlnd17kRQuqi4Q0qu98pO3-g_oXQ2VfpAlTCS9XoUu4/pub?gid=31953161&single=true&output=csv"; // <-- URL CSV pubblicato
const USE_SHEET = true;  // <-- collegamento live attivo

const COUNTRY_META = {
  ITA: { name: "Italia", continent: "Europa" },
  FRA: { name: "Francia", continent: "Europa" },
  ESP: { name: "Spagna", continent: "Europa" },
  PRT: { name: "Portogallo", continent: "Europa" },
  DEU: { name: "Germania", continent: "Europa" },
  AUT: { name: "Austria", continent: "Europa" },
  CHE: { name: "Svizzera", continent: "Europa" },
  NLD: { name: "Paesi Bassi", continent: "Europa" },
  BEL: { name: "Belgio", continent: "Europa" },
  GBR: { name: "Regno Unito", continent: "Europa" },
  IRL: { name: "Irlanda", continent: "Europa" },
  GRC: { name: "Grecia", continent: "Europa" },
  HRV: { name: "Croazia", continent: "Europa" },
  CZE: { name: "Repubblica Ceca", continent: "Europa" },
  POL: { name: "Polonia", continent: "Europa" },
  HUN: { name: "Ungheria", continent: "Europa" },
  SVN: { name: "Slovenia", continent: "Europa" },
  NOR: { name: "Norvegia", continent: "Europa" },
  SWE: { name: "Svezia", continent: "Europa" },
  FIN: { name: "Finlandia", continent: "Europa" },
  DNK: { name: "Danimarca", continent: "Europa" },
  ISL: { name: "Islanda", continent: "Europa" },
  CYP: { name: "Cipro", continent: "Europa" },
  JPN: { name: "Giappone", continent: "Asia" },
  CHN: { name: "Cina", continent: "Asia" },
  THA: { name: "Thailandia", continent: "Asia" },
  VNM: { name: "Vietnam", continent: "Asia" },
  IDN: { name: "Indonesia", continent: "Asia" },
  IND: { name: "India", continent: "Asia" },
  TUR: { name: "Turchia", continent: "Asia" },
  ARE: { name: "Emirati Arabi Uniti", continent: "Asia" },
  ISR: { name: "Israele", continent: "Asia" },
  KOR: { name: "Corea del Sud", continent: "Asia" },
  USA: { name: "Stati Uniti", continent: "Nord America" },
  CAN: { name: "Canada", continent: "Nord America" },
  MEX: { name: "Messico", continent: "Nord America" },
  CUB: { name: "Cuba", continent: "Nord America" },
  BRA: { name: "Brasile", continent: "Sud America" },
  ARG: { name: "Argentina", continent: "Sud America" },
  PER: { name: "Perù", continent: "Sud America" },
  CHL: { name: "Cile", continent: "Sud America" },
  COL: { name: "Colombia", continent: "Sud America" },
  MAR: { name: "Marocco", continent: "Africa" },
  EGY: { name: "Egitto", continent: "Africa" },
  ZAF: { name: "Sudafrica", continent: "Africa" },
  TZA: { name: "Tanzania", continent: "Africa" },
  KEN: { name: "Kenya", continent: "Africa" },
  AUS: { name: "Australia", continent: "Oceania" },
  NZL: { name: "Nuova Zelanda", continent: "Oceania" },
};

const NAME_TO_A3 = {};
for (const [a3, m] of Object.entries(COUNTRY_META)) NAME_TO_A3[m.name.toLowerCase()] = a3;
Object.assign(NAME_TO_A3, {
  "regno unito": "GBR", "inghilterra": "GBR", "uk": "GBR",
  "stati uniti d'america": "USA", "usa": "USA", "america": "USA",
  "paesi bassi": "NLD", "olanda": "NLD",
  "repubblica ceca": "CZE", "cechia": "CZE",
});

const NUM_TO_A3 = {
  "380": "ITA", "250": "FRA", "724": "ESP", "620": "PRT", "276": "DEU",
  "040": "AUT", "756": "CHE", "528": "NLD", "056": "BEL", "826": "GBR",
  "372": "IRL", "300": "GRC", "191": "HRV", "203": "CZE", "616": "POL",
  "348": "HUN", "705": "SVN", "578": "NOR", "752": "SWE", "246": "FIN",
  "208": "DNK", "352": "ISL", "196": "CYP", "392": "JPN", "156": "CHN",
  "764": "THA", "704": "VNM", "360": "IDN", "356": "IND", "792": "TUR",
  "784": "ARE", "376": "ISR", "410": "KOR", "840": "USA", "124": "CAN",
  "484": "MEX", "192": "CUB", "076": "BRA", "032": "ARG", "604": "PER",
  "152": "CHL", "170": "COL", "504": "MAR", "818": "EGY", "710": "ZAF",
  "834": "TZA", "404": "KEN", "036": "AUS", "554": "NZL",
};
function a3FromGeo(geo) {
  const raw = String(geo.id);
  return NUM_TO_A3[raw.padStart(3, "0")] || NUM_TO_A3[raw] || null;
}

function splitPosto(posto) {
  if (!posto) return { city: "", rest: "" };
  const parts = posto.split(/\s[-–:]\s|\s[-–]\s?/);
  const city = (parts[0] || "").trim();
  return { city, rest: posto.trim() };
}
function parseDate(s) {
  if (!s) return "";
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const yr = y.length === 2 ? "20" + y : y;
    return `${yr}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return String(s).trim();
}
function fmtDate(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

const SAMPLE_ROWS = [
  ["Germania", "", "Wuppertal", "14/12/2022", "15/12/2022", "0"],
  ["Italia", "Campania", "Costiera Amalfitana - Vietri, Maiori, Minori, Cammino degli Dei, Positano e Sorrento - Regalo Laurea Chiara", "27/12/2022", "30/12/2022", "-750"],
  ["Italia", "Toscana", "Terme San Giovanni", "21/01/2023", "21/01/2023", "-23"],
  ["Italia", "Toscana", "Casale dello Sparviero", "04/02/2023", "04/02/2023", "-26,5"],
  ["Italia", "Toscana", "Carnevale di Viareggio", "19/02/2023", "19/02/2023", "-24,93"],
  ["Italia", "Toscana", "Firenze ristorante messicano", "04/03/2023", "04/03/2023", "-31"],
  ["Germania", "Baviera", "Augsburg Coiltech", "28/03/2023", "30/03/2023", "0"],
  ["Italia", "Toscana", "Cantina Antinori nel Chianti Classico - regalo compleanno Chiara", "01/04/2023", "01/04/2023", "-90"],
  ["Italia", "Lazio", "Roma - San Pietro, Castel Sant'Angelo, Altare della Patria, Colosseo, Fori Romani, Piazza di Spagna, Piazza del Popolo, Piazza Navona", "14/04/2023", "16/04/2023", "292,53"],
  ["Italia", "Veneto", "Venezia, Murano, Burano - Piazza San Marco, Quartiere Ebraico, Ponte di Rialto", "28/04/2023", "30/04/2023", "-281,05"],
];

function rowsToTrips(rows) {
  return rows.map((r, i) => {
    const [naz, reg, posto, dal, al, costo] = r;
    const a3 = NAME_TO_A3[(naz || "").trim().toLowerCase()] || null;
    const { city, rest } = splitPosto(posto);
    return {
      id: "t" + i + "_" + Date.now(),
      countryA3: a3, countryRaw: naz, region: reg || "",
      city, notes: rest,
      dateStart: parseDate(dal), dateEnd: parseDate(al),
      cost: costo || "",
    };
  }).filter((t) => t.countryA3);
}

const SUGGESTIONS = {
  italia: [
    { dest: "Verona", why: "Prima città italiana nella European Best Destinations 2026: Arena romana, centro UNESCO, cultura ed enogastronomia.", when: "Aprile–giugno / settembre", source: "European Best Destinations 2026 — idealista.it", url: "https://www.idealista.it/news/vacanze/mete-turistiche/2026/02/23/328740-le-20-mete-dove-andare-in-vacanza-secondo-l-european-best-destinations-2026" },
    { dest: "Firenze", why: "Tra le migliori destinazioni culturali europee 2026: densità museale altissima e centro rinascimentale senza tempo.", when: "Marzo–maggio / ottobre", source: "SportOutdoor24 — cultura 2026", url: "https://www.sportoutdoor24.it/news/migliori-mete-cultura-2026-classifica-european-best-destinations/" },
    { dest: "Procida", why: "Isola campana premiata per ritmi lenti e autenticità mediterranea, ideale per chi cerca undertourism.", when: "Maggio–giugno / settembre", source: "Donna Moderna — EBD 2026", url: "https://www.donnamoderna.com/lifestyle/viaggi/european-best-destinations-2026-sette-citta-italiane-top-20" },
    { dest: "Cefalù", why: "Duomo normanno UNESCO, centro storico sul mare e spiaggia dorata in Sicilia.", when: "Maggio–giugno / settembre", source: "idealista.it — EBD 2026", url: "https://www.idealista.it/news/vacanze/mete-turistiche/2026/02/23/328740-le-20-mete-dove-andare-in-vacanza-secondo-l-european-best-destinations-2026" },
  ],
  estero: [
    { dest: "Madrid, Spagna", why: "Eletta miglior destinazione europea 2026: Prado, Reina Sofía, Thyssen, vita gastronomica e quartieri creativi.", when: "Aprile–giugno / settembre–ottobre", source: "European Best Destinations 2026 — siviaggia.it", url: "https://siviaggia.it/notizie/migliori-destinazioni-viaggio-classifica-european-best-destinations-2026/576440/" },
    { dest: "Nicosia, Cipro", why: "Migliore destinazione culturale europea 2026: intreccio veneziano-ottomano, musei e scena d'arte contemporanea.", when: "Primavera / autunno", source: "SportOutdoor24 — cultura 2026", url: "https://www.sportoutdoor24.it/news/migliori-mete-cultura-2026-classifica-european-best-destinations/" },
    { dest: "Vienna, Austria", why: "Patrimonio imperiale + MuseumsQuartier con Klimt e Schiele; caffè storici e alta cultura.", when: "Aprile–giugno / settembre", source: "SportOutdoor24 — cultura 2026", url: "https://www.sportoutdoor24.it/news/migliori-mete-cultura-2026-classifica-european-best-destinations/" },
    { dest: "Lisbona, Portogallo", why: "Città storica in ascesa: fascino nostalgico, arte e tradizione, tra le più amate del 2026.", when: "Marzo–giugno / settembre", source: "Okviaggi — mete europee 2026", url: "https://www.okviaggi.it/le-migliori-mete-europee-del-2026-ecco-la-classifica-delle-destinazioni-emergenti/" },
    { dest: "Lubiana, Slovenia", why: "Capitale slow e green: centro pedonale, ponti sulla Ljubljanica, gastronomia stagionale.", when: "Maggio–settembre", source: "Tramundi — città europee 2026", url: "https://www.tramundi.it/blog/a/citta-europee-da-visitare-nel-2026" },
  ],
};

const CONTINENTS = ["Europa", "Asia", "Nord America", "Sud America", "Africa", "Oceania"];

const C = {
  bg: "#0d1b2a", panel: "#152736", panelSoft: "#1b3145",
  ink: "#eaf0f6", inkSoft: "#9fb3c8", line: "#26415c",
  visited: "#f4a259", visitedHot: "#e76f51", neutral: "#2a4258",
  neutralHover: "#375670", accent: "#5bc0be",
};
function heatColor(count) {
  if (count >= 3) return C.visitedHot;
  if (count === 2) return "#f28c3a";
  return C.visited;
}

function parseCSV(text) {
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

export default function TravelTracker() {
  const [trips, setTrips] = useState(() => rowsToTrips(SAMPLE_ROWS));
  const [selected, setSelected] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [view, setView] = useState("mappa");
  const [heatmap, setHeatmap] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterCountry, setFilterCountry] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [sheetState, setSheetState] = useState(USE_SHEET ? "loading" : "idle");
  const jsonRef = useRef(null);
  const csvRef = useRef(null);

  // Caricamento live da Google Sheets (solo se USE_SHEET = true e app fuori dalla chat)
  useEffect(() => {
    if (!USE_SHEET || !SHEET_CSV_URL) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(SHEET_CSV_URL);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const text = await res.text();
        const rows = parseCSV(text).filter((r) => r.some((c) => c && c.trim()));
        if (rows.length < 2) throw new Error("CSV vuoto");
        const body = rows.slice(1).map((r) => [r[0], r[1], r[2], r[3], r[4], r[5] || ""]);
        const mapped = rowsToTrips(body);
        if (alive && mapped.length) { setTrips(mapped); setSheetState("ok"); }
        else if (alive) setSheetState("empty");
      } catch (e) {
        if (alive) setSheetState("error");
      }
    })();
    return () => { alive = false; };
  }, []);

  const byCountry = useMemo(() => {
    const m = {};
    for (const t of trips) {
      if (!m[t.countryA3]) m[t.countryA3] = [];
      m[t.countryA3].push(t);
    }
    for (const k in m) m[k].sort((a, b) => (a.dateStart < b.dateStart ? -1 : 1));
    return m;
  }, [trips]);

  const stats = useMemo(() => {
    const visited = Object.keys(byCountry);
    const continents = new Set(visited.map((a3) => COUNTRY_META[a3]?.continent).filter(Boolean));
    const dates = trips.map((t) => t.dateStart).filter(Boolean).sort();
    return {
      countries: visited.length,
      totalKnown: Object.keys(COUNTRY_META).length,
      continents: continents.size,
      trips: trips.length,
      first: dates[0] ? fmtDate(dates[0]) : "—",
      last: dates[dates.length - 1] ? fmtDate(dates[dates.length - 1]) : "—",
    };
  }, [byCountry, trips]);

  const badges = useMemo(() => [
    { label: "5 paesi", ok: stats.countries >= 5, icon: "🗺️" },
    { label: "10 paesi", ok: stats.countries >= 10, icon: "🌍" },
    { label: "3 continenti", ok: stats.continents >= 3, icon: "🧭" },
    { label: "20 viaggi", ok: stats.trips >= 20, icon: "✈️" },
  ], [stats]);

  const countryOptions = useMemo(
    () => Object.keys(byCountry).map((a3) => ({ a3, name: COUNTRY_META[a3]?.name || a3 })).sort((a, b) => a.name.localeCompare(b.name)),
    [byCountry]
  );

  const listTrips = useMemo(() => {
    let out = [...trips];
    if (filterCountry !== "all") out = out.filter((t) => t.countryA3 === filterCountry);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((t) =>
        (COUNTRY_META[t.countryA3]?.name || "").toLowerCase().includes(q) ||
        (t.region || "").toLowerCase().includes(q) ||
        (t.city || "").toLowerCase().includes(q) ||
        (t.notes || "").toLowerCase().includes(q)
      );
    }
    out.sort((a, b) => {
      switch (sortBy) {
        case "date-asc": return a.dateStart < b.dateStart ? -1 : 1;
        case "date-desc": return a.dateStart > b.dateStart ? -1 : 1;
        case "country": return (COUNTRY_META[a.countryA3]?.name || "").localeCompare(COUNTRY_META[b.countryA3]?.name || "");
        default: return 0;
      }
    });
    return out;
  }, [trips, filterCountry, search, sortBy]);

  function addTrip(t) { setTrips((prev) => [...prev, { ...t, id: "t" + Date.now() }]); setShowForm(false); }
  function removeTrip(id) { setTrips((prev) => prev.filter((t) => t.id !== id)); }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(trips, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "viaggi.json"; a.click();
    URL.revokeObjectURL(url);
  }
  function importJSON(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data)) { setTrips(data.filter((d) => d && d.countryA3)); setSelected(null); }
        else alert("Il file non contiene un elenco di viaggi valido.");
      } catch { alert("File JSON non leggibile."); }
    };
    reader.readAsText(file); e.target.value = "";
  }
  function importCSV(e) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCSV(String(reader.result));
      if (rows.length < 2) { alert("CSV vuoto o non valido."); return; }
      const body = rows.slice(1).filter((r) => r.some((c) => c && c.trim()));
      const mapped = rowsToTrips(body.map((r) => [r[0], r[1], r[2], r[3], r[4], r[5]]));
      if (mapped.length === 0) { alert("Nessuna riga riconosciuta. Colonne attese: Nazione, Regione, Posto, Visitato dal, Visitato al, Costo."); return; }
      setTrips(mapped); setSelected(null);
    };
    reader.readAsText(file); e.target.value = "";
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.ink, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        .tt-btn { cursor:pointer; border:1px solid ${C.line}; background:${C.panel}; color:${C.ink};
          padding:8px 14px; border-radius:10px; font-size:14px; transition:.15s; }
        .tt-btn:hover { background:${C.panelSoft}; border-color:${C.accent}; }
        .tt-btn.active { background:${C.accent}; color:#06222a; border-color:${C.accent}; font-weight:600; }
        .tt-btn:focus-visible, .rsm-geography:focus { outline:2px solid ${C.accent}; outline-offset:2px; }
        input, select, textarea { font-family:inherit; }
        .rsm-geography { outline:none; }
        a { color:${C.accent}; }
        @media (max-width:820px){ .tt-grid{ grid-template-columns:1fr !important; } }
      `}</style>

      <header style={{ padding: "22px 20px 8px", maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 30, margin: 0, letterSpacing: "-0.5px" }}>Travel Tracker</h1>
          <span style={{ color: C.inkSoft, fontSize: 14 }}>La tua mappa dei viaggi, illuminata paese per paese</span>
        </div>

        <div className="tt-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginTop: 18 }}>
          <Stat label="Paesi visitati" value={`${stats.countries}`} sub={`su ${stats.totalKnown} noti`} />
          <Stat label="Continenti" value={`${stats.continents}`} sub={`su ${CONTINENTS.length}`} />
          <Stat label="Viaggi totali" value={`${stats.trips}`} />
          <Stat label="Primo viaggio" value={stats.first} />
          <Stat label="Ultimo viaggio" value={stats.last} />
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: C.inkSoft, marginBottom: 6 }}>Obiettivi</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {badges.map((b) => (
                <span key={b.label} title={b.label} style={{ fontSize: 12, opacity: b.ok ? 1 : 0.32, filter: b.ok ? "none" : "grayscale(1)" }}>{b.icon}</span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
          {["mappa", "lista", "suggerimenti"].map((v) => (
            <button key={v} className={"tt-btn" + (view === v ? " active" : "")} onClick={() => setView(v)}>
              {v === "mappa" ? "Mappa" : v === "lista" ? "Lista viaggi" : "Suggerimenti"}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          {view === "mappa" && (
            <button className={"tt-btn" + (heatmap ? " active" : "")} onClick={() => setHeatmap((h) => !h)}>{heatmap ? "Heatmap on" : "Heatmap"}</button>
          )}
          <button className="tt-btn" onClick={() => setShowForm(true)}>+ Aggiungi viaggio</button>
          <button className="tt-btn" onClick={exportJSON}>Esporta JSON</button>
          <button className="tt-btn" onClick={() => jsonRef.current?.click()}>Importa JSON</button>
          <button className="tt-btn" onClick={() => csvRef.current?.click()}>Importa CSV</button>
          {sheetState !== "idle" && (
            <span style={{ fontSize: 12, color: sheetState === "ok" ? C.accent : sheetState === "loading" ? C.inkSoft : "#e76f51" }}>
              {sheetState === "loading" && "Sheets: caricamento…"}
              {sheetState === "ok" && "Sheets: collegato ✓"}
              {sheetState === "empty" && "Sheets: nessun dato"}
              {sheetState === "error" && "Sheets: errore (uso i dati locali)"}
            </span>
          )}
          <input ref={jsonRef} type="file" accept="application/json" onChange={importJSON} style={{ display: "none" }} />
          <input ref={csvRef} type="file" accept=".csv,text/csv" onChange={importCSV} style={{ display: "none" }} />
        </div>
      </header>

      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 20px 40px" }}>
        {view === "mappa" && (
          <div className="tt-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>
            <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, position: "relative", overflow: "hidden" }}>
              <ComposableMap projectionConfig={{ scale: 155 }} style={{ width: "100%", height: "auto" }}>
                <ZoomableGroup center={[10, 30]} zoom={1}>
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const a3 = a3FromGeo(geo);
                        const visits = a3 ? byCountry[a3]?.length || 0 : 0;
                        const isVisited = visits > 0;
                        const isSel = a3 && a3 === selected;
                        let fill = C.neutral;
                        if (isVisited) fill = heatmap ? heatColor(visits) : C.visited;
                        return (
                          <Geography key={geo.rsmKey} geography={geo}
                            tabIndex={isVisited ? 0 : -1}
                            onMouseEnter={(e) => {
                              const name = a3 ? COUNTRY_META[a3]?.name || geo.properties.name : geo.properties.name;
                              setTooltip({ name, count: visits, x: e.clientX, y: e.clientY });
                            }}
                            onMouseMove={(e) => setTooltip((t) => t && { ...t, x: e.clientX, y: e.clientY })}
                            onMouseLeave={() => setTooltip(null)}
                            onClick={() => { if (isVisited) setSelected(a3); }}
                            style={{
                              default: { fill: isSel ? C.accent : fill, stroke: C.bg, strokeWidth: 0.4, outline: "none" },
                              hover: { fill: isVisited ? C.visitedHot : C.neutralHover, stroke: C.bg, strokeWidth: 0.4, outline: "none", cursor: isVisited ? "pointer" : "default" },
                              pressed: { fill: C.accent, outline: "none" },
                            }} />
                        );
                      })
                    }
                  </Geographies>
                </ZoomableGroup>
              </ComposableMap>
              <div style={{ position: "absolute", bottom: 10, left: 12, display: "flex", gap: 14, fontSize: 11, color: C.inkSoft, background: "rgba(13,27,42,.7)", padding: "6px 10px", borderRadius: 8 }}>
                <Legend color={C.visited} label="Visitato" />
                {heatmap && <Legend color={C.visitedHot} label="3+ visite" />}
                <Legend color={C.neutral} label="Non visitato" />
                <span>Trascina · scroll per zoom</span>
              </div>
            </div>

            <aside style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, minHeight: 300 }}>
              {selected && byCountry[selected] ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div>
                      <h2 style={{ fontFamily: "'Fraunces',serif", margin: "0 0 2px", fontSize: 22 }}>{COUNTRY_META[selected]?.name || selected}</h2>
                      <div style={{ color: C.inkSoft, fontSize: 13 }}>
                        {COUNTRY_META[selected]?.continent} · {byCountry[selected].length} viagg{byCountry[selected].length > 1 ? "i" : "io"}
                      </div>
                    </div>
                    <button className="tt-btn" style={{ padding: "4px 10px" }} onClick={() => setSelected(null)}>✕</button>
                  </div>
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    {byCountry[selected].map((t) => (
                      <div key={t.id} style={{ background: C.panelSoft, borderRadius: 12, padding: "10px 12px", border: `1px solid ${C.line}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
                          <strong style={{ fontSize: 15 }}>{t.city || "—"}</strong>
                          <span style={{ color: C.accent, fontSize: 12, whiteSpace: "nowrap" }}>
                            {fmtDate(t.dateStart)}{t.dateEnd && t.dateEnd !== t.dateStart ? ` – ${fmtDate(t.dateEnd)}` : ""}
                          </span>
                        </div>
                        {t.region && <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 2 }}>{t.region}</div>}
                        {t.notes && t.notes !== t.city && (
                          <p style={{ margin: "6px 0 0", fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }}>{t.notes}</p>
                        )}
                        {t.cost && String(t.cost).trim() !== "" && String(t.cost).trim() !== "0" && (
                          <div style={{ marginTop: 6, fontSize: 12, color: C.inkSoft }}>Costo: <span style={{ color: C.ink }}>{t.cost} €</span></div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ color: C.inkSoft, fontSize: 14, lineHeight: 1.5 }}>
                  <div style={{ fontSize: 34, marginBottom: 8 }}>🗺️</div>
                  Clicca su un paese illuminato per vedere i tuoi viaggi.
                  <br /><br />
                  I paesi in cui non sei ancora stato restano spenti — un promemoria di dove andare.
                </div>
              )}
            </aside>
          </div>
        )}

        {view === "lista" && (
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca paese, regione, posto, note…" style={inp} />
              <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} style={inp}>
                <option value="all">Tutti i paesi</option>
                {countryOptions.map((o) => <option key={o.a3} value={o.a3}>{o.name}</option>)}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inp}>
                <option value="date-desc">Data ↓ (recenti)</option>
                <option value="date-asc">Data ↑ (vecchi)</option>
                <option value="country">Paese A–Z</option>
              </select>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: C.inkSoft, borderBottom: `1px solid ${C.line}` }}>
                    <th style={th}>Paese</th><th style={th}>Regione</th><th style={th}>Posto</th><th style={th}>Dal</th><th style={th}>Al</th><th style={th}></th>
                  </tr>
                </thead>
                <tbody>
                  {listTrips.map((t) => (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${C.line}` }}>
                      <td style={td}>{COUNTRY_META[t.countryA3]?.name || t.countryRaw}</td>
                      <td style={{ ...td, color: C.inkSoft }}>{t.region}</td>
                      <td style={{ ...td, maxWidth: 380 }}>{t.notes || t.city}</td>
                      <td style={{ ...td, color: C.accent, whiteSpace: "nowrap" }}>{fmtDate(t.dateStart)}</td>
                      <td style={{ ...td, color: C.accent, whiteSpace: "nowrap" }}>{fmtDate(t.dateEnd)}</td>
                      <td style={td}><button className="tt-btn" style={{ padding: "3px 9px" }} onClick={() => removeTrip(t.id)}>Elimina</button></td>
                    </tr>
                  ))}
                  {listTrips.length === 0 && (
                    <tr><td style={{ ...td, color: C.inkSoft }} colSpan={6}>Nessun viaggio trovato. Cambia i filtri o aggiungine uno.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === "suggerimenti" && (
          <div className="tt-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <SuggCol title="In Italia" items={SUGGESTIONS.italia} />
            <SuggCol title="All'estero" items={SUGGESTIONS.estero} />
            <p style={{ gridColumn: "1 / -1", fontSize: 12, color: C.inkSoft, margin: 0 }}>
              Suggerimenti basati sui trend di viaggio 2026 (European Best Destinations e guide di settore),
              orientati verso città d'arte e cultura in linea con i tuoi viaggi. Ogni scheda cita la fonte.
            </p>
          </div>
        )}
      </main>

      {tooltip && (
        <div style={{ position: "fixed", left: tooltip.x + 12, top: tooltip.y + 12, pointerEvents: "none", background: "rgba(6,15,24,.95)", border: `1px solid ${C.line}`, borderRadius: 8, padding: "6px 10px", fontSize: 13, zIndex: 50 }}>
          <strong>{tooltip.name}</strong>
          <span style={{ color: C.inkSoft }}> · {tooltip.count > 0 ? `${tooltip.count} visita${tooltip.count > 1 ? "e" : ""}` : "non visitato"}</span>
        </div>
      )}

      {showForm && <TripForm onClose={() => setShowForm(false)} onAdd={addTrip} />}
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, color: C.inkSoft }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 600, lineHeight: 1.15 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.inkSoft }}>{sub}</div>}
    </div>
  );
}
function Legend({ color, label }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: "inline-block" }} />{label}
    </span>
  );
}
function SuggCol({ title, items }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
      <h2 style={{ fontFamily: "'Fraunces',serif", margin: "0 0 12px", fontSize: 20 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((s) => (
          <div key={s.dest} style={{ background: C.panelSoft, border: `1px solid ${C.line}`, borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
              <strong style={{ fontSize: 15 }}>{s.dest}</strong>
              <span style={{ fontSize: 12, color: C.accent }}>{s.when}</span>
            </div>
            <p style={{ margin: "6px 0 8px", fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }}>{s.why}</p>
            <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Fonte: {s.source} ↗</a>
          </div>
        ))}
      </div>
    </div>
  );
}

const inp = { background: C.bg, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 14, flex: "1 1 180px", minWidth: 140 };
const th = { padding: "8px 10px", fontWeight: 500, fontSize: 12 };
const td = { padding: "9px 10px", verticalAlign: "top" };

function TripForm({ onClose, onAdd }) {
  const [countryA3, setCountryA3] = useState("ITA");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [cost, setCost] = useState("");
  const opts = Object.entries(COUNTRY_META).map(([a3, m]) => ({ a3, name: m.name })).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(4,10,17,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", margin: "0 0 14px", fontSize: 20 }}>Aggiungi un viaggio</h2>
        <label style={lbl}>Paese</label>
        <select value={countryA3} onChange={(e) => setCountryA3(e.target.value)} style={{ ...inp, width: "100%", marginBottom: 12 }}>
          {opts.map((o) => <option key={o.a3} value={o.a3}>{o.name}</option>)}
        </select>
        <label style={lbl}>Regione</label>
        <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="es. Toscana" style={{ ...inp, width: "100%", marginBottom: 12 }} />
        <label style={lbl}>Città / località</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="es. Firenze" style={{ ...inp, width: "100%", marginBottom: 12 }} />
        <label style={lbl}>Cosa hai visto / note</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Monumenti, cibo, luoghi…" style={{ ...inp, width: "100%", marginBottom: 12, resize: "vertical" }} />
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Dal (gg/mm/aaaa)</label>
            <input value={dateStart} onChange={(e) => setDateStart(e.target.value)} placeholder="14/04/2023" style={{ ...inp, width: "100%" }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={lbl}>Al (gg/mm/aaaa)</label>
            <input value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} placeholder="16/04/2023" style={{ ...inp, width: "100%" }} />
          </div>
        </div>
        <label style={lbl}>Costo (€, opzionale)</label>
        <input value={cost} onChange={(e) => setCost(e.target.value)} placeholder="-90" style={{ ...inp, width: "100%", marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="tt-btn" onClick={onClose}>Annulla</button>
          <button className="tt-btn active" onClick={() => {
            if (!dateStart) { alert("Inserisci almeno la data di inizio."); return; }
            onAdd({ countryA3, countryRaw: COUNTRY_META[countryA3]?.name, region, city, notes: notes || city, dateStart: parseDate(dateStart), dateEnd: parseDate(dateEnd || dateStart), cost });
          }}>Salva viaggio</button>
        </div>
      </div>
    </div>
  );
}
const lbl = { display: "block", fontSize: 12, color: C.inkSoft, marginBottom: 5 };
