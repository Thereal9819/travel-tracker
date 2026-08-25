// Metadati paesi e mappatura codici ISO A3 — condivisi tra la mappa 2D
// (react-simple-maps) e il globo 3D (react-globe.gl).

export const COUNTRY_META = {
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

export const NAME_TO_A3 = {};
for (const [a3, m] of Object.entries(COUNTRY_META)) NAME_TO_A3[m.name.toLowerCase()] = a3;
Object.assign(NAME_TO_A3, {
  "regno unito": "GBR", "inghilterra": "GBR", "uk": "GBR",
  "stati uniti d'america": "USA", "usa": "USA", "america": "USA",
  "paesi bassi": "NLD", "olanda": "NLD",
  "repubblica ceca": "CZE", "cechia": "CZE",
});

export const NUM_TO_A3 = {
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

export function a3FromGeo(geo) {
  const raw = String(geo.id);
  return NUM_TO_A3[raw.padStart(3, "0")] || NUM_TO_A3[raw] || null;
}
