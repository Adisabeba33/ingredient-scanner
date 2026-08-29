# Weruva Deep Research Handoff

## Status

Campaign branch: `agent/deep-research-weruva`

Strict ledger: `research/deep-research-weruva.json`

Post-30 working index: `research/WERUVA-POST-30-INDEX.md`

Binding contract: `research/AGENTS.md`

As of 2026-08-29 the strict ledger contains **50 complete schema-v2 records**:

- 30 records that were already in the canonical Weruva ledger before the promotion task.
- 20 TruLuxe records promoted from the post-30 index in commit `c76af91805f2f9be588bf6e2676cde4393fc6fe9`.

The TruLuxe promotion updated the strict ledger and consumed the corresponding index rows atomically in the same Git commit.

## Completed promotion batch

### TruLuxe — 20 source_verified records

The following UPCs are now full strict-ledger records and are no longer index-only:

`878408003219`, `878408003318`, `878408003264`, `878408003363`, `878408003202`, `878408003301`, `878408003196`, `878408003295`, `878408003233`, `878408003332`, `878408003257`, `878408003356`, `878408003271`, `878408003370`, `878408003288`, `878408003387`, `878408003226`, `878408003325`, `878408003240`, `878408003349`.

For this batch the repository exclusion set was rebuilt from `data/known-products.ts`, `data/known-formulas.ts`, `data/wrong-barcodes.ts`, `docs/CATALOG-CONFLICTS.md`, every `research/deep-research-*.json`, the current Weruva ledger, and the batch itself. No collision was found.

Exact unit UPC/size mapping came from the ADMC distributor table, where UPC, UNIT SIZE and case quantity are separate columns. Current ingredient statements, GA and calories came from current Weruva TruLuxe product pages. `life_stage` was kept `null` where no pack-printed life-stage statement was captured; marketing categorization was not promoted into a label claim. Kawa Booty carries an explicit conflict note because an older distributor row calls the 3 oz SKU “Kawa Bunga” while current Weruva evidence calls it Kawa Booty.

## Cat Stew — 18 records fully re-researched, strict append still pending

The next promotion block remains the 18-row Cat Stew section in `WERUVA-POST-30-INDEX.md`:

`813778018111`, `813778017978`, `813778018104`, `813778017961`, `813778018098`, `813778017954`, `813778018081`, `813778017947`, `813778018074`, `813778017930`, `813778018067`, `813778017923`, `813778017725`, `813778017749`, `813778017756`, `813778017732`, `813778017763`, `813778017770`.

All 18 UPC-A check digits were revalidated on 2026-08-29. ADMC maps every code to the exact Cat Stew recipe and UNIT SIZE with case quantity in a separate column, so none of these 18 codes is being inferred from a sibling size or substituted from a case barcode.

Current Weruva manufacturer evidence was rechecked on 2026-08-29 for Goody Stew Shoes, Stewbacca, Stewlander, Stew's Clues, Stewy Lewis, Taco Stewsday, Kettle Call, Simmer Down, Stick a Spork in It, Stir the Pot, Too Hot to Handle and What a Crock. Current pages provide the printed ingredient order, displayed guaranteed analysis, calorie basis and presentation. The Weruva Cat Stew collection identifies the range's protein texture as Minced and presentation as Gravy; strict records should therefore use `texture: "minced"` and `presentation: "in_gravy"`. Do not infer a pack life-stage claim from the collection's marketing filter; leave `life_stage` null unless the package evidence itself prints one.

### Current canned formula calorie evidence

- Goody Stew Shoes: 91 kcal / 2.8 oz, 172 kcal / 5.5 oz; 1104 kcal/kg.
- Stewbacca: 87 kcal / 2.8 oz, 170 kcal / 5.5 oz; 1092 kcal/kg.
- Stewlander: 82 kcal / 2.8 oz, 161 kcal / 5.5 oz; 1034 kcal/kg.
- Stew's Clues: 90 kcal / 2.8 oz, 175 kcal / 5.5 oz; 1125 kcal/kg.
- Stewy Lewis: 79 kcal / 2.8 oz, 155 kcal / 5.5 oz; 996 kcal/kg.
- Taco Stewsday: 87 kcal / 2.8 oz, 171 kcal / 5.5 oz; 1097 kcal/kg.

The 5.5 oz per-can figures above were independently evidenced during the research pass and are **not derived** from kcal/kg.

### Current pouch calorie evidence

- Kettle Call: 95 kcal / 3.0 oz; 1118 kcal/kg.
- Simmer Down: 97 kcal / 3.0 oz; 1146 kcal/kg.
- Stick a Spork in It: 93 kcal / 3.0 oz; 1097 kcal/kg.
- Stir the Pot: 86 kcal / 3.0 oz; 1017 kcal/kg.
- Too Hot to Handle: 98 kcal / 3.0 oz; 1153 kcal/kg.
- What a Crock: 101 kcal / 3.0 oz; 1198 kcal/kg.

The current official ingredient strings differ by recipe and must be copied independently; do not collapse them into a shared premix template. Examples of real current differences include Goody Stew Shoes carrying Tricalcium Phosphate where several sibling cans do not, Stewy Lewis using Copper Glycine Complex, and pouch recipes using Coconut Oil while the canned recipes do not.

### Write-state note

The connected GitHub file writer currently exposes full-file replacement for `research/deep-research-weruva.json`, not an incremental patch operation. The ledger is minified into one large line. No unsafe replacement was attempted after the 50-record state because recreating the whole blob from a truncated read would risk deleting or mutating valid records. Do **not** work around this by creating temporary workflow files or by storing Cat Stew in a sidecar ledger. The correct next write is an atomic append of these 18 complete schema-v2 records to the existing strict ledger plus consumption of the Cat Stew index rows in the same commit.

## Known traps that remain binding

- `878408000171` and `878408000072` are Mideast Feast **case** barcodes. Never represent either as an individual can.
- The first 20 index rows marked `RECHECK_BATCH_STATUS` still need individual re-verification. The old “18 verified, 2 pending” conversational count does not identify the two pending entries and must not be inherited.
- Every size requires its own UPC proof and its own printed calorie value.
- BFF records must use `brand: "B.F.F."`; use only the range naming justified by the package/current manufacturer evidence. Do not silently turn older BFF Originals products into OMG or Play without proof.
- Puddy Pops and Wx lickable rows shown as `0.5 oz × 5` are sellable five-packs. The promotion task requires `barcode_scope: "individual_unit"`; do not promote the five-pack UPC as though it identifies one stick. If no individual-stick barcode exists, leave the index row with an explicit multipack reason instead.
- Historical/replacement UPCs already noted in the index must remain explicit conflicts; never silently overwrite a prior code with a newer one.

## Remaining work

The index is the authoritative queue of work not yet consumed into the strict ledger. TruLuxe has been removed as an index-only block; all other sections remain pending promotion or explicit disposition.

A row is finished only when it is either:

1. represented by a complete schema-v2 ledger record that passes the `source_verified` gate; or
2. left in the index with a one-line reason it cannot be promoted (case/multipack identity, unavailable current label evidence, unrecoverable discontinued formula, unresolved generation conflict, etc.).

When consuming a batch, update `research/deep-research-weruva.json` and `research/WERUVA-POST-30-INDEX.md` in the same Git commit so they cannot disagree.

## Resume point

Resume with **Cat Stew (18 rows)**. The research gate is already complete; rebuild the mandatory repository-wide exclusion set immediately before the write, assemble the 18 records from the current manufacturer evidence above, atomically append them to the strict ledger, and remove the Cat Stew rows from the index in that same commit. After that continue through the remaining index in groups of roughly 20.
