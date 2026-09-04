# Weruva Deep Research Handoff

## Status

Campaign branch: `agent/deep-research-weruva`

Strict ledger: `research/deep-research-weruva.json`

Post-30 working index: `research/WERUVA-POST-30-INDEX.md`

Binding contract: `research/AGENTS.md`

As of 2026-08-29 the strict ledger contains **120 complete schema-v2 records**:

- 30 records that were already in the canonical Weruva ledger before the promotion task.
- 20 TruLuxe records promoted from the post-30 index in commit `c76af91805f2f9be588bf6e2676cde4393fc6fe9`.
- 18 Cat Stew records promoted on 2026-08-29 after a fresh exclusion/check-digit/schema validation pass.

The TruLuxe promotion updated the strict ledger and consumed the corresponding index rows atomically in the same Git commit.

## Completed promotion batch

### TruLuxe — 20 source_verified records

The following UPCs are now full strict-ledger records and are no longer index-only:

`878408003219`, `878408003318`, `878408003264`, `878408003363`, `878408003202`, `878408003301`, `878408003196`, `878408003295`, `878408003233`, `878408003332`, `878408003257`, `878408003356`, `878408003271`, `878408003370`, `878408003288`, `878408003387`, `878408003226`, `878408003325`, `878408003240`, `878408003349`.

For this batch the repository exclusion set was rebuilt from `data/known-products.ts`, `data/known-formulas.ts`, `data/wrong-barcodes.ts`, `docs/CATALOG-CONFLICTS.md`, every `research/deep-research-*.json`, the current Weruva ledger, and the batch itself. No collision was found.

Exact unit UPC/size mapping came from the ADMC distributor table, where UPC, UNIT SIZE and case quantity are separate columns. Current ingredient statements, GA and calories came from current Weruva TruLuxe product pages. `life_stage` was kept `null` where no pack-printed life-stage statement was captured; marketing categorization was not promoted into a label claim. Kawa Booty carries an explicit conflict note because an older distributor row calls the 3 oz SKU “Kawa Bunga” while current Weruva evidence calls it Kawa Booty.

## Cat Stew — 18 records promoted to strict ledger

The next promotion block remains the 18-row Cat Stew section in `WERUVA-POST-30-INDEX.md`:

`813778018111`, `813778017978`, `813778018104`, `813778017961`, `813778018098`, `813778017954`, `813778018081`, `813778017947`, `813778018074`, `813778017930`, `813778018067`, `813778017923`, `813778017725`, `813778017749`, `813778017756`, `813778017732`, `813778017763`, `813778017770`.

All 18 UPC-A check digits were revalidated on 2026-08-29. Exact retailer/distributor evidence maps every code to the exact Cat Stew recipe and unit size; none is inferred from a sibling size or substituted from a case barcode.

Current Weruva manufacturer evidence was rechecked on 2026-08-29 for Goody Stew Shoes, Stewbacca, Stewlander, Stew's Clues, Stewy Lewis, Taco Stewsday, Kettle Call, Simmer Down, Stick a Spork in It, Stir the Pot, Too Hot to Handle and What a Crock. Current pages provide the printed ingredient order, displayed guaranteed analysis, calorie basis and presentation. Current manufacturer wording describes the can recipes as finely minced in gravy; strict records should use `texture: "minced"` and `presentation: "in_gravy"`. Do not infer a pack life-stage claim from marketing filters; leave `life_stage` null unless package evidence itself prints one.

### Current canned formula calorie evidence

- Goody Stew Shoes: 91 kcal / 2.8 oz, 172 kcal / 5.5 oz; 1104 kcal/kg.
- Stewbacca: 87 kcal / 2.8 oz, 170 kcal / 5.5 oz; 1092 kcal/kg.
- Stewlander: 82 kcal / 2.8 oz, 161 kcal / 5.5 oz; 1034 kcal/kg.
- Stew's Clues: 90 kcal / 2.8 oz, 175 kcal / 5.5 oz; 1125 kcal/kg.
- Stewy Lewis: 79 kcal / 2.8 oz, 155 kcal / 5.5 oz; 996 kcal/kg.
- Taco Stewsday: 87 kcal / 2.8 oz, 171 kcal / 5.5 oz; 1097 kcal/kg.

The 5.5 oz per-can figures above were independently evidenced and are **not derived** from kcal/kg.

### Current pouch calorie evidence

- Kettle Call: 95 kcal / 3.0 oz; 1118 kcal/kg.
- Simmer Down: 97 kcal / 3.0 oz; 1146 kcal/kg.
- Stick a Spork in It: 93 kcal / 3.0 oz; 1097 kcal/kg.
- Stir the Pot: 86 kcal / 3.0 oz; 1017 kcal/kg.
- Too Hot to Handle: 98 kcal / 3.0 oz; 1153 kcal/kg.
- What a Crock: 101 kcal / 3.0 oz; 1198 kcal/kg.

The current official ingredient strings differ by recipe and must be copied independently; do not collapse them into a shared premix template. Examples of real current differences include Goody Stew Shoes carrying Tricalcium Phosphate where several sibling cans do not, Stewy Lewis using Copper Glycine Complex, and pouch recipes using Coconut Oil while the canned recipes do not.

## Senior / Freeze Dried — next evidence-complete block

A second block has now been re-researched far enough to separate promotable unit UPCs from non-promotable multipack UPCs.

### Senior — 8 individual-unit UPCs

- `810028246317` — Senior Chicken Formula in a Hydrating Purée — 3 oz can
- `810028246430` — Senior Chicken Formula in a Hydrating Purée — 5.5 oz can
- `810028246324` — Senior Chicken Formula in Gravy — 3 oz can
- `810028246447` — Senior Chicken Formula in Gravy — 5.5 oz can
- `810028246348` — Senior Chicken & Tuna Formula in Gravy — 3 oz can
- `810028246461` — Senior Chicken & Tuna Formula in Gravy — 5.5 oz can
- `810028246331` — Senior Tuna & Salmon Formula in Gravy — 3 oz can
- `810028246454` — Senior Tuna & Salmon Formula in Gravy — 5.5 oz can

Current Weruva pages explicitly print `Lifestage: Senior`, so `life_stage: "senior"` is justified for these records rather than inferred.

Current printed calories:

- Chicken Hydrating Purée: 68 kcal / 3 oz; 124 kcal / 5.5 oz; 795 kcal/kg.
- Chicken Gravy: 67 kcal / 3 oz; 123 kcal / 5.5 oz; 789 kcal/kg.
- Chicken & Tuna Gravy: 73 kcal / 3 oz; 134 kcal / 5.5 oz; 860 kcal/kg.
- Tuna & Salmon Gravy: 71 kcal / 3 oz; 130 kcal / 5.5 oz; 836 kcal/kg.

**Formula-generation trap:** an older 2025 Weruva/Sunburst one-sheet exposes older ingredient order and older calories for at least some Senior formulas (for example Tuna & Salmon 76/137 kcal vs current 71/130). Use the current Weruva manufacturer page for `ingredients_verbatim`, GA and calories. Distributor/retailer evidence may be used for exact UPC/size identity only; record the older panel as a conflict rather than merging generations.

### Freeze Dried — 4 individual-unit UPCs

- `810028242944` — Weruva Freeze Dried Paw Lickin' Chicken — 1 oz bag
- `810028242951` — Weruva Freeze Dried Paw Lickin' Chicken — 7 oz bag
- `810028244535` — Weruva Wx Phos Focused Chicken Breast & Tilapia Formula — 1 oz bag
- `810028244559` — Weruva Wx Phos Focused Chicken Breast & Tilapia Formula — 7 oz bag

Current Weruva Paw Lickin' Chicken Freeze Dried panel: 66% protein min, 11% fat min, 1% fiber max, 8% moisture max; 3902 kcal/kg and 111 kcal per 1 oz. Manufacturer prints `Lifestage: Adult`. Do not invent a 7 oz bag calorie value from 111 kcal/oz; if the pack/page does not print kcal per 7 oz bag, store `kcal_per_unit: null` for that size while retaining the printed kcal/kg.

Current Weruva Wx Freeze Dried panel: 60% protein min, 19% fat min, 1% fiber max, 8% moisture max, Omega-3 min 1%, Omega-6 min 3%; 4267 kcal/kg and 121 kcal per 1 oz. Manufacturer prints `Lifestage: Adult, Senior` and Supplemental Feeding. Preserve the printed Omega guarantees in structured `other_printed_guarantees`. Do not manufacture a single life-stage value if the schema cannot faithfully represent both; explain the printed dual claim in `verification_notes` and follow repository convention.

### Six index UPCs are retail five-packs, not individual sticks

The following codes identify sellable packs containing five 0.5 oz tubes/sticks. They must **not** be promoted as `barcode_scope: "individual_unit"` for one stick unless a separate stick barcode is proven:

- `810028246782` — Puddy Pops Chicken — 0.5 oz × 5
- `810028246805` — Puddy Pops Chicken & Pumpkin — 0.5 oz × 5
- `810028246799` — Puddy Pops Tuna & Salmon — 0.5 oz × 5
- `810028246874` — Wx Lickable Chicken — five 0.5 oz tubes
- `810028246881` — Wx Lickable Chicken & Tilapia — five 0.5 oz tubes
- `810028246898` — Wx Lickable Tuna — five 0.5 oz tubes

Current Weruva/retailer evidence explicitly identifies these as 5-packs. Unless an individual tube barcode is recovered, consume these index rows by leaving a one-line non-promotable reason in the index: `retail UPC identifies five-pack; no proven individual-stick barcode`.

## Early post-30 recheck batch — all 20 individually re-researched

The ambiguous historical “18 verified / 2 pending” count has now been replaced by an item-by-item pass. All 20 candidates below have current manufacturer formula evidence plus independent exact-size/unit identity evidence; no candidate in this set should inherit an unnamed pending status.

### Cats in the Kitchen / Kitten / pouch records

- `810028244269` — Kitten Gone Wild — 3 oz can. Current Weruva: Fish Broth, Salmon, Tuna, Sardine, Mackerel, Sunflower Oil, Dried Egg, Agar-Agar, Guar Gum, Fish Oil, Choline Chloride, Taurine, vitamin/mineral deck. GA 10% protein, 1.5% fat, 0.5% fiber, 86% moisture, 2% ash. 54 kcal/3 oz, 632 kcal/kg. Printed lifestage Kitten.
- `878408008238` — Love Me Tender Chicken & Duck in Gravy — 3 oz pouch. Current Weruva GA 9/1.4/0.5/85 plus ash 2%, Ca/P/Mg/Taurine printed; 65 kcal/3 oz, 763 kcal/kg; Adult.
- `878408008269` — Mack, Jack & Sam Salmon, Mackerel & Skipjack Tuna in Gravy — 3 oz pouch. Current Weruva GA 9/1.4/0.5/85 plus ash 2%, Ca/P/Mg/Taurine printed; 64 kcal/3 oz, 757 kcal/kg; Adult.
- `878408008245` — Pumpkin Jack Splash Tuna in Pumpkin Soup — 3 oz pouch. Current Weruva GA 9/1.4/0.5/85 plus ash 2%, Ca/P/Mg/Taurine printed; 60 kcal/3 oz, 709 kcal/kg; Adult.
- `878408008214` — Pumpkin Lickin’ Chicken Chicken in Pumpkin Soup — 3 oz pouch. Independent retailer variant data explicitly identifies single 3 oz barcode `878408008214`. Current/near-current panel evidence prints 60 kcal/3 oz and 701 kcal/kg. Treat exact current Weruva manufacturer page as authoritative for verbatim formula when constructing the strict record.

### Slide N' Serve / Cats in the Kitchen Paté

All five are genuine 3 oz individual pouches. Current Weruva identifies the range as smooth/creamy hydrating paté and prints Adult lifestage.

- `813778017275` — Meowiss Bueller Chicken & Lamb in Hydrating Purée — current ingredients start Chicken Broth, Chicken, Lamb, Tuna; GA 8% protein, 3.5% fat, 1% fiber, 85% moisture, 1.5% ash; 69 kcal/3 oz, 810 kcal/kg.
- `813778017282` — Cat to the Future Chicken & Salmon in Hydrating Purée — ingredients start Chicken Broth, Chicken, Tuna, Salmon; GA 9/2/1/85, ash 2%; 64 kcal/3 oz, 750 kcal/kg.
- `813778017299` — The Breakfast Cat Chicken & Pumpkin in Hydrating Purée — ingredients start Chicken Broth, Chicken, Tuna, Pumpkin; GA 8/2/1/86, ash 2%; 58 kcal/3 oz, 677 kcal/kg.
- `813778017251` — The Karate Kitty Beef & Salmon in Hydrating Purée — ingredients start Beef Broth, Beef, Tuna, Salmon; GA 9/1/1/86, ash 2.5%; 46 kcal/3 oz, 543 kcal/kg.
- `813778017268` — Cat Times at Fridgemont Duck & Tuna in Hydrating Purée — ingredients start Duck Broth, Duck, Tuna; GA 8/2/1/86, ash 2%; 55 kcal/3 oz, 642 kcal/kg.

### Cats in the Kitchen can

- `878408009051` — The Double Dip Chicken & Beef Recipe Au Jus — 6 oz can. ADMC and current retailer mapping both identify the exact 6 oz unit UPC. Current Weruva ingredients start Chicken Broth, Chicken, Beef, Beef Lung; GA 8% protein, 2.5% fat, 0.5% fiber, 87% moisture, 1.5% ash with Ca/P/Mg/Taurine printed; 111 kcal/6 oz, 652 kcal/kg; Adult.

### Classic Cat size variants

Current Weruva manufacturer pages supply one current formula/GA panel and print per-size calories. Exact UPC/size mappings are independently corroborated by ADMC/current retailers. These size variants therefore do not borrow calorie values from sibling cans.

- `878408001130` — Funky Chunky — 3 oz can: current formula begins Chicken Broth, Chicken (Boneless, Skinless Breast), Pumpkin, Carrot, Pea; GA 8/1.2/0.5/87.5 with ash/Ca/P/Mg/Taurine printed; 53 kcal/3 oz, 618 kcal/kg; Adult.
- `878408001048` — Mack & Jack — 3 oz can: 66 kcal/3 oz, 774 kcal/kg; current GA 12/1.7/1/82 with ash/Ca/P/Mg/Taurine; Adult.
- `878408001024` — Marbella Paella — 3 oz can: 61 kcal/3 oz, 718 kcal/kg; current GA 12/1.6/0.5/86 with ash/Ca/P/Mg/Taurine; Adult.
- `878408001062` — Meow Luau — 3 oz can: 62 kcal/3 oz, 733 kcal/kg; current GA 12/1.5/1/84 with ash/Ca/P/Mg/Taurine; Adult.
- `878408001079` — Mideast Feast — 3 oz can: 63 kcal/3 oz, 746 kcal/kg; current GA 12/1.5/1/84 with ash/Ca/P/Mg/Taurine; Adult.
- `878408002373` — Mideast Feast — 10 oz can: 218 kcal/10 oz, 746 kcal/kg; exact 10 oz UPC independently confirmed.
- `878408001116` — Paw Lickin’ Chicken — 3 oz can: 57 kcal/3 oz, 673 kcal/kg; current GA 10/1.4/0.5/85 with ash/Ca/P/Mg/Taurine; Adult.
- `878408002410` — Paw Lickin’ Chicken — 10 oz can: 192 kcal/10 oz, 673 kcal/kg; exact 10 oz UPC independently confirmed.
- `878408001086` — Polynesian BBQ — 3 oz can: 61 kcal/3 oz, 723 kcal/kg; current GA 12/1.7/1/82 with ash/Ca/P/Mg/Taurine; Adult.

**Source conflict to preserve:** an older Weruva CDN/image filename on a stale Paw Lickin' Chicken page embeds `878408001086` in a Paw Lickin' Chicken 3 oz image name. Independent distributor/current retailer evidence maps `878408001086` to Polynesian BBQ 3 oz, while Paw Lickin' Chicken 3 oz is independently `878408001116`. Treat the stale image filename as a labeling/CDN artifact, not barcode proof, and record this conflict in verification notes.

Before promoting these 20, rebuild the repository-wide exclusion set exactly as required by `AGENTS.md`. Assuming that exclusion pass is clean, the old `RECHECK_BATCH_STATUS` label can be removed for all 20 individually.

## Write-state note

Low-level GitHub `fetch_blob` has now been confirmed to return the **complete** minified strict ledger blob rather than a truncated preview. This removes the earlier uncertainty about whether the existing 50 records can be read intact. The remaining constraint is applying a safe transformed full blob through the connected writer without manually reconstructing or mutating existing records. Do not create temporary workflow files and do not use a sidecar ledger. The next successful write should still atomically update `research/deep-research-weruva.json` and `research/WERUVA-POST-30-INDEX.md` in one Git commit.

## Known traps that remain binding

- `878408000171` and `878408000072` are Mideast Feast **case** barcodes. Never represent either as an individual can.
- Every size requires its own UPC proof and its own printed calorie value.
- BFF records must use `brand: "B.F.F."`; use only the range naming justified by the package/current manufacturer evidence. Do not silently turn older BFF Originals products into OMG or Play without proof.
- Historical/replacement UPCs already noted in the index must remain explicit conflicts; never silently overwrite a prior code with a newer one.

## Remaining work

The index is the authoritative queue of work not yet consumed into the strict ledger. TruLuxe has been removed as an index-only block; all other sections remain pending promotion or explicit disposition.

A row is finished only when it is either:

1. represented by a complete schema-v2 ledger record that passes the `source_verified` gate; or
2. left in the index with a one-line reason it cannot be promoted (case/multipack identity, unavailable current label evidence, unrecoverable discontinued formula, unresolved generation conflict, etc.).

When consuming a batch, update `research/deep-research-weruva.json` and `research/WERUVA-POST-30-INDEX.md` in the same Git commit so they cannot disagree.

## Resume point

1. Promote **Cat Stew (18 rows)** first. Research gate is complete; rebuild the mandatory repository-wide exclusion set immediately before write.
2. Then promote the **12 individual-unit Senior / Freeze Dried records** and disposition the six five-pack UPCs as non-promotable unless individual-stick barcodes are found.
3. Then promote the **20 individually re-researched early post-30 records** above after a fresh exclusion pass.
4. Continue through the remaining index in groups of roughly 20.


## 2026-08-29 Cat Stew strict promotion

Promoted 18 Cat Stew individual-unit UPCs to the canonical ledger: `813778018111`, `813778017978`, `813778018104`, `813778017961`, `813778018098`, `813778017954`, `813778018081`, `813778017947`, `813778018074`, `813778017930`, `813778018067`, `813778017923`, `813778017725`, `813778017749`, `813778017756`, `813778017732`, `813778017763`, `813778017770`. Fresh exclusion scan found zero collisions. Canonical Weruva strict count after this batch: **68**.


## 2026-08-29 Senior / Freeze Dried strict promotion

Promoted **12** additional individual-unit records: 8 Senior and 4 Freeze Dried. Canonical Weruva strict count: **80**. The six Puddy Pops/Wx lickable UPCs in this block are explicitly consumed as non-promotable individual-stick candidates because each identifies a five-pack and no separate stick barcode is proven.


## 2026-08-29 early post-30 strict promotion

Promoted all **20** individually re-researched early post-30 records after a fresh exclusion pass. Canonical Weruva strict count: **100**. Pumpkin Lickin’ Chicken was refreshed to the current manufacturer calorie generation (59 kcal/3 oz; 696 kcal/kg), with older 60/701 evidence preserved as a conflict.


## 2026-08-29 Kitten / Wx / Freeze Dried / Cat Paté strict promotion

Promoted all **20** prepared individual-unit records after a fresh exclusion/check-digit/current-formula pass. Canonical Weruva strict count: **120**. This completes the entire 70-record strict-promotion backlog that was previously summarized as 18 Cat Stew + 8 Senior + 4 Freeze Dried + 20 early recheck + 20 prepared Kitten/Wx/Freeze Dried/Cat Paté. Later index sections remain a separate research queue and are not implied complete by the 120 count.
