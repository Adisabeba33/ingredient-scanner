# TheraDiet Research Handoff

Updated: 2026-08-30

## 1. Brand identity

- **Exact pack spelling:** `TheraDiet` (capital T and D), as printed on current Rayne Nutrition package artwork.
- **Trademark / owner:** THERADIET is a live U.S. registered mark owned by **Baystride, Inc.** for pet food (USPTO serial 88357840 / registration 6070556).
- **Operating name / manufacturer identity used in this ledger:** **Baystride, Inc. dba Rayne Nutrition.** A U.S. government business listing identifies RAYNE NUTRITION with legal name BAYSTRIDE INC; current product pages and package artwork are published by Rayne Nutrition.
- **Market:** U.S.-first for this ledger. Canadian Rayne material is corroboration only and is not used to define a U.S. formula or barcode.
- **Sales channel:** current U.S. therapeutic diets are sold directly by Rayne with veterinarian verification; Rayne also describes veterinary-exclusive distribution.
- **Observed barcode prefixes:** current/late-generation TheraDiet leads repeatedly use `013189…`; older Rayne product records also occur under `856361…`. These are observed product-code families, **not a claim that a GS1 certificate was independently retrieved**. The repository currently has neither prefix in `data/gs1-prefixes.ts`; seeding must verify ownership before adding it.
- **Identity sources:**
  - https://trademarks.justia.com/883/57/theradiet-88357840.html
  - https://www.brla.gov/Archive/ViewFile/Item/776
  - https://raynenutrition.com/

## 2. Ranges used in this ledger

The current ledger uses these `product_line` values exactly:

- `Rabbit-MAINT`
- `Low Fat Kangaroo-MAINT`

No other range spelling has been written into the ledger yet.

## 3. Coverage

### Rabbit-MAINT — partial

Researched in batch 1:

- Canine dry, with Chickpea Formula, 24.2 lb — current formula complete; older exact-size barcode proof exists; held at `needs_physical_label` because the current bag barcode itself is not publicly exposed.
- Canine Chunky Stew, 12.5 oz / 354 g — current formula and current UPC evidence; `source_verified`.
- Feline Chunky Stew outer case, 24 x 6.4 oz — current case identity exists; older outer-case GTIN evidence exists; held at `needs_physical_label` until a current outer-carton barcode is seen.

Known current Rabbit-MAINT products/sizes beyond this batch remain incomplete where the public web exposes a Rayne internal product/deck code but no trustworthy GTIN.

### Low Fat Kangaroo-MAINT — partial

Researched through batch 2:

- Canine Chunky Stew, 12.5 oz / 354 g — current formula plus multiple current UPC-bearing listings with 2027 expiration; `source_verified`.
- Canine dry with Chickpea Formula, 24 lb — current RC302-5 formula plus a current exact-size retail mapping to UPC-A `856361001541`, independently corroborated as GTIN `0856361001541`; `source_verified`. The current package panel has a self-conflicting cup-energy statement (105 g/cup × 3304 kcal/kg ≠ 313 kcal/cup), preserved in `conflicts`.

The current 6.6 lb bag and other Low Fat Kangaroo-MAINT sizes/forms remain unresolved where only Rayne/internal MPN-style identifiers or a product listing without a proven package barcode are publicly exposed.

### Other current TheraDiet ranges

Untouched in the ledger so far. Discovery found current Rayne therapeutic products beyond the two ranges above, but they were deliberately not padded into this batch without barcode evidence.

## 4. Unresolved tail by reason

### Current product and formula exist, but no current GS1 barcode proof

This is the dominant blocker. Rayne publishes excellent current product/label data, but many pages expose only product/deck codes such as `VC…` / `RC…`, not a UPC/GTIN. Those codes are **not barcodes** and must never be promoted into the `upc` field.

Next pass should search by exact current product name + printed size and only add a record when a real GTIN/UPC is separately proven.

### Historical barcode evidence versus current packaging

`013189409243` (Rabbit-MAINT canine dry 24.2 lb) is tied to the exact size/product in an older barcode record. The same exact product/size is current, but the live Rayne package assets do not show the barcode. One current physical bag settles it.

`013189409632` is tied to an older `24/6.4 oz` feline Rabbit-MAINT case. Rayne currently sells the same case configuration, but a current outer carton barcode is required before assuming continuity.

Older `856361…` Rayne codes also exist for former/current-looking sizes. Treat those as a separate historical generation until a package proves otherwise.

### Retailer UPC-field corruption

Low Fat Kangaroo-MAINT RC002-9 is a useful warning pattern: several 2026 listings put `0013189409052` directly in UPC, while other copies for the same exact item put `013189409052` in MPN and expose `8885004071957` or `Does Not Apply` as UPC. The ledger records both sides. Do not copy a single retailer field without cross-checking product identity, check digit, and independent listings.

### Multi-life-stage statement does not fit one current controlled value cleanly

The current Rabbit-MAINT canine dry package states AAFCO levels for **adult maintenance and growth**. That is not safely equivalent to repository `all` (which can imply broader life-stage coverage). The record therefore keeps `life_stage: null` and preserves the exact statement in `verification_notes`. A future schema may need a multi-stage adequacy representation.

## 5. Anything the repository must learn

- **Potential new barcode family:** `013189…` appears repeatedly on current/late-generation TheraDiet leads. Verify GS1 ownership during seeding before adding to `data/gs1-prefixes.ts`.
- **Second active/legacy barcode family:** `856361…` is not merely historical: batch 2 found current retail availability for the exact 24 lb Low Fat Kangaroo-MAINT bag under UPC-A `856361001541`, independently matching eBay GTIN `0856361001541`. Other older `856361…` records still need generation-by-generation proof; never replace them with `013189…` by assumption.
- **No texture/presentation vocabulary extension is required yet.** Current records fit `kibble`, `stew`, and `plain`.
- **TetraPak:** current stew units are 354 g cartons/boxes. Existing `package_type: "box"` is adequate for this research pass; no production vocabulary edit is authorized here.

## 6. Where this pass stopped and why

After batch 2 the ledger holds **5 records**. The campaign is intentionally continuing in short evidence-driven batches rather than being padded to 20.

Reason: targeted searches continue to find active TheraDiet products, but most public evidence still stops at manufacturer/internal product codes rather than proven GS1 barcodes. Batch 2 added the one newly proven exact-size UPC (`856361001541`) and left weaker leads out. `research/BRIEF-THERADIET.md` explicitly says twenty is a limit, not a quota, and forbids weak filler. The next pass should keep working the missing-barcode gap rather than restart broad discovery.

## Batch reports

### TheraDiet batch 1

- added: 4 (running total: 4)
- source_verified: 2
- needs_physical_label: 2
- candidate: 0
- rejected: 0
- individual_unit: 3
- case: 1
- UPCs: `013189409243`, `013189409076`, `013189409052`, `013189409632`
- exclusion check: all four exact UPC strings returned no repository code-search match before append
- new this batch:
  - exact brand/owner/operator identity established
  - observed `013189…` current/late-generation code family
  - observed older `856361…` Rayne code family
  - multi-stage `adult maintenance and growth` adequacy gap documented
- checker: connector-runtime structural preflight clean; exact `node scripts/check-ledger.mjs` invocation unavailable because the shell has no repository checkout/network. Live repository code-search duplicate checks were run separately for all four UPCs.
- commit: see draft PR batch comment for exact SHA
- remote verified: see draft PR batch comment


### TheraDiet batch 2

- added: 1 (running total: 5)
- source_verified added: 1
- needs_physical_label added: 0
- UPC added: `856361001541`
- product: Low Fat Kangaroo-MAINT with Chickpea Formula Dry Dog Food, 24 lb
- barcode proof: current Blylee's exact 24 lb retail page maps the item to SKU/UPC-A `856361001541`; eBay independently identifies the exact 24 lb product as GTIN/UPC `0856361001541`; both canonicalize to `00856361001541`
- exclusion check: exact UPC-A and canonical GTIN-14 returned no repository code-search match before append
- formula proof: current Rayne RC302-5 package panel
- material conflict: package panel prints `1 cup/105 g = 313 kcal/cup` and `3304 kcal/kg`; 105 g at 3304 kcal/kg is 346.9 kcal, so the label is internally inconsistent. Both printed claims are preserved and the discrepancy is documented rather than repaired.
- checker: connector-runtime structural preflight clean after append; exact local `node scripts/check-ledger.mjs` invocation remains unavailable in this connector runtime
- commit: see draft PR batch comment for exact SHA
- remote verified: see draft PR batch comment
