# Beneful research handoff

Web access: yes. Shell: no. This pass used the supported `research/incoming/` fallback from AGENTS.md §3a and stopped after staging batch 01.

## Batch 01

- Staged: 20 dry records in `research/incoming/beneful-batch-01.json`.
- Ranges represented: `Originals` and `IncrediBites`.
- `source_verified`: 6 / 20.
- `needs_physical_label`: 14 / 20. These are deliberately not promoted because the available barcode evidence was secondary/legacy or the current size-generation binding was not strong enough. This is not a stricter formula gate: where a current Purina deck existed, it was accepted as sufficient composition evidence.
- Current Purina label decks found/read: Originals Farm-Raised Beef (U409024), Originals Natural Salmon (Q409224), IncrediBites Farm-Raised Beef (N408524), IncrediBites Farm-Raised Chicken (J408824). Originals Farm-Raised Chicken had a current retailer panel/deck code L409524 but the Purina PDF itself was not surfaced in this connector pass.
- Prefix observed: `017800` on all 20 staged UPC leads. Six rows have direct exact-size retailer bindings in this pass; the remaining fourteen must be re-bound before promotion.
- Wet records: 0. Batch 01 intentionally stayed dry per the brief. Therefore package type is `bag` throughout and no row has a calorie arithmetic witness; calories are printed per cup.
- Controlled vocabulary used: `texture: "kibble"`, `presentation: "plain"`.
- Ranges proved in this batch: Originals, IncrediBites. The other seeded names were not evaluated yet: Healthy Weight, Grain Free, Prepared Meals, Simple Goodness, Superfood Blend.
- Current range missing from seed observed during research: `Healthy Puppy` appears on Purina's current site, but it was outside this two-range first batch and is only a recommendation for the next shell-enabled pass to evaluate.
- Treat leads observed: Beneful Baked Delights and Healthy Smile appear in barcode-index evidence. `lib/nutrition-role.ts` has no Beneful line per the brief, so any confirmed current treat range needs a handoff recommendation before seeding as food.
- Checker exit code: **not available**. No shell was available, so `node scripts/check-ledger.mjs research/deep-research-beneful.json` and inventory regeneration could not be run. Per AGENTS.md §3a, do not merge the incoming batch into the ledger until a shell-enabled pass runs the required checks and gets exit 0.

## Next action

A shell-enabled pass should fetch the current branch, mechanically re-check all 20 UPCs against every ledger/seed/wrong-barcode source, resolve the fourteen weak unit bindings (or leave them `needs_physical_label`), merge only valid records into `research/deep-research-beneful.json`, regenerate `research/INVENTORY-BENEFUL.md`, run the checker, and delete the incoming file.
