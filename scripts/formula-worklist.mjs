#!/usr/bin/env node
/**
 * The formulas a brand's staged barcodes are still missing, as a worklist.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * A barcode campaign and a formula campaign are different jobs, and the Iams
 * campaign is what taught this repository the difference. It came back with
 * 133 proven UPC-to-product bindings and 13 compositions, because the maker
 * renders its ingredient panels as images and the campaign correctly refused
 * to guess at them.
 *
 * The recovery is not 120 more page reads. **Composition is a property of the
 * recipe, not of the bag size** — one Minichunks Chicken & Whole Grain panel
 * answers six barcodes, and the 133 Iams records collapse to 63 recipes of
 * which 55 need a panel. Told that, an agent fetches 55 pages. Not told it, it
 * walks the barcode list and fetches 120.
 *
 * So this script does the collapse, and prints what is left to find with the
 * barcodes each answer would serve. It is the second campaign's assignment,
 * the same way brand-inventory.mjs is the first campaign's.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────
 *
 *   node scripts/formula-worklist.mjs research/deep-research-iams.json
 *   node scripts/formula-worklist.mjs research/incoming/iams-batch-*.json
 *   node scripts/formula-worklist.mjs research/deep-research-iams.json > research/WORKLIST-IAMS.md
 *
 * Takes a ledger (an object with `records`) or bare record arrays, or several
 * of either. Runs under bare node: no install, no network, no build.
 */

import { readFileSync } from "node:fs";

const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error("usage: node scripts/formula-worklist.mjs <ledger-or-batch.json> [...]");
  process.exit(2);
}

const records = [];
for (const path of paths) {
  const parsed = JSON.parse(readFileSync(path, "utf8"));
  const batch = Array.isArray(parsed) ? parsed : parsed.records;
  if (!Array.isArray(batch)) {
    console.error(`${path}: neither a record array nor a ledger with records`);
    process.exit(2);
  }
  records.push(...batch);
}

/**
 * A recipe key, which is the identity minus everything the bag size changes.
 *
 * The size lives in `size`, but it leaks into `variant` too — makers print
 * "Chicken & Whole Grain 13.5 lb" as one string and a ledger copies it. Left
 * in, every size looks like its own recipe and the collapse does nothing, so
 * a trailing printed size is stripped. Nothing else is normalised: two
 * variants that differ by a real word are two recipes until a panel proves
 * otherwise, and guessing the other way merges products that a maker
 * deliberately separates.
 */
const recipeKey = (r) => {
  const variant = String(r.variant ?? "")
    .replace(/\s*\d+(?:\.\d+)?\s*(?:lb|lbs|oz|kg|g|ct|count)\b\.?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return [r.species ?? "?", r.product_line ?? "(no range)", variant || "(no variant)"].join(" | ");
};

const hasIngredients = (r) => typeof r.ingredients_verbatim === "string" && r.ingredients_verbatim.trim() !== "";
const hasAnalysis = (r) => r.guaranteed_analysis?.crude_protein_min_percent != null;
const hasCalories = (r) =>
  r.calorie_content?.kcal_per_kg != null || r.calorie_content?.kcal_per_unit != null;

/**
 * Retail hosts that publish a full nutrition panel as text.
 *
 * This list is what "a second independent source" is counted against, and it
 * is deliberately only shops. A manufacturer page outranks all of them
 * (AGENTS.md §6) and is better evidence, not worse — but iams.com renders its
 * panels as images, so it appears in almost every Iams record as IDENTITY
 * evidence while proving nothing about the formula. Counting it would report
 * a second witness that nobody read. Distributor price lists (admc.us) and
 * the makers' UPC exhibits bind a code to a size and print no formula at all.
 *
 * So a recipe "has two sources" here when two different shops carry the panel.
 * A transcribed manufacturer image is stronger and is not automatic: say so in
 * verification_notes and promote on that.
 */
const RETAIL_PANEL_HOSTS = new Set([
  "chewy.com", "petco.com", "petsmart.com", "target.com", "walmart.com",
  "kroger.com", "samsclub.com", "instacart.com", "heb.com", "tractorsupply.com",
  "brickseek.com", "farmandhomesupply.com", "coastalcountry.com",
  "feederspetsupply.com", "k9outdoors.com", "store.animalwiz.com",
]);

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const recipes = new Map();
for (const r of records) {
  const key = recipeKey(r);
  if (!recipes.has(key)) {
    recipes.set(key, { key, rows: [], ingredients: 0, analysis: 0, calories: 0, shops: new Set() });
  }
  const recipe = recipes.get(key);
  recipe.rows.push(r);
  if (hasIngredients(r)) recipe.ingredients++;
  if (hasAnalysis(r)) recipe.analysis++;
  if (hasCalories(r)) recipe.calories++;
  for (const url of r.source_urls ?? []) {
    const host = hostOf(url);
    if (host && RETAIL_PANEL_HOSTS.has(host)) recipe.shops.add(host);
  }
}

const all = [...recipes.values()].sort(
  (a, b) => b.rows.length - a.rows.length || a.key.localeCompare(b.key),
);
const missing = all.filter((r) => r.ingredients === 0);
const partial = all.filter((r) => r.ingredients > 0 && (r.analysis === 0 || r.calories === 0));
const done = all.filter((r) => r.ingredients > 0 && r.analysis > 0 && r.calories > 0);
const oneWitness = done.filter((r) => r.shops.size < 2);
const corroborated = done.filter((r) => r.shops.size >= 2);

const brands = [...new Set(records.map((r) => r.brand))].join(", ");
const line = (r) => `${r.size ?? "?"}`;

console.log(`# ${brands} — the formulas still missing`);
console.log();
console.log(
  `Generated by \`node scripts/formula-worklist.mjs ${paths.join(" ")}\`. ` +
    `**Re-run it before you start** — it reads the ledger, so it is current the moment ` +
    `you generate it and stale the moment somebody captures a panel.`,
);
console.log();
console.log(`- Barcode records: **${records.length}**`);
console.log(`- Distinct recipes behind them: **${all.length}**`);
console.log(`- Recipes with a complete panel (ingredients + analysis + calories): **${done.length}**`);
console.log(`  - of those, corroborated by two or more shops: **${corroborated.length}**`);
console.log(`  - of those, resting on a single shop: **${oneWitness.length}**`);
console.log(`- Recipes with a partial panel: **${partial.length}**`);
console.log(`- Recipes with no ingredients at all: **${missing.length}**`);
console.log();
console.log(
  `One panel answers every barcode listed beside it. The whole point of this ` +
    `page is that the work is ${missing.length + partial.length} panels, not ${records.length} pages ` +
    `— plus ${oneWitness.length} recipes that need a second witness rather than a new panel.`,
);

const section = (title, note, list) => {
  if (list.length === 0) return;
  console.log();
  console.log(`## ${title}`);
  console.log();
  console.log(note);
  console.log();
  console.log("| n | species | range | recipe | have | shops carrying it | the barcodes one panel answers |");
  console.log("|---:|---|---|---|---|---|---|");
  for (const recipe of list) {
    const [species, range, variant] = recipe.key.split(" | ");
    const have = [
      recipe.ingredients > 0 ? "ingredients" : null,
      recipe.analysis > 0 ? "analysis" : null,
      recipe.calories > 0 ? "calories" : null,
    ].filter(Boolean);
    const codes = recipe.rows.map((r) => `\`${r.upc}\` ${line(r)}`).join("<br>");
    const shops = recipe.shops.size ? [...recipe.shops].sort().join(", ") : "—";
    console.log(
      `| ${recipe.rows.length} | ${species} | ${range} | ${variant} | ${have.join(" + ") || "**none**"} | ${shops} | ${codes} |`,
    );
  }
};

section(
  "Missing — no ingredient list at all",
  "Every one of these needs a panel. Capture it once and write it to each barcode beside it.",
  missing,
);
section(
  "Partial — an ingredient list, but not the whole panel",
  "Cheaper than the section above and easy to leave half-done. A record with ingredients and no calories is not finished.",
  partial,
);
section(
  "Needs a second witness — the panel is complete, one shop carries it",
  "**No new research.** Every one of these has ingredients, guaranteed analysis and calories " +
    "already, from a single shop. Open a SECOND shop's page for the same recipe, compare the " +
    "panel field by field, and promote to `source_verified` if they agree — or record the " +
    "disagreement in `conflicts` and leave it at `needs_physical_label` if they do not. " +
    "A manufacturer panel transcribed from an image counts and outranks both; say so in " +
    "`verification_notes`.",
  oneWitness,
);
section(
  "Corroborated — two shops already agree",
  "Ready to promote per record, once you have checked the two panels actually match. Nothing to fetch.",
  corroborated,
);
