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

## Stop point
Stopped after exactly batch 1 (20 records), as requested. The next pass should be shell-enabled merge/validation first; only after that should research continue to Perfect Portions.
