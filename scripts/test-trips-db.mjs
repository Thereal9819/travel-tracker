// One-off test script (no test framework in this project).
// Run from the project root: node scripts/test-trips-db.mjs
import assert from "node:assert/strict";
import { unlinkSync, existsSync } from "node:fs";
import { makeClient } from "../api/_turso.js";
import { ensureTable, listTrips, insertTrip, updateTrip, deleteTrip } from "../api/_trips-db.js";

const DB_FILE = "./scripts/_test-trips.db";
for (const suffix of ["", "-shm", "-wal"]) {
  const p = DB_FILE + suffix;
  if (existsSync(p)) {
    try {
      unlinkSync(p);
    } catch (err) {
      console.error(`Warning: could not delete ${p}: ${err.code}`);
    }
  }
}

const db = makeClient(`file:${DB_FILE}`, undefined);

async function main() {
  await ensureTable(db);
  await ensureTable(db); // idempotente

  assert.deepEqual(await listTrips(db), [], "starts empty");

  const id1 = await insertTrip(db, {
    countryA3: "ITA",
    countryRaw: "Italia",
    region: "Toscana",
    city: "Firenze",
    notes: "Firenze - Duomo",
    dateStart: "2023-02-01",
    dateEnd: "2023-02-03",
  });
  assert.equal(typeof id1, "string");
  assert.ok(id1.length > 0);

  let trips = await listTrips(db);
  assert.equal(trips.length, 1);
  assert.deepEqual(trips[0], {
    id: id1,
    countryA3: "ITA",
    countryRaw: "Italia",
    region: "Toscana",
    city: "Firenze",
    notes: "Firenze - Duomo",
    dateStart: "2023-02-01",
    dateEnd: "2023-02-03",
  });

  // campi opzionali assenti -> stringa vuota, non errore
  const id2 = await insertTrip(db, {
    countryA3: "DEU",
    countryRaw: "Germania",
    dateStart: "2023-05-10",
  });
  trips = await listTrips(db);
  assert.equal(trips.length, 2);
  const t2 = trips.find((t) => t.id === id2);
  assert.equal(t2.region, "");
  assert.equal(t2.city, "");
  assert.equal(t2.notes, "");
  assert.equal(t2.dateEnd, "");

  // ordinamento per dateStart
  assert.equal(trips[0].id, id1); // 2023-02-01 prima di 2023-05-10
  assert.equal(trips[1].id, id2);

  // update su id esistente -> true, dati aggiornati
  const updated = await updateTrip(db, id1, {
    countryA3: "ITA",
    countryRaw: "Italia",
    region: "Toscana",
    city: "Siena",
    notes: "Siena - Piazza del Campo",
    dateStart: "2023-02-01",
    dateEnd: "2023-02-04",
  });
  assert.equal(updated, true);
  trips = await listTrips(db);
  const t1 = trips.find((t) => t.id === id1);
  assert.equal(t1.city, "Siena");
  assert.equal(t1.dateEnd, "2023-02-04");

  // update su id inesistente -> false, nessun errore
  const notUpdated = await updateTrip(db, "id-che-non-esiste", {
    countryA3: "FRA",
    countryRaw: "Francia",
    dateStart: "2023-01-01",
  });
  assert.equal(notUpdated, false);

  // delete su id esistente
  await deleteTrip(db, id1);
  trips = await listTrips(db);
  assert.equal(trips.length, 1);
  assert.equal(trips[0].id, id2);

  // delete su id inesistente -> nessun errore
  await deleteTrip(db, "id-che-non-esiste");
  trips = await listTrips(db);
  assert.equal(trips.length, 1);

  console.log("OK - trips-db: create/list/update/delete all correct");
}

main()
  .catch((err) => {
    console.error("FAIL -", err.message);
    process.exit(1);
  })
  .finally(() => {
    if (db && typeof db.close === "function") {
      db.close();
    }
    for (const suffix of ["", "-shm", "-wal"]) {
      const p = DB_FILE + suffix;
      if (existsSync(p)) {
        try {
          unlinkSync(p);
        } catch (err) {
          console.error(`Warning: could not delete ${p}: ${err.code}`);
        }
      }
    }
  });
