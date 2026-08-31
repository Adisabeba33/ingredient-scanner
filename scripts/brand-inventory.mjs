#!/usr/bin/env node
/**
 * Everything this repository already holds for one brand, as a markdown page.
 *
 * ── Why this is generated and never written by hand ───────────────────────
 *
 * A research agent's most expensive mistake is re-researching a product we
 * already have. The only defence is showing it what we hold — and a list typed
 * into a brief is out of date the moment the next batch lands, at which point
 * it starts causing the exact duplicates it was written to prevent.
 *
 * So the inventory is a function of the seed. Re-run it and it is current;
 * there is no second copy of the truth to go stale. This is the same rule that
 * made data/gs1-prefixes.ts and data/wrong-barcodes.ts data files rather than
 * constants, for the same reason.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────
 *
 *   node scripts/brand-inventory.mjs "Fancy Feast"
 *   node scripts/brand-inventory.mjs "Fancy Feast" > research/INVENTORY-FANCY-FEAST.md
 *
 * Runs under bare node — it reads the TypeScript as text with the same regex
 * discipline scripts/check-batch.mjs uses, so it needs no install and no build.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const wanted = process.argv[2];
if (!wanted) {
  console.error('Usage: node scripts/brand-inventory.mjs "Fancy Feast"');
  process.exit(1);
}
const same = (a, b) => (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();

/**
 * Strip whole-line `//` comments.
 *
 * These data files are unusually heavily commented, on purpose, and the
 * comments quote things — Fancy Feast's `lines` list carries a note saying
 * Purina's pages call the dry range "Gourmet" and title the decks "Gourmet Cat
 * Food". Read naively, that produced three ranges that do not exist, one of
 * them with a line break in the middle of its name.
 *
 * Only lines that BEGIN with `//` are dropped, so a `//` inside a product name
 * survives.
 */
function decomment(src) {
  return src
    .split("\n")
    .filter((line) => !/^\s*\/\//.test(line))
    .join("\n");
}

/** One `{ … },` entry at the top level of an exported array. */
function blocks(src) {
  return [...decomment(src).matchAll(/\n {2}\{\n([\s\S]*?)\n {2}\},/g)].map((m) => m[1]);
}
const field = (block, name) =>
  new RegExp(`${name}:\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(block)?.[1] ?? null;

// ── The seed ──────────────────────────────────────────────────────────────

const products = [];
for (const b of blocks(read("data/known-products.ts"))) {
  const brand = field(b, "brand");
  if (!brand || !same(brand, wanted)) continue;
  products.push({
    line: field(b, "line"),
    variant: field(b, "variant"),
    species: field(b, "species"),
    foodForm: field(b, "foodForm"),
    lifeStage: field(b, "lifeStage"),
    packages: [...b.matchAll(/size:\s*"([^"]*)".*?upc:\s*"(\d+)"/g)].map((m) => ({
      size: m[1],
      upc: m[2],
    })),
  });
}

const boxes = [];
for (const b of blocks(read("data/known-multipacks.ts"))) {
  const brand = field(b, "brand");
  if (!brand || !same(brand, wanted)) continue;
  boxes.push({
    line: field(b, "line"),
    variant: field(b, "variant"),
    size: field(b, "size"),
    upc: field(b, "upc"),
  });
}

const withFormula = new Set(
  [...read("data/known-formulas.ts").matchAll(/^ {2}"(\d+)":\s*\{/gm)].map((m) => m[1])
);

// ── The brand entry, and the ranges that hold nothing ─────────────────────

const brandBlock = blocks(read("data/us-pet-brands.ts")).find((b) =>
  same(field(b, "name"), wanted)
);
const declaredLines = brandBlock
  ? [...(/lines:\s*\[([\s\S]*?)\]/.exec(brandBlock)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map(
      (m) => m[1]
    )
  : [];
const owner = brandBlock ? field(brandBlock, "owner") : null;

const seededCodesEarly = products.flatMap((p) => p.packages.map((k) => k.upc));

// ── Codes that belong to this brand and are NOT single tins ───────────────

const allWrong = [];
for (const m of read("data/wrong-barcodes.ts").matchAll(
  /code:\s*"(\d+)",\s*\n\s*is:\s*"([^"]+)"(?:,\s*\n\s*insteadUse:\s*"(\d+)")?/g
)) {
  allWrong.push({ code: m[1], is: m[2], insteadUse: m[3] ?? null });
}

/**
 * Narrowed to this maker's own GS1 company prefixes.
 *
 * `data/wrong-barcodes.ts` carries no brand field — a case code's `is:` line is
 * prose — so the only honest filter is the company prefix, taken from the
 * barcodes this brand already holds. Without it a 9Lives inventory printed ten
 * Purina case codes, which is the noise this whole file exists to remove.
 *
 * A brand with nothing seeded yet has no prefix to derive, so it gets the whole
 * list with that said plainly. Better a page of codes that are probably
 * somebody else's than a silently empty section.
 */
const brandPrefixes = new Set(
  [...new Set(seededCodesEarly)].map((c) => c.padStart(14, "0").slice(1, 8))
);
const wrongFiltered = brandPrefixes.size > 0;
const wrong = wrongFiltered
  ? allWrong.filter((w) => brandPrefixes.has(w.code.padStart(14, "0").slice(1, 8)))
  : allWrong;

// ── Anything a research ledger already claims for this brand ──────────────

const inLedgers = [];
for (const file of readdirSync(join(ROOT, "research"))) {
  if (!file.endsWith(".json")) continue;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(join(ROOT, "research", file), "utf8"));
  } catch {
    continue;
  }
  for (const r of parsed.records ?? []) {
    if (!same(r.brand, wanted) || !r.upc) continue;
    inLedgers.push({
      file: `research/${file}`,
      upc: String(r.upc),
      status: r.research_status,
      what: [r.product_line, r.variant, r.size].filter(Boolean).join(" — "),
    });
  }
}

// ── Report ────────────────────────────────────────────────────────────────

const seededCodes = products.flatMap((p) => p.packages.map((k) => k.upc));
const heldLines = new Set(products.map((p) => p.line));
const emptyLines = declaredLines.filter((l) => !heldLines.has(l));
const unlistedLines = [...heldLines].filter((l) => !declaredLines.includes(l));
const out = [];
const say = (s = "") => out.push(s);

say(`# ${wanted} — what the catalog already holds`);
say();
say(
  `Generated by \`node scripts/brand-inventory.mjs "${wanted}"\`. **Re-run it before you start** — ` +
    `it reads the live seed, so it is current the moment you generate it and stale the moment ` +
    `somebody seeds a batch. Never work from a pasted copy.`
);
say();
say(`- Owner on record: **${owner ?? "not in data/us-pet-brands.ts"}**`);
say(`- Products: **${products.length}** under **${seededCodes.length}** barcodes`);
say(`- Of those barcodes, **${seededCodes.filter((c) => withFormula.has(c)).length}** carry a full composition`);
say(`- Variety packs and cases held as boxes: **${boxes.length}**`);
say(`- Ranges the brand entry names: **${declaredLines.length}** — **${heldLines.size}** hold products`);
say();

if (emptyLines.length) {
  say(`## Ranges named but EMPTY — nothing seeded under them`);
  say();
  say(`These are the obvious gaps. A range here is one the brand is believed to sell and`);
  say(`this catalog has not one product from.`);
  say();
  for (const l of emptyLines) say(`- **${l}**`);
  say();
}
if (unlistedLines.length) {
  say(`## Ranges holding products but NOT in the brand entry`);
  say();
  say(`A bug if you see any: these products file under "Other" on the coverage page.`);
  say();
  for (const l of unlistedLines) say(`- ${l}`);
  say();
}

say(`## Every product held, by range`);
say();
say(`Match on the **barcode**, not the name — a maker renames a flavour without changing`);
say(`the code. Anything listed here is DONE; do not research it again.`);
say();
for (const line of [...heldLines].sort()) {
  const mine = products.filter((p) => p.line === line);
  const codes = mine.flatMap((p) => p.packages.length);
  say(`### ${line} — ${mine.length} product${mine.length === 1 ? "" : "s"}, ${codes.reduce((a, b) => a + b, 0)} barcode${codes.reduce((a, b) => a + b, 0) === 1 ? "" : "s"}`);
  say();
  say(`| barcode | variant | size | species | form | life stage | composition |`);
  say(`|---|---|---|---|---|---|---|`);
  for (const p of mine.sort((a, b) => (a.variant ?? "").localeCompare(b.variant ?? ""))) {
    for (const k of p.packages) {
      say(
        `| \`${k.upc}\` | ${p.variant} | ${k.size} | ${p.species} | ${p.foodForm} | ` +
          `${p.lifeStage ?? "—"} | ${withFormula.has(k.upc) ? "yes" : "**no — identity only**"} |`
      );
    }
  }
  say();
}

if (boxes.length) {
  say(`## Variety packs and cases already marked`);
  say();
  say(`| barcode | range | what | size |`);
  say(`|---|---|---|---|`);
  for (const b of boxes) say(`| \`${b.upc}\` | ${b.line} | ${b.variant} | ${b.size} |`);
  say();
}

if (wrong.length) {
  say(`## Codes on the do-not-file list`);
  say();
  say(`Cases, trays and twins. Every one of these is a code somebody could reasonably`);
  say(`mistake for a single tin, which is why the list exists. If your evidence says one of`);
  say(`them has earned its way off, say so out loud rather than quietly.`);
  say();
  say(
    wrongFiltered
      ? `Narrowed to this maker's own GS1 company prefix. The full list is in \`data/wrong-barcodes.ts\`.`
      : `**Not narrowed** — this brand has no seeded barcode to take a company prefix from, so ` +
        `the whole list is shown and most of it is probably somebody else's.`
  );
  say();
  say(`| barcode | what it really is | scan instead |`);
  say(`|---|---|---|`);
  for (const w of wrong) {
    say(`| \`${w.code}\` | ${w.is} | ${w.insteadUse ? `\`${w.insteadUse}\`` : "—"} |`);
  }
  say();
}

if (inLedgers.length) {
  say(`## Already claimed by a research ledger`);
  say();
  say(`Researched but not seeded. Do not re-research; if one is wrong, correct it in place.`);
  say();
  say(`| barcode | status | what | ledger |`);
  say(`|---|---|---|---|`);
  for (const r of inLedgers.sort((a, b) => a.upc.localeCompare(b.upc))) {
    say(`| \`${r.upc}\` | ${r.status} | ${r.what} | ${r.file} |`);
  }
  say();
}

// The machine-readable half. A person reads the tables; an agent greps this.
const exclusion = [
  ...new Set([...seededCodes, ...boxes.map((b) => b.upc), ...inLedgers.map((r) => r.upc)]),
].sort();
say(`## The exclusion list`);
say();
say(
  `Every barcode above, flat, for a mechanical check. ${exclusion.length} ` +
    `code${exclusion.length === 1 ? "" : "s"}. A code in this list is not a new record ` +
    `whatever a retailer page says about it.`
);
say();
say("```");
for (const c of exclusion) say(c);
say("```");
say();
say(
  `\`scripts/check-ledger.mjs\` performs this check for you against the live files and will ` +
    `refuse a batch that repeats any of them, so this list is for planning rather than for ` +
    `verification.`
);

console.log(out.join("\n"));
