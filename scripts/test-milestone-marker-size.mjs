// One-off test script (no test framework in this project).
// Run from the project root: node scripts/test-milestone-marker-size.mjs
import assert from "node:assert/strict";
import {
  dotSizeForAltitude,
  MIN_DOT_SIZE,
  MAX_DOT_SIZE,
  FAR_ALTITUDE,
} from "../src/milestoneMarkerSize.js";

// Stesso valore di ZOOM_EMOJI_THRESHOLD in src/Globe3D.jsx al momento in
// cui questo piano è stato scritto — se quella costante cambia, questo
// test resta comunque valido perché non dipende dal valore esatto, solo
// dalla relazione tra "lontano" e "vicino".
const NEAR = 0.6;

// A altitudine "lontana" (o oltre), dimensione minima.
assert.equal(dotSizeForAltitude(FAR_ALTITUDE, NEAR), MIN_DOT_SIZE, "far altitude -> min size");
assert.equal(dotSizeForAltitude(FAR_ALTITUDE + 5, NEAR), MIN_DOT_SIZE, "beyond far altitude -> clamped to min size");

// Alla soglia (o oltre, più vicino), dimensione massima.
assert.equal(dotSizeForAltitude(NEAR, NEAR), MAX_DOT_SIZE, "near altitude -> max size");
assert.equal(dotSizeForAltitude(NEAR - 0.5, NEAR), MAX_DOT_SIZE, "closer than near altitude -> clamped to max size");

// A metà strada tra le due altitudini, dimensione a metà tra minimo e massimo.
const mid = (FAR_ALTITUDE + NEAR) / 2;
const midSize = dotSizeForAltitude(mid, NEAR);
const expectedMid = (MIN_DOT_SIZE + MAX_DOT_SIZE) / 2;
assert.ok(
  Math.abs(midSize - expectedMid) < 0.01,
  `midpoint altitude should give ~${expectedMid}px, got ${midSize}`
);

// Monotonicità: zoomando in avanti (altitudine che scende) la dimensione
// non deve mai diminuire.
const altitudes = [2.5, 2.0, 1.5, 1.0, 0.6];
const sizes = altitudes.map((a) => dotSizeForAltitude(a, NEAR));
for (let i = 1; i < sizes.length; i++) {
  assert.ok(
    sizes[i] >= sizes[i - 1],
    `size must not decrease as altitude decreases: altitudes=${altitudes} sizes=${sizes}`
  );
}

// Guardia difensiva: un'altitudine non finita (NaN, Infinity) non deve mai
// produrre un valore non finito da scrivere nel DOM come "NaNpx".
assert.equal(dotSizeForAltitude(NaN, NEAR), MIN_DOT_SIZE, "NaN altitude -> clamped to min size");

console.log("OK - dotSizeForAltitude: min/max/midpoint/monotonicity/NaN-guard all correct");
