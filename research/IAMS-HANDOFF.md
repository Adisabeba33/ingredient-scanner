# IAMS research handoff

This session had access to real public product pages through web retrieval, but **no shell**; per AGENTS.md §3a I did not merge or commit a full ledger, did not run or simulate the Node checker, and staged the new records as a bare JSON array in `research/incoming/iams-batch-01.json`.

## Batch 1
- Assigned brand: Iams only.
- Staging path: `research/incoming/iams-batch-01.json`.
- Added: 20 records.
- Status: 0 source_verified; 20 needs_physical_label; 0 candidate; 0 rejected.
- Scope: 20 individual-unit US dry bags.
- Lines tested: Advanced Health (4 exact sizes of Healthy Digestion) and ProActive Health (16 bags across several size ladders).
- Catalog files and application code were not edited.

## Prefix
All 20 staged UPCs begin with **019014**. The evidence spans two printed ranges, Advanced Health and ProActive Health. This is therefore an observed-on-20-US-packs prefix, **not GS1/GEPIR-confirmed** in this session. Recommendation: add only with that qualification after the shell-enabled merge/check pass confirms there is no collision.

## Range-name findings
- `Advanced Health` is a real current US range: the current IAMS manufacturer page prints IAMS ADVANCED HEALTH and exposes the 6 / 13.5 / 27 / 36 lb Healthy Digestion ladder.
- `ProActive Health` is printed by the US distributor evidence across the dry bags in this batch.
- `Minichunks` was not used as a product_line. Distributor evidence prints it beneath ProActive Health, consistent with the brief's hypothesis that it is a variant/kibble designation rather than a separate range. Recommendation: remove `Minichunks` from the brand-entry lines only during a separate seeding/catalog task, after a current pack/deck confirms the current spelling.
- No new range outside the existing brand entry was established in this batch.

## US / Europe boundary
European pages rejected as ledger evidence: **0 counted**. Search results with non-US/EAN-style material were not promoted into records; the batch was built from US IAMS pages and a US distributor catalog. No European composition or analytical-constituents panel was substituted for a US label.

## Evidence limitation / physical-label tail
The current IAMS Healthy Digestion page is readable, but its ingredient and guaranteed-analysis panels are exposed as images in the accessible page representation. For ProActive Health, the distributor catalog proves exact UPC + identity + size, but I did not obtain a readable current primary label deck for the complete formula fields. Therefore all 20 records are intentionally `needs_physical_label`, with formula/GA/calorie fields left unproven rather than filled from stale or secondary generations.

Dry calorie arithmetic witness was not available because current printed calorie panels were not proven; no per-bag calorie number was derived.

## UPCs staged
019014805747, 019014805754, 019014805761, 019014805778,
019014711123, 019014610891, 019014700677,
019014803316, 019014803347, 019014803330, 019014805358,
019014700776, 019014805303,
019014610976, 019014700721, 019014805037,
019014611331, 019014700684, 019014711147, 019014612062.

## Checker / inventory / remote verification
Because there was no shell, I did **not** run `node scripts/brand-inventory.mjs` or `node scripts/check-ledger.mjs`, and I did not pretend that either was green. The inventory was not hand-reconstructed. A shell-enabled pass must merge the incoming array into `research/deep-research-iams.json`, regenerate `research/INVENTORY-IAMS.md`, run the checker to exit 0, answer every WARN, and delete the incoming file.

Incoming batch commit: `41fea1eb26f62e53a3a60181c622a924ab40b8ec`.

## Decisions that differ from the brief
1. The requested final ledger commit was not made because this session has no shell; this follows the brief's explicit AGENTS §3a fallback.
2. The inventory and checker were not run or simulated for the same reason.
3. Zero records were marked source_verified because the complete current formula/GA/calorie evidence required by AGENTS §10 was not readable/proven. This is deliberate.
4. No GS1 prefix file or brand-line file was edited because the assignment says research staging only.



## Batch 2
- Staging path: `research/incoming/iams-batch-02.json`.
- Added: 20 records (running incoming total: 40).
- Status this batch: 0 source_verified; 20 needs_physical_label.
- Scope: 14 additional ProActive Health dry bags plus 6 ProActive Health wet dog units.
- Current IAMS manufacturer evidence directly confirms that **Minichunks is presented under ProActive Health** and describes Minichunks as the smaller kibble; it should not be treated as a peer product_line to ProActive Health.
- The current IAMS Minichunks page exposes a broader size ladder (3.3, 5, 7, 11, 15, 30, 38.5, 40, 44, 50 lb), but only sizes with separately proven UPCs were staged.
- ADMC evidence also surfaced additional puppy, small-breed and wet-food identities with exact UPC + unit size.

### Batch 2 UPCs
019014610860, 019014711086, 019014610907, 019014700714, 019014700769,
019014805020, 019014700691, 019014803446, 019014803453, 019014803378,
019014610945, 019014700738, 019014711109, 019014704200, 019014025206,
019014025190, 019014013302, 019014013326, 019014013296, 019014013319.

### Batch 2 evidence notes
The six wet records above are dog wet food, not Perfect Portions. Perfect Portions research found six exact 2.6 oz cat UPCs in the same US distributor source (Chicken 019014802296, Salmon 019014802326, Tuna 019014802319, Indoor Salmon 019014802340, Indoor Turkey 019014802302, Optimal Metabolism Chicken 019014802357), and the current IAMS Tuna page confirms the twin easy-peel/two-individual-meals construction. They are deliberately reserved for the next batch so the tray/portion/barcode-scope question can be handled explicitly rather than mixed into this batch.

European pages rejected as ledger evidence remains 0 counted; no EU composition was used.

Batch 2 incoming commit: `86d9509a11b9b58d21e27744e0ad5cc53c16dba8`.

As in batch 1, this environment still has no shell. The Node inventory/checker were not run or simulated; both incoming arrays require a shell-enabled merge/check pass before promotion or seeding.


## Batch 3
- Staging path: `research/incoming/iams-batch-03.json`.
- Added: 20 records (running incoming total: 60).
- Status this batch: 0 source_verified; 20 needs_physical_label.
- Scope: 6 Perfect Portions cat wet twin-tray retail units + 14 ProActive Health cat dry bags.
- Perfect Portions barcode scope was handled explicitly: ADMC lists each UPC as a **2.6 oz unit** and 24 units/case; current IAMS pages describe the retail package as two individual meals/servings in easy-peel trays. The ledger therefore records the UPC as the retail twin-tray `individual_unit`, `size: "2.6 oz"`, `package_type: "tray"`, and calorie `unit_name: "serving"`. No serving-ounce or calorie number was inferred from the 2.6 oz package weight.
- Cat dry records cover Indoor Weight & Hairball Care, Hairball Care with Chicken, Healthy Adult Original with Chicken, Healthy Kitten with Chicken, Healthy Senior with Chicken, and Sensitive Digestion & Skin.
- Current IAMS pages confirm several of these current cat ranges and size ladders, but nutrition/ingredient panels remain image-only in the accessible representation; no stale deck was substituted.

### Batch 3 UPCs
019014802296, 019014802326, 019014802319, 019014802340, 019014802302,
019014802357, 019014712465, 019014712458, 019014712298, 019014712380,
019014712434, 019014611911, 019014712564, 019014712571, 019014712267,
019014712274, 019014712496, 019014712502, 019014712625, 019014805105.

European pages rejected as ledger evidence remains 0 counted. Batch 3 incoming commit: `025c7d3cfb31347a0c15743e71116cf8e743093e`.

Shell is still unavailable, so the Node inventory/checker were not run or simulated. All three incoming arrays require shell-enabled merge/check before promotion/seeding.


## Batch 4 — evidence-limited tail
- Staging path: `research/incoming/iams-batch-04.json`.
- Added: **4 records**, not padded to 20 (running incoming total: **64**).
- Status: 0 source_verified; 4 needs_physical_label.
- New exact US units: Sensitive Digestion & Skin 6 lb / 13 lb and Urinary Tract Health with Chicken 3.5 lb / 7 lb.
- The 2025 ADMC catalog has now been exhausted for new IAMS unit UPCs beyond the 60 already staged plus these four. Its Urinary rows are duplicated at two price points, not four products.
- The 13 lb Sensitive Digestion row is printed by ADMC as `19014805129` (11 digits). It is staged as `019014805129` only with an explicit conflict: restored leading zero, consistent with the observed IAMS prefix and UPC-A check digit. Physical-pack confirmation remains desirable.
- Current IAMS manufacturer pages confirm Urinary Tract Health and additional current cat recipes/size ladders (including Healthy Adult Salmon, Indoor Weight & Hairball Care Salmon, Healthy Weight and newer Healthy Enjoyment), but I did **not** manufacture UPCs for those sizes. Retail search results that did not give an unambiguous 12-digit unit UPC were left out rather than used to fill a 20-record quota.
- This is the first batch intentionally shorter than 20 because the currently strong exact-UPC source is exhausted. Better evidence is required before adding the remaining current shelf.

Batch 4 incoming commit: `bf1b39d3157f6277c47cd9bd0ee4956bb7098f84`.

Shell remains unavailable; inventory/checker were not run or simulated.

## Stop point
Stopped after batch 4 with 64 total incoming records staged. The strong distributor UPC source is exhausted; next pass should prioritize alternate US retailer/distributor evidence for the newer cat shelf rather than padding records from ambiguous GTIN displays.
