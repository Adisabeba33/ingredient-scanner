#!/usr/bin/env node
/**
 * Check a research ledger against everything the seeding pass actually needs.
 *
 * `research/AGENTS.md` is the prose contract; this script turns the repeatable
 * parts of that contract into a commit gate. It deliberately runs under bare
 * node and reads the repository's TypeScript/data files as text.
 *
 * Legacy exception: research/deep-research-barcodes.json predates the one-brand
 * ledger contract and is explicitly reserved by AGENTS.md for Fancy Feast and
 * Friskies together. Its historical records also include entries that were
 * later seeded without being rewritten as promoted_to_seed. Those historical
 * records are grandfathered through the record that was last in the shared
 * ledger when this compatibility path was added. Records appended after that
 * marker are checked by the same current rules as every other ledger, including
 * live catalog collision checks. This keeps the old file usable without
 * weakening checks on new research.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

const seededUpcs = new Set(
  [...read("data/known-products.ts").matchAll(/upc:\s*"(\d+)"/g)].map((m) => m[1])
);
const boxUpcs = new Set(
  [...read("data/known-multipacks.ts").matchAll(/upc:\s*"(\d+)"/g)].map((m) => m[1])
);
const wrongUpcs = new Map();
for (const m of read("data/wrong-barcodes.ts").matchAll(
  /code:\s*"(\d+)",\s*\n\s*is:\s*"([^"]+)"/g
)) {
  wrongUpcs.set(m[1], m[2]);
}
const gs1 = [...read("data/gs1-prefixes.ts").matchAll(/prefix:\s*"(\d+)",\s*maker:\s*"([^"]+)"/g)].map(
  (m) => [m[1], m[2]]
);

function vocabulary(name) {
  const src = read("lib/presentation.ts");
  const block = new RegExp(`const ${name} = new Set<string>\\(\\[([\\s\\S]*?)\\]\\)`).exec(src);
  return new Set([...(block?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]));
}
const TEXTURES = vocabulary("TEXTURES");
const PRESENTATIONS = vocabulary("PRESENTATIONS");

function otherLedgers(selfPath) {
  const claimed = new Map();
  const dir = join(ROOT, "research");
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json") || file === basename(selfPath)) continue;
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch {
      continue;
    }
    for (const r of parsed.records ?? []) {
      if (r.upc) claimed.set(String(r.upc), file);
    }
  }
  return claimed;
}

const SCOPES = ["individual_unit", "multipack", "case", "tray", "unknown"];
const SPECIES = ["cat", "dog"];
const FORMS = ["wet", "dry", "treat", "supplement", "unknown"];
const PACKAGES = ["can", "pouch", "tub", "tray", "bag", "box", "canister", "other"];
const LIFE_STAGES = ["adult", "senior", "kitten", "puppy", "all"];
const STATUSES = [
  "candidate",
  "source_verified",
  "needs_physical_label",
  "rejected",
  "promoted_to_seed",
];
const GTIN_LENGTHS = [8, 12, 13, 14];
const GRAMS_PER_OZ = 28.3495;
const KCAL_SLACK = 1.3;
const LEGACY_SHARED_FILE = "deep-research-barcodes.json";
const LEGACY_SHARED_BRANDS = new Set(["Fancy Feast", "Friskies"]);
const LEGACY_BASELINE_LAST_UPC = "050000215201";

function checkDigit(body) {
  let sum = 0;
  for (let i = 0; i < body.length; i += 1) {
    sum += Number(body[i]) * ((body.length - 1 - i) % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}

function validGtin(code) {
  if (!/^\d+$/.test(code) || !GTIN_LENGTHS.includes(code.length)) return false;
  return checkDigit(code.slice(0, -1)) === Number(code[code.length - 1]);
}

function gs1Body(code) {
  return code.replace(/\D+/g, "").padStart(14, "0").slice(1);
}
function makerOf(code) {
  const body = gs1Body(code);
  return gs1.find(([p]) => body.startsWith(p) || body.startsWith(`0${p}`))?.[1] ?? null;
}

const normalise = (t) =>
  (t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function identityOf(r) {
  const isBox = r.barcode_scope !== "individual_unit";
  return (
    isBox
      ? [r.species, r.product_name, r.size]
      : [r.species, r.product_line, r.variant, r.size]
  )
    .map(normalise)
    .join(" | ");
}

const path = process.argv[2];
if (!path) {
  console.error("Usage: node scripts/check-ledger.mjs research/deep-research-<brand>.json");
  process.exit(1);
}

let ledger;
try {
  ledger = JSON.parse(readFileSync(path, "utf8"));
} catch (e) {
  console.error(`FATAL  ${path} is not valid JSON: ${e.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
const err = (upc, msg) => errors.push(`${upc ?? "-"}  ${msg}`);
const warn = (upc, msg) => warnings.push(`${upc ?? "-"}  ${msg}`);
const isLegacySharedLedger = basename(path) === LEGACY_SHARED_FILE;

for (const key of isLegacySharedLedger
  ? ["schema_version", "records"]
  : ["schema_version", "brand_scope", "records"]) {
  if (!(key in ledger)) err(null, `ledger is missing the top-level key "${key}"`);
}
if (!isLegacySharedLedger) {
  if (!Array.isArray(ledger.brand_scope) || ledger.brand_scope.length !== 1) {
    err(null, "brand_scope must be an array holding exactly one brand");
  }
}

const records = Array.isArray(ledger.records) ? ledger.records : [];
const claimedElsewhere = otherLedgers(path);
const legacyBaselineEnd = isLegacySharedLedger
  ? records.findIndex((r) => String(r?.upc ?? "") === LEGACY_BASELINE_LAST_UPC)
  : -1;
if (isLegacySharedLedger && legacyBaselineEnd < 0) {
  err(
    null,
    `legacy shared-ledger baseline marker ${LEGACY_BASELINE_LAST_UPC} is missing; ` +
      `do not guess which historical records may bypass current checks`
  );
}

const unknownPrefixes = new Set();
const alreadySeeded = [];
const seenUpc = new Map();
const seenIdentity = new Map();
const byComposition = new Map();

for (let recordIndex = 0; recordIndex < records.length; recordIndex += 1) {
  const r = records[recordIndex];
  const upc = r.upc == null ? null : String(r.upc);
  const isBox = r.barcode_scope !== "individual_unit";
  const legacyBaselineRecord =
    isLegacySharedLedger && legacyBaselineEnd >= 0 && recordIndex <= legacyBaselineEnd;

  // Historical shared-ledger records are immutable evidence. Grandfather their
  // old format/seed overlap, but load their UPCs and identities so a new append
  // still collides with them exactly as it should.
  if (legacyBaselineRecord) {
    if (upc && !seenUpc.has(upc)) seenUpc.set(upc, r);
    const identity = identityOf(r);
    if (identity && !seenIdentity.has(identity)) seenIdentity.set(identity, upc);
    continue;
  }

  if (typeof r.upc !== "string") err(upc, "upc must be a quoted STRING, never a number");
  if (!upc || !validGtin(upc)) {
    err(upc, `not a valid barcode — ${upc ? "check digit or length" : "missing"}`);
  } else {
    if (r.canonical_gtin14 !== upc.padStart(14, "0")) {
      err(upc, `canonical_gtin14 should be "${upc.padStart(14, "0")}"`);
    }
    if (!makerOf(upc)) unknownPrefixes.add(gs1Body(upc).slice(0, 7).replace(/^0/, ""));
    if (seenUpc.has(upc)) err(upc, `appears twice in this ledger`);
    seenUpc.set(upc, r);
    if (seededUpcs.has(upc) || boxUpcs.has(upc)) alreadySeeded.push(upc);
    if (wrongUpcs.has(upc)) err(upc, `data/wrong-barcodes.ts says this is ${wrongUpcs.get(upc)}`);
    if (claimedElsewhere.has(upc)) {
      err(upc, `already claimed by ${claimedElsewhere.get(upc)}`);
    }
  }

  if (isLegacySharedLedger) {
    if (!LEGACY_SHARED_BRANDS.has(r.brand)) {
      err(upc, `brand "${r.brand}" is outside legacy shared scope Fancy Feast + Friskies`);
    }
  } else if (ledger.brand_scope?.length === 1 && r.brand !== ledger.brand_scope[0]) {
    err(upc, `brand "${r.brand}" is outside brand_scope`);
  }

  const controlled = [
    ["barcode_scope", SCOPES, r.barcode_scope],
    ["species", SPECIES, r.species],
    ["food_form", FORMS, r.food_form],
    ["package_type", PACKAGES, r.package_type],
    ["research_status", STATUSES, r.research_status],
  ];
  for (const [name, allowed, value] of controlled) {
    if (!allowed.includes(value)) {
      err(upc, `${name} "${value}" is not one of: ${allowed.join(", ")}`);
    }
  }
  if (r.life_stage != null && !LIFE_STAGES.includes(r.life_stage)) {
    err(
      upc,
      `life_stage "${r.life_stage}" is not one of: ${LIFE_STAGES.join(", ")}. ` +
        `A pack printing another word ("Mature") keeps that word in the variant; ` +
        `this field takes the stage the catalog can store, and the mapping goes in conflicts.`
    );
  }
  if (r.texture != null && !TEXTURES.has(r.texture)) {
    err(upc, `texture "${r.texture}" is not in lib/presentation.ts. Use null, or propose a value.`);
  }
  if (r.presentation != null && !PRESENTATIONS.has(r.presentation)) {
    err(
      upc,
      `presentation "${r.presentation}" is not in lib/presentation.ts. ` +
        `A presentation is what the food is SUSPENDED IN — never a texture ` +
        `("bite", "dehydrated") and never a package type ("can").`
    );
  }

  const ga = r.guaranteed_analysis;
  if (!ga || typeof ga !== "object") {
    err(upc, "guaranteed_analysis must be an object");
  } else {
    for (const g of ga.other_printed_guarantees ?? []) {
      if (typeof g !== "object" || g === null) {
        err(
          upc,
          `other_printed_guarantees holds free text (${JSON.stringify(g)}). ` +
            `Every entry must be {nutrient, basis: "min"|"max", value: number, unit}.`
        );
        continue;
      }
      if (!["min", "max"].includes(g.basis)) err(upc, `guarantee "${g.nutrient}" has basis "${g.basis}"`);
      if (typeof g.value !== "number") err(upc, `guarantee "${g.nutrient}" value must be a number`);
    }

    const p = ga.crude_protein_min_percent;
    const f = ga.crude_fat_min_percent;
    const m = ga.moisture_max_percent;
    const a = ga.ash_max_percent ?? 0;
    const fib = ga.crude_fiber_max_percent ?? 0;
    for (const [name, v] of [
      ["crude_protein_min_percent", p],
      ["crude_fat_min_percent", f],
      ["moisture_max_percent", m],
    ]) {
      if (v != null && (typeof v !== "number" || v < 0 || v > 100)) {
        err(upc, `${name} = ${v} is not a percentage`);
      }
    }
    const sum = (p ?? 0) + (f ?? 0) + (m ?? 0) + a + fib;
    if (sum > 100) {
      err(
        upc,
        `panel sums to ${sum.toFixed(1)}% of the pack (protein+fat+moisture+ash+fibre). ` +
          `At least one figure was mistranscribed.`
      );
    }

    if (m != null && p != null) {
      const isSnack = r.food_form === "treat" || r.food_form === "supplement";
      const wet = m >= 60;
      const lo = wet ? 60 : 5;
      const hi = wet ? 92 : isSnack ? 35 : 20;
      const cap = wet ? 20 : isSnack ? 90 : 50;
      if (m < lo || m > hi) {
        warn(upc, `moisture ${m}% is outside ${lo}–${hi}% for a ${wet ? "wet" : "dry"} ${r.food_form}`);
      }
      if (p > cap) warn(upc, `protein ${p}% is above ${cap}% for a ${wet ? "wet" : "dry"} ${r.food_form}`);
    }

    const kk = r.calorie_content?.kcal_per_kg;
    if (kk != null && p != null && f != null && m != null) {
      const rest = Math.max(0, 100 - m - p - f - a);
      const ceiling = (p * 4 + f * 9 + rest * 4) * 10;
      if (ceiling > 0 && kk > ceiling * 2) {
        err(
          upc,
          `${kk} kcal/kg against a panel ceiling of ${Math.round(ceiling)}. ` +
            `No food reaches twice what its own guarantees allow — re-read the label.`
        );
      }
    }
  }

  const cal = r.calorie_content ?? {};
  if ((cal.kcal_per_kg == null) !== (cal.kcal_per_unit == null)) {
    if (cal.kcal_per_unit != null) warn(upc, "kcal_per_unit without kcal_per_kg");
  }
  if (cal.kcal_per_unit != null && !cal.unit_name) {
    err(upc, "kcal_per_unit needs unit_name — a number per nothing cannot be checked");
  }
  const perContainer = ["can", "pouch", "tub", "tray", "bowl"].includes(cal.unit_name);
  const oz = /([\d.]+)\s*oz\b/.exec(r.size ?? "");
  if (perContainer && oz && cal.kcal_per_kg != null && cal.kcal_per_unit != null) {
    const calc = (cal.kcal_per_kg * Number(oz[1]) * GRAMS_PER_OZ) / 1000;
    if (Math.abs(calc - cal.kcal_per_unit) >= KCAL_SLACK) {
      warn(
        upc,
        `calories disagree: ${cal.kcal_per_kg} kcal/kg x ${oz[1]} oz = ${calc.toFixed(1)}, ` +
          `label says ${cal.kcal_per_unit}. Try other sizes before believing the label.`
      );
    }
  }

  if (r.research_status === "source_verified") {
    if (!isBox) {
      if (!(r.ingredients_verbatim ?? "").trim()) {
        err(upc, "source_verified with no ingredients_verbatim");
      }
      for (const k of ["crude_protein_min_percent", "crude_fat_min_percent", "moisture_max_percent"]) {
        if (ga?.[k] == null) err(upc, `source_verified with no ${k}`);
      }
    }
    if (!(r.size ?? "").trim()) err(upc, "source_verified with no printed size");
    if (!Array.isArray(r.source_urls) || r.source_urls.length === 0) {
      err(upc, "source_verified with no source_urls");
    }
  }

  if (isBox) {
    if ((r.ingredients_verbatim ?? "").trim()) {
      warn(
        upc,
        "a multipack carries an ingredient list. It is never stored — a box has " +
          "no composition — so this is at best unused and at worst a member's " +
          "deck standing in for a carton's."
      );
    }
    const contains = r.contains ?? [];
    if (!Array.isArray(contains)) {
      err(upc, "contains must be an array of printed member barcodes (empty is fine)");
    } else {
      const seen = new Set();
      for (const c of contains) {
        const code = String(c);
        if (!validGtin(code)) err(upc, `member "${code}" is not a valid barcode`);
        if (code.padStart(14, "0") === (upc ?? "").padStart(14, "0")) {
          err(upc, "a box lists itself as a member");
        }
        if (seen.has(code)) err(upc, `member "${code}" listed twice`);
        seen.add(code);
      }
    }
  } else if (r.contains != null && r.contains.length) {
    err(upc, "contains is only meaningful on a multipack");
  }

  const identity = identityOf(r);
  if (seenIdentity.has(identity)) {
    err(
      upc,
      `the same printed identity and size as ${seenIdentity.get(identity)}. ` +
        `Two barcodes cannot both be "${r.product_line} ${r.variant}" at ${r.size} — ` +
        `a word is missing from one of the two names.`
    );
  } else {
    seenIdentity.set(identity, upc);
  }

  const v = normalise(r.variant);
  if (v && normalise(r.size) === v) {
    warn(upc, `variant just restates the size ("${r.variant}") — name the product, not the pack`);
  }
  if (/historical|generation|discontinued|legacy/i.test(r.variant ?? "")) {
    warn(
      upc,
      `variant carries an annotation ("${r.variant}"). The variant is what the pack ` +
        `prints; a note about which generation this is belongs in conflicts.`
    );
  }

  const comp = normalise(r.ingredients_verbatim);
  if (comp && !isBox) {
    byComposition.set(comp, [...(byComposition.get(comp) ?? []), r]);
  }

  for (const k of ["source_urls", "conflicts", "verification_notes"]) {
    if (!Array.isArray(r[k])) err(upc, `${k} must be an array`);
  }
}

for (const [, group] of byComposition) {
  const identities = new Set(
    group.map((r) => [r.species, r.product_line, r.variant].map(normalise).join("|"))
  );
  if (identities.size > 1) {
    warn(
      group.map((r) => r.upc).join(", "),
      `share one ingredient list to the letter across different names: ` +
        `${[...identities].join("  /  ")}. If that is a rename, say so in conflicts; ` +
        `if it is a paste, one of them has the wrong deck.`
    );
  }
}

if (alreadySeeded.length) {
  const shown = alreadySeeded.slice(0, 8).join(", ");
  err(
    null,
    `${alreadySeeded.length} barcode${alreadySeeded.length === 1 ? " is" : "s are"} ` +
      `already in the catalog: ${shown}${alreadySeeded.length > 8 ? ", …" : ""}. ` +
      `If this ledger has already been seeded that is expected and this run is ` +
      `informational; if you are adding new records, drop these — the catalog holds them.`
  );
}

const byStatus = {};
for (const r of records) byStatus[r.research_status] = (byStatus[r.research_status] ?? 0) + 1;
const byScope = {};
for (const r of records) byScope[r.barcode_scope] = (byScope[r.barcode_scope] ?? 0) + 1;

console.log(`\n${path}`);
console.log(
  `brand_scope: ${
    isLegacySharedLedger ? '["Fancy Feast","Friskies"] (legacy shared)' : JSON.stringify(ledger.brand_scope)
  }`
);
console.log(`records: ${records.length}`);
if (isLegacySharedLedger && legacyBaselineEnd >= 0) {
  console.log(`  legacy baseline: records 1-${legacyBaselineEnd + 1} grandfathered; appended records fully checked`);
}
console.log(`  by status: ${Object.entries(byStatus).map(([k, v]) => `${k} ${v}`).join(", ") || "—"}`);
console.log(`  by scope:  ${Object.entries(byScope).map(([k, v]) => `${k} ${v}`).join(", ") || "—"}`);
if (unknownPrefixes.size) {
  console.log(
    `\nGS1 prefixes this seed does not know yet: ${[...unknownPrefixes].join(", ")}\n` +
      `  Expected for a new brand. Name the owner in verification_notes; the\n` +
      `  seeding pass adds them to data/gs1-prefixes.ts.`
  );
}

if (warnings.length) {
  console.log(`\nWARN (${warnings.length}) — questions, not failures:`);
  for (const w of warnings) console.log(`  ${w}`);
}
if (errors.length) {
  console.log(`\nERROR (${errors.length}) — these block seeding:`);
  for (const e of errors) console.log(`  ${e}`);
}
console.log(
  errors.length
    ? `\n${errors.length} error${errors.length === 1 ? "" : "s"} to fix before committing.\n`
    : `\nClean.${warnings.length ? ` ${warnings.length} warning${warnings.length === 1 ? "" : "s"} to read.` : ""}\n`
);

process.exit(errors.length > 0 ? 1 : 0);
