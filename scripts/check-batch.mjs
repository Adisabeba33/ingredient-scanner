#!/usr/bin/env node
/**
 * Check a seed batch BEFORE any of it is typed into data/.
 *
 * Four questions, none of which need a shop or a network:
 *
 *   1. Is the barcode real?      UPC-A check digit.
 *   2. Do we know the maker?     GS1 company prefix, against the list below.
 *   3. Do we already hold it?    against data/known-products.ts.
 *   4. Is it somebody else's?    against data/wrong-barcodes.ts — cases,
 *                                multipacks, and products that share a name.
 *   5. Does the pack agree with  kcal/kg x net weight has to equal
 *      itself?                   the printed kcal/can.
 *
 * The fourth is the one that earns its keep. A calorie statement is a second,
 * independent measurement of the net weight, and it has now settled three
 * disputes that looked like they needed somebody to walk into a shop:
 *
 *   - Fancy Feast Gems Turkey: Target said 4.9 oz, Purina said 4 oz. At 930
 *     kcal/kg a 2.45 oz gem would be 64.6 kcal and the deck prints 52. Purina
 *     was right.
 *   - Friskies Country Style Dinner: two calorie statements, 1151/179 and
 *     1093/170. BOTH check out. A typo cannot do that, so it is two formulas.
 *   - Friskies Ocean Favorites Salmon & Shrimp: 5.4 oz or 5.5? The deck's own
 *     calorie line only works at 5.5.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────
 *
 *   node scripts/check-batch.mjs batch.tsv
 *   cat batch.tsv | node scripts/check-batch.mjs
 *
 * One product per line, tab- or comma-separated, blank lines and #comments
 * ignored:
 *
 *   upc            oz     kcalPerKg   kcalPerUnit   [label]
 *   050000429943   3      1090        85            Fancy Feast Chicken Feast
 *
 * `oz` is the weight the CALORIE FIGURE is about, which is not always the pack:
 * a Fancy Feast Petites tub is 2.8 oz and states calories per 1.4 oz serving, a
 * Gems box is 4 oz and states them per 2 oz gem. Pass the serving.
 *
 * Leave kcal columns empty (or write `-`) when the source gives no calorie
 * statement; the row is still checked for digit, prefix and collision.
 *
 * Exit code is 1 if anything failed, so it can gate a script.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const PRODUCTS = join(HERE, "..", "data", "known-products.ts");
const WRONG = join(HERE, "..", "data", "wrong-barcodes.ts");
const GS1 = join(HERE, "..", "data", "gs1-prefixes.ts");

/**
 * The GS1 company prefixes the seed holds products under.
 *
 * Read out of data/gs1-prefixes.ts rather than written here, for the reason
 * that file states at length: this script and lib/known-products.test.ts both
 * ask the question, and a check that knows less than the repository does is a
 * check somebody will trust and should not.
 */
function prefixes() {
  const src = readFileSync(GS1, "utf8");
  const out = new Map();
  for (const m of src.matchAll(/prefix:\s*"(\d+)",\s*maker:\s*"([^"]+)"/g)) {
    out.set(m[1], m[2]);
  }
  return out;
}

const GRAMS_PER_OZ = 28.3495;

/**
 * How far a calorie statement may be from the arithmetic before it is a
 * problem rather than a rounding.
 *
 * Purina rounds inconsistently — Medleys Milanese and Carne Asada both print
 * 811 kcal/kg on a 3 oz can and then state 69 and 68 kcal/can, against a true
 * 68.97 — so anything under about a whole kcal is the label's own habit and
 * not evidence of anything.
 */
const KCAL_SLACK = 1.3;

function checkDigit(upc11) {
  let sum = 0;
  for (let i = 0; i < 11; i += 1) {
    const d = Number(upc11[i]);
    sum += i % 2 === 0 ? d * 3 : d;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Every barcode the seed already holds.
 *
 * Read out of the TypeScript with a regular expression rather than by importing
 * it: this script has to run under plain node, before anything is added, and
 * the shape it is looking for — `upc: "050000429943"` — is not one that varies.
 */
function seeded() {
  const src = readFileSync(PRODUCTS, "utf8");
  return new Set([...src.matchAll(/upc:\s*"(\d+)"/g)].map((m) => m[1]));
}

/**
 * The codes that belong to something else — cases, multipacks, and one product
 * that shares a flavour name with another.
 *
 * Added after the first real use of this script missed one: 050000962648 was on
 * the do-not-file list and the checker said "ok", because the list lived in a
 * test file where nothing but the test could see it. A check that knows less
 * than the repository does is a check somebody will trust and should not.
 */
function wrongCodes() {
  const src = readFileSync(WRONG, "utf8");
  const out = new Map();
  for (const m of src.matchAll(/code:\s*"(\d+)",\s*\n\s*is:\s*"([^"]+)"/g)) {
    out.set(m[1], m[2]);
  }
  return out;
}

function parse(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\t|,/).map((c) => c.trim()))
    .map(([upc, oz, kg, per, ...rest]) => ({
      upc: (upc ?? "").replace(/[^\d]/g, ""),
      oz: Number(oz),
      kg: kg && kg !== "-" ? Number(kg) : null,
      per: per && per !== "-" ? Number(per) : null,
      label: rest.join(" ").trim(),
    }));
}

const file = process.argv[2];
const input = file ? readFileSync(file, "utf8") : readFileSync(0, "utf8");
const rows = parse(input);
if (rows.length === 0) {
  console.error("Nothing to check. Expecting: upc<TAB>oz<TAB>kcalPerKg<TAB>kcalPerUnit");
  process.exit(1);
}

const already = seeded();
const wrong = wrongCodes();
const makers = prefixes();
const seenHere = new Set();
let failures = 0;

console.log(`\nChecking ${rows.length} product${rows.length === 1 ? "" : "s"}\n`);

for (const r of rows) {
  const problems = [];

  if (r.upc.length !== 12) {
    problems.push(`${r.upc.length} digits, expected 12`);
  } else if (checkDigit(r.upc.slice(0, 11)) !== Number(r.upc[11])) {
    problems.push(`check digit ${r.upc[11]}, should be ${checkDigit(r.upc.slice(0, 11))}`);
  }

  const maker = makers.get(r.upc.slice(0, 6));
  if (!maker) {
    problems.push(
      `prefix ${r.upc.slice(0, 6)} belongs to no maker we have seeded. ` +
        `If this is a new maker rather than a mistyped digit, add the prefix ` +
        `to data/gs1-prefixes.ts and say whose it is.`
    );
  }

  if (already.has(r.upc)) problems.push("ALREADY IN THE SEED");

  const belongsTo = wrong.get(r.upc);
  if (belongsTo) {
    problems.push(
      `NOT A SINGLE TIN — data/wrong-barcodes.ts says this is ${belongsTo}. ` +
        `If the source now gives it a full deck of its own, it may have earned ` +
        `its way off that list; say so out loud rather than quietly.`
    );
  }
  if (seenHere.has(r.upc)) problems.push("duplicated inside this batch");
  seenHere.add(r.upc);

  let kcal = "";
  if (r.kg !== null && r.per !== null && Number.isFinite(r.oz)) {
    const calc = (r.kg * r.oz * GRAMS_PER_OZ) / 1000;
    const off = Math.abs(calc - r.per);
    kcal = `${calc.toFixed(1)} vs ${r.per}`;
    if (off >= KCAL_SLACK) {
      problems.push(
        `calories disagree: ${r.kg} kcal/kg x ${r.oz} oz = ${calc.toFixed(1)}, ` +
          `label says ${r.per}. Try other pack sizes before believing the label.`
      );
    }
  } else if (r.kg !== null || r.per !== null) {
    problems.push("half a calorie statement — give both kcal/kg and kcal/unit, or neither");
  }

  const mark = problems.length === 0 ? "ok  " : "FAIL";
  if (problems.length > 0) failures += 1;
  console.log(`${mark} ${r.upc}  ${kcal.padEnd(16)} ${r.label}`);
  for (const p of problems) console.log(`       ! ${p}`);
}

console.log(
  `\n${rows.length - failures} of ${rows.length} clean` +
    (failures ? `, ${failures} to look at\n` : "\n")
);

// A failing calorie check is usually the SOURCE being interesting rather than
// wrong — a downsizing in progress, a reformulation, a per-serving figure on a
// multi-serving pack. Read it before assuming somebody mistyped.
process.exit(failures > 0 ? 1 : 0);
