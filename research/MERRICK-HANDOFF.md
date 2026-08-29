# Merrick Deep Research Handoff

Last updated: 2026-08-29

## Read this first

This is the current handoff for Merrick barcode research in `Adisabeba33/ingredient-scanner`.

Before any new Merrick work, read `research/AGENTS.md` and treat it as binding. Rebuild the live exclusion set from the repository before every batch; never rely only on the UPC lists below.

Current branch: `agent/deep-research-merrick`
Current review surface: draft PR #4
Primary ledger: `research/deep-research-merrick.json`
Research mode: **ACTIVE MARKET ONLY**

Do not merge the research PR unless the user explicitly asks.

## User priority

Research only products that are genuinely current and realistically purchasable now. Do not mine discontinued, historical, archive-only, old-packaging, or inactive regional SKUs just to increase the count.

Market priority:
1. United States
2. Canada
3. Australia / New Zealand if relevant and current
4. Europe / UK if relevant and current

Prefer **individual retail units**. Cases, trays, and variety packs are separate package identities and must never be substituted for contained unit UPCs.

## Current Merrick state

The canonical ledger now contains **60 records**:

- 60 `source_verified`
- 60 `individual_unit`
- 20 cat + 40 dog
- 54 wet + 6 dry
- size distribution: 17 × 3 oz, 8 × 3.5 oz, 29 × 12.7 oz, 4 × 4 lb, 2 × 12 lb
- all UPC-A check digits valid
- all canonical GTIN-14 values valid and unique
- all records use the controlled `Texture` and `Presentation` vocabularies from `lib/presentation.ts`
- remote post-commit exclusion sweep for batch 3 found 0 collisions
- final PR diff after cleanup contains only this handoff and `research/deep-research-merrick.json`; temporary Merrick workflows were removed

Data commits:

- Batch 1: `ce20f60d182cf249fcf1c954c94daefb8290eae9` — `research: add first 20 active Merrick cat barcodes`
- Batch 2: `0a6479b06b704a38862ffdb3f6efd93c1a943105` — `research: add second 20 active Merrick barcodes`
- Batch 3: `b32a1327a442d76ee067af11406da2d4092cce07` — `research: add third 20 active Merrick barcodes`
- Batch-3 normalization-only repair: `f7f593e8914efbf0d48c6809b1f0993c351ab95d` — `research: repair Merrick premix normalization`; only the top-level normalized grouping for UPC `022808260219` changed, not its verbatim label or evidence.

Remote validation after batch 3 reported:

- `TOTAL 60`
- `STATUS {'source_verified': 60}`
- `SCOPE {'individual_unit': 60}`
- `SPECIES {'cat': 20, 'dog': 40}`
- `FORM {'wet': 54, 'dry': 6}`
- `SIZE {'3 oz': 17, '4 lb': 4, '12 lb': 2, '12.7 oz': 29, '3.5 oz': 8}`
- `COLLISIONS []`

## Merrick source behavior

Merrick's current US PDPs expose retail UPCs through PriceSpider `ps-sku` fields. For a single-size PDP, the accepted chain is:

`current exact PDP -> first/main-product ps-sku -> exact current package size -> current ingredient/GA/calorie evidence`

Do not accept later `ps-sku` values blindly; Merrick pages contain related-product widgets with unrelated UPCs later in the HTML.

For a multi-size PDP, the first `ps-sku` alone does **not** prove which package size it belongs to. Obtain a separate exact size-to-UPC mapping before adding that size.

Formula and barcode evidence may come from different current sources when the mapping is unambiguous. Keep formula generations separate; do not copy stale retailer formula text over a current Merrick deck.

## Batch 1 — current cat individual units

### Wet 3 oz cans

`022808000839`, `022808000754`, `022808000891`, `022808000778`, `022808000853`, `022808000792`, `022808382539`, `022808382614`, `022808382577`, `022808382638`, `022808382591`, `022808383277`, `022808382553`, `022808385103`

### Dry bags

- `022808001317` — Chicken & Sweet Potato, 4 lb
- `022808001355` — Salmon & Sweet Potato, 4 lb
- `022808001393` — Whitefish & Spinach, 4 lb
- `022808001454` — Lamb & Carrots, 4 lb
- `022808383109` — Chicken & Sweet Potato, 12 lb
- `022808383123` — Salmon & Sweet Potato, 12 lb

Cat formula-generation cautions already documented in the ledger:

- Rabbit pâté `022808385103`: current Merrick generation differs from stale retailer copy; keep the current Merrick formula.
- Chicken and Salmon 12 lb dry: retailer evidence proves size↔UPC, while the current Merrick PDP/deck supplies the current formula.

## Batch 2 — current dog wet 12.7 oz individual cans

- `022808001997` — Cowboy Cookout In Gravy
- `022808283010` — Big Texas Steak Tips Dinner in Gravy
- `022808284000` — Texas Style with Braised Beef
- `022808280040` — Lamb Shepherd's Pie
- `022808390046` — Limited Ingredient Diet Real Lamb
- `022808370024` — Backcountry Real Beef Dinner
- `022808470144` — Backcountry Hero's Banquet Stew
- `022808390916` — LID Healthy Grains Chicken & Brown Rice
- `022808280064` — Turkey Meatloaf
- `022808280002` — Chicken Casserole
- `022808280026` — Beef Tips & Rice Stew
- `022808284093` — Kentucky Style Chopped Lamb
- `022808390930` — LID Healthy Grains Turkey & Brown Rice
- `022808284031` — Memphis Style Glazed Chicken
- `022808284017` — Kansas City Style Chopped Pork
- `022808003342` — Real Beef, Lamb + Bison Dinner
- `022808282976` — Carver's Delight
- `022808282938` — Colossal Chicken
- `022808282877` — Pappy's Pot Roast
- `022808002864` — Wilderness Blend in Gravy

Do not infer `adult` just because a product appears adult-market. Preserve `life_stage: null` where the captured current evidence does not explicitly print a stage.

## Batch 3 — current dog wet individual units

### 12.7 oz cans — 9

- `022808006688` — Grain Free Thanksgiving Day Dinner In Gravy
- `022808008125` — Grain Free Puppy Plate Beef Recipe In Gravy
- `022808002888` — Grain Free Puppy Plate Chicken Recipe In Gravy
- `022808002123` — Grain Free Real Duck Dinner
- `022808004868` — Grain Free Real Texas Beef Dinner
- `022808002666` — Grain Free Turducken In Gravy
- `022808004844` — Grain Free Real Chicken Dinner
- `022808001751` — Grain Free Grammy's Pot Pie In Gravy
- `022808370017` — Backcountry Real Chicken Dinner

### Lil' Plates 3.5 oz tubs — 8

- `022808260219` — Itsy Bitsy Beef Stew
- `022808260264` — Teeny Texas Steak Tips Dinner in Gravy
- `022808260295` — Small Surfin' + Turfin' Supper in Gravy
- `022808260271` — Pint Sized Puppy Plate Recipe in Gravy
- `022808260240` — Dainty Duck Medley in Gravy
- `022808260202` — Tiny Thanksgiving Day Dinner
- `022808260233` — Little Lamb Chop Stew
- `022808260226` — Petite Pot Pie

### Lil' Plates Petite Pâté 3 oz individual cans — 3

- `022808010388` — Beef Dinner
- `022808010401` — Chicken Dinner
- `022808010425` — Lamb Dinner

For Beef and Lamb, the current Merrick PDP lists a single 3 oz can size and exposes the UPC as the primary PriceSpider `ps-sku`. For Chicken, the current Merrick PDP also mentions a `3-3 oz Cans` offer, so the individual-unit mapping was independently corroborated by current Canadian distributor Can-Pet: UPC `0 22808 01040 1` maps to the 85 g Chicken Dinner unit packed 24 per case. Do not reinterpret `022808010401` as the 3-pack code.

Current first-party Petite Pâté formula decks stored in the ledger:

- Beef: `B287023` — 1201 kcal/kg, 102 kcal/can
- Chicken: `B287123` — 1184 kcal/kg, 101 kcal/can
- Lamb: `B287223` — 1320 kcal/kg, 112 kcal/can

All three print GA 8% protein / 5% fat / 2% fiber / 78% moisture and adult-maintenance adequacy.

### Batch-3 source quirks

- `022808260295` is a current 3.5 oz **tub**, but Merrick's current PDP prints calories as `89 kcal/pouch`. The ledger preserves the printed calorie unit and records the package/calorie-wording disagreement in `conflicts`; do not silently rewrite the label statement.
- `022808260219` prints `VITAMINS, (...)`. The verbatim label is preserved exactly; a post-batch audit repaired only `ingredients_ordered_normalized` so the vitamin premix remains one top-level ingredient, as required by `research/AGENTS.md`.

## Deliberately not added yet

### Lil' Plates Petite Pâté Turkey

Current Merrick page exposes UPC `022808010456` but also lists both `3 oz. Can` and `3-3 oz. Cans`. The exact unit-vs-multipack mapping has not been independently resolved. **Do not add or infer this code's barcode scope until the exact package identity is proven.**

### Cat Whitefish and Lamb 12 lb bags

The 12 lb sizes are current, but their exact size-to-UPC identities are still unresolved. Do not infer them from neighboring Merrick codes.

## Best next research order

1. Re-fetch the 60-record ledger and rebuild all live exclusions.
2. Recheck the remaining current dog-wet catalog against these 60 records. Batch 3 consumed most of the clean single-size wet candidates; do not force a fourth wet batch from variety packs or ambiguous package identities.
3. Resolve Petite Pâté Turkey `022808010456` only if an independent source proves whether it is the single 3 oz can UPC or an outer 3-pack UPC.
4. Move into **current Merrick dog dry food**, mapping every active bag size to its exact UPC. Multi-size Merrick PDPs require separate size↔UPC proof.
5. Keep trying to resolve the current cat Whitefish & Spinach and Lamb & Carrots 12 lb bag UPCs.
6. After complete-and-balanced active food is substantially covered, current supplemental cat products (Finishing Sauces, Petite Parfaits, Bone Broths) may be researched if useful to scanner coverage.
7. Never pad a batch with discontinued/history/case/multipack records. If fewer than 20 clean active individual units remain, add fewer than 20.

## Validation workflow for every next batch

Before write:

- scan `data/known-products.ts`
- scan `data/known-formulas.ts`
- scan `data/wrong-barcodes.ts`
- scan `docs/CATALOG-CONFLICTS.md`
- scan every `research/deep-research-*.json`
- include codes collected earlier in the same batch
- validate UPC/EAN check digit and canonical GTIN-14
- validate `texture` and `presentation` against `lib/presentation.ts`
- ensure vitamin/mineral premix blocks stay one top-level element in `ingredients_ordered_normalized`

For `source_verified`, require the complete gate from `research/AGENTS.md`: exact individual barcode, exact package size, current matching formula generation, complete ingredient order, full printed GA, calories, life-stage/adequacy where printed, current sources, and no repository collision.

After write:

- commit
- re-fetch/checkout the remote branch
- parse the committed JSON
- confirm total and unique UPC/GTIN-14 values
- re-run check digits
- confirm status/scope/species/form/size counts
- re-run global exclusions excluding the target ledger itself
- perform a normalized-ingredient structural audit
- only then report the batch complete

## Bottom line

Merrick is now at **60 active, source-verified individual retail barcodes: 20 cat + 40 dog**. Continue from exactly this baseline and stay on the active market.
