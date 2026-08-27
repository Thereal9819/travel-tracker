// One-off test script (no test framework in this project).
// Run from the project root: node scripts/test-milestone-emojis.mjs
import assert from "node:assert/strict";
import { MILESTONES } from "../src/milestones.js";
import { MILESTONE_EMOJIS, DEFAULT_MILESTONE_EMOJI } from "../src/milestoneEmojis.js";

const realIds = new Set(MILESTONES.map((m) => m.id));

assert.equal(typeof DEFAULT_MILESTONE_EMOJI, "string", "DEFAULT_MILESTONE_EMOJI must be a string");
assert.ok(DEFAULT_MILESTONE_EMOJI.length > 0, "DEFAULT_MILESTONE_EMOJI must not be empty");

const mappedIds = Object.keys(MILESTONE_EMOJIS);
assert.ok(mappedIds.length > 0, "MILESTONE_EMOJIS must not be empty");

for (const id of mappedIds) {
  assert.ok(realIds.has(id), `MILESTONE_EMOJIS has an id that doesn't exist in MILESTONES: "${id}"`);
  const emoji = MILESTONE_EMOJIS[id];
  assert.equal(typeof emoji, "string", `emoji for "${id}" must be a string`);
  assert.ok(emoji.length > 0, `emoji for "${id}" must not be empty`);
}

// Verifica che il ramo di fallback sia davvero raggiungibile: deve
// esistere almeno una milestone reale senza emoji specifica.
const unmapped = [...realIds].filter((id) => !(id in MILESTONE_EMOJIS));
assert.ok(
  unmapped.length > 0,
  "expected at least one milestone without a specific emoji, to exercise the fallback"
);

console.log(
  `OK - ${mappedIds.length}/${realIds.size} milestone con emoji specifica, ${unmapped.length} sul fallback "${DEFAULT_MILESTONE_EMOJI}"`
);
