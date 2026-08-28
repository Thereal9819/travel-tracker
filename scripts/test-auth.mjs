// One-off test script (no test framework in this project).
// Exercises api/_auth.js's checkWriteAuth in isolation, with mock req/res.
// Run: node scripts/test-auth.mjs
import assert from "node:assert/strict";
import { checkWriteAuth } from "../api/_auth.js";

function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
}

function main() {
  // API_SHARED_SECRET non configurata -> fallisce chiuso, anche con una
  // chiave fornita (un segreto assente e' un errore di configurazione,
  // non un lasciapassare).
  delete process.env.API_SHARED_SECRET;
  let res = mockRes();
  let ok = checkWriteAuth({ headers: { "x-api-key": "qualsiasi" } }, res);
  assert.equal(ok, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, "unauthorized");

  process.env.API_SHARED_SECRET = "il-vero-segreto";

  // Nessun header -> rifiutato.
  res = mockRes();
  ok = checkWriteAuth({ headers: {} }, res);
  assert.equal(ok, false);
  assert.equal(res.statusCode, 401);

  // req.headers del tutto assente (non solo vuoto) -> non deve lanciare,
  // deve comunque rifiutare in modo pulito.
  res = mockRes();
  ok = checkWriteAuth({}, res);
  assert.equal(ok, false);
  assert.equal(res.statusCode, 401);

  // Chiave sbagliata -> rifiutato.
  res = mockRes();
  ok = checkWriteAuth({ headers: { "x-api-key": "sbagliata" } }, res);
  assert.equal(ok, false);
  assert.equal(res.statusCode, 401);

  // Chiave corretta -> accettato, res non toccata.
  res = mockRes();
  ok = checkWriteAuth({ headers: { "x-api-key": "il-vero-segreto" } }, res);
  assert.equal(ok, true);
  assert.equal(res.statusCode, null);

  console.log("OK - auth: checkWriteAuth accepts only the exact configured secret, fails closed when unset");
}

main();
