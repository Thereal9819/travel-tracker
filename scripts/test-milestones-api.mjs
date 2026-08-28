// One-off test script (no test framework in this project).
// Exercises the api/milestones.js handler directly with mock req/res
// objects, against a local on-disk SQLite file (no live Turso needed).
// Run: node scripts/test-milestones-api.mjs
import assert from "node:assert/strict";
import { unlinkSync, existsSync } from "node:fs";

// Relative path (resolved against the current working directory, i.e. the
// project root when run as shown below) — avoids Windows file:// URL/path
// conversion edge cases entirely.
const DB_FILE = "./scripts/_test-milestones-api.db";
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
const TEST_KEY = "test-shared-secret";
process.env.API_SHARED_SECRET = TEST_KEY;
const AUTH_HEADERS = { "x-api-key": TEST_KEY };

const { default: handler } = await import("../api/milestones.js");

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
  // GET on empty db
  let res = mockRes();
  await handler({ method: "GET" }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { checked: [] });

  // POST senza x-api-key -> 401, nessuna scrittura
  res = mockRes();
  await handler({ method: "POST", body: { id: "taj-mahal", checked: true } }, res);
  assert.equal(res.statusCode, 401);

  // POST con x-api-key sbagliata -> 401
  res = mockRes();
  await handler({ method: "POST", headers: { "x-api-key": "wrong" }, body: { id: "taj-mahal", checked: true } }, res);
  assert.equal(res.statusCode, 401);

  // GET riflette che nessuna delle due POST sopra ha scritto nulla
  res = mockRes();
  await handler({ method: "GET" }, res);
  assert.deepEqual(res.body, { checked: [] });

  // POST invalid body, con chiave corretta
  res = mockRes();
  await handler({ method: "POST", headers: AUTH_HEADERS, body: {} }, res);
  assert.equal(res.statusCode, 400);

  // POST id with disallowed characters (uppercase, spaces, etc.)
  res = mockRes();
  await handler({ method: "POST", headers: AUTH_HEADERS, body: { id: "Not Valid!", checked: true } }, res);
  assert.equal(res.statusCode, 400);

  // POST id too long (> 64 chars)
  res = mockRes();
  await handler({ method: "POST", headers: AUTH_HEADERS, body: { id: "a".repeat(65), checked: true } }, res);
  assert.equal(res.statusCode, 400);

  // POST valid check
  res = mockRes();
  await handler({ method: "POST", headers: AUTH_HEADERS, body: { id: "taj-mahal", checked: true } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { checked: ["taj-mahal"] });

  // GET reflects the change
  res = mockRes();
  await handler({ method: "GET" }, res);
  assert.deepEqual(res.body, { checked: ["taj-mahal"] });

  // POST uncheck
  res = mockRes();
  await handler({ method: "POST", headers: AUTH_HEADERS, body: { id: "taj-mahal", checked: false } }, res);
  assert.deepEqual(res.body, { checked: [] });

  // Unsupported method
  res = mockRes();
  await handler({ method: "DELETE" }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, "GET, POST");

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

  console.log("OK - all milestones-api assertions passed");
}

await main()
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
