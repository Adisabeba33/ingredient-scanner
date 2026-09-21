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


## Source-upgrade pass 2 — Kitten + variety packs
- Upgraded Healthy Kitten Perfect Portions `019014802333`: added current US Target ingredient panel, core GA and 38 kcal/serving. It remains `needs_physical_label` because the complete current AAFCO adequacy/deck evidence is still not proven together.
- Upgraded Indoor Salmon & Turkey variety pack `019014802371` and Healthy Adult Chicken & Tuna variety pack `019014802364` with current Target identity/scope corroboration.
- Both variety packs remain `needs_physical_label`. They contain distinct recipes, so no synthetic single ingredient/GA deck was created for the box; exact per-flavor current panels are required.
- Commits: Batch 5 upgrade `d5fea916107c8e26f5bfbc9a47b2b146478e7cfb`; Batch 7 upgrade `828783f4c5ed8bc56d877e21841a99163d47ee74`.
- Upgrade result so far: 6 Perfect Portions records materially strengthened across passes 1–2, but 0 promoted to source_verified because AGENTS §10 remains stricter than the currently accessible evidence.


## Source-upgrade pass 3 + Batch 8 — remaining pâté and current Cuts in Gravy
- Revisited the three remaining Batch 3 pâté records: Indoor Salmon `019014802340`, Indoor Turkey `019014802302`, Optimal Metabolism Chicken `019014802357`.
- Indoor Salmon now has independent exact-UPC identity/twin-tray corroboration. A Canadian retailer exposes ingredients, but those were **not copied** into the US formula fields because the Iams brief explicitly forbids cross-market formula substitution.
- Indoor Turkey was re-confirmed by the North ADMC US list; Optimal Metabolism was independently re-confirmed by Mars qualifying-product evidence. Neither has a complete current US deck accessible enough for promotion.
- New current-shelf discovery: staged `research/incoming/iams-batch-08.json` with **3 additional US Perfect Portions Cuts in Gravy UPCs**, bringing the running incoming total from 92 to **95**:
  - `019014803217` — Indoor Cuts in Gravy Chicken, 2.6 oz retail twin tray.
  - `019014802708` — Indoor Cuts in Gravy Salmon & Tuna, 12 x 2.6 oz variety multipack.
  - `019014807963` — Cuts in Gravy Chicken/Tuna/Salmon, 24 x 2.6 oz multipack.
- Target exposes a particularly strong panel for `019014803217`: exact UPC, ingredients and extended GA (protein 9%, fat 4%, fiber 1.04%, moisture 82%, ash 3.54%, calcium 0.25%, potassium 0.2%, vitamin E 80 IU/kg, taurine 0.06%). It still lacks calories + complete adequacy/deck together, so it remains `needs_physical_label`.
- No variety-pack formula was synthesized from multiple recipes.
- Commits: Batch 3 upgrade `485fde34e8a49b5fcaffd0f2bd2f7a628f27b2db`; Batch 8 staging `50f3e86116c9339e236bb586cb273824e22a900f`.
- Running total: **95 staged Iams UPC records**. Source-upgrade work has materially strengthened all originally staged Perfect Portions pâté/variety targets, but 0 have been promoted to `source_verified` under the strict AGENTS §10 threshold.


## Batch 9 — current Perfect Portions Cuts/Sensitive sweep
- Staging path: `research/incoming/iams-batch-09.json`.
- Added: **6 current US Perfect Portions UPCs** (running incoming total: **101**).
- Status: 0 source_verified; 6 needs_physical_label.
- Exact current retail twin-tray UPCs staged from US Target evidence:
  - `019014803224` — Indoor Cuts in Gravy Salmon, 2.6 oz
  - `019014803231` — Indoor Cuts in Gravy Tuna, 2.6 oz
  - `019014807956` — Cuts in Gravy Chicken, 2.6 oz
  - `019014807970` — Cuts in Gravy Tuna, 2.6 oz
  - `019014807987` — Cuts in Gravy Salmon, 2.6 oz
  - `019014808069` — Sensitive Digestion & Skin Pâté Turkey, 2.6 oz
- All six are explicitly scoped as the 2.6 oz retail twin-tray unit, not one snapped serving and not an outer case.
- Formula fields remain conservative where Target's accessible representation does not expose a complete current panel; no values were copied from Canadian/EU pages.
- The IAMS wet-cat shelf has now crossed **100 staged UPC records overall for the brand campaign**; running total is 101.
- This pass confirms the newer `0190148079xx` / `0190148080xx` UPC block is genuine current US IAMS shelf, not a neighboring inferred sequence. No unstated neighbors were generated.

Batch 9 commit: `bfec717c71e6fc9fbafe5c097534022e354fcbf1`.

Shell remains unavailable; inventory/checker were not run or simulated.


## Source-upgrade pass 4 — variety nutrition + formula-version conflict
- No speculative new UPCs were added in this pass; effort went into resolving label evidence.
- Indoor Salmon & Turkey variety pack `019014802371`: current Target label panel now supplies the Salmon recipe GA (protein 9.5% min, fat 5% min, fiber 1% max, moisture 78% max, ash 4%, vitamin E 80 IU/kg, taurine 0.06%). Current Walmart independently states the 12 twin trays equal 24 servings and describes the product as complete and balanced. It remains `needs_physical_label` because the Turkey panel, calories and exact AAFCO adequacy statement are not all exposed together.
- Healthy Adult Chicken `019014802296`: a fresh current Target panel exposed a **material formula/version conflict** versus the ingredient deck captured in upgrade pass 1. The current Target GA also expands/corrects the row to fiber 1% max, ash 3.5% max, vitamin E 80 IU/kg and taurine 0.06%. The conflicting ingredient decks were not silently reconciled; a `conflicts` entry now blocks promotion until a current manufacturer/physical label settles the version.
- This pass is a useful warning for the wider upgrade campaign: retailer panels can be current enough to expose real reformulation drift, so source_verified should not be achieved by simply accumulating fields from different snapshots.
- Commits: Batch 5 upgrade `996b01cbe16afb539bae276958aab61f848db3d1`; Batch 3 conflict/GA update `f928331f472c8343008fda723859b39ff7d118eb`.
- Running staged UPC count remains **101**.


## Source-upgrade pass 5 — reformulation audit
- Audited Healthy Adult Salmon `019014802326` and Tuna `019014802319` against fresh current Target panels. Both show the same warning pattern already found on Chicken: current retailer ingredient/GA snapshots differ from the earlier captured panel evidence. Explicit `conflicts` were added; no cross-snapshot field merging was done.
- Result: all three core Healthy Adult pâté flavors (Chicken/Salmon/Tuna) now have documented formula-version drift risk and should be resolved from a current physical/manufacturer label before any `source_verified` promotion.
- Sensitive Digestion & Skin Pâté Turkey `019014808069` gained independent current IAMS manufacturer identity confirmation. The accessible manufacturer page still does not expose the complete ingredients + GA + calories + exact AAFCO statement together, so status remains `needs_physical_label`.
- Indoor Cuts Salmon `019014803224` and Tuna `019014803231` were audited conservatively: exact US UPC binding retained, but no formula fields were imported from non-US mirrors or neighboring Cuts recipes.
- Commits: Batch 3 audit `71190e5edd2d10c8d6157008da42a4d0c1d21bef`; Batch 9 audit `9c3343ae64ca7b704075802f469bdf4ca7b84995`.
- Running staged UPC count remains **101**. This audit is increasingly showing that physical/current manufacturer label capture, rather than more retailer aggregation, is the bottleneck for promotion.


## Dry source-upgrade pass 1 — Minichunks + Healthy Digestion
- Pivoted from wet to dry as planned. No speculative UPCs added; running staged count remains **101**.
- Minichunks Chicken & Whole Grains: upgraded all six proven US bag-size UPCs in Batch 2 (`019014610860`, `019014711086`, `019014610907`, `019014700714`, `019014700769`, `019014805020`) with the shared current recipe panel: ingredients, GA and **3,646 kcal/kg / 380 kcal/cup**. Per-bag calories were deliberately not manufactured.
- The recipe-level GA captured for Minichunks is protein 25% min, fat 14% min, fiber 4% max, moisture 10% max, vitamin E 60 IU/kg, selenium 0.35 mg/kg and omega-6 fatty acids 2.5% min.
- All six remain `needs_physical_label`: exact size UPCs are proven, and the shared formula panel is strong, but the complete current AAFCO adequacy/deck/version evidence is not proven together for promotion under AGENTS §10.
- Advanced Health Healthy Digestion Chicken & Whole Grain: all four proven size UPCs (`019014805747`, `019014805754`, `019014805761`, `019014805778`) gained independent current IAMS manufacturer recipe/size-ladder corroboration. Formula fields were left conservative where the accessible representation was incomplete.
- Commits: Minichunks upgrade `2ed5c8c8f9bc9ca95373f31cde4ef56c31d0c3e6`; Healthy Digestion corroboration `8260d2c6b59418cb32df4c72afa77993a02f1b17`.
- Dry is proving more efficient than Perfect Portions because one current recipe panel can legitimately support several separately proven bag-size UPCs without conflating barcode identity or inventing per-bag nutrition.


## Dry source-upgrade pass 2 — Lamb & Rice + Large Breed
- Audited 12 existing dry dog UPC rows; running staged UPC count remains **101**.
- Large Breed Adult Chicken: current IAMS manufacturer page now corroborates all six staged sizes represented across Batches 1/7 (11, 15, 30, 40/44/50 lb where staged) and publishes the broader current ladder **11/15/30/38.5/40/44/50 lb**. Manufacturer also states the recipe is 100% complete and balanced for adults. Exact UPC-to-size evidence remains separate; no missing UPCs were inferred.
- Adult Lamb & Rice: current IAMS now markets the recipe as **Minichunks Lamb & Rice**, with current sizes **3.3/5/7/11/15/30/38.5/44 lb**. Four staged distributor-era Lamb & Rice rows received an explicit naming/version-transition conflict rather than being silently renamed.
- Large Breed Lamb & Rice: current IAMS confirms sizes **11/15/30/40 lb** and complete-and-balanced adult positioning. The staged `019014700776` 38.5 lb record is therefore flagged as a likely prior-size/version SKU; `019014805303` 40 lb aligns with the current manufacturer ladder.
- Nutrition on these manufacturer pages is primarily image-rendered in the accessible representation, so ingredients/GA/calories were **not transcribed from guesses or OCR**. This pass strengthens identity/currentness and surfaces version conflicts rather than fabricating formula completeness.
- Commits: Batch 1 audit `8f372469080daf1a51a15876e42f944eda6337af`; Batch 7 Large Breed Chicken corroboration `47018a0b752dab4e3df5e565d09c19cba941de05`.


## Dry source-upgrade pass 3 — Smart Puppy + weight/aging transitions
- Audited **13 existing dry dog UPC rows**; running staged count remains **101**.
- Smart Puppy: current IAMS manufacturer evidence was attached to Small Breed, Original and Large Breed recipe groups. Six staged UPC rows across Batches 2/7 now have current recipe-family corroboration while preserving exact UPC-to-size evidence separately.
- Adult Weight Control: the three staged distributor-era UPCs (`019014711123`, `019014610891`, `019014700677`) now carry an explicit naming/version conflict because current IAMS markets the weight-management recipe as **Healthy Weight Chicken & Whole Grain**. They were not silently renamed or assumed formula-identical.
- Mature Adult: three standard staged UPCs (`019014700684`, `019014711147`, `019014612062`) now carry a transition conflict against current **Healthy Aging Chicken & Whole Grain**.
- Mature Adult Large Breed `019014611331` likewise carries a transition conflict against current **Healthy Aging Large Breed Chicken & Whole Grain**.
- This pass reinforces an important catalog rule: historical/distributor UPC identity and current manufacturer recipe naming must stay distinct until an exact current UPC/label proves continuity.
- Commits: Smart Puppy Batch 2 `ae2e0c87ec9be86aeac5434af5aaf260b86289cf`; weight/aging Batch 1 `d593b72ea6d875fbeb93dc01c1c12d2d33fae7ec`; Smart Puppy Large Breed 11 lb Batch 7 `23e05c9e2df4792dccfde35bbc065667f72b3d3a`.


## Dry source-upgrade pass 4 — core cat dry
- Audited **16 existing dry-cat UPC rows** across Batches 3/4/5; staged count remains **101**.
- Urinary Tract Health Chicken: all three staged sizes (3.5/7/16 lb) now have current IAMS recipe-family corroboration while exact UPC-to-size evidence stays separate.
- Sensitive Digestion & Skin: 6 lb and 13 lb rows gained current manufacturer recipe corroboration (the 3 lb row remains for the next pass).
- Healthy Adult Salmon & Tuna: all three staged sizes now carry an explicit transition conflict because current IAMS markets the recipe as **Healthy Adult Salmon**, while distributor-era identity says **Salmon & Tuna**. No silent formula merge.
- Indoor Weight & Hairball Care Salmon 16 lb and Long Hair Care Chicken & Salmon 6 lb gained current manufacturer identity corroboration.
- Indoor Weight & Hairball Care (3.5/7/16 lb) now carries a naming/version warning because current IAMS exposes the recipe as **Chicken & Turkey**, while the staged distributor identity lacks that flavor qualifier.
- Hairball Care Chicken (3.5/7/16 lb) gained current manufacturer recipe-family corroboration.
- Commits: Batch 4 `96439d9b77ec4520f0446f6e0e36146d9f752c00`; Batch 5 `4bfa659259dbdf9bea281ecdc5fa34b9005fd142`; Batch 3 `097fca454b9ca1285124c06c25eee94ac266e463`.


## Dry source-upgrade pass 5 — finish remaining cat-dry families
- Audited **23 existing dry-cat rows** across Batches 3/5/6/7; running staged count remains **101**.
- Healthy Adult Original Chicken (3.5/7/16/22 lb), Healthy Kitten (3.5/7 lb), Healthy Senior (3.5/7/16 lb), Healthy Weight (3.5/7 lb), and Sensitive Digestion & Skin 3 lb gained current IAMS manufacturer recipe-family corroboration.
- Sensitive Digestion & Skin now has manufacturer corroboration across all staged 3/6/13 lb UPCs.
- High Protein: all five staged sizes now have current IAMS **High Protein Chicken & Salmon** manufacturer corroboration. Because staged distributor identities are generic `High Protein`, each carries a naming/version warning instead of a silent rename.
- Healthy Enjoyment Chicken & Salmon: all staged 3/6/15 lb UPCs now align with the current IAMS manufacturer size family.
- Healthy Enjoyment Chicken & Beef (3/6/15 lb) remains a proven recent/historical US SKU, but no current IAMS manufacturer catalog page was found in this pass; all three are explicitly flagged as discontinued/phase-out currentness risk rather than being presented as current shelf.
- Commits: Batch 3 `1cf19d08437d15289244052cacd77523a3b1d9da`; Batch 5 `2fdd42884e733aa3cddc8d14108f8fa653a34065`; Batch 6 `504c562bf899ca82708807aeb0da7ac67951d594`; Batch 7 `7450209d3d58eb1faebfb911762e8ba4ad682519`.
- At this point the staged **dry-cat catalog has effectively completed its second-pass identity/currentness audit**. Remaining work is primarily full label-panel completion (ingredients/GA/calories/AAFCO) and any genuinely new UPC discovery, not basic recipe-family identification.


## Dry source-upgrade pass 6 — dog-dry audit completion
- Final unreviewed dog-dry identities were checked; running staged UPC count remains **101**.
- Small Breed Adult (7/15 lb; `019014803446`, `019014803453`) gained current IAMS manufacturer recipe-family corroboration for Small Breed Adult Chicken & Whole Grains.
- Optimal Weight Large Breed `019014700691` now carries an explicit naming/version transition against current IAMS **Healthy Weight Large Breed**. The distributor-era identity is preserved; no silent formula merge or UPC substitution.
- With this pass, every staged dry-dog UPC has now received a second-pass identity/currentness review. Combined with pass 5, the staged dry catalog (dog + cat) has effectively completed this audit phase.
- Remaining dry work is not basic identity research: it is (a) complete label-panel acquisition for ingredients/GA/calories/AAFCO, (b) exact current UPC proof for renamed/reformulated successor products, and (c) targeted discovery of genuinely missing current sizes without sequence inference.
- Commit: `b8c6438c7ab04d6429e81e306a5643a14072520a`.


## Missing-current-UPC sweep 1 — new current Beef & Rice family
- Broad current-retail sweep found a genuinely missing US recipe family: **IAMS ProActive Health Adult Minichunks Beef & Rice**. Current IAMS lists sizes **5/7/11/15/30 lb** and states complete-and-balanced adult nutrition.
- Two exact current UPC-to-size bindings were strong enough to stage without sequence inference:
  - `019014808168` — 15 lb, exact Target UPC; Target also exposes the current ingredient deck.
  - `019014808151` — 30 lb, exact Kroger-family UPC/size binding.
- Staged as `research/incoming/iams-batch-10.json`; both remain `needs_physical_label` because a complete current GA + calories + exact AAFCO/deck panel is not yet jointly proven.
- Current manufacturer also lists 5, 7 and 11 lb, but those UPCs were **not inferred** from the 8081xx sequence. They remain targeted discovery gaps.
- Retail sweep also surfaced other potentially missing current families, notably **High Protein Adult Dog Chicken & Beef** and newer Advanced Health dog recipes; these require exact UPC proof before staging.
- New staged total: **103 UPC records**.
- Commit: `7323a4164dd28e3bd6d17acfa01c6ff0c4813c1f`.

## Stop point
Missing-current-UPC sweep has started. 103 total incoming records are now staged. Dry identity/currentness audit is complete; next target is exact UPC proof for Beef & Rice 5/7/11 lb, High Protein Adult Dog Chicken & Beef, and newer Advanced Health recipes.
