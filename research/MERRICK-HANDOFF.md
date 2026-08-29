# Merrick Deep Research Handoff

Last updated: 2026-08-28

## Read this first

This is the current handoff for Merrick barcode research in `Adisabeba33/ingredient-scanner`.

Before any new Merrick work, read `research/AGENTS.md` and treat it as binding. Rebuild the live exclusion set from the repository before every batch; never rely only on the UPC lists below.

Current branch: `agent/deep-research-merrick`
Current review surface: draft PR #4
Primary ledger: `research/deep-research-merrick.json`
Research mode: **ACTIVE MARKET ONLY**

Do not merge the research PR unless the user explicitly asks.

## User priority

Research products that are genuinely current and realistically purchasable now. Do not mine discontinued, historical, archive-only, old-packaging, or inactive regional SKUs just to increase the count.

Market priority:
1. United States
2. Canada
3. Australia / New Zealand if relevant and current
4. Europe / UK if relevant and current

Prefer **individual retail units**. Cases, trays, and variety packs are separate package identities and must never be substituted for the contained unit UPC.

## Current Merrick state

The canonical ledger now contains **40 records**:

- 40 `source_verified`
- 40 `individual_unit`
- 20 cat + 20 dog
- 34 wet + 6 dry
- all UPC-A check digits valid
- all canonical GTIN-14 values valid
- all 40 now use the controlled `Texture` and `Presentation` vocabularies from `lib/presentation.ts`
- remote post-commit exclusion sweep found 0 collisions

Data commits:

- Batch 1: `ce20f60d182cf249fcf1c954c94daefb8290eae9` — `research: add first 20 active Merrick cat barcodes`
- Batch 2: `0a6479b06b704a38862ffdb3f6efd93c1a943105` — `research: add second 20 active Merrick barcodes`

Remote validation after batch 2 reported:

- `TOTAL 40`
- `STATUS {'source_verified': 40}`
- `SCOPE {'individual_unit': 40}`
- `SPECIES {'cat': 20, 'dog': 20}`
- `FORM {'wet': 34, 'dry': 6}`
- `COLLISIONS []`

## Why Merrick is comparatively clean to research

Merrick's current US PDPs expose a retail UPC in the PriceSpider `ps-sku` field. For products with a single listed size, the exact current PDP gives a strong manufacturer-level chain:

`current product URL -> first PDP ps-sku -> exact package size -> current ingredient deck -> GA -> calories`

Do not assume that every `ps-sku` on a page belongs to the main product. Related-product widgets appear later in the HTML. For batch 2, only the **first PriceSpider SKU on the exact product PDP** was accepted, and every selected page listed one unambiguous `12.7 oz. Can` size.

For multi-size PDPs, verify size-to-UPC separately. Never infer neighboring codes.

## Batch 1 — 20 current cat individual units

### Wet, 3 oz cans

- `022808000839` — Purrfect Bistro Simmered Beef, Tomato & Wild Rice Recipe Grilled in Sauce
- `022808000754` — Purrfect Bistro Savory Salmon & Sweet Potato Recipe in Rich Gravy
- `022808000891` — Purrfect Bistro Braised Pork, Carrot & Barley Recipe Grilled in Sauce
- `022808000778` — Purrfect Bistro Stewed Chicken, Beef & Carrot Recipe in Rich Gravy
- `022808000853` — Purrfect Bistro Wild-Caught Cod, Spinach & Wild Rice Recipe Grilled in Sauce
- `022808000792` — Purrfect Bistro Wild-Caught Tuna, Cod & Carrot Recipe in Rich Gravy
- `022808382539` — Purrfect Bistro Grain Free Chicken Recipe Pâté
- `022808382614` — Purrfect Bistro Grain Free Duck Recipe Pâté
- `022808382577` — Purrfect Bistro Grain Free Tuna Recipe Pâté
- `022808382638` — Purrfect Bistro Grain Free Beef Recipe Pâté
- `022808382591` — Purrfect Bistro Grain Free Turkey Recipe Pâté
- `022808383277` — Purrfect Bistro Grain Free Land & Sea Recipe Pâté
- `022808382553` — Purrfect Bistro Grain Free Salmon Recipe Pâté
- `022808385103` — Purrfect Bistro Grain Free Rabbit Recipe Pâté

### Dry individual bags

- `022808001317` — Chicken & Sweet Potato, 4 lb
- `022808001355` — Salmon & Sweet Potato, 4 lb
- `022808001393` — Wild-Caught Ocean Whitefish & Spinach, 4 lb
- `022808001454` — Pasture-Raised Lamb & Carrots, 4 lb
- `022808383109` — Chicken & Sweet Potato, 12 lb
- `022808383123` — Salmon & Sweet Potato, 12 lb

### Batch-1 controlled-vocabulary repair

During batch 2 the ledger was checked against `lib/presentation.ts`. Several batch-1 records had incorrectly used free-text/category wording in `texture` or `presentation` (for example `grain free` or a combined phrase such as `grilled in sauce`). These fields were normalized to the repository's controlled vocabulary.

Every affected batch-1 record now carries an explicit verification note. **No barcode identity, ingredients, GA, calories, size, or formula evidence changed.**

## Batch 2 — 20 current dog wet individual cans, 12.7 oz

- `022808001997` — Grain Free Cowboy Cookout In Gravy
- `022808283010` — Chunky Grain Free Big Texas Steak Tips Dinner in Gravy
- `022808284000` — Slow-Cooked BBQ Texas Style with Braised Beef
- `022808280040` — Kitchen Comforts Lamb Shepherd's Pie
- `022808390046` — Grain Free Limited Ingredient Diet Real Lamb Recipe
- `022808370024` — Backcountry Grain Free Real Beef Dinner
- `022808470144` — Backcountry Grain Free Hero's Banquet Stew
- `022808390916` — Limited Ingredient Diet With Healthy Grains Real Chicken & Brown Rice Recipe
- `022808280064` — Kitchen Comforts Turkey Meatloaf
- `022808280002` — Kitchen Comforts Chicken Casserole
- `022808280026` — Kitchen Comforts Beef Tips & Rice Stew
- `022808284093` — Slow-Cooked BBQ Kentucky Style with Chopped Lamb
- `022808390930` — Limited Ingredient Diet With Healthy Grains Real Turkey & Brown Rice Recipe
- `022808284031` — Slow-Cooked BBQ Memphis Style with Glazed Chicken
- `022808284017` — Slow-Cooked BBQ Kansas City Style with Chopped Pork
- `022808003342` — Grain Free Real Beef, Lamb + Bison Dinner
- `022808282976` — Chunky Grain Free Carver's Delight Dinner in Gravy
- `022808282938` — Chunky Grain Free Colossal Chicken Dinner in Gravy
- `022808282877` — Chunky Grain Free Pappy's Pot Roast Dinner in Gravy
- `022808002864` — Wilderness Blend in Gravy Grain Free Wet Dog Food

All 20 batch-2 products were read from their exact current Merrick PDPs. Each page's first PriceSpider `ps-sku` matched the stored UPC, each page listed exactly `12.7 oz. Can`, and the current official page supplied the complete ingredient order, printed GA, and calorie statement.

### Life-stage rule discovered in batch 2

Do **not** infer `adult` merely because a product is ordinary adult-market food. The current PDP text explicitly prints adult context for only some of these products.

Batch 2 therefore stores:

- 10 records with `life_stage: "adult"` because the current page explicitly says adult
- 10 records with `life_stage: null` because the captured current product/formula text does not explicitly state a stage

This is intentional and follows the repository rule that absence is not a claim.

### Texture / presentation rule

Use the controlled vocabularies from `lib/presentation.ts`:

- texture describes the physical cut/form (`chunks`, `stew`, `loaf`, `pate`, etc.)
- presentation describes what it is suspended in (`in_gravy`, `in_sauce`, `plain`, etc.)
- when the current page does not explicitly support a texture, use `unknown`; do not invent one

Batch 2 intentionally contains 12 `unknown` textures where Merrick does not clearly name a controlled texture. That is preferable to guessing.

## Existing formula-generation cautions

### Cat Rabbit pâté

UPC `022808385103` has a current Merrick formula deck (`B294423`) that differs from stale retailer copy indexed under the same UPC. The ledger stores the current official Merrick generation. Do not merge the legacy 900 kcal/kg / 77 kcal-per-can panel into it.

### Cat Chicken and Salmon 12 lb dry

Some retailer pages used for exact 12 lb UPC identity retain older formula text. The ledger deliberately uses:

- retailer evidence only for **12 lb size ↔ UPC identity**
- current Merrick PDP/deck for **ingredients, GA, and calories**

Keep those generations separate.

## Still unresolved / next research order

1. Re-fetch this 40-record ledger and rebuild all global exclusions.
2. Keep trying to prove exact current 12 lb UPCs for cat Whitefish & Spinach and Lamb & Carrots. Both 12 lb sizes are current, but do not add them until the exact size-to-UPC mapping is proven.
3. Continue the current Merrick dog wet catalog. The exact-PDP sweep found substantially more current, exclusion-clean candidates than were needed for batch 2, so another high-quality 20 should be possible without touching history.
4. Good next dog-wet areas include the remaining Grain Free cans, Backcountry cans, current Lil' Plates 3.5 oz tubs, and current puppy cans/tubs. For every product, keep package-size identity exact.
5. Avoid Lil' Plates Petite Pâté pages that expose both `3 oz. Can` and `3-3 oz. Cans` until the individual-can UPC and the multi-can package UPC are separately mapped.
6. After current wet coverage, move through current dog dry size variants. Multi-size pages require separate size-to-UPC proof.
7. Supplemental cat products (Finishing Sauces, Petite Parfaits, Bone Broths) can be researched later as active individual retail products if useful to scanner coverage, but they should not displace complete-and-balanced food while plentiful food SKU remain.
8. Never fill a batch with discontinued/history/case noise. Fewer than 20 is acceptable if the active/provable pool eventually runs out.

## Validation workflow for every next batch

Before write:

- scan `data/known-products.ts`
- scan `data/known-formulas.ts`
- scan `data/wrong-barcodes.ts`
- scan `docs/CATALOG-CONFLICTS.md`
- scan every `research/deep-research-*.json`
- include codes collected earlier in the same batch
- validate UPC/EAN check digit and canonical GTIN-14
- verify values against current controlled vocabularies

For `source_verified`, require the full gate from `research/AGENTS.md`: exact unit barcode, exact size mapping, matching current formula generation, complete ingredient order, printed guaranteed analysis, calories, life-stage/adequacy where printed, sources, and no repository collision.

After write:

- commit
- re-fetch/checkout the remote branch
- parse the committed JSON
- confirm total and unique UPCs
- re-run checksums and GTIN-14
- confirm scope/status/species/form counts
- validate controlled texture/presentation values
- re-run exclusions excluding the target ledger itself
- only then report the batch complete

## Bottom line

Merrick is now at **40 active, source-verified individual retail barcodes: 20 cat + 20 dog**. Continue from this exact baseline and stay on the active market.