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
