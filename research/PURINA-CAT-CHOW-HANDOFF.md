# Purina Cat Chow — research handoff

**Capabilities: web access available; shell unavailable.** Per `research/AGENTS.md` §3a and the brand brief §0, this pass did not write or commit the full ledger and did not create a temporary GitHub Actions runner. The completed records are staged as a bare array in `research/incoming/purina-cat-chow-batch-01.json`.

## Batch 1 status

- Assigned brand: **Purina Cat Chow only**
- Delivery path: `research/incoming/purina-cat-chow-batch-01.json`
- Records staged: **11**
- `source_verified`: **11 / 11**
- `needs_physical_label`: **0**
- `candidate`: **0**
- `rejected`: **0**
- Current manufacturer label decks found: **3 exact products / 3 products researched**
- Products researched without a current deck: **0**
- GS1 prefix proven from exact-size package evidence: **017800 on 11 packages**
- Products deliberately left out because the front says **KITTEN CHOW** rather than **CAT CHOW**: **1 distinct near-miss observed** (Purina Kitten Chow Nurture; no record written)
- Checker exit code: **not run — no shell in this session**. This is the required §3a stop condition, not an asserted clean check.
- Inventory regeneration: **not run — no shell in this session**. The checked-in inventory read at start reported zero Cat Chow products.

## Current decks used

1. **Complete — With Real Chicken** — deck `O450123`, dated path 2025-08. It supplies the complete ingredient statement, guaranteed analysis, 3688 kcal/kg, 411 kcal/cup, and AAFCO all-life-stages statement.
2. **Complete — With Real Salmon** — deck `B450923`, dated path 2025-08. It supplies the complete ingredient statement, guaranteed analysis, 3737 kcal/kg, 410 kcal/cup, and AAFCO all-life-stages statement.
3. **Indoor Hairball + Healthy Weight — With Chicken** — deck `P450025`, dated path 2025-10. It supplies the complete ingredient statement, guaranteed analysis, 3382 kcal/kg, 359 kcal/cup, and AAFCO adult-maintenance statement.

Per the brief §4, each current Purina deck was treated as sufficient composition evidence for `source_verified`; the retailer/distributor source is used only to bind UPC to exact sellable bag size.

## Size ladders proved in this pass

**Complete / With Real Chicken**
- 3.15 lb — `017800150149`
- 6.3 lb — `017800150125`
- 15 lb — `017800184953`
- 20 lb — `017800184960`
- 25 lb — `017800145916`

**Complete / With Real Salmon**
- 3.15 lb — `017800194778`
- 15 lb — `017800194808`
- Purina currently lists a 12 lb bag, but this pass did not find an acceptable exact-size UPC witness, so it was not guessed or staged.

**Indoor / Hairball + Healthy Weight With Chicken**
- 3.15 lb — `017800150187`
- 6.3 lb — `017800150163`
- 15 lb — `017800184991`
- 20 lb — `017800184984`
- Purina currently lists a 12 lb bag, but this pass did not find an acceptable exact-size UPC witness, so it was not guessed or staged.

The first batch therefore stopped at 11 rather than padding to 20 with unproven size/UPC bindings.

## Calories / arithmetic

All staged rows are dry food. Calories are copied as `kcal_per_kg` plus the printed per-cup figure with `unit_name: "cup"`. No per-bag calorie number was invented. As required by the brief, these dry rows went in **without a package-weight arithmetic witness** because the label calorie basis is a volume cup.

## Prefix finding

All 11 proved package UPCs begin with **017800**. No `050000`, `038100`, `022808`, or fifth prefix was proved in this batch. This is evidence for these packages only, not an assumption for the rest of Cat Chow.

## Brand boundary / Kitten Chow

The research encountered **Purina Kitten Chow Nurture** while checking Cat Chow UPC families. It was excluded because the product is branded **KITTEN CHOW**, matching the repository boundary in the brief. No Fancy Feast, Friskies, Purina ONE, Pro Plan, Beyond, Dog Chow, Alpo, Merrick, or other Purina sibling was written.

## Next shell-enabled action

Merge the 11 staged records into `research/deep-research-purina-cat-chow.json`, delete the incoming file, then run exactly:

```bash
node scripts/brand-inventory.mjs "Purina Cat Chow" > research/INVENTORY-PURINA-CAT-CHOW.md
node scripts/check-ledger.mjs research/deep-research-purina-cat-chow.json
```

Do not commit the merged ledger unless the checker exits 0. No production seed files were touched.


## Batch 2 status

- Delivery path: `research/incoming/purina-cat-chow-batch-02.json`
- Records staged this batch: **11**
- Running staged total: **22**
- Running `source_verified`: **22 / 22**
- New ranges touched: **Naturals, Gentle**
- Additional exact formulas/decks/documents: **3** — Naturals Original `H452120`, Naturals Indoor `E450524`, Gentle `G450423`
- Running GS1 prefix result: **017800 on 22 / 22 proved packages**
- Checker exit code remains **not run — shell unavailable**; §3a delivery mode remains in force.
- No production seed files were touched.

### Batch 2 size ladders

**Naturals / Original With Chicken & Salmon**
- 3.15 lb — `017800113229`
- 6.3 lb — `017800113205`
- 13 lb — `017800145008`
- 18 lb — `017800162579`

**Naturals / Indoor With Chicken & Turkey**
- 3.15 lb — `017800171564`
- 6.3 lb — `017800171595`
- 13 lb — `017800171625`
- 18 lb — `017800171632`

**Gentle / Sensitive Stomach + Skin With Turkey**
- 3.15 lb — `017800166294`
- 6.3 lb — `017800166317`
- 13 lb — `017800166331`

For Naturals Original, Purina manufacturer document `H452120` supplies the complete panel and AAFCO all-life-stages statement. For Naturals Indoor, the current Purina page plus its downloadable/current formula identity `E450524` supplies the panel and 3481 kcal/kg / 371 kcal/cup; exact package UPCs are independently bound to sizes. Gentle uses the current Purina label-deck PDF `G450423`, which prints the full ingredient panel, guaranteed analysis, adult-maintenance feeding-test statement, and 3603 kcal/kg / 402 kcal/cup.

All batch-2 rows are dry food and therefore again carry no invented per-bag calorie figure and no package-weight arithmetic witness.

### Boundary observations after batch 2

No sibling Purina brand was added. Kitten Chow remains excluded. The Cat Chow shelf now has proved records in four of the five named catalog ranges encountered in this campaign: Complete, Indoor, Naturals and Gentle. `Hairball` has not yet been treated as a separate product range because current Cat Chow Indoor and Naturals Indoor packaging uses hairball-control wording inside those products; a future pass should only create a distinct Hairball-range record if a current package actually prints a distinct product/range identity rather than merely a benefit claim.


## Batch 3 status

- Delivery path: `research/incoming/purina-cat-chow-batch-03.json`
- Records staged this batch: **4**
- Running staged total: **26**
- Running `source_verified`: **26 / 26**
- New current recipe: **Healthy Aging 7+ Senior With Chicken**
- New package formats/sizes proved for already-covered recipes: Complete 18 oz and Indoor 18 oz
- Running GS1 prefix result: **017800 on 26 / 26 proved packages**
- Checker exit code remains **not run — shell unavailable**; §3a delivery mode remains in force.
- No production seed files were touched.

### Batch 3 additions

**Complete / With Real Chicken**
- 18 oz — `017800450072`

**Indoor / Hairball + Healthy Weight With Chicken**
- 18 oz — `017800028677`

**Healthy Aging 7+ / With Chicken**
- 3.15 lb — `017800190084`
- 14 lb — `017800190237`

The Healthy Aging package itself is currently branded **CAT CHOW**, so it belongs to this campaign despite the original inventory's five named empty ranges not listing a Senior/Healthy Aging range. The current Purina brand site also presents a Senior Cat Chow product. This is a range recommendation for the later seeding pass; no production range file was changed.

### Healthy Aging manufacturer-source discrepancy

Purina's current product page links manufacturer deck `C450823`. The deck prints **3602 kcal/kg / 382 kcal/cup**; the current HTML product page displays **3586 kcal/kg / 393 kcal/cup**. Ingredient order and the adult-maintenance AAFCO identity agree. The staged records preserve the values printed in the downloadable label deck and explicitly record the calorie discrepancy in `conflicts`; they remain `source_verified` because the brand brief makes the exact manufacturer deck sufficient evidence and only an ingredient-order disagreement is an automatic physical-label gate.

### Remaining leads after batch 3

Purina currently advertises 12 lb bags for Indoor and Complete Salmon, but an acceptable exact UPC-to-size witness still has not been proved, so neither was guessed. Older Cat Chow UPC databases expose numerous discontinued/legacy packages (Healthy Weight, older Indoor/Complete sizes, old Naturals codes); these were not padded into the current campaign without current package/formula evidence.


## Exhaustion pass after batch 3

A further current-shelf search was run specifically against the two unresolved manufacturer-listed 12 lb packages and against additional current Cat Chow recipes.

- Purina's current **Complete With Real Salmon** page still lists **3.15 lb, 12 lb and 15 lb**.
- Purina's current **Indoor Healthy Weight + Hairball With Chicken** page still lists **3.15 lb, 6.3 lb, 12 lb, 15 lb and 20 lb**.
- Current retail pages independently prove that both 12 lb sellable products exist.
- However, the accessible current sources found in this pass still do **not expose an acceptable UPC-to-12-lb binding** for either product. Instacart/Grocery Outlet product IDs are retailer/catalog IDs, not UPCs, and were deliberately not promoted to barcode evidence.
- Therefore **zero records were added in this exhaustion pass**. The running staged result remains **26 / 26 source_verified**.
- No legacy UPC was substituted for either current 12 lb package.
- No separate `Hairball` recipe was created: current manufacturer evidence continues to present hairball control as a benefit of the Indoor recipe rather than a separately proved current Cat Chow product identity.

This pass strengthens the conclusion that the remaining work is now narrow UPC identity work rather than missing formula work. The two 12 lb packages remain explicit unresolved leads, not guessed records.


## Deep UPC hunt — 12 lb variants

A second, narrower barcode hunt was run after the exhaustion pass, using exact product names, Purina prefix fragments, UPC/GTIN wording, retailer catalog pages and distributor-style listings.

### New size lead discovered

The current Purina manufacturer page for **Complete With Real Chicken** also lists a **12 lb** bag. Earlier batches proved 18 oz, 3.15 lb, 6.3 lb, 15 lb, 20 lb and 25 lb, but did not include this current 12 lb size. Current retailer pages also prove that the 12 lb Chicken package exists. As with the two previously unresolved 12 lb packages, this pass did not find an acceptable exact UPC binding, so **no barcode was guessed**.

The unresolved current 12 lb set is therefore now:

1. Complete / With Real Chicken — 12 lb — package existence proved, UPC unresolved.
2. Complete / With Real Salmon — 12 lb — package existence proved, UPC unresolved.
3. Indoor / Hairball + Healthy Weight With Chicken — 12 lb — package existence proved, UPC unresolved.

### Evidence-quality finding

Several search results and retail pages expose internal product IDs, DoorDash URPC UUIDs, Instacart product IDs, Tractor Supply SKUs, or a UPC belonging to a different size selected on a multi-size page. None is sufficient to bind one of these three 12 lb packages to a UPC. In particular, a retailer page may say that a recipe is available in 12 lb while displaying the 15 lb UPC; that is a size ladder, not barcode proof for the 12 lb bag.

No new record was staged from this hunt. Running total remains **26 / 26 source_verified**. This is deliberate: three current package gaps are now explicitly documented rather than filled with inferred or cross-size barcodes.


## Distributor/catalog UPC pass

A catalog-focused pass searched exact 12 lb product/UPC/GTIN combinations and distributor-style indexes rather than ordinary product discovery.

### What it proved

- A current/specialty-retailer Cat Chow Complete page exposes UPC `017800184953`, but that UPC is already independently proved as the **15 lb** package. The same page lists 12 lb only as another available size. It is therefore **not** evidence for the 12 lb UPC.
- A current specialty pet-food catalog similarly exposes `017800184953` for generic Cat Chow and `017800184991` for generic Cat Chow Indoor. Those are the already-proved **15 lb** codes, not 12 lb bindings.
- A historical wholesale UPC list exposes `017800173063` as **Cat Chow Complete 25 lb** and `017800173087` as **Cat Chow Indoor 25 lb**. These are useful legacy/package-generation leads but do not match the current package evidence already staged and were **not added** to the current ledger.
- Canadian distributor catalogs were also encountered, but their package weights are metric and their UPC/business-unit evidence is not a valid substitute for the current U.S. 12 lb packages.

### Decision

No new current U.S. 12 lb UPC reached the brief's identity standard in this pass. The three unresolved 12 lb packages remain unresolved rather than being assigned the 15 lb UPC shown on multi-size pages or a historical wholesale code.

Running staged total remains **26 / 26 source_verified**. At this point the ordinary web, retailer and indexed distributor/catalog surfaces have been substantially exhausted for the three 12 lb codes. A future attempt should prioritize a photographed current 12 lb back label, a current wholesaler item master with explicit UPC+size columns, or GS1/package data rather than repeating general web searches.


## Near-ready UPC leads preserved by user request

The user explicitly chose a lower evidence threshold for **retaining unfinished work for future pickup**, not for promoting it as verified. To keep the strict ledger contract intact, the three current 12 lb packages were saved separately in:

`research/PURINA-CAT-CHOW-UPC-LEADS.json`

That file contains **3 candidate records** with the already-proved manufacturer formula/panel, exact 12 lb package identity and current package-existence sources. Their `upc` and `canonical_gtin14` are deliberately `null` because the missing fact is exactly the barcode binding.

These are intentionally **not** in `research/deep-research-purina-cat-chow.json` or an incoming strict-ledger batch, because `AGENTS.md` §9 requires a zero-padded UPC string there and §10 requires the individual barcode to be proved for `source_verified`. Future work can promote each lead almost mechanically once an exact current UPC witness is found, check digit/collision checks pass, and the strict record fields are restored.

The three preserved leads are:
- Complete / With Real Chicken — 12 lb
- Complete / With Real Salmon — 12 lb
- Indoor / Hairball + Healthy Weight With Chicken — 12 lb


## Expanded low-confidence / legacy lead preservation

Per user direction, the separate near-ready lead file was expanded rather than discarding useful but sub-ledger evidence. It now contains **6 leads total**: the three current 12 lb packages with missing UPCs plus three barcode-bearing low-confidence/legacy leads.

Newly preserved barcode leads:
- `017800113182` — indexed as Purina Cat Chow Naturals; valid UPC-A check digit, but current exact-size/current-formula binding is not strong enough for the strict ledger.
- `017800173063` — historical wholesale evidence: Cat Chow Complete 25 lb. Kept as a legacy/package-generation lead because the current campaign already proves a different current 25 lb UPC.
- `017800173087` — historical wholesale evidence: Cat Chow Indoor 25 lb. Kept as legacy because current manufacturer evidence does not establish that 25 lb Indoor is a current U.S. package.

These records are deliberately stored only in `research/PURINA-CAT-CHOW-UPC-LEADS.json`. They are not counted in the 26 strict `source_verified` records and should not be seeded until their stated missing evidence is resolved.


## STOP POINT — campaign paused by user (2026-09-22)

The user explicitly stopped the Purina Cat Chow campaign here and considers the present coverage sufficient for now. **Do not continue historical label/deck research unless the user reopens the campaign.**

### State at pause

- Strict staged current records: **26**.
- Strict `source_verified`: **26 / 26**.
- Strict `needs_physical_label`: **0**.
- All 26 proved current UPCs use prefix `017800`.
- Current formula/product families represented: Complete With Real Chicken; Complete With Real Salmon; Indoor Hairball + Healthy Weight With Chicken; Naturals Original With Chicken & Salmon; Naturals Indoor With Chicken & Turkey; Gentle Sensitive Stomach + Skin With Turkey; Healthy Aging 7+ Senior With Chicken.
- Separate preservation file: `research/PURINA-CAT-CHOW-UPC-LEADS.json`.
- That lead file contains **27 records total** and is intentionally outside the strict ledger workflow.
- **21 historical UPCs** have been raised to `historical_confirmed` and bound to an historical formula family. Their period-correct full label panels remain intentionally unresolved.
- Three current 12 lb packages are preserved as near-ready candidates with `upc: null`: Complete With Real Chicken, Complete With Real Salmon, and Indoor Hairball + Healthy Weight With Chicken. Package existence/formula identity is established; exact UPC binding is the missing fact.
- Two raw barcode leads remain unresolved (`017800150101`, `017800465724`) and one weak attribution collision is explicitly rejected (`017800150149` as Indoor, because that UPC is proved as current Complete With Real Chicken 3.15 lb).
- Historical/legacy records must **not** be treated as current sellable-package mappings without new evidence.

### Files created/staged during this campaign

- `research/incoming/purina-cat-chow-batch-01.json` — 11 strict records.
- `research/incoming/purina-cat-chow-batch-02.json` — 11 strict records.
- `research/incoming/purina-cat-chow-batch-03.json` — 4 strict records.
- `research/PURINA-CAT-CHOW-UPC-LEADS.json` — 27 near-ready, historical, unresolved, and collision records retained for future work.
- `research/PURINA-CAT-CHOW-HANDOFF.md` — this running research/handoff record.

### Validation / integration status

Shell remains unavailable in this environment. Therefore the required inventory regeneration and `node scripts/check-ledger.mjs research/deep-research-purina-cat-chow.json` have **not been run** here, and the incoming batches have **not** been merged into the strict main Cat Chow ledger or production seed files. No claim of checker success is made.

When this campaign is resumed in a shell-enabled session, first read this handoff and `AGENTS.md`; merge the three strict incoming batches, regenerate inventory, run the checker, resolve any ERROR/WARN as required by the brief, and only then commit/promote. Keep `PURINA-CAT-CHOW-UPC-LEADS.json` separate unless individual leads acquire enough evidence to satisfy the strict ledger contract.


## Shell-enabled pass (2026-09-22)

Run from a session with a shell, which the campaign did not have. It did what
the "Next shell-enabled action" section above asked for, and nothing else.

- **Merged** the three incoming batches into
  `research/deep-research-purina-cat-chow.json` — 26 records — and deleted the
  incoming files. `research/incoming/` is empty of Cat Chow again.
- **`node scripts/check-ledger.mjs research/deep-research-purina-cat-chow.json`
  exits 0. Clean, zero warnings.** That is a real run, not an assertion.
- **Inventory regenerated** from the live seed, and
  `research/WORKLIST-PURINA-CAT-CHOW.md` generated: 7 recipes behind 26
  barcodes, all 7 with a complete panel, none partial, none missing.

### Verified independently rather than taken from this handoff

- All 26 UPC-A check digits recomputed: 26 correct.
- Prefix `017800` on 26 of 26, with no exception.
- Panel bounds per food form (dry: moisture 5–20%, protein ≤50%): 26 of 26
  inside.
- Calorie basis `cup` on 26 of 26; no per-bag figure invented anywhere.
- No two recipes share an ingredient deck.
- `017800150149` is held as Complete / With Real Chicken / 3.15 lb, which
  matches this handoff's rejection of the Indoor attribution.

### One defect fixed

The two Healthy Aging records carried `conflicts` as `{field, note}` **objects**
rather than strings. `AGENTS.md` §9 shows an array of sentences, and every
consumer of the field joins and reads it as text — so the calorie disagreement
it held, which is real and useful, would have printed as `[object Object]`
everywhere it was read. Rewritten as `"calorie_content: <note>"`, keeping every
word.

Nothing caught this: the checker tested `Array.isArray` and stopped. It now
checks the entries too, which is the same rule it has always applied to a
printed guarantee written as free text. Verified by re-inserting an object and
watching it error, and by confirming eleven other ledgers report the same
counts before and after the change.

### Left for the seeding pass, not done here

- **`Healthy Aging` is a real current range and is NOT in
  `data/us-pet-brands.ts`**, which names five: Complete, Indoor, Naturals,
  Gentle, Hairball. Two records would land under "Other" until it is added.
- **`Hairball` may not be a range at all.** This campaign found hairball
  control presented as a property of the Indoor recipe rather than as a
  separate product identity, which is the Iams "Minichunks" question in
  reverse. A pack decides; do not delete it from the seed file on this
  evidence alone.
- **`research/PURINA-CAT-CHOW-UPC-LEADS.json` is safe where it sits, but by
  accident.** Both `scripts/check-ledger.mjs` and `scripts/brand-inventory.mjs`
  read `parsed.records ?? []` from every `*.json` in `research/`, and that file
  is a bare array, so they skip it — verified by probing one of its 24
  barcode-bearing leads against the checker and getting no "already claimed".
  Wrap it in `{ "records": [...] }` at any point and it becomes a phantom
  ledger that blocks the promotion of its own leads.
