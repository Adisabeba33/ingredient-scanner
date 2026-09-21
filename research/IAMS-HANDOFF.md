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


## Batch 5 — alternate-source second pass
- Staging path: `research/incoming/iams-batch-05.json`.
- Added: **15 records** (running incoming total: **79**).
- Status: 0 source_verified; 15 needs_physical_label.
- This pass deliberately switched away from the exhausted South ADMC list and used the newer North ADMC list, Mars qualifying-product evidence, Target/Kroger and specialist US retailers.
- New exact UPCs include: Perfect Portions Healthy Kitten 2.6 oz; Perfect Portions Indoor Salmon & Turkey 12 x 2.6 oz variety pack; Urinary Tract Health 16 lb; Healthy Adult Salmon & Tuna 3.5/7/16 lb; Indoor Weight & Hairball Care Salmon 16 lb; Long Hair Care 6 lb; Healthy Enjoyment Chicken & Salmon 3 lb; Healthy Weight 3.5/7 lb; Healthy Senior 3.5/16 lb; and legacy/current-evidence High Protein 3/13 lb.
- The Perfect Portions variety-pack UPC `019014802371` is explicitly `barcode_scope: multipack`; it is not filed as one 2.6 oz tray.
- Important taxonomy finding: **Healthy Enjoyment is a current printed IAMS range** on the manufacturer site and is not in the six-range memory list in `data/us-pet-brands.ts`. Recommend adding `Healthy Enjoyment` before seeding its products.
- The current IAMS Healthy Enjoyment page shows 3/6/15 lb sizes. Only the 3 lb exact UPC (`019014806379`) was staged in this pass; retailer evidence for 6 lb conflicts across feeds (`0001901480638` in Kroger-family feeds versus `019014807093` in a Canadian distributor), so neither was silently normalized into the US ledger without stronger pack evidence.
- Healthy Adult Salmon/Tuna naming has changed across sources: older Mars/ADMC calls it Salmon & Tuna, while current IAMS/Target merchandising often shortens the front-facing name to Salmon. UPC `019014804122` is independently bound to the 7 lb US unit by both. Keep the naming history visible rather than treating it as two products.

Batch 5 incoming commit: `04550c1b663ef8888140f22a26d8e2324f0169ec`.

Shell remains unavailable; inventory/checker were not run or simulated.


## Batch 6 — Healthy Enjoyment size-ladder resolution
- Staging path: `research/incoming/iams-batch-06.json`.
- Added: **5 records** (running incoming total: **84**).
- Status: 0 source_verified; 5 needs_physical_label.
- Resolved the previously conflicting Healthy Enjoyment size ladder with exact US UPC-to-size bindings:
  - Chicken & Salmon 6 lb — `019014806386`
  - Chicken & Salmon 15 lb — `019014806416`
  - Chicken & Beef 3 lb — `019014806324`
  - Chicken & Beef 6 lb — `019014806348`
  - Chicken & Beef 15 lb — `019014806362`
- Together with Batch 5's Chicken & Salmon 3 lb `019014806379`, the Chicken & Salmon US ladder is now 3/6/15 lb with individually bound UPCs.
- The earlier Canadian `019014807093` 6 lb feed is a market-specific/conflicting listing and was **not** substituted for the US 6 lb code. Multiple US retailers independently expose `019014806386` for the 6 lb US bag.
- Chicken & Beef has strong US UPC evidence for 3/6/15 lb, but 2026 Chewy evidence explicitly says the flavor has been discontinued. Keep these as proven historical/recent US SKUs, not as a claim that all three remain current shelf.
- No additional speculative size-ladder codes were generated.

Batch 6 incoming commit: `b6bce202933e9da496f7e8956a6ce203100b1b49`.

Shell remains unavailable; inventory/checker were not run or simulated.


## Batch 7 — thin-tail Mars/IAMS evidence
- Staging path: `research/incoming/iams-batch-07.json`.
- Added: **8 records** (running incoming total: **92**).
- Status: 0 source_verified; 8 needs_physical_label.
- Added Perfect Portions Healthy Adult Chicken & Tuna variety pack `019014802364` (12 x 2.6 oz, explicit `multipack` scope).
- Added Mars-qualified ProActive Health High Protein cat dry size ladder: 5 lb `019014804702`, 12 lb `019014804719`, 22 lb `019014804726`.
- Added missing dog size-ladder units from IAMS/Mars qualifying-product evidence: Adult Large Breed 11 lb `019014804870`, 40 lb `019014707294`, 50 lb `019014044191`; Smart Puppy Large Breed 11 lb `019014805402`.
- The 50 lb Large Breed UPC has contemporary 2026 US marketplace corroboration in addition to the older IAMS qualifying list.
- No guessed neighbors were added. This pass specifically searched the unresolved `019014802xxx`, `804xxx`, `805xxx` and old size-ladder tails and stopped where only barcode-database similarity suggestions remained.
- Target currently exposes full ingredients and GA for some Perfect Portions (notably Healthy Kitten and the Chicken/Tuna variety pack). These are useful upgrade leads, but `source_verified` still requires calories + adequacy + current deck completeness together; this batch does not promote partial panels.

Batch 7 incoming commit: `8c4a8446d37349e3ceb627549af863d69fa07483`.

Shell remains unavailable; inventory/checker were not run or simulated.


## Source-upgrade pass 1 — Perfect Portions
- Revisited Batch 3 rather than adding new UPCs.
- Upgraded evidence for three exact Perfect Portions adult twin-tray UPCs: Chicken `019014802296`, Salmon `019014802326`, Tuna `019014802319`.
- Current US Target product panels were added alongside the existing manufacturer/distributor identity evidence. The staged rows now carry the displayed complete ingredient list, core GA (protein 9% min, fat 5% min, fiber 1.5% max, moisture 78% max) and 38 kcal/serving for these three recipes.
- **No status inflation:** all three remain `needs_physical_label`. The accessible retailer/manufacturer evidence still does not prove the complete current AAFCO adequacy statement/deck and every printed guarantee together, which AGENTS §10 requires for `source_verified`.
- Batch 3 evidence-upgrade commit: `be229c45d744d693823082a7d1409acbf10bdf87`.
- Next upgrade targets: Healthy Kitten `019014802333`, Chicken & Tuna variety pack `019014802364`, then the remaining Perfect Portions adult/indoor variants.

## Stop point
Stopped after batch 7 with 92 total incoming records staged. The remaining new-UPC tail is now sparse. Highest-value next work is a source-upgrade pass on the 92 staged records (especially Perfect Portions, where current Target pages expose ingredients/GA) plus targeted searches for any unresolved current size-ladder UPCs.
