#!/usr/bin/env node
/**
 * Check a research ledger against everything the seeding pass actually needs.
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * `research/AGENTS.md` says what a good record is. It is a contract written in
 * prose, and prose is not checkable — so six brands have now arrived correct
 * against the contract and still needing a day of repair before they could be
 * seeded. The same handful of defects, every time:
 *
 *   - a printed guarantee written as free text ("DHA 0.07% min") instead of a
 *     structured object, in a different spelling per ledger;
 *   - a `presentation` that is a package type or a texture ("can", "bite");
 *   - a `variant` that restates the size, so two pack sizes of one product
 *     read as two products — or worse, two DIFFERENT products read as one;
 *   - a life stage the seed's vocabulary does not have;
 *   - a calorie figure the panel beside it cannot physically produce;
 *   - a panel whose own numbers sum past the whole pack;
 *   - two records claiming the same printed identity at the same size.
 *
 * None of those are research failures. They are format failures, and a machine
 * should be the one finding them — before the commit, not a month later.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────
 *
 *   node scripts/check-ledger.mjs research/deep-research-theradiet.json
 *
 * Exit code is 1 if anything ERRORS, so it can gate a batch. WARNs are printed
 * and do not fail: they are questions, and some have good answers.
 *
 * Reads the repository's own seed, vocabularies and exclusion lists with plain
 * regexes, exactly as `scripts/check-batch.mjs` does, so it runs under bare
 * node before anything is installed or built.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

// ── The repository's own answers, read rather than restated ───────────────

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
  // Mapped to pairs rather than kept as match arrays: element 0 of a match is
  // the WHOLE match, so destructuring the raw array reads the entire source
  // line as the prefix and nothing ever matches.
  (m) => [m[1], m[2]]
);

function vocabulary(name) {
  const src = read("lib/presentation.ts");
  const block = new RegExp(`const ${name} = new Set<string>\\(\\[([\\s\\S]*?)\\]\\)`).exec(src);
  return new Set([...(block?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]));
}
const TEXTURES = vocabulary("TEXTURES");
const PRESENTATIONS = vocabulary("PRESENTATIONS");

/** Every barcode any other ledger already claims. */
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

// ── Controlled values ─────────────────────────────────────────────────────

const SCOPES = ["individual_unit", "multipack", "case", "tray", "unknown"];
const SPECIES = ["cat", "dog"];
const FORMS = ["wet", "dry", "treat", "supplement", "unknown"];
const PACKAGES = ["can", "pouch", "tub", "tray", "bag", "box", "canister", "other"];
// The five the SEED can store. `mature` is not one of them — Blue Buffalo
// prints it and it means senior; say so in `conflicts` rather than inventing a
// sixth value the catalog has nowhere to put.
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

/** See lib/known-products.ts — the packaging indicator is not a company. */
function gs1Body(code) {
  return code.replace(/\D+/g, "").padStart(14, "0").slice(1);
}
function makerOf(code) {
  const body = gs1Body(code);
  return gs1.find(([p]) => body.startsWith(p) || body.startsWith(`0${p}`))?.[1] ?? null;
}

const normalise = (t) =>
  (t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// ── Run ───────────────────────────────────────────────────────────────────

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

for (const key of ["schema_version", "brand_scope", "records"]) {
  if (!(key in ledger)) err(null, `ledger is missing the top-level key "${key}"`);
}
if (!Array.isArray(ledger.brand_scope) || ledger.brand_scope.length !== 1) {
  err(null, "brand_scope must be an array holding exactly one brand");
}
const records = Array.isArray(ledger.records) ? ledger.records : [];
const claimedElsewhere = otherLedgers(path);

const unknownPrefixes = new Set();
const alreadySeeded = [];
const seenUpc = new Map();
const seenIdentity = new Map();
const byComposition = new Map();

for (const r of records) {
  const upc = r.upc == null ? null : String(r.upc);
  const isBox = r.barcode_scope !== "individual_unit";

  // ── Identity and barcode ────────────────────────────────────────────
  if (typeof r.upc !== "string") err(upc, "upc must be a quoted STRING, never a number");
  if (!upc || !validGtin(upc)) {
    // A `rejected` record holding an invalid code is not a defect — it is the
    // status doing its job. AGENTS.md §10 names "invalid code" as a reason to
    // reject, and §12 requires this checker to exit 0 before a batch is
    // finished. Read together with an unconditional error here, those two
    // rules cannot both be satisfied: the only ways to green are deleting the
    // evidence, which guarantees the next agent rediscovers the same code and
    // spends the same day on it, or inventing a check digit, which §7 forbids
    // outright.
    //
    // The Iams campaign met this with six codes normalised out of 13-digit
    // retailer strings. It rejected all six and said so rather than patching
    // them, which is exactly right, and the ledger still could not go green.
    //
    // So a rejected record's bad barcode is reported as a question, not a
    // blocker. Every other rule below still applies to it, and a bad code on
    // any OTHER status is an error as before.
    if (r.research_status === "rejected") {
      warn(upc, "rejected, and the barcode is invalid — which is presumably why. Say in verification_notes what the source actually printed, so the next agent does not re-derive it.");
    } else {
      err(upc, `not a valid barcode — ${upc ? "check digit or length" : "missing"}`);
    }
  } else {
    if (r.canonical_gtin14 !== upc.padStart(14, "0")) {
      err(upc, `canonical_gtin14 should be "${upc.padStart(14, "0")}"`);
    }
    // Collected, not warned per record. A new brand's prefix is unknown by
    // definition, and two hundred identical lines is how somebody learns to
    // scroll past this whole report — see data/gs1-prefixes.ts on exactly
    // that failure.
    if (!makerOf(upc)) unknownPrefixes.add(gs1Body(upc).slice(0, 7).replace(/^0/, ""));
    if (seenUpc.has(upc)) err(upc, `appears twice in this ledger`);
    seenUpc.set(upc, r);
    // Aggregated rather than one line per record, for the same reason the
    // unknown prefixes are: a ledger that has ALREADY been seeded overlaps
    // completely, and two hundred identical lines bury the four findings that
    // actually matter. Still an error — "do not research this again" is the
    // whole point — just counted once.
    if (seededUpcs.has(upc) || boxUpcs.has(upc)) alreadySeeded.push(upc);
    if (wrongUpcs.has(upc)) err(upc, `data/wrong-barcodes.ts says this is ${wrongUpcs.get(upc)}`);
    if (claimedElsewhere.has(upc)) {
      err(upc, `already claimed by ${claimedElsewhere.get(upc)}`);
    }
  }

  if (ledger.brand_scope?.length === 1 && r.brand !== ledger.brand_scope[0]) {
    err(upc, `brand "${r.brand}" is outside brand_scope`);
  }

  // ── Controlled values ───────────────────────────────────────────────
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

  // ── Guaranteed analysis ─────────────────────────────────────────────
  const ga = r.guaranteed_analysis;
  if (!ga || typeof ga !== "object") {
    err(upc, "guaranteed_analysis must be an object");
  } else {
    for (const g of ga.other_printed_guarantees ?? []) {
      if (typeof g !== "object" || g === null) {
        err(
          upc,
          `other_printed_guarantees holds free text (${JSON.stringify(g)}). ` +
            `Every entry must be {nutrient, basis: "min"|"max", value: number, unit}. ` +
            `Three ledgers have each invented their own sentence format and each ` +
            `needed its own parser written by hand.`
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
    // ── What a panel can and cannot prove ────────────────────────────
    //
    // This summed protein + fat + moisture + ash + fibre and called anything
    // over 100% impossible. That was wrong, and Weruva is what proved it: a
    // perfectly ordinary can guarantees 12% protein MIN, 6% fat MIN, 83%
    // moisture MAX, 1.5% ash MAX and 1% fibre MAX — 103.5% — while the food
    // inside might be 13/7/79/1.2/0.6 and sum to 101 minus its carbohydrate.
    //
    // Minima and maxima are BOUNDS. Only the minima bound the actual from
    // below, so the one thing guarantees alone can prove impossible is a
    // protein floor and a fat floor that already exceed the whole pack.
    // Twenty real Weruva panels failed the old rule, which is a check being
    // loudest exactly where it is wrong — see data/gs1-prefixes.ts on how
    // that teaches somebody to read past the word ERROR.
    if ((p ?? 0) + (f ?? 0) > 100) {
      err(
        upc,
        `protein min ${p}% and fat min ${f}% already exceed the whole pack. ` +
          `Minima bound the food from below, so this one is arithmetically impossible.`
      );
    }
    // The softer signal the old rule was reaching for, kept as a question.
    // A protein floor and a moisture ceiling that cannot both be tight is
    // usually a loose guarantee and occasionally a mistranscribed moisture —
    // I and love and you had a jerky at 27% protein against 82% moisture.
    if ((p ?? 0) + (m ?? 0) > 100) {
      warn(
        upc,
        `protein min ${p}% against moisture max ${m}% — they cannot both be tight. ` +
          `Usually a loose guarantee; check the moisture is not a transcription slip.`
      );
    }

    // Bounds by form. Moisture is what actually catches a dry-matter panel
    // pasted into an as-fed one; the protein ceiling rises for a snack,
    // because dried meat really does reach it.
    if (m != null && p != null) {
      const isSnack = r.food_form === "treat" || r.food_form === "supplement";
      const wet = m >= 60;
      // A drinkable broth is a third thing here, not a very wet food. Reveal's
      // Bone Broth pouches are 95% moisture because they are broth; a can of
      // food is 78–82% because there is food in it. Read off the NAME, never
      // off the number — a bound that widens to fit what it meets is not a
      // bound, and a real can at 95% is still the error this hunts.
      const broth = /\bbone broth\b/i.test(
        `${r.product_line ?? ""} ${r.product_name ?? ""} ${r.variant ?? ""}`
      );
      const lo = broth ? 88 : wet ? 60 : 5;
      const hi = broth ? 97 : wet ? 92 : isSnack ? 35 : 20;
      if (m < lo || m > hi) {
        warn(upc, `moisture ${m}% is outside ${lo}–${hi}% for something this ${wet ? "wet" : "dry"}`);
      }
      // No flat protein ceiling. It used to be 50% for anything not a snack,
      // and freeze-dried raw broke it honestly: Weruva's 1 oz Freeze Dried is
      // 66% protein at 8% moisture, which is what a food with the water taken
      // out looks like. The protein-against-moisture warning above carries the
      // real signal without needing a category to decide it.
      //
      // What IS worth saying: the ledger's own `food_form` disagreeing with
      // its own panel. One Weruva freeze-dried record is filed `wet` beside 8%
      // moisture, and the seed reads the form off the moisture — so the two
      // would silently part company.
      const declaredWet = r.food_form === "wet";
      if (r.food_form === "wet" || r.food_form === "dry") {
        if (declaredWet !== wet) {
          warn(
            upc,
            `food_form says "${r.food_form}" and the panel says ${m}% moisture. ` +
              `The seed reads the form off the moisture, so one of the two is wrong.`
          );
        }
      }
    }

    // A calorie figure the panel cannot physically produce. Modified Atwater
    // on the guarantees themselves; doubled, because protein and fat are
    // MINIMA and moisture a MAXIMUM, so a real food beats its own ceiling —
    // the worst honest ratio across 1010 seeded panels is 1.69.
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

  // ── Calorie arithmetic, where both halves are printed ────────────────
  const cal = r.calorie_content ?? {};
  if ((cal.kcal_per_kg == null) !== (cal.kcal_per_unit == null)) {
    // Not an error: plenty of bags print kcal/kg alone.
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

  // ── The status gate, checked rather than promised ────────────────────
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

  // An ingredient list has to BE one.
  //
  // The Beneful campaign put the label deck's URL into ingredients_verbatim on
  // ten records and marked five of them source_verified. The field was a
  // non-empty string, so the check above passed, and the composition that
  // reached the seeding pass was a link. A deck nobody read is not a formula —
  // and a URL is the specific shape this goes wrong in, because the agent has
  // the deck open and the address to hand.
  //
  // Cheap tests only, because a real list is unpredictable: it must not start
  // with a scheme, and a US label separates ingredients with commas, so one
  // with none is not a list whatever else it is.
  const ingredients = (r.ingredients_verbatim ?? "").trim();
  if (ingredients) {
    if (/^https?:\/\//i.test(ingredients)) {
      err(
        upc,
        "ingredients_verbatim holds a URL, not an ingredient list. Cite the " +
          "deck in source_urls and read the list off it — a link is not a " +
          "composition."
      );
    } else if (!ingredients.includes(",")) {
      err(
        upc,
        `ingredients_verbatim has no comma in it ("${ingredients.slice(0, 48)}…"). ` +
          "A US label prints ingredients as a comma-separated list in descending " +
          "weight order; one without a separator is not that list."
      );
    }
  }

  // ── Boxes ───────────────────────────────────────────────────────────
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

  // ── Identity ────────────────────────────────────────────────────────
  //
  // A box is named differently from a tin. Its `variant` is usually the pack
  // itself ("13 OZ CAN (12 PACK)") and the flavour lives in `product_name`, so
  // keying a carton on line+variant reads every 12-pack of a range as the same
  // thing. Units are keyed on what a shelf label says; boxes on their name.
  const identity = (
    isBox
      ? [r.species, r.product_name, r.size]
      : [r.species, r.product_line, r.variant, r.size]
  )
    .map(normalise)
    .join(" | ");
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

  // An array of STRINGS, and the second half of that is not pedantry.
  //
  // AGENTS.md §9 shows all three as arrays of sentences, and every consumer
  // of them — the handoff, the seeding pass, docs/CATALOG-CONFLICTS.md —
  // joins and reads them as text. An object slipped into one survives
  // Array.isArray, survives JSON.parse, and then prints as "[object Object]"
  // wherever somebody reads it, which is the point at which the evidence it
  // held is gone.
  //
  // Two Purina Cat Chow records arrived with conflicts as
  // {field, note} objects carrying a real and useful calorie disagreement.
  // Nothing caught it: the note was intact in the file and unreadable
  // everywhere else. This is the same shape of defect as a printed guarantee
  // written as free text, which this checker has caught since the first
  // ledger that did it.
  for (const k of ["source_urls", "conflicts", "verification_notes"]) {
    if (!Array.isArray(r[k])) {
      err(upc, `${k} must be an array`);
      continue;
    }
    for (const entry of r[k]) {
      if (typeof entry !== "string") {
        err(
          upc,
          `${k} holds a ${Array.isArray(entry) ? "array" : typeof entry} where a string belongs ` +
            `(${JSON.stringify(entry).slice(0, 70)}…). Every entry is a sentence; ` +
            `an object here reads as "[object Object]" everywhere it is used.`,
        );
      }
    }
  }
}

// Two DIFFERENT products with one deck, to the letter. Sometimes real — a
// rename in flight sells one recipe under two names at once — and sometimes a
// list pasted onto the wrong barcode. Either way somebody has to say which.
for (const [, group] of byComposition) {
  const identities = new Set(
    group.map((r) => [r.species, r.product_line, r.variant].map(normalise).join("|"))
  );
  if (identities.size > 1) {
    const codes = group.map((r) => r.upc).join(", ");
    const said = group.some((r) => (r.conflicts ?? []).length > 0);
    const claimsVerified = group.some((r) => r.research_status === "source_verified");
    // Two narrowings, because a gate that fires wrongly teaches people to
    // write a meaningless conflict note to get past it — which is worse than
    // no gate at all.
    //
    // 1. Only across different RANGES. "Gullet Stix 5 count" and "Gullet Stix
    //    48 count" are one product in two pack sizes; the identity key counts
    //    them as different because the count lives in `variant`, and they
    //    obviously share a deck.
    // 2. Only for a deck long enough to be a fingerprint. A bully stick's
    //    whole ingredient list is "Beef Pizzle", and every product made of
    //    that thing collides with every other one. Five is the same floor
    //    lib/composition-key.ts uses, and for the same reason.
    const lines = new Set(group.map((r) => normalise(r.product_line)));
    const items = (group[0].ingredients_verbatim ?? "").split(",").length;
    const worthGating = lines.size > 1 && items >= 5;
    // "Somebody has to say which" was the whole point, and nothing made
    // anybody. Three I and love and you jerky records carried the Naked
    // Essentials KIBBLE deck — complete premix, 10% moisture, calories per CUP
    // on a 4 oz bag of jerky — this warning named all three, and they stayed
    // `source_verified` for three weeks because a warning is not a gate.
    //
    // AGENTS.md §10 already says `source_verified` means "conflicts are
    // resolved or precisely documented". An undocumented shared deck is a
    // conflict that is neither, so the status is the thing that has to give.
    // One record answering for the group is enough — the disagreement is
    // findable, which is all the rule ever asked for.
    if (claimsVerified && !said && worthGating) {
      err(
        codes,
        `share one ingredient list to the letter across different names: ` +
          `${[...identities].join("  /  ")}. Not one of them says why in ` +
          `conflicts, and at least one claims source_verified — which asserts ` +
          `that conflicts are resolved or documented. Either say which it is, ` +
          `or drop the status.`
      );
    } else {
      warn(
        codes,
        `share one ingredient list to the letter across different names: ` +
          `${[...identities].join("  /  ")}. If that is a rename, say so in conflicts; ` +
          `if it is a paste, one of them has the wrong deck.`
      );
    }
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

// ── Report ────────────────────────────────────────────────────────────────

const byStatus = {};
for (const r of records) byStatus[r.research_status] = (byStatus[r.research_status] ?? 0) + 1;
const byScope = {};
for (const r of records) byScope[r.barcode_scope] = (byScope[r.barcode_scope] ?? 0) + 1;

console.log(`\n${path}`);
console.log(`brand_scope: ${JSON.stringify(ledger.brand_scope)}`);
console.log(`records: ${records.length}`);
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
