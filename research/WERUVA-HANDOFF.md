# Weruva Deep Research Handoff

## Status

Campaign branch: `agent/deep-research-weruva`

Strict ledger: `research/deep-research-weruva.json`

Post-30 working index: `research/WERUVA-POST-30-INDEX.md`

Binding contract: `research/AGENTS.md`

As of 2026-08-29 the strict ledger contains **120 complete schema-v2 records**.

**Seed readiness: 120 source-verified strict records are ready for production seeding.**

This means the entire previously identified 70-record strict-promotion backlog has been consumed into the canonical ledger:

- 18 Cat Stew
- 8 Senior
- 4 Freeze Dried
- 20 early post-30 recheck records
- 20 Kitten / Wx / Freeze Dried / Cat Paté records

Together with the 30 original strict records and 20 TruLuxe records, the canonical Weruva strict total is **120**.

The six Puddy Pops / Wx lickable retail UPCs below are explicitly **not** individual-stick seed candidates because each identifies a five-pack and no separate individual-stick barcode is proven:

- `810028246782`
- `810028246805`
- `810028246799`
- `810028246874`
- `810028246881`
- `810028246898`

Disposition for each: `retail UPC identifies five-pack; no proven individual-stick barcode`.

## Promotion history

- Original canonical strict ledger: 30 records.
- TruLuxe: +20, promoted in commit `c76af91805f2f9be588bf6e2676cde4393fc6fe9`.
- Cat Stew: +18 after fresh exclusion / UPC check-digit / schema validation.
- Senior + Freeze Dried: +12 after fresh exclusion / UPC check-digit / current-formula validation; six five-pack rows dispositioned as non-promotable individual sticks.
- Early post-30 recheck: +20 after fresh exclusion / UPC check-digit / current-formula validation. Pumpkin Lickin’ Chicken was refreshed to the current Weruva calorie generation (59 kcal/3 oz; 696 kcal/kg), with older 60/701 evidence retained as a generation conflict.
- Kitten / Wx / Freeze Dried / Cat Paté: +20 after fresh exclusion / UPC check-digit / current-formula validation. Wx dual printed `Adult, Senior` lifestage claims are preserved in verification notes with scalar `life_stage: null`; Freeze Dried Mideast Feast 7 oz keeps `kcal_per_unit: null` because no bag-total calorie value is printed.

## What 120 means

The **120** count is the authoritative number of complete `source_verified` Weruva records physically present in `research/deep-research-weruva.json` and ready to be consumed by the production seeding workflow.

It does **not** mean every later row still listed in `research/WERUVA-POST-30-INDEX.md` has been researched. The index contains additional Slide N' Serve / Classic / Pantry Pours, B.F.F. Play / Originals, B.F.F. OMG and later Weruva/Wx/Pantry/Pumpkin/Paté work that remains a separate research queue. Those later rows must not be counted as seed-ready until they independently pass the same strict gate.

## Seed boundary

No production seed files were changed by this research promotion. Per `research/AGENTS.md`, `source_verified` means research-ready for seed. `promoted_to_seed` must only be applied after the record has actually been copied into production seed files.

PR #3 must remain **DRAFT / OPEN** and must not be merged without explicit user instruction.
