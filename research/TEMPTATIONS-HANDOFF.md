# Temptations campaign handoff — partial, evidence-preserving

Date: 2026-09-23

## Capabilities

GitHub read/write and public web search were available. A local shell exists, but this runtime cannot resolve github.com, so the repository could not be cloned and the repository scripts, checker, typecheck, lint, tests and build could not truthfully be run here. The public search surface can read current Temptations maker pages, but it does not expose the Product JSON-LD `sku` needed for barcode harvesting.

## Work completed

- Added `research/BRIEF-TEMPTATIONS.md` carrying forward the binding four-step status table and Mars route-A rules.
- Added `research/INVENTORY-TEMPTATIONS.md`.
- Added `research/TEMPTATIONS-CANDIDATES.json` with maker-page leads only; no UPC was invented.
- Confirmed direct maker pages for Classic, MixUps, JUMBO Stuff, Lickable Puree, Lickable Spoons, dry food and seasonal products.
- Confirmed that Temptations is not exclusively treats: current maker pages include complete-and-balanced dry and wet foods. Only actual treat products should receive `food_form: "treat"`.
- Confirmed live seasonal/direct URLs that justify continuing beyond the visible current-index count.

## Current decision tally

No ledger record has been promoted yet.

- rejected at step 1: 0
- stopped at step 2: 0 ledger records (maker-page leads are intentionally not ledger rows yet)
- stopped at step 3: 0
- source_verified: 0
- candidate maker-page leads captured: 17

This is deliberately conservative: the current tool surface does not expose exact structured-data SKUs, and the shell cannot run the harvester. Creating UPCs from search snippets would violate step 1.

## Findings that matter for the next executable pass

1. **Multi-size pages are common.** Classic Tasty Chicken currently shows 1, 1.7, 3, 6.3, 16, 16, 30 and 48 oz. A page-level sku cannot be assigned to every displayed size without proving the selected variant.
2. **JUMBO Stuff has package-copy inconsistencies.** Savory Salmon's selector shows 2.47 oz while benefit copy says 2.5 oz; Tempting Tuna shows 5.29 oz while copy says 5.3 oz. Preserve these as source conflicts/rounding evidence rather than silently choosing.
3. **Seasonal pages remain directly reachable.** Tasty Human and the holiday 3.15-lb dry bag are examples.
4. **Variety packs must remain identity-only at carton level.** Lickable Puree Beef Liver/Cheese and Lickable Spoons MVMP are confirmed variety-pack surfaces; do not attach one member's composition to the carton.
5. **Marketing calorie claims are not silently substituted for a missing exact label field.** Classic pages say under 2 calories/treat and JUMBO pages say 2 calories/treat. Use the exact printed panel/calorie evidence required by the campaign before promotion.

## Blocker to completing the full campaign in this runtime

The binding next-agent brief says to run:

```bash
node scripts/harvest-maker-pages.mjs https://www.temptationstreats.com <dir>
node scripts/check-ledger.mjs research/deep-research-temptations.json
npm run typecheck
npm run lint
npm test
npm run build
```

The local runtime currently fails DNS resolution for `github.com`, so it cannot clone the branch and execute those repository scripts. GitHub connector access can write files but cannot execute repository code. The public web search result also omits the JSON-LD `sku`, so a compliant barcode ledger cannot be fabricated from it.

When an executable checkout/browser environment is available, resume with the harvester rather than repeating discovery. Then:
- capture all structured-data SKUs;
- normalize only a dropped leading zero when UPC-A validates;
- bind each SKU to an exact size;
- perform two genuinely independent panel transcriptions or use route B;
- build `research/deep-research-temptations.json`;
- run checker and all four repo gates;
- seed verified/identity rows according to `docs/SEEDING-A-BATCH.md`;
- update this handoff with final counts.

## Database reminder

After a successful seed deploy, the operator must still press **Write N to the catalog**. Nothing reaches the database before that action.
