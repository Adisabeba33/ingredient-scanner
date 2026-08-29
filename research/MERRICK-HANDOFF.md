# Merrick Deep Research Handoff

Last updated: 2026-08-28

## Read this first

This is the current handoff for Merrick barcode research in `Adisabeba33/ingredient-scanner`.

Before any new Merrick work, read `research/AGENTS.md` and treat it as binding. Rebuild the live exclusion set from the repository before every batch; never rely only on the UPC list in this handoff.

Current branch: `agent/deep-research-merrick`
Primary ledger: `research/deep-research-merrick.json`
Research mode: **ACTIVE MARKET ONLY**

Do not merge the research PR unless the user explicitly asks.

## User priority: active retail market only

The user currently wants barcodes for products that are genuinely current and realistically purchasable now. Do not spend time mining discontinued, historical, archive-only, old packaging, or inactive regional SKUs merely to increase the record count.

Market priority:

1. United States
2. Canada
3. Australia / New Zealand if relevant and currently sold
4. Europe / UK if relevant and currently sold

A surviving old retailer page, cached result, stale product database entry, or discontinued listing is not enough to qualify a product as active.

Prefer **individual retail units**. A variety pack, case, tray, or other outer-package barcode may be researched later if useful to the scanner, but its `barcode_scope` must remain honest and it must never be substituted for a contained can/bag UPC.

## Current Merrick state

The first Merrick batch is complete in `research/deep-research-merrick.json`:

- 20 records total
- 20 `source_verified`
- 20 `individual_unit`
- species: cat only
- 14 wet 3 oz cans
- 4 dry 4 lb bags
- 2 dry 12 lb bags
- 20/20 UPC-A check digits valid
- no collisions with the live repository exclusion set at commit time

The first data commit is:

`ce20f60d182cf249fcf1c954c94daefb8290eae9` — `research: add first 20 active Merrick cat barcodes`

## Why Merrick is comparatively clean to research

The current Merrick US site exposes retail UPCs in PriceSpider `ps-sku` fields on live product cards/PDPs. This gives strong manufacturer-level barcode identity for many current products instead of relying on inferred EAN sequences or retailer SKU numbers.

Still verify the package size separately whenever a PDP contains multiple sizes. Do not assume the page's first/default PriceSpider code represents every size.

For formula data, prefer the current Merrick PDP/current ingredient deck. Merrick has reformulated some products, so a retailer can correctly identify the UPC while still carrying stale ingredient/GA/calorie copy. In that situation, use the retailer only for exact barcode-to-size identity and Merrick's current official page for the current formula generation, with the conflict documented.

## Batch 1 UPCs

### Current wet cat food — 3 oz individual cans

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

### Current dry cat food — individual bags

- `022808001317` — Chicken & Sweet Potato, 4 lb
- `022808001355` — Salmon & Sweet Potato, 4 lb
- `022808001393` — Wild-Caught Ocean Whitefish & Spinach, 4 lb
- `022808001454` — Pasture-Raised Lamb & Carrots, 4 lb
- `022808383109` — Chicken & Sweet Potato, 12 lb
- `022808383123` — Salmon & Sweet Potato, 12 lb

## Important formula-generation notes

### Rabbit pâté

UPC `022808385103` has a live-current Merrick formula deck (`B294423`) that differs from stale retailer copy still indexed under the same UPC. The current official Merrick formula is stored in the ledger. Do not merge the legacy 900 kcal/kg / 77 kcal-per-can panel into the current record.

### Dry Chicken and Salmon 12 lb

Merrick reformulated these recipes. Some retailer pages used for exact 12 lb UPC identity retain older formula text. The ledger deliberately uses:

- exact retailer evidence for **12 lb size ↔ UPC identity**
- current Merrick official PDP/deck for **ingredients, GA and calories**

Do not downgrade these records merely because a stale retailer formula differs; instead preserve the generation conflict and verify against Merrick's current official formula.

## Current official cat-market map

The current Merrick cat catalog exposed 33 unique product-card PriceSpider UPCs during the initial scan. This is not the same thing as “33 total cat barcodes,” because some PDPs list more than one package size and the card exposes only a default/current purchase code.

The first batch deliberately prioritizes complete-and-balanced individual food units rather than variety-pack outer codes or supplemental treats/toppers.

Current cat categories observed include:

- Purrfect Bistro wet cans
- Purrfect Bistro dry foods
- Purrfect Bistro Finishing Sauces
- Purrfect Bistro Petite Parfaits
- Bone Broths
- wet variety packs

Do not count a product as fully covered until **each active individual package size** has an exact barcode-to-size mapping.

## Best next research order

When continuing Merrick:

1. Re-fetch the current ledger and rebuild all global exclusions.
2. Finish unresolved **current cat individual food size variants** first. In particular, look for exact current 12 lb UPCs for the Whitefish & Spinach and Lamb & Carrots dry recipes if those sizes remain actively orderable. Do not infer them from neighboring codes.
3. Decide whether current supplemental cat retail units (Finishing Sauces, Petite Parfaits, Bone Broths) are useful to the scanner; if yes, research their exact retail package barcode, full ingredient panel, GA and calories as separate active products.
4. Do not use the two current wet variety-pack outer UPCs as substitutes for the 3 oz cans. Only add them later with `barcode_scope: multipack` if outer-pack scanning is desired.
5. Once current cat individual food coverage is exhausted, move to **current Merrick dog** products and continue in batches of approximately 20.
6. If fewer than 20 genuinely active, fully provable records are available, add fewer than 20. Never fill a batch with discontinued/history/case noise.

## Validation workflow for every next batch

Before write:

- scan `data/known-products.ts`
- scan `data/known-formulas.ts`
- scan `data/wrong-barcodes.ts`
- scan `docs/CATALOG-CONFLICTS.md`
- scan every `research/deep-research-*.json`
- include every code already collected in the current batch
- validate UPC/EAN check digit and canonical GTIN-14

For `source_verified`, require the full gate from `research/AGENTS.md`: exact unit barcode, exact size mapping, current matching formula generation, complete ingredient order, printed guaranteed analysis, calories, life-stage/adequacy where printed, sources, and no repository collision.

After write:

- commit
- re-fetch/checkout the remote branch
- parse the committed JSON
- confirm count and unique UPCs
- re-run checksums
- confirm scope/status counts
- re-run exclusions excluding the target ledger itself
- only then report the batch complete

## Bottom line

Merrick research has a clean start: **20 active cat individual-unit barcodes are source-verified**. Continue from this exact baseline; do not rediscover these codes and do not pivot into old/discontinued Merrick products unless the user later explicitly asks for archival coverage.
