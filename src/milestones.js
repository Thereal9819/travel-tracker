// 52 luoghi iconici del mondo per la pagina Milestone.
// Le coordinate sono approssimative (centro del monumento/sito) — sufficienti
// per un puntino su una mappa a scala mondiale, non serve precisione al metro.

export const MILESTONES = [
  // Europa
  { id: "torre-eiffel", name: "Torre Eiffel", country: "Francia", continent: "Europa", lat: 48.8584, lng: 2.2945 },
  { id: "colosseo", name: "Colosseo", country: "Italia", continent: "Europa", lat: 41.8902, lng: 12.4922 },
  { id: "pantheon-roma", name: "Pantheon", country: "Italia", continent: "Europa", lat: 41.8986, lng: 12.4769 },
  { id: "torre-di-pisa", name: "Torre di Pisa", country: "Italia", continent: "Europa", lat: 43.7230, lng: 10.3966 },
  { id: "sagrada-familia", name: "Sagrada Familia", country: "Spagna", continent: "Europa", lat: 41.4036, lng: 2.1744 },
  { id: "alhambra", name: "Alhambra", country: "Spagna", continent: "Europa", lat: 37.1760, lng: -3.5881 },
  { id: "stonehenge", name: "Stonehenge", country: "Regno Unito", continent: "Europa", lat: 51.1789, lng: -1.8262 },
  { id: "big-ben", name: "Big Ben", country: "Regno Unito", continent: "Europa", lat: 51.5007, lng: -0.1246 },
  { id: "acropoli-atene", name: "Acropoli di Atene", country: "Grecia", continent: "Europa", lat: 37.9715, lng: 23.7267 },
  { id: "san-basilio", name: "Cattedrale di San Basilio", country: "Russia", continent: "Europa", lat: 55.7525, lng: 37.6231 },
  { id: "neuschwanstein", name: "Castello di Neuschwanstein", country: "Germania", continent: "Europa", lat: 47.5576, lng: 10.7498 },
  { id: "porta-brandeburgo", name: "Porta di Brandeburgo", country: "Germania", continent: "Europa", lat: 52.5163, lng: 13.3777 },
  { id: "piazza-san-marco", name: "Piazza San Marco", country: "Italia", continent: "Europa", lat: 45.4342, lng: 12.3388 },
  { id: "versailles", name: "Reggia di Versailles", country: "Francia", continent: "Europa", lat: 48.8049, lng: 2.1204 },
  { id: "duomo-milano", name: "Duomo di Milano", country: "Italia", continent: "Europa", lat: 45.4642, lng: 9.1900 },
  { id: "louvre", name: "Piramide del Louvre", country: "Francia", continent: "Europa", lat: 48.8606, lng: 2.3376 },
  { id: "notre-dame", name: "Notre-Dame", country: "Francia", continent: "Europa", lat: 48.8530, lng: 2.3499 },
  { id: "cremlino", name: "Cremlino e Piazza Rossa", country: "Russia", continent: "Europa", lat: 55.7520, lng: 37.6175 },
  { id: "buckingham-palace", name: "Buckingham Palace", country: "Regno Unito", continent: "Europa", lat: 51.5014, lng: -0.1419 },
  { id: "fontana-di-trevi", name: "Fontana di Trevi", country: "Italia", continent: "Europa", lat: 41.9009, lng: 12.4833 },

  // Asia
  { id: "grande-muraglia", name: "Grande Muraglia Cinese", country: "Cina", continent: "Asia", lat: 40.4319, lng: 116.5704 },
  { id: "citta-proibita", name: "Città Proibita", country: "Cina", continent: "Asia", lat: 39.9163, lng: 116.3972 },
  { id: "esercito-terracotta", name: "Esercito di Terracotta", country: "Cina", continent: "Asia", lat: 34.3841, lng: 109.2785 },
  { id: "taj-mahal", name: "Taj Mahal", country: "India", continent: "Asia", lat: 27.1751, lng: 78.0421 },
  { id: "angkor-wat", name: "Angkor Wat", country: "Cambogia", continent: "Asia", lat: 13.4125, lng: 103.8670 },
  { id: "petra", name: "Petra", country: "Giordania", continent: "Asia", lat: 30.3285, lng: 35.4444 },
  { id: "hagia-sophia", name: "Hagia Sophia", country: "Turchia", continent: "Asia", lat: 41.0086, lng: 28.9802 },
  { id: "moschea-blu", name: "Moschea Blu", country: "Turchia", continent: "Asia", lat: 41.0054, lng: 28.9768 },
  { id: "burj-khalifa", name: "Burj Khalifa", country: "Emirati Arabi Uniti", continent: "Asia", lat: 25.1972, lng: 55.2744 },
  { id: "palazzo-del-potala", name: "Palazzo del Potala", country: "Cina", continent: "Asia", lat: 29.6558, lng: 91.1177 },
  { id: "monte-fuji", name: "Monte Fuji", country: "Giappone", continent: "Asia", lat: 35.3606, lng: 138.7274 },
  { id: "tempio-oro-amritsar", name: "Tempio d'Oro", country: "India", continent: "Asia", lat: 31.6200, lng: 74.8765 },

  // Nord America
  { id: "statua-liberta", name: "Statua della Libertà", country: "Stati Uniti", continent: "Nord America", lat: 40.6892, lng: -74.0445 },
  { id: "monte-rushmore", name: "Monte Rushmore", country: "Stati Uniti", continent: "Nord America", lat: 43.8791, lng: -103.4591 },
  { id: "golden-gate", name: "Golden Gate Bridge", country: "Stati Uniti", continent: "Nord America", lat: 37.8199, lng: -122.4783 },
  { id: "cascate-niagara", name: "Cascate del Niagara", country: "Canada", continent: "Nord America", lat: 43.0799, lng: -79.0747 },
  { id: "chichen-itza", name: "Chichen Itza", country: "Messico", continent: "Nord America", lat: 20.6843, lng: -88.5678 },
  { id: "empire-state", name: "Empire State Building", country: "Stati Uniti", continent: "Nord America", lat: 40.7484, lng: -73.9857 },
  { id: "cn-tower", name: "CN Tower", country: "Canada", continent: "Nord America", lat: 43.6426, lng: -79.3871 },

  // Sud America
  { id: "cristo-redentore", name: "Cristo Redentore", country: "Brasile", continent: "Sud America", lat: -22.9519, lng: -43.2105 },
  { id: "machu-picchu", name: "Machu Picchu", country: "Perù", continent: "Sud America", lat: -13.1631, lng: -72.5450 },
  { id: "moai-isola-pasqua", name: "Moai dell'Isola di Pasqua", country: "Cile", continent: "Sud America", lat: -27.1212, lng: -109.3667 },
  { id: "cascate-iguazu", name: "Cascate dell'Iguazú", country: "Argentina", continent: "Sud America", lat: -25.6953, lng: -54.4367 },

  // Africa
  { id: "piramidi-giza", name: "Piramidi di Giza", country: "Egitto", continent: "Africa", lat: 29.9792, lng: 31.1342 },
  { id: "sfinge-giza", name: "Grande Sfinge di Giza", country: "Egitto", continent: "Africa", lat: 29.9753, lng: 31.1376 },
  { id: "table-mountain", name: "Table Mountain", country: "Sudafrica", continent: "Africa", lat: -33.9628, lng: 18.4098 },
  { id: "cascate-vittoria", name: "Cascate Vittoria", country: "Zambia", continent: "Africa", lat: -17.9243, lng: 25.8572 },
  { id: "jemaa-el-fna", name: "Piazza Jemaa el-Fna", country: "Marocco", continent: "Africa", lat: 31.6258, lng: -7.9891 },

  // Oceania
  { id: "sydney-opera-house", name: "Sydney Opera House", country: "Australia", continent: "Oceania", lat: -33.8568, lng: 151.2153 },
  { id: "uluru", name: "Uluru", country: "Australia", continent: "Oceania", lat: -25.3444, lng: 131.0369 },
  { id: "sydney-harbour-bridge", name: "Sydney Harbour Bridge", country: "Australia", continent: "Oceania", lat: -33.8523, lng: 151.2108 },
  { id: "grande-barriera-corallina", name: "Grande Barriera Corallina", country: "Australia", continent: "Oceania", lat: -18.2871, lng: 147.6992 },
];
