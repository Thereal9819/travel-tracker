// One-off test script (no test framework in this project).
// Run from the project root: node scripts/test-csv-trips.mjs
import assert from "node:assert/strict";
import { parseCSV, parseDate, splitPosto, csvRowToTripPayload } from "./lib/csv-trips.mjs";

// parseCSV: righe semplici e con virgole dentro un campo tra virgolette
const rows = parseCSV(
  'Italia,Toscana,"Firenze, centro storico",01/02/2023,03/02/2023,-50\nGermania,,Berlino,10/05/2023,12/05/2023,0\n'
);
assert.deepEqual(rows[0], ["Italia", "Toscana", "Firenze, centro storico", "01/02/2023", "03/02/2023", "-50"]);
assert.deepEqual(rows[1], ["Germania", "", "Berlino", "10/05/2023", "12/05/2023", "0"]);

// parseDate: formato gg/mm/aaaa -> ISO aaaa-mm-gg, anno a 2 cifre -> 20xx
assert.equal(parseDate("01/02/2023"), "2023-02-01");
assert.equal(parseDate("1/2/23"), "2023-02-01");
assert.equal(parseDate(""), "");

// splitPosto: prima parte prima del trattino è la "città", testo intero in "rest"
assert.deepEqual(splitPosto("Roma - San Pietro, Colosseo"), {
  city: "Roma",
  rest: "Roma - San Pietro, Colosseo",
});
assert.deepEqual(splitPosto(""), { city: "", rest: "" });

// csvRowToTripPayload: paese riconosciuto -> payload completo, MAI il campo costo
const payload = csvRowToTripPayload(["Italia", "Toscana", "Firenze - Duomo", "01/02/2023", "03/02/2023", "-50"]);
assert.equal(payload.countryA3, "ITA");
assert.equal(payload.countryRaw, "Italia");
assert.equal(payload.region, "Toscana");
assert.equal(payload.city, "Firenze");
assert.equal(payload.notes, "Firenze - Duomo");
assert.equal(payload.dateStart, "2023-02-01");
assert.equal(payload.dateEnd, "2023-02-03");
assert.equal("cost" in payload, false, "il campo costo non deve mai far parte del payload");

// paese non riconosciuto -> null (stesso comportamento già esistente lato client)
assert.equal(
  csvRowToTripPayload(["Paese Inesistente Xyz", "", "Posto", "01/01/2023", "02/01/2023", "0"]),
  null
);

console.log("OK - csv-trips: parseCSV/parseDate/splitPosto/csvRowToTripPayload all correct");
