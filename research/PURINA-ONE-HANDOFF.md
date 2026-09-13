# Purina ONE Deep Research — Handoff

Branch: `agent/deep-research-purina-one`  
Ledger: `research/deep-research-purina-one.json`  
Brief: `research/BRIEF-PURINA-ONE.md`  
Last updated: 2026-09-06

## 1. Scope and current status

This campaign is restricted to **Purina ONE** U.S. pet food. Do not pull in Purina Pro Plan,
Purina Cat Chow, Dog Chow, Beneful, Fancy Feast, Friskies, ALPO, or generic Purina products
even when the manufacturer, barcode prefix, claims, or range names overlap.

The catalog started with one Purina ONE package only:

- `017800012638` — Purina ONE +Plus Hairball Formula dry cat food, 3.5 lb.

Batch 1 adds **20 new individual-unit dry-cat barcodes**, all staged as
`source_verified`. The seeded 3.5 lb Hairball package is deliberately excluded rather than
re-researched.

Batch 1 coverage:

| Current range / formula | New package records |
|---|---:|
| Tender Selects Blend — With Real Salmon | 4 |
| Tender Selects Blend — With Real Chicken | 4 |
| +Plus Urinary Tract Health Formula | 4 |
| +Plus Healthy Kitten Formula | 3 |
| +Plus Indoor Advantage With Real Turkey | 3 |
| +Plus Hairball Formula | 2 |
| **Total** | **20** |

The campaign is **not complete**. Continue dry cat before moving to dry dog, then wet cat,
wet dog, and finally multipacks as required by the brief.

## 2. Current Purina ONE line taxonomy

Treat the current physical/package identity and current Purina label deck as the authority.
Do not inherit a range name from retailer copy when the current pack no longer prints it.

### SmartBlend

`SmartBlend` is still abundant in retailer titles and legacy product metadata, but the
current 2026 Purina cat decks examined in Batch 1 do **not** use SmartBlend as the current
range identity. In this batch, current packaging/decks resolve the products as
`Tender Selects Blend` or `+Plus`.

Therefore:

- do **not** file a 2026 package under SmartBlend merely because an old retailer title says it;
- keep SmartBlend as a historical/legacy naming signal until a current pack/deck proves a
  current SmartBlend SKU;
- if a stable UPC spans old SmartBlend artwork and a current renamed pack, preserve the
  generation conflict rather than merging the old identity into the current one.

This answer is provisional for the brand as a whole until the remaining dog/wet ranges are
researched, but it is settled for the six Batch 1 formulas.

### +Plus

`+Plus` is current and active. Batch 1 confirms current +Plus identities for Urinary Tract
Health, Healthy Kitten, Indoor Advantage, and Hairball.

**Urinary Tract Health is ordinary retail/OTC Purina ONE, not a veterinary prescription
diet.** Do not set vet-channel flags from retailer metadata that says “Veterinary Diet.”

### Tender Selects Blend

Current Purina 2026 label decks support `Tender Selects Blend` for the Salmon and Chicken
adult dry-cat recipes. Retailer pages still expose prior-generation formula data for some
bag sizes; those copies are not the formula master.

## 3. LiveClear brand-data gap

`LiveClear` is a current Purina ONE range but is missing from the repository's Purina ONE
range dictionary/inventory taxonomy. This is a real brand-data gap, not permission to edit
production data during this research assignment.

Important boundary: **Purina ONE LiveClear and Purina Pro Plan LiveClear are different
products.** Never use a Pro Plan LiveClear deck or barcode as evidence for Purina ONE.

Per the brief, this finding belongs here only. Do not change production taxonomy files from
this branch.

## 4. Barcode and package findings

Purina ONE uses Nestlé Purina's `017800` company prefix in the records researched here.
`data/gs1-prefixes.ts` already recognizes that prefix.

Batch 1 proves the “one recipe, many retail bags” pattern directly:

- Salmon: 3.5, 7, 16, 22 lb
- Chicken: 3.5, 7, 16, 22 lb
- Urinary Tract Health: 3.5, 7, 16, 22 lb
- Healthy Kitten: 3.5, 7, 16 lb
- Indoor Advantage: 3.5, 7, 16 lb
- Hairball: existing seed 3.5 lb; new records 7 and 16 lb

Each bag has its own retail UPC and each is recorded as `individual_unit`. A large bag is
not a case merely because of its weight.

The 20 new UPCs in Batch 1 are:

- `017800474740`, `017800474900`, `017800431194`, `017800147347`
- `017800571180`, `017800571210`, `017800571920`, `017800144100`
- `017800549172`, `017800549202`, `017800012782`, `017800144117`
- `017800350884`, `017800029650`, `017800104777`
- `017800033886`, `017800033862`, `017800033855`
- `017800012607`, `017800012621`

## 5. Formula-generation conflicts

Purina is actively transitioning some cat dry foods to a newer Pet Nutrition Facts panel.
That creates a trap: retailer pages can correctly identify the UPC/size while carrying an
older formula.

Batch 1 rules applied:

1. **Current Purina deck controls composition.**
2. Exact retailer/distributor listing binds the UPC to the package size.
3. Older retailer ingredients/GA are retained as a conflict signal but are not blended into
   the current deck.
4. Missing nutrient basis is left missing rather than reverse-engineered.

Specific current-generation examples:

- Tender Selects Salmon — deck `F415625` (2026-04)
- Tender Selects Chicken — deck `F415525` (2026-04)
- Healthy Kitten — deck `A415925` (2026-07)
- Indoor Advantage — deck `S418825` (2026-08)
- Urinary Tract Health — current Purina-linked deck `P415815`
- Hairball — current Purina-linked deck `M418520`

The new Pet Nutrition Facts decks print **Dietary Fiber**, not legacy **Crude Fiber**, for
Salmon, Chicken, Healthy Kitten, and Indoor Advantage. The ledger therefore leaves
`crude_fiber_max_percent` null and stores Dietary Fiber in
`other_printed_guarantees`. Do not silently relabel Dietary Fiber as Crude Fiber.

Those same newer decks print kcal/cup but not kcal/kg. The ledger stores the printed
kcal/cup and leaves `kcal_per_kg` null. This is deliberate; the brief explicitly forbids
deriving an unprinted calorie basis.

## 6. Checker / validation notes

The Batch 1 data were validated against the repository checker's visible contract:

- 20/20 UPC check digits valid;
- 20/20 GTIN-14 canonical forms valid;
- no duplicate UPC inside the batch;
- seeded `017800012638` excluded;
- no wrong-barcode entry used;
- all controlled vocabulary values valid;
- all `source_verified` records have current ingredients, protein, fat, moisture, exact
  size, and direct sources;
- no duplicate printed identity at the same size.

The checker logic produces one expected warning shape on the newer Pet Nutrition Facts
records: `kcal_per_unit without kcal_per_kg`. There are 14 such records. Each one is
answered in its `verification_notes`: the current deck prints kcal/cup and does not print
kcal/kg, so the missing value is intentional.

## 7. Wrong-barcode and near-miss hazards

No Batch 1 UPC is present in `data/wrong-barcodes.ts`.

The main near-miss hazards encountered are **not bad check digits**; they are semantically
plausible wrong evidence:

- retailer formula text from an older generation under the same valid UPC;
- SmartBlend legacy naming attached to a current package that no longer uses that line;
- retailer “Veterinary Diet” categorization on +Plus Urinary Tract Health;
- Purina Pro Plan LiveClear evidence accidentally attached to Purina ONE LiveClear.

Treat these as identity/formula conflicts, not as permission to “repair” the current deck.

## 8. Unresolved tail / physical-label needs

Batch 1 has no `needs_physical_label` records.

This does **not** mean the dry-cat category is exhausted. The remaining current dry-cat
formulas/ranges have not yet been fully worked. Continue with exact size ladders and
current decks. In particular, investigate current +Plus Sensitive Skin & Stomach,
senior/7+, weight-management/Ideal Weight, Whole Body Support, True Instinct/Natural
offerings, and LiveClear before declaring dry cat complete.

Any UPC whose current formula generation or exact bag-size binding cannot be settled from
the current Purina deck plus exact retail evidence must remain `needs_physical_label`.

## 9. Where to resume

Resume in this order:

1. Remaining **dry cat** Purina ONE products, max 20 records in the next batch.
2. Dry dog.
3. Wet cat individual units.
4. Wet dog individual units.
5. Multipacks / cases, with outer-package identity kept structurally separate from an
   individual food formula.

Before every future commit:

- re-read `research/BRIEF-PURINA-ONE.md`;
- re-check live inventory/exclusions;
- append no more than 20 records;
- run `node scripts/check-ledger.mjs research/deep-research-purina-one.json`;
- resolve every ERROR and explicitly answer every WARN;
- commit and re-fetch the remote ledger to verify it parses and contains the intended batch.

Keep the PR draft/open. Do not merge or promote records into production seed files without
an explicit separate instruction.
