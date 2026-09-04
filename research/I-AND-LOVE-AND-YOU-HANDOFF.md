# I and love and you — Deep Research Handoff

Last updated: 2026-08-29
Status: **paused / closed for now by user request**

## Resume here

This research campaign is intentionally paused. If it is resumed later, read `research/AGENTS.md` first, then this handoff, then fetch the current canonical ledger before making any changes.

Brand: **I and love and you**
Canonical research ledger: `research/deep-research-i-and-love-and-you.json`
Research branch: `agent/deep-research-i-and-love-and-you`
Review surface: draft PR #6

Do not merge PR #6 unless the user explicitly asks.

## Final research state at pause

The canonical ledger contains **189 records**.

At the end of this campaign the user confirmed that these **189 researched records have been entered into the product database**. Treat that as handoff context for future work: when research resumes, do not start over or assume these 189 are still waiting to be entered. Rebuild the live exclusion set from the repository before researching additional barcodes.

The ledger itself remains the research/evidence history and should not be deleted or silently rewritten merely because the products have been entered into the database.

## Multipack clarification completed before pause

A final cleanup was performed across the entire current ledger after the user clarified how multipacks must be modeled.

Current ledger totals at that audit:

- total records: **189**
- multipacks: **85**
- single-flavour multipacks: **68**
- variety packs: **17**
- multipacks with unresolved `contains`: **13**
- final multipack-contract audit issues: **0**

Every multipack now has the fields:

- `pack_count`
- `unit_size`
- `contains`

### Single-flavour multipacks

These remain formula-bearing records because every unit in the outer pack is the same food. Their top-level ingredients, guaranteed analysis and calorie data were retained. `contains` points to the proven individual/member UPC where that UPC could be established.

### Variety packs

These are treated as outer package identities, **not as food formulas**. For all 17 variety packs:

- `ingredients_verbatim` is `null`
- `ingredients_ordered_normalized` is `null`
- top-level guaranteed-analysis values are `null`
- top-level calorie values are `null`
- member relationships are represented through `contains` when all required member UPCs are proven
- verification notes identify the member recipes and/or unresolved member evidence

This prevents a variety carton from being fingerprinted or scored as though one member recipe were the composition of the whole box.

### Unresolved `contains`

For **13 multipacks**, one or more member UPCs could not be proven strongly enough. Those records were deliberately kept with `contains: []` rather than guessing, copying an outer barcode into the member relation, or recording a partial relation when the required member set was incomplete.

The 13 outer UPCs with empty `contains` at the final audit were:

- `818336014314`
- `10818336010009`
- `10818336013918`
- `818336013874`
- `818336013881`
- `818336013751`
- `10818336013758`
- `818336013775`
- `10818336013772`
- `10818336011976`
- `818336012341`
- `20818336012345`
- `818336013553`

Their individual `verification_notes` describe what member-barcode proof is missing. These are natural targets if the campaign is resumed and the goal is to improve existing records before finding new products.

One specifically checked example is `818336014314` (Original Recipe Savory Salmon Paté, 5.5 oz can, 12-pack): a secondary code `00818336014314` resolves to the same outer 12-pack GTIN, not a proven inner-can UPC, so the inner UPC was not guessed and `contains` was left empty.

## Current/live catalog exhaustion reached during research

Before the final multipack cleanup, a full manufacturer Shopify catalog sweep was performed. The clean current catalog was effectively exhausted under the strict research contract: remaining live leads were either conflicts or lacked enough exact evidence to become clean new source-verified records.

Known unresolved live leads included:

1. **Feed Meow Variety Pack** — manufacturer Shopify data mapped barcode `10818336013703` to both a 3 oz 12-pack and a 3 oz 24-pack. This is an exact-pack identity conflict; do not source-verify either mapping without stronger evidence.
2. **Puppy Food Starter Kit** — outer barcode `818336012464`, SKU `K10000`; the current manufacturer page established the kit identity but did not textually establish the complete bundle contents/formula relationships strongly enough for the strict contract.
3. Larger variety-pack variants existed where exact member quantities were not independently proven. Do not infer those quantities from a smaller sibling pack.

If future work seeks more than the current/live catalog, the user should explicitly authorize historical/discontinued research. Previous campaign direction favored current products and did not use historical/discontinued SKUs merely to pad a batch.

## Important evidence/modeling rules for continuation

`research/AGENTS.md` remains binding. In addition, preserve the multipack clarification represented in the current ledger:

- A single-flavour box is the same food in a larger sellable package; retain its formula and relate it to the individual unit through `contains`.
- A variety pack is not a formula. Its top-level ingredients/GA/calories stay null.
- Never use an outer carton/case barcode as an inner/member UPC.
- Never invent a member UPC from a standalone sibling or GTIN transformation unless the exact individual barcode is actually proven under the repository evidence rules.
- When a single unit and its multipack both exist, prioritize researching the individual unit first.
- Preserve unresolved relationships honestly as `contains: []` with explicit notes rather than guessing.

## Final validation snapshot

The final multipack clarification audit printed:

```text
TOTAL 189
MULTIPACKS 85
SINGLES 68
VARIETIES 17
EMPTY_CONTAINS 13
ISSUES 0
ILY_MULTIPACK_CLARIFICATION_AUDIT_OK
```

At that point the canonical ledger blob was:

`feb7ae92c34a93a29455e998ab3afa9e5a64fca6`

The final PR file check showed that PR #6 contained only:

`research/deep-research-i-and-love-and-you.json`

Temporary audit/reissue scripts and workflows used for the multipack migration were removed after successful validation.

## How to restart later

When the user asks to continue I and love and you:

1. Fetch the latest `research/AGENTS.md` and treat the newest contract as authoritative.
2. Fetch this handoff and the current `research/deep-research-i-and-love-and-you.json` from the active branch/review surface.
3. Rebuild the global barcode exclusion set from production files and every research ledger; the user reports the existing 189 have already been entered into the database, so production state may have changed substantially since this handoff.
4. Re-audit counts/statuses rather than trusting the snapshot above if the repository has changed.
5. Prefer resolving the 13 empty `contains` relationships and other documented live conflicts before searching weaker historical leads, unless the user asks for a different priority.
6. For genuinely new products, prioritize individual-unit UPCs over boxes/multipacks.
7. Keep work on the I and love and you branch/PR unless the existing review surface has been closed/merged or the user explicitly requests a new one.
8. Never merge without explicit user instruction.

This document is a continuation checkpoint, not a replacement for the evidence stored in the JSON ledger or for `research/AGENTS.md`.