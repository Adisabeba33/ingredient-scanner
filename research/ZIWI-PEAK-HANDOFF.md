# ZIWI Peak Deep Research Handoff

Last updated: 2026-08-28

## Read this first

This is the current handoff for ZIWI Peak research.

Before doing any new ZIWI work, read `research/AGENTS.md` and treat it as binding. Rebuild the live exclusion set from the repository; do not rely on the counts or UPC lists in this handoff alone.

Current research branch: `agent/deep-research-ziwi-peak`
Current review surface: draft PR #2
Primary ledger: `research/deep-research-ziwi-peak.json`

Do not merge the PR unless the user explicitly asks.

## Current canonical state

The old multi-file append layout has already been consolidated. Do **not** use the old B1-B6 append-file instructions from earlier handoffs.

Current canonical ZIWI ledger contains **156 records**.

Current status arithmetic after the latest two 20-record batches:

- **109 `source_verified`**
- **23 `needs_physical_label`**
- **24 `candidate`**

The 156-record ledger is the authoritative ZIWI research staging file on this branch. Always re-fetch it before writing and rerun global duplicate checks against:

- `data/known-products.ts`
- `data/known-formulas.ts`
- `data/wrong-barcodes.ts`
- `docs/CATALOG-CONFLICTS.md`
- every `research/deep-research-*.json`
- all new codes collected in the current batch

## User priority changed: ACTIVE MARKET ONLY

The user does **not** currently want discontinued, historical, inactive, archive-only, or old regional products researched further.

From this point forward, ZIWI research should target only products that are **currently sold and realistically orderable online**.

Market priority:

1. **United States** — highest priority
2. **Canada** — highest priority
3. **Australia / New Zealand** — secondary but useful if actively sold
4. **Europe / UK** — secondary but useful if actively sold

A product should count as an active-market target only when there is current evidence that the exact SKU/size is actually offered for sale. A surviving old retailer page, archived product JSON, discontinued inventory record, barcode database entry, cached search result, or historical distributor list is not enough.

Do not spend research time mining old Hoki, old regional Venison, discontinued Provenance generations, obsolete package sizes, or other historical ZIWI SKU families unless the user later asks for archival coverage.

## Current active-market conclusion

As of the 2026-08-28 scan, the current active ZIWI catalog appears **effectively saturated** in the research ledger.

Two direct first-party catalog sweeps were already performed:

- current official ZIWI US Shopify catalog: **50 products inspected**
- current official ZIWI Global Shopify catalog: **42 products inspected**

After subtracting the live repository exclusion set, both produced **zero additional new first-party variant barcodes**.

A follow-up active-market sweep also checked current retailer inventory in Canada / Australia / New Zealand. Available/current ZIWI variants that exposed barcodes mapped back to codes already present in the ledger. No convincing new active individual-unit barcode set was found.

Therefore: **do not start another arbitrary “next 20” ZIWI batch right now.** There is no evidence that 20 useful active individual-unit ZIWI barcodes remain undiscovered. Forcing another batch would mostly create historical/discontinued or outer-case noise.

The correct future workflow is a **delta scan**, not another historical excavation.

## What the next agent should do

When ZIWI research is resumed:

1. Re-fetch `research/deep-research-ziwi-peak.json` and all global exclusion files.
2. Check whether any of the 2026 announced products below have become genuinely orderable from ZIWI or major retailers.
3. Sweep the current official US and Global product JSON/catalog again and compare all active variant barcodes against the repository.
4. Check major current-market retailers, especially US and Canada, for active SKU variants not represented in the official store.
5. Only investigate Australia/NZ/Europe when the product is visibly current and orderable.
6. Add only genuinely new active barcode identities.
7. If fewer than 20 valid active products exist, add fewer than 20. **Never manufacture a batch size by using discontinued SKUs, neighboring EAN inference, case codes, or archive products.**
8. For `source_verified`, still require the full gate from `research/AGENTS.md`: exact unit barcode, current matching formula generation, complete ingredients, complete printed GA, calories, life-stage/adequacy where printed, source URLs, valid check digit, and no repo collision.

## 2026 launch products to re-check for activation

ZIWI announced these new 2026 UPCs. They are already present in the ledger as research leads/candidates, so they are **not new barcodes**, but their status should be revisited once they become genuinely orderable and a complete current label deck is available:

- `9421038211250` — Air-Dried Puppy Chicken & Lamb, 14 oz
- `9421038211243` — Steam & Dried Kitten Chicken with Southern Blue Whiting, 1.5 lb
- `9421038211212` — Kitten Pâté Beef with Mackerel, 3 oz
- `9421038211267` — Kitten Pâté Chicken with Lamb, 3 oz
- `9421038211564` — Cat Pâté Salmon & Chicken, 3 oz
- `9421038211571` — Cat Pâté Salmon & Chicken, 6.5 oz
- `9421038211595` — Cat Pâté Salmon & South Pacific Fish, 3 oz
- `9421038211588` — Cat Pâté Salmon & South Pacific Fish, 6.5 oz

Do not duplicate them. If they become active, upgrade the existing records only when current exact formula/label evidence resolves the missing fields.

## Superboost / formula-generation warning

Several Raw Superboost / functional booster records remain `needs_physical_label` because older exact SKU evidence and newer formula copies disagree on the probiotic tail, especially:

- older generation: `Dried Bacillus subtilis Fermentation Product` + `Dried Enterococcus faecium Fermentation Product`
- newer copies: often Bacillus-only

Do not combine these generations or upgrade them by borrowing a sibling formula. A current authoritative generation-specific label or physical pack is required.

## IMPORTANT: records from the second extra batch that are not current promotion priority

The last 20-record research batch deliberately captured some historical and outer-package evidence while trying to exhaust the brand. After the user's active-market clarification, these should **not be treated as current individual-product promotion targets**.

### Historical / regional individual SKUs — HOLD for later archival use

- `9421016592678` — historical/regional Venison Cat 85 g
- `9421016595877` — historical Hoki Cat 85 g
- `9421016595839` — historical Hoki Cat larger can (surviving metadata conflict: 170 g vs 185 g)

Keep them in research history; do not use them as evidence that those old products are part of the current active assortment.

### Outer retail multipacks / cases — do not substitute for one can

These are real outer-package barcodes, but they are not individual-can UPCs. They are low priority for the current scanner catalog unless the product model explicitly supports scanning outer retail packs/cases.

Multipacks:

- `9421038210833`
- `9421038210826`
- `9421038210819`
- `9421038210802`
- `9421038210840`
- `9421038210857`
- `9421038210864`

Cases:

- `9421016594511`
- `9421016594917`
- `9421016594450`
- `9421016594337`
- `9421016595969`
- `9421016594634`
- `9421016594573`
- `9421016594474`
- `9421016594870`

Their `barcode_scope` must remain `multipack` / `case`. Never promote one of these as the barcode for a contained individual can.

### Useful active individual from that batch

- `9421016597024` — Provenance Otago Valley Wet Dog 170 g — `source_verified`; exact individual-unit barcode and matching formula/GA/calorie evidence were captured.

## Earlier verified additions worth noting

The prior 20-record batch added several genuinely useful current/near-current identities, including:

- `9421016590612` — Original Air-Dried Venison Dog 1 kg
- `9421016592975` — Original Air-Dried Venison Dog 2.5 kg
- `9421016598014` — Original Air-Dried Beef Dog 3.5 oz trial size
- `9421016598076` — Original Air-Dried Chicken Dog 3.5 oz trial size
- `9421016598038` — Original Air-Dried Lamb Dog 3.5 oz trial size
- `9421016594672` — Good Dog Rewards Lamb 85 g
- `9421016594641` — Good Dog Rewards Venison 85 g

Those three trial-size barcodes came directly from official ZIWI Shopify variant data and were matched to current official formula/GA/calorie pages.

## Known traps

1. **Do not infer sequential EANs.** ZIWI has many neighboring-looking codes; proximity is not proof.
2. **Do not use retailer SKU/item numbers as UPC/EAN.**
3. **Do not substitute case/tray/multipack codes for individual units.**
4. **Do not merge old and current formula generations.**
5. **Mackerel & Lamb vs Lamb wet:** some retailer copies historically cross-assigned sibling EANs.
6. **Tripe & Lamb wet:** historical source material includes size/unit inconsistencies; preserve documented conflicts.
7. **Provenance:** formula generations differ materially across time/markets.
8. **Superboost:** probiotic-generation conflict remains unresolved for several SKUs.
9. **Availability matters now.** A valid old barcode is not a current target merely because a page still exists.

## Promotion guidance

Research and production are separate.

For the user's current production import, prioritize **active, current, individual-unit `source_verified` records**. Do not blindly promote all 156 records simply because they exist in research.

Before production promotion, filter out or separately review:

- historical/discontinued records
- `candidate`
- unresolved `needs_physical_label`
- `case` / `multipack` barcode scopes unless the application explicitly supports them

If production files are changed after this handoff, the next research agent must rebuild exclusions from the live repository because promoted UPCs may now appear in `data/known-products.ts` / `data/known-formulas.ts`.

## Recent research commits / PR

- first additional 20-record data commit: `4c4348babf89a8ddccb654e3d66f056b13548c16`
- second additional 20-record data commit: `542dd8dcaa348df6ebfa1e914e846e1678bdf3c6`
- draft PR: #2 — `Research 20 more ZIWI Peak barcodes`

PR #2 remains research-only and unmerged unless the user explicitly requests otherwise.

## Bottom line

For the current product goal, **ZIWI Peak active-market barcode research is paused because coverage appears saturated**.

Do not continue mining old/inactive SKUs just to increase the count. Resume only when a delta scan shows genuinely new, currently sold, orderable ZIWI products or when the user explicitly asks for historical/archive coverage.
