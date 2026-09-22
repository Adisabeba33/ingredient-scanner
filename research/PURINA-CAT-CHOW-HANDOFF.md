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
