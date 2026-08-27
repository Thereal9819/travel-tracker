// One-off test script (no test framework in this project).
// Run from the project root: node scripts/test-milestones-db.mjs
import assert from "node:assert/strict";
import { unlinkSync, existsSync } from "node:fs";
import {
  makeClient,
  ensureTable,
  getChecked,
  setChecked,
} from "../api/_milestones-db.js";

// Relative path (resolved against the current working directory, i.e. the
// project root when run as shown above) — avoids Windows file:// URL/path
// conversion edge cases entirely.
const DB_FILE = "./scripts/_test-milestones.db";
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
  // ensureTable is idempotent
  await ensureTable(db);

  assert.deepEqual(await getChecked(db), [], "starts empty");

  await setChecked(db, "torre-eiffel", true);
  assert.deepEqual(await getChecked(db), ["torre-eiffel"], "one id checked");

  // checking the same id twice must not error or duplicate
  await setChecked(db, "torre-eiffel", true);
  assert.deepEqual(await getChecked(db), ["torre-eiffel"], "no duplicate on re-check");

  await setChecked(db, "colosseo", true);
  assert.deepEqual(
    await getChecked(db),
    ["colosseo", "torre-eiffel"],
    "two ids checked, sorted"
  );

  await setChecked(db, "torre-eiffel", false);
  assert.deepEqual(await getChecked(db), ["colosseo"], "unchecking removes the id");

  // unchecking an id that isn't there must not error
  await setChecked(db, "not-there", false);
  assert.deepEqual(await getChecked(db), ["colosseo"], "no-op unchecking unknown id");

  console.log("OK - all milestones-db assertions passed");
}

await main()
  .catch((err) => {
    console.error("FAIL -", err.message);
    process.exit(1);
  })
  .finally(() => {
    if (db && typeof db.close === 'function') {
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
