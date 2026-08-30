# Blue Buffalo — what reached the catalog, and where the research stopped

## Seeded into the catalog — batch 024

Of the 133 `source_verified` records below, **132 are in the seed** — 78
products under 132 barcodes, 128 of them with a full composition and 4 seeded
as identity only. One is held back: `859610008742`, whose printed identity
already belongs to another barcode. Section J of `docs/CATALOG-CONFLICTS.md`
gives the reasoning for that and for the two other flags this batch carried in.

**All 44 multipacks are seeded as boxes**, in `data/known-multipacks.ts`, with
empty `contains`. That is the part of this handoff that has changed since it
was written: the campaign left every outer pack at `needs_physical_label`
because no inner-unit barcode could be proven, and under the seed's box model
that does not block anything. A box carries no composition and never will, and
the mark alone — `found = false`, `reason = 'multipack'` — is what stops the
app inviting somebody to photograph the back of a carton, where every member's
ingredient list is printed one after another and parses like a real one. So the
real remaining tail is **114 records, not 158**.

What Blue Buffalo taught the toolchain, none of it about this maker:

- **A maker can run two GS1 prefixes at once.** The Weight Control 3 lb bag is
  859610 and the 5 lb bag of the same recipe is 840243. Both are current.
- **The vet-channel check now states the rule rather than a roster.** It listed
  Royal Canin's two exact range names; "Natural Veterinary Diet" is a third
  shape under a retail brand, and an exact-name list could only ever meet it by
  being edited again.
- **"Baby Blue" vs "Baby BLUE".** One lower-case letter would have filed every
  kitten product under "Other" while the range looked present on the page.
  `lib/known-import.test.ts` now refuses any product or box whose range is not
  in its brand's own entry.
- **A kitten taurine guarantee is a maker's number, not the industry's.** The
  seed asserted 0.07% flat; Blue Buffalo prints 0.10% on kitten *and* adult wet
  food. The check is now within one brand: a kitten formula is never
  taurine-poorer than that maker's own adult formula.
- **The calibration sweep stopped keeping its own copy of the snack ranges.**
  It reads them out of `lib/nutrition-role.ts` now, because that mirror had
  gone stale on three consecutive batches.

Everything below is the research campaign's own handoff, unchanged.

---

# Blue Buffalo Deep Research — Campaign Summary / Handoff

**Repository:** `Adisabeba33/ingredient-scanner`  
**Research branch:** `agent/deep-research-blue-buffalo`  
**Base branch:** `agent/deep-research-barcode-ledger`  
**Draft PR:** #5 — `research: deep research Blue Buffalo`  
**Owned ledger:** `research/deep-research-blue-buffalo.json`  
**Binding research contract:** `research/AGENTS.md`  
**Brand scope:** Blue Buffalo only  
**Snapshot date:** 2026-08-30  
**Last research-data checkpoint before this summary:** `07c4dc8147b97c5a938c5d7ffb216b227476a330` — `research: verify 10 additional Blue Buffalo cat SKUs`

---

## 1. Purpose of this document

This file is the handoff for the entire Blue Buffalo deep-research campaign to date. It summarizes what was researched, how evidence was judged, where the ledger stands now, which areas were successfully source-verified, which families still require physical-label evidence, and how another agent should continue without repeating work or weakening the evidence standard.

The JSON ledger remains the source of truth for record-level data. This Markdown file is a campaign-level map and continuation guide; it must not replace record-level `source_urls`, `conflicts`, `verification_notes`, or status fields in `research/deep-research-blue-buffalo.json`.

---

## 2. Current campaign state

At the latest completed deterministic remote audit:

- **TOTAL Blue Buffalo records:** 291
- **`source_verified`:** 133
- **`needs_physical_label`:** 158
- **Net result of the most recent full remaining-record pass:** +10 `source_verified`, -10 `needs_physical_label`

The campaign began with an isolated Blue Buffalo branch and draft PR so that Blue Buffalo research could proceed in parallel with Royal Canin, Hill's, Ziwi Peak, Weruva, Merrick, I and Love and You, and other brand streams without agents writing the same ledger.

`catalog_number` has remained `null` unless explicitly reserved; this avoids global numbering collisions with concurrent agents.

No production catalog seeding is part of this campaign. Research under `research/` is staging evidence only. Do not modify `data/known-products.ts`, `data/known-formulas.ts`, or runtime application data unless the user separately requests promotion into production.

---

## 3. Core evidence policy used throughout the campaign

All work has followed `research/AGENTS.md`. In practical terms, the Blue Buffalo campaign has used the following strict gate:

A record may become `source_verified` only when all of these are established for the same current formula generation:

1. exact brand and product identity;
2. exact variant / recipe;
3. exact printed package size;
4. correct barcode scope (`individual_unit`, `multipack`, etc.);
5. exact UPC belonging to that unit;
6. valid UPC check digit;
7. canonical GTIN-14;
8. complete current ingredient statement in printed order;
9. complete printed guaranteed analysis;
10. calorie content in every printed basis available;
11. life stage and nutritional-adequacy / supplemental-feeding statement when printed;
12. food form / texture / presentation / package type;
13. direct trustworthy source URLs;
14. no unresolved material conflict that makes the active shelf formula uncertain.

If the evidence is incomplete or two apparently current sources expose materially different formula generations under the same UPC, the record remains `needs_physical_label`.

The campaign deliberately does **not** raise records to `source_verified` merely because a UPC, product name, ingredient list, or partial GA can be found online.

---

## 4. Source hierarchy and sources that proved most useful

The campaign uses the source order defined in `AGENTS.md`:

1. current physical package / barcode;
2. current manufacturer label PDF / deck / technical sheet / feeding guide;
3. current manufacturer exact-product page;
4. current retailer page for one exact sellable unit and size;
5. secondary barcode database only as corroboration.

### Important Blue Buffalo source patterns

**Blue Buffalo current qualifying-products list** has been the strongest recurring anchor for exact current U.S. UPC + product + size identity:

- `https://www.bluebuffalo.com/incentive-requests/qualifying-products/`

It has been used to establish many current U.S. package identities, but it does not by itself prove the current full formula.

Other repeatedly useful sources have included:

- Blue Buffalo manufacturer pages and market-specific catalog pages;
- Chewy;
- Petco;
- PetSmart;
- Target;
- State Line Pet Supply and other retailer pages exposing label-style data;
- DirectionsForMe / label-transcription pages where appropriate;
- VCA and veterinary retailer pages for Natural Veterinary Diet formulas;
- Canadian Blue Buffalo / Canadian retail pages only as corroboration when the formula is demonstrably identical.

### Market priority

For this campaign, U.S. evidence is preferred over Canada, Mexico, and Europe for U.S. UPCs.

A Canadian page must **not** be used to fill missing U.S. formula fields when the Canadian formula differs. One important example was True Solutions Urinary Care: Canadian 6 lb / 15 lb pages exposed a materially different formula and calorie profile from the current U.S. 3.5 lb / 11 lb formula. The Canadian generation was therefore excluded from the U.S. records rather than merged.

---

## 5. How the campaign expanded

### Initial Tastefuls batch

The first Blue Buffalo commit added 7 Tastefuls 3 oz wet-cat records.

Initial source-verified products included:

- `840243140510` — Tastefuls Chicken Entrée Pate, 3 oz;
- `840243140572` — Tastefuls Ocean Fish and Tuna Entrée Pate, 3 oz;
- `840243140596` — Tastefuls Salmon Entrée Pate, 3 oz.

Four closely related 3 oz items were deliberately left `needs_physical_label` because current retailer data exposed incompatible formula / GA generations:

- `840243140558` — Turkey & Chicken Entrée Pate;
- `840243140695` — Chicken Entrée in Gravy Morsels;
- `840243140626` — Chicken Entrée in Gravy Flaked;
- `840243140664` — Fish & Shrimp Entrée in Gravy Flaked.

This established the campaign's main principle early: a plausible current formula is not enough when two live sources disagree materially.

### 5.5 oz Tastefuls expansion

A subsequent wave added and verified additional 5.5 oz Tastefuls records where exact-size identity and complete current label data could be reconciled.

### Broader catalog expansion

The ledger was then expanded far beyond the first Tastefuls wet-food family. Research coverage now includes substantial portions of:

- Tastefuls wet food;
- Tastefuls dry food;
- Tastefuls purées / mini purées;
- Tastefuls Spoonless / Savory Singles;
- Tastefuls multipacks and variety packs;
- Baby BLUE kitten wet and dry;
- Wilderness wet and dry;
- Wilderness Wild Delights;
- Wilderness Rocky Mountain Recipe;
- Wilderness treats;
- True Solutions;
- Natural Veterinary Diet;
- Basics limited-ingredient formulas;
- BLUE Bursts treats;
- True Chews cat treats;
- multiple multipack / variety-pack outer UPCs.

The campaign did not assume that every catalog entry can be source-verified from the internet. When only the UPC/product identity could be established, formula fields were deliberately kept incomplete and the status remained `needs_physical_label`.

---

## 6. Important research milestones

### Wild Cuts verification

A later pass verified Blue Buffalo Wild Cuts chicken and duck records after matching exact product identities, current formula evidence, UPC validation, and package sizes. A campaign checkpoint for this work was commit:

- `b7539bb7a21e76296fc4e6d6f85e326724ab090d` — `research: verify Blue Buffalo Wild Cuts chicken and duck`

### Baby BLUE second pass

A later focused Baby BLUE pass produced three different outcomes, which are a useful example of the status gate:

- `840243134403` — Baby BLUE Kitten Grain-Free High Protein Salmon 3 oz: promoted to `source_verified` after the current formula could be coherently proven.
- `840243134427` — Baby BLUE Kitten Grain-Free High Protein Chicken 3 oz: remained `needs_physical_label` because current U.S. sources exposed materially different GA / ingredient generations.
- `840243134380` — Baby BLUE Kitten Chicken 3 oz: substantially enriched with formula / GA / calorie data but conservatively retained as `needs_physical_label` when the exact current nutritional-adequacy statement could not be directly bound to the UPC at that pass.

The associated checkpoint commit was:

- `39ff31b97e5f716afc48773448644ec31b2677c1` — `research: verify Baby BLUE salmon and audit kitten wet formulas`

### Full remaining-record re-research pass

After the ledger reached 291 total records, a deterministic audit found:

- 123 `source_verified`;
- 168 `needs_physical_label`.

A complete additional web-research sweep was then performed across the entire unresolved tail rather than assuming those 168 records were hopeless.

That pass successfully promoted 10 more records:

#### True Solutions

- `840243150564` — True Solutions Urinary Care, dry, 3.5 lb;
- `840243150571` — True Solutions Urinary Care, dry, 11 lb;
- `840243135318` — True Solutions Weight Control, dry, 3.5 lb;
- `840243135301` — True Solutions Weight Control, dry, 11 lb.

#### Natural Veterinary Diet

- `840243116799` — GI Gastrointestinal Support, dry, 7 lb;
- `840243116805` — HF Hydrolyzed for Food Intolerance, dry, 7 lb;
- `840243117963` — WU Weight Management + Urinary Care, dry, 6.5 lb;
- `840243118748` — KM Kidney + Mobility Support, dry, 7 lb;
- `840243120048` — KM Kidney + Mobility Support, wet, 5.5 oz;
- `840243126279` — WU Weight Management + Urinary Care, dry, 16 lb.

After these promotions, the deterministic remote audit became:

- TOTAL = 291
- `source_verified` = 133
- `needs_physical_label` = 158

The commit was:

- `07c4dc8147b97c5a938c5d7ffb216b227476a330` — `research: verify 10 additional Blue Buffalo cat SKUs`

---

## 7. Why 158 records still remain `needs_physical_label`

The remaining 158 should **not** be interpreted as 158 records that were never researched. The unresolved tail has now received repeated passes, including an explicit full-tail sweep.

The major blocker classes are:

### A. Formula-generation collisions under the same UPC

Two apparently current U.S. sources may show different ingredient orders, GA values, or calories under the same UPC. When there is no strong package-generation evidence deciding which formula is currently on shelf, the record must remain unresolved.

Examples include several Tastefuls wet foods and long-lived dry-food UPCs.

### B. Exact-size binding problem

A family-level current formula may be available, but the exact UPC / exact package size is not tied strongly enough to that formula generation.

This occurs frequently in dry-food families with several historical and current bag sizes.

### C. Missing printed calorie statement

Some records already have exact UPC, product identity, ingredients, and GA but are missing a directly sourced calorie statement for the exact package/formula generation.

Purées, mini purées, treats, and some dry-food sizes have appeared in this category.

### D. Missing complete printed GA

A product may have ingredients and calorie data but only a partial guaranteed analysis online. The contract requires the complete printed panel, including any additional printed nutrient guarantees.

### E. Missing nutritional-adequacy / supplemental-feeding statement

Some otherwise nearly complete records lack direct proof of the exact current AAFCO maintenance/growth/all-life-stages statement or intermittent/supplemental-feeding statement.

### F. Multipack outer UPC versus inner-unit barcode

For multipacks, variety packs, boxes, cases, and trays, the campaign never assumes that a standalone SKU UPC is the barcode printed on the inner unit.

The outer UPC may be fully proven while child identities are known, yet the inner-unit `upc` remains `null` unless direct evidence shows the barcode actually printed on the child package.

This is a major reason many outer packs remain `needs_physical_label` even when their contents are understood.

### G. Legacy / discontinued / reformulated product families

Some Wilderness, Basics, treats, and older Tastefuls/BLUE identities have long-lived UPCs and conflicting current/historical formula evidence. A current physical package is often the only safe way to bind the UPC to the active formula generation.

---

## 8. Notable unresolved conflicts that must not be force-promoted

The following are examples of records where the problem is substantive, not merely lack of effort. Always re-check the live ledger before acting, because statuses may change in future commits.

### Tastefuls wet formula drift

- `840243140558` — Turkey & Chicken Entrée Pate 3 oz: current sources disagree on GA generation.
- `840243140695` — Chicken Entrée in Gravy Morsels 3 oz: materially different ingredient decks under the same UPC.
- `840243140626` — Chicken Entrée in Gravy Flaked 3 oz: ingredient and GA generation conflict.
- `840243140664` — Fish & Shrimp Entrée in Gravy Flaked 3 oz: competing current formula generations.

### Baby BLUE

- `840243134427` — Grain-Free High Protein Chicken 3 oz: current U.S. sources disagree materially on formula / GA.

### True Solutions

- `840243154111` — Urinary Care wet 3 oz: full coherent current label deck remains unresolved.
- `840243142187` — Hairball Control dry 3.5 lb: current online evidence has shown a material printed-GA conflict (including crude-fiber disagreement); do not merge generations.
- `840243142194` — Hairball Control dry 11 lb: requires the same level of exact current generation proof.

### BLUE Bursts

- `840243137053` — BLUE Bursts Chicken 12 oz: current exact-U.S. evidence exposed a newer/different ingredient + GA generation from previously collected sources. This record was correctly downgraded rather than silently mixing generations.
- `840243137015` — BLUE Bursts Chicken 5 oz: still requires a coherent exact-package deck before promotion.

### Wilderness / True Chews treats

Examples still requiring exact-package current formula proof include:

- `840243120314` — Wilderness Crunchy Salmon, 2 oz;
- `840243125333` — Wilderness Crunchy Salmon, 12 oz;
- `840243149230` — True Chews Chicken Recipe Chewy Cat Treats;
- `840243149438` — True Chews Chicken Sticks.

These should not be promoted from a family-level or Canadian formula unless exact current U.S. package/formula identity is proven.

---

## 9. Special handling for Natural Veterinary Diet

The veterinary line became one of the most productive areas during the final sweep because current VCA / veterinary retailer data often exposes complete ingredients, printed guarantees, calories, veterinary-use scope, and nutritional-adequacy statements.

However, do not infer missing values from sibling veterinary formulas or sibling bag sizes.

The campaign specifically preserved the distinction between:

- AAFCO complete-and-balanced maintenance formulas;
- veterinary formulas whose label uses a feeding-test statement;
- products whose current statement is intermittent/supplemental only.

For example, a current NP / Novel Protein canned formula may legitimately carry a supplemental/intermittent statement. That statement must be recorded as printed; it must not be replaced with an older AAFCO statement merely to make the record appear complete.

When a PDF contains the needed adequacy statement but the exact page / current label cannot be independently inspected and tied to the UPC, keep the record conservative until the document can be properly verified.

---

## 10. Multipack rules that were enforced

The Blue Buffalo ledger contains many outer-package UPCs for variety packs and multi-packs. These were handled under the stricter multipack rules in `AGENTS.md`:

- outer UPC is the outer barcode only;
- `barcode_scope` must reflect the actual outer pack;
- `multipack_contents` lists each proven child product and quantity;
- child `upc` is used only if the barcode printed on the inner package is actually proven;
- `standalone_upc` may reference a separately proven matching standalone SKU, but it does **not** prove the inner barcode;
- pack counts must reconcile with child quantities;
- no outer UPC may be reused as an inner can/pouch/tube UPC.

Several unresolved variety packs are therefore intentionally conservative rather than incomplete by mistake.

---

## 11. Barcode validation rules applied

Every promoted UPC is expected to pass the UPC-A check-digit calculation from the 11-digit body.

For a 12-digit UPC-A:

1. multiply digits in odd positions of the 11-digit body by 3;
2. add even-position digits;
3. compute `(10 - total % 10) % 10`;
4. confirm that this equals the printed check digit.

Canonical GTIN-14 is the valid UPC left-padded with zeros to 14 digits.

The campaign never guessed sequential UPCs, stripped arbitrary digits, converted retailer SKUs to UPCs, or treated case / multipack codes as individual-unit barcodes.

---

## 12. Deterministic auditing and temporary GitHub Actions runner

Because the ledger became too large for reliable manual mutation through ordinary file responses, the campaign used the existing shared workflow file as a temporary controlled runner:

- `.github/workflows/tmp-royal-canin-cats-runner.yml`

The safe pattern used was:

1. fetch current Blue Buffalo branch;
2. temporarily replace the shared workflow with a Blue Buffalo-specific audit / mutation runner;
3. checkout `agent/deep-research-blue-buffalo` inside Actions;
4. parse and mutate only `research/deep-research-blue-buffalo.json`;
5. validate target UPCs, status gates, check digits, GTINs, uniqueness, controlled values, and expected count deltas;
6. restore the shared runner from `agent/deep-research-barcode-ledger`;
7. verify the restored runner blob;
8. commit and push the Blue Buffalo ledger + restored runner;
9. re-fetch the remote ledger;
10. parse remote JSON and confirm status totals;
11. compare remote file content to the intended committed content.

The known base runner blob SHA at this handoff is:

- `dde3c125efd00c7387aad2aa7ae1ce5e5d4bfc4a`

After the latest research commit, the workflow explicitly reported:

- remote ledger matched local committed ledger;
- TOTAL 291;
- `source_verified` 133;
- `needs_physical_label` 158;
- runner restored successfully.

Do not leave a Blue Buffalo-specific temporary workflow in place after a run.

---

## 13. Repository / PR state at handoff

At the time this summary was prepared:

- branch: `agent/deep-research-blue-buffalo`;
- base: `agent/deep-research-barcode-ledger`;
- PR #5: **OPEN**;
- PR #5: **DRAFT**;
- PR #5: **NOT MERGED**;
- ledger: `research/deep-research-blue-buffalo.json`;
- last completed research-data commit: `07c4dc8147b97c5a938c5d7ffb216b227476a330`.

The PR intentionally remains draft. Do not merge it unless the user explicitly requests a merge.

The PR contains many commits because temporary workflow staging / audit / restore operations were used repeatedly. Commit count therefore does not equal number of research batches.

---

## 14. Best continuation strategy for the remaining 158

Do not simply start at record 1 and repeat generic searches. The remaining tail has already been broadly researched. Work by evidence gap.

### Priority 1 — near-complete exact-size records

Start with records where:

- exact UPC and size are already proven;
- ingredients are complete;
- GA is complete;
- only calories or adequacy are missing;
- or a family-level formula exists but exact-size binding is the only remaining problem.

These offer the highest chance of additional online promotions.

### Priority 2 — veterinary wet/dry records

Re-check current VCA / Blue Buffalo / veterinary retailer technical pages and PDFs. The veterinary line has yielded full current label decks more often than many consumer lines.

When a PDF is required, inspect the actual relevant PDF page rather than relying on a search snippet.

### Priority 3 — True Solutions current-generation reconciliation

Urinary Care dry and Weight Control dry were successfully resolved. Hairball Control and Urinary Care wet still need exact current package-generation proof.

### Priority 4 — legacy Wilderness / Basics / treat families

Search exact UPC + exact size + current product name. These families frequently have historical formula drift, so exact current shelf binding matters more than the number of corroborating old pages.

### Priority 5 — multipacks

Many multipacks will remain physical-label dependent unless a retailer or manufacturer exposes back-of-box images showing the exact inner units and their printed barcodes. Do not guess inner UPCs from standalone SKUs.

---

## 15. Stopping rule

A record should stop receiving repeated generic web searches once:

- exact UPC / product identity is known;
- repeated current-source searches return the same incomplete evidence;
- or two current generations remain materially incompatible;
- and no manufacturer label, package image, or exact technical deck resolves the collision.

At that point, `needs_physical_label` is the correct research result, not a failure.

A future agent should only reopen such a record when a genuinely new high-quality source appears: current back-label photos, manufacturer label PDF, exact package technical sheet, or a retailer page exposing a clearly current exact package generation.

---

## 16. Required checks before the next Blue Buffalo commit

Before any future write:

1. read current `research/AGENTS.md`;
2. fetch the current Blue Buffalo branch and ledger immediately before mutation;
3. rebuild the live repository-wide exclusion set;
4. confirm that no other agent changed the Blue Buffalo ledger since the last read;
5. validate UPC and GTIN check digits;
6. ensure all formula fields come from one coherent current generation;
7. keep `source_urls`, `conflicts`, `verification_notes`, and `multipack_contents` correctly typed;
8. parse the complete JSON after changes;
9. verify global UPC / GTIN uniqueness;
10. run deterministic status counts;
11. restore the shared Actions runner if it was temporarily replaced;
12. fetch the committed remote ledger again and confirm it matches;
13. leave PR #5 draft/open unless the user explicitly requests otherwise.

---

## 17. Handoff snapshot

**Blue Buffalo ledger:** `research/deep-research-blue-buffalo.json`  
**Total researched records:** 291  
**Source verified:** 133  
**Needs physical label:** 158  
**Current research-data checkpoint:** `07c4dc8147b97c5a938c5d7ffb216b227476a330`  
**Draft PR:** #5  
**Runner base blob:** `dde3c125efd00c7387aad2aa7ae1ce5e5d4bfc4a`

The main conclusion of the campaign so far is that the unresolved tail is now a **quality-controlled physical-label / formula-generation problem**, not simply an unsearched list. Many records contain substantial evidence already. Future progress should come from resolving very specific gaps, not from relaxing the `source_verified` gate.
