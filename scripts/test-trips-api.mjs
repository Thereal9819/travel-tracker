// One-off test script (no test framework in this project).
// Exercises the api/trips.js handler directly with mock req/res objects,
// against a local on-disk SQLite file (no live Turso needed).
// Run: node scripts/test-trips-api.mjs
import assert from "node:assert/strict";
import { unlinkSync, existsSync } from "node:fs";

const DB_FILE = "./scripts/_test-trips-api.db";
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
process.env.TURSO_DATABASE_URL = `file:${DB_FILE}`;
delete process.env.TURSO_AUTH_TOKEN; // local file: DB needs no auth token

const { default: handler } = await import("../api/trips.js");

function mockRes() {
  const res = {
    statusCode: null,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end() {
      return this;
    },
  };
  return res;
}

async function main() {
  // GET su db vuoto
  let res = mockRes();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { trips: [] });

  // POST corpo non valido (manca countryA3)
  res = mockRes();
  await handler({ method: "POST", body: { countryRaw: "Italia", dateStart: "2023-01-01" } }, res);
  assert.equal(res.statusCode, 400);

  // POST valido
  res = mockRes();
  await handler(
    { method: "POST", body: { countryA3: "ITA", countryRaw: "Italia", city: "Roma", dateStart: "2023-01-01" } },
    res
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.trips.length, 1);
  const createdId = res.body.trips[0].id;
  assert.equal(res.body.trips[0].city, "Roma");
  assert.equal(res.body.trips[0].region, "");

  // GET riflette la modifica
  res = mockRes();
  await handler({ method: "GET" }, res);
  assert.equal(res.body.trips.length, 1);

  // PUT su id esistente
  res = mockRes();
  await handler(
    {
      method: "PUT",
      body: { id: createdId, countryA3: "ITA", countryRaw: "Italia", city: "Milano", dateStart: "2023-01-01" },
    },
    res
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.trips[0].city, "Milano");

  // PUT su id inesistente -> 404
  res = mockRes();
  await handler(
    {
      method: "PUT",
      body: { id: "non-esiste", countryA3: "ITA", countryRaw: "Italia", dateStart: "2023-01-01" },
    },
    res
  );
  assert.equal(res.statusCode, 404);

  // DELETE senza id -> 400
  res = mockRes();
  await handler({ method: "DELETE", body: {} }, res);
  assert.equal(res.statusCode, 400);

  // DELETE su id esistente
  res = mockRes();
  await handler({ method: "DELETE", body: { id: createdId } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.trips, []);

  // DELETE su id inesistente -> 200 (no error for missing id on DELETE)
  res = mockRes();
  await handler({ method: "DELETE", body: { id: "non-esiste" } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.trips, []);

  // Metodo non supportato
  res = mockRes();
  await handler({ method: "PATCH" }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, "GET, POST, PUT, DELETE");

  // Missing/invalid TURSO_DATABASE_URL must produce a clean 500 JSON error,
  // not crash the whole function (makeClient throws synchronously when the
  // URL is missing/malformed, e.g. LibsqlError: URL_INVALID) — this is the
  // exact state right after deploy, before Turso env vars are configured.
  const savedUrl = process.env.TURSO_DATABASE_URL;
  process.env.TURSO_DATABASE_URL = "not-a-valid-turso-url";
  res = mockRes();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 500);
  assert.ok(res.body && typeof res.body.error === "string", "500 body has an error string");
  process.env.TURSO_DATABASE_URL = savedUrl;

  // Sanity check: normal requests still work after restoring the URL.
  res = mockRes();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 200);

  console.log("OK - trips-api: GET/POST/PUT/DELETE all correct");
}

main()
  .catch((err) => {
    console.error("FAIL -", err.message);
    process.exit(1);
  })
  .finally(() => {
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
