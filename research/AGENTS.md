# Deep Research Agent Contract — Pet-Food Barcodes

This file is the binding workflow for every agent that researches pet-food barcodes under `research/`. An agent must read this file before editing anything in this directory.

The objective is to build source-verifiable staging ledgers. These ledgers are evidence, not guesses and not production catalog data.

## 1. Assignment and file ownership

1. Work on exactly the brand assigned by the user or coordinator.
2. One assigned brand equals one JSON ledger file.
3. Read every ledger for duplicate detection, but write only to the ledger owned by your assignment.
4. Never add another brand “while you are there.” Never edit, reorder, reformat, or renumber another agent's records.
5. If the assigned brand is unclear, stop and ask before researching or writing.

File layout:

```text
research/
  AGENTS.md
  deep-research-barcodes.json       # legacy shared ledger: Fancy Feast + Friskies only
  deep-research-hills.json          # Hill's only
  deep-research-royal-canin.json    # example: Royal Canin only
```

Use `research/deep-research-<brand-slug>.json` for every new brand. Make the slug lowercase ASCII with words separated by hyphens; omit punctuation and trademark symbols.

Examples:

- Hill's → `research/deep-research-hills.json`
- Royal Canin → `research/deep-research-royal-canin.json`
- Blue Buffalo → `research/deep-research-blue-buffalo.json`

`research/deep-research-barcodes.json` is a legacy exception reserved for Fancy Feast and Friskies. Do not put Hill's or any other brand in it.

## 2. Mandatory repository checks before research

Read the current versions of:

- `research/AGENTS.md`
- `data/known-products.ts`
- `data/known-formulas.ts`
- `data/wrong-barcodes.ts`
- `docs/CATALOG-CONFLICTS.md`
- every `research/deep-research-*.json` ledger

Build a live exclusion set from those files. Do not rely on a previous agent's count, a pasted list, or memory. A barcode that already appears in the production catalog, the wrong-barcode list, any research ledger, or the current working batch is not new.

Also inspect the repository's current vocabulary for `texture` and `presentation`. Reuse existing values instead of inventing near-synonyms.

## 3. Git branch and pull-request rules

- Never commit research directly to `main`.
- If an open research campaign branch and draft PR already exist, continue on that branch unless the user explicitly says otherwise.
- For this campaign, the existing branch is `agent/deep-research-barcode-ledger` and the existing review surface is draft PR #1.
- If that campaign is already merged or closed, create a new branch named `agent/deep-research-<brand-slug>` and open a draft PR.
- Do not merge a PR without an explicit user request.
- Keep commits narrow: one brand file or one documentation change per commit whenever practical.

## 4. Starting a new brand ledger

Fetch the latest branch immediately before creating the file. A new brand ledger begins with valid JSON shaped like this:

```json
{
  "schema_version": 2,
  "purpose": "Staging ledger for source-verified pet-food barcode research before catalog promotion.",
  "repository": "Adisabeba33/ingredient-scanner",
  "brand_scope": ["Hill's"],
  "created_at": "YYYY-MM-DD",
  "updated_at": "YYYY-MM-DD",
  "rules_source": "research/AGENTS.md",
  "records": []
}
```

Requirements:

- `brand_scope` contains exactly the assigned brand.
- Keep the file valid JSON at every commit.
- Update `updated_at` whenever records change.
- Append records; do not silently rewrite previously reviewed evidence.
- If an earlier record must change, explain why in `verification_notes` and the commit/PR description.

## 5. Catalog-number coordination

`catalog_number` is global across the repository, not local to a brand file.

- Use an integer only when the user or coordinator has explicitly reserved a non-overlapping range for this batch.
- Otherwise set `catalog_number` to `null`.
- Never infer “the next number” while multiple agents may be working.
- Never renumber another agent's records to make room.

## 6. Evidence priority and formula generation

Use the strongest available evidence in this order:

1. A clear current physical package showing the exact item and barcode.
2. A current manufacturer label PDF, product deck, technical sheet, or feeding guide for the exact item.
3. A current manufacturer product page for the exact item.
4. A retailer page that clearly represents one exact sellable unit and size.
5. A secondary barcode database only as corroboration, never as the sole proof for a `source_verified` record.

The formula source and barcode source may be different. A manufacturer deck usually proves the formula; a single-unit retailer page or package image may prove the unit UPC.

Do not combine generations. The ingredients, guaranteed analysis, calories, life-stage/adequacy statement, size, and deck code must describe the same current formula. When an old page conflicts with a current manufacturer deck, prefer the current deck and record the disagreement in `conflicts`. If the shelf formula cannot be resolved, use `needs_physical_label`.

Every material field must be traceable to a direct URL or a clearly described physical-label observation. Save the access date.

## 7. Barcode proof rules

- Store barcodes as quoted, zero-preserving strings. Never store them as numbers.
- Prove that the code belongs to the exact individual product and printed size.
- Set `barcode_scope` honestly: `individual_unit`, `multipack`, `case`, `tray`, or `unknown`.
- Validate the check digit. For UPC-A, compute it from the 11-digit body; do not merely trust a search snippet.
- Store `canonical_gtin14` as the valid barcode left-padded with zeros to 14 digits.
- Document any padding, standard leading-zero equivalence, or reconstruction in `barcode_notes` and `verification_notes`.
- Packaging, lot, deck, manufacturer item, retailer SKU, ASIN, TCIN, and model numbers are not UPCs.

Forbidden shortcuts:

- guessing a sequential UPC from neighboring products;
- dropping a leading or trailing digit until a lookup returns a result;
- using a case, tray, or multipack code as the unit UPC;
- blindly removing a GTIN packaging indicator;
- accepting a code with an invalid check digit;
- treating a retailer identifier or manufacturer item number as a barcode;
- using an Amazon case code to represent one can, pouch, tub, tray, or bag.

A retailer item-body reconstruction is allowed only when the page clearly identifies one unit and size, the transformation is standard, and the complete check-digit arithmetic is documented. If the individual-unit UPC remains unproven, use `needs_physical_label`.

## 8. Formula proof rules

For each exact item capture:

- the complete ingredient statement in printed order;
- the complete printed guaranteed analysis;
- calorie content in every printed basis available;
- label/deck code when present;
- life stage or nutritional-adequacy statement;
- food form, texture, presentation, package type, and printed size;
- direct source URLs and access date;
- all material conflicts or uncertainties.

`ingredients_verbatim` must be the full label text. Do not shorten, tidy, reorder, translate, infer, or silently repair OCR. `ingredients_ordered_normalized` must preserve the same top-level order. A parenthesized vitamin/mineral/premix block remains one top-level ingredient, with its internal order preserved in the string.

Use `null` only when the label truly does not print a value, and explain the omission. Missing evidence is not zero.

Calorie arithmetic is a cross-check, not a substitute for the label. When both `kcal_per_kg` and unit calories are printed, compare them using the nominal package weight and record the result and rounding tolerance.

## 9. Record contract

Every object in `records` must follow this contract:

```json
{
  "catalog_number": null,
  "upc": "zero-padded string",
  "canonical_gtin14": "14-digit zero-padded string",
  "barcode_scope": "individual_unit | multipack | case | tray | unknown",
  "brand": "assigned brand only",
  "manufacturer": "string or null",
  "species": "cat | dog",
  "product_line": "string or null",
  "product_name": "string",
  "variant": "string",
  "recipe": ["string"],
  "life_stage": "adult | senior | kitten | puppy | all | null",
  "food_form": "wet | dry | treat | supplement | unknown",
  "texture": "repository vocabulary value or null",
  "presentation": "repository vocabulary value or null",
  "package_type": "can | pouch | tub | tray | bag | box | other",
  "size": "printed package size",
  "ingredients_verbatim": "complete label text in printed order",
  "ingredients_ordered_normalized": ["same top-level order"],
  "guaranteed_analysis": {
    "crude_protein_min_percent": null,
    "crude_fat_min_percent": null,
    "crude_fiber_max_percent": null,
    "moisture_max_percent": null,
    "ash_max_percent": null,
    "taurine_min_percent": null,
    "other_printed_guarantees": [
      {
        "nutrient": "string",
        "basis": "min | max",
        "value": 0,
        "unit": "percent | IU/kg | other"
      }
    ]
  },
  "calorie_content": {
    "kcal_per_kg": null,
    "kcal_per_unit": null,
    "unit_name": "can | pouch | serving | cup | piece | other | null"
  },
  "label_deck_code": "string or null",
  "formula_source": "specific source description",
  "source_urls": ["direct URL"],
  "source_accessed_at": "YYYY-MM-DD",
  "barcode_notes": "string or null",
  "conflicts": ["material source disagreement"],
  "verification_notes": ["check-digit, arithmetic, identity, and label checks"],
  "research_status": "candidate | source_verified | needs_physical_label | rejected | promoted_to_seed"
}
```

Use JSON `null` for a permitted missing value, never the string `"null"`. Do not add speculative values to make a record look complete.

## 10. Status gates

Use `source_verified` only when all of the following pass:

- exact brand, product, variant, form, size, and unit identity are established;
- the individual-unit barcode is proven and its check digit is valid;
- the barcode is absent from every repository exclusion source and current batch;
- the current complete ingredient order is captured;
- the complete printed guaranteed analysis and calories are captured;
- life stage/adequacy and label/deck identity are captured when printed;
- direct sources and access date are recorded;
- conflicts are resolved or precisely documented without undermining identity.

Use `candidate` when a lead is promising but incomplete. Use `needs_physical_label` when a package image is required to settle barcode scope, current formula, cropped data, or a source conflict. Use `rejected` for a duplicate, wrong product, invalid code, or unsuitable case/multipack substitution. `promoted_to_seed` is used only after the record has actually been copied into production seed files.

## 11. Duplicate and collision checks

Before appending each record, compare:

- `upc`;
- `canonical_gtin14`;
- normalized product identity plus printed size;
- label/deck code where present.

Compare against:

- `data/known-products.ts`;
- `data/wrong-barcodes.ts`;
- every `research/deep-research-*.json` file;
- all records already collected in the current batch.

If the same UPC points to different identities, sizes, or formula generations, do not overwrite either claim. Record the collision and use `needs_physical_label` or `rejected` as appropriate.

## 12. Validation before every commit

**Run the checker first — it does most of this list for you:**

```bash
node scripts/check-ledger.mjs research/deep-research-<brand-slug>.json
```

It runs under bare node, needs no install and no network, and reads the live
catalog, the live `texture`/`presentation` vocabularies, the wrong-barcode list
and every other ledger. ERROR blocks seeding and exits 1; WARN is a question to
answer in `conflicts` or `verification_notes`. A batch is not finished until it
exits 0.

It exists because this section was prose for six brand campaigns, and every one
of them arrived correct against the prose and still needed a day of hand repair
for the same format defects: a printed guarantee written as a sentence, a
`presentation` holding a package type, a `variant` restating the size, a life
stage the catalog cannot store, a calorie figure the panel beside it cannot
produce, and two records claiming one printed identity.

Then confirm the rest by hand:

- JSON parses successfully.
- UPCs, canonical GTIN-14 values, and non-null catalog numbers are unique globally.
- Check digits and zero padding are correct.
- Every record belongs only to the assigned brand.
- Controlled values match the contract.
- `source_urls`, `conflicts`, and `verification_notes` are arrays.
- `ingredients_verbatim` is complete and agrees in order with `ingredients_ordered_normalized`.
- Guaranteed analysis, calories, and missing values follow the evidence rules.
- No previously reviewed record changed unintentionally.
- The new record count and status counts match the handoff report.

For calorie validation, convert the nominal package weight to kilograms and compare `kcal_per_kg × package kg` with the printed unit calories. Explain reasonable label rounding; do not manufacture agreement.

## 13. Concurrent-agent safety

- One agent owns one brand ledger at a time.
- Never have two agents write the same file concurrently unless a coordinator assigns non-overlapping ranges and a merge owner.
- Fetch the current remote file and blob SHA immediately before updating it.
- If the remote file changed since your read, merge first, rerun duplicate checks, and validate the combined file.
- Append records instead of replacing the whole history conceptually, even when the API requires sending the complete file.
- Use a precise commit message, for example `research: add 10 verified Hills records`.
- After the commit, fetch the file back from the branch, parse it, and compare the committed records with the intended batch.
- Never report success only because an API returned a commit SHA.

## 14. Research versus production

Files under `research/` are staging ledgers. Do not edit `data/known-products.ts`, `data/known-formulas.ts`, application code, or runtime behavior unless the user gives a separate explicit promotion request.

Research completion does not equal production seeding.

## 15. Required handoff report

At the end, report:

- assigned brand;
- exact ledger path;
- number of records added and total records in that brand file;
- UPCs added;
- counts by `research_status`;
- unresolved conflicts or physical-label needs;
- commit SHA and draft PR link/number;
- confirmation that the remote file was fetched again, parsed, and matched.

## 16. Hill's assignment example

An agent assigned Hill's must:

1. Read this file and all repository exclusion sources.
2. Create or fetch `research/deep-research-hills.json`.
3. Add Hill's records only; do not add them to `deep-research-barcodes.json`.
4. Leave `catalog_number` as `null` unless a range was explicitly reserved.
5. Use current Hill's manufacturer label/technical evidence for formula fields and a proven single-unit page or physical label for the UPC.
6. Commit to the active research branch, update the draft PR, then fetch and validate the remote file again.

If a requested shortcut conflicts with barcode identity, formula integrity, or duplicate safety, preserve the evidence and ask for clarification.
