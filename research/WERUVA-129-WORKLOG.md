# Weruva 129-candidate strict re-verification worklog

Started 2026-08-29 under `research/AGENTS.md`.

Baseline: canonical strict ledger = 120 `source_verified` records. Machine recount of all remaining `awaiting strict promotion` tables = 131 rows / 129 unique UPC strings. These 129 are candidates, not guaranteed promotable records.

## Pass 1 — Slide N' Serve / Classic / Pantry Pours

First-party current-formula pages re-opened and formula panels captured for:

- Family Food — current manufacturer page: https://www.weruva.com/collections/weruva-cat-pate/products/family-food-cat-pouch
- Jeopurrdy Licious — https://www.weruva.com/products/jeopurrdy-licious-cat-pouch
- Meal of Fortune — https://www.weruva.com/products/meal-of-fortune-cat-pouch
- Name 'Dat Tuna — https://www.weruva.com/products/name-dat-tuna-cat-pouch
- The Newly Feds — https://www.weruva.com/products/the-newly-feds-cat-pouch
- The Slice is Right — https://www.weruva.com/products/the-slice-is-right-cat-pouch
- Asian Fusion — https://www.weruva.com/products/asian-fusion-cat-can
- Grandma's Chicken Soup — https://www.weruva.com/products/grandmas-chicken-soup-cat-can

Current first-party formula observations already established in this pass:

- Family Food: current page exposes 2.8 oz and 5.5 oz variants; ingredients begin `Chicken Broth, Chicken, Tuna...`; GA 9.0/3.5/1.0/85.5; 2.8 oz 67 kcal; 839 kcal/kg.
- Name 'Dat Tuna: current page exposes 2.8 oz and 5.5 oz variants; ingredients begin `Fish Broth, Tuna...`; GA 8.0/1.5/1.0/87.5; 2.8 oz 44 kcal; 549 kcal/kg.
- Asian Fusion: current page exposes 3 oz and 5.5 oz cans; full ingredient panel captured; GA protein 12%, fat 1.6%, fiber 0.5%, moisture 83%, ash 2%, calcium max 0.28%, phosphorus max 0.25%, magnesium max 0.024%, taurine min 0.05%; 65 kcal/3 oz, 120 kcal/5.5 oz, 770 kcal/kg; Adult.
- Grandma's Chicken Soup: current page exposes 3 oz and 5.5 oz cans; full ingredient panel captured; GA protein 8%, fat 1.2%, fiber 0.5%, moisture 87.5%, ash 1%, calcium max 0.2%, phosphorus max 0.17%, magnesium max 0.018%, taurine min 0.05%; 58 kcal/3 oz, 106 kcal/5.5 oz, 683 kcal/kg; Adult.

## Machine current-catalog rebase

A manufacturer-catalog crawl of all 129 unique indexed UPCs found **13 UPCs that are still printed in the current Weruva Shopify variant catalog with the same barcode**. These are the strongest first strict-promotion tranche, but still require the normal exclusion/formula/check-digit gate before append:

- `810028246072` — Wx Chicken & Tilapia Formula in Gravy, 5.5 oz
- `813778015660` — B.F.F. PLAY Beef & Tuna Tic Toc, 2.8 oz
- `813778015530` — B.F.F. PLAY Beef & Tuna Tic Toc, 5.5 oz
- `813778014656` — B.F.F. PLAY Chicken & Turkey Topsy Turvy, 2.8 oz
- `813778015073` — B.F.F. PLAY Chicken & Turkey Topsy Turvy, 5.5 oz
- `813778014670` — B.F.F. PLAY Chicken Checkmate, 2.8 oz
- `813778015097` — B.F.F. PLAY Chicken Checkmate, 5.5 oz
- `813778014120` — B.F.F. OMG Chicken & Pumpkin Love Munchkin!, 2.8 oz
- `813778019125` — B.F.F. OMG Chicken & Pumpkin Love Munchkin!, 5.5 oz
- `813778019170` — B.F.F. OMG Beef & Salmon Best Day Eva!, 5.5 oz
- `810028246065` — Wx Chicken Formula in Gravy, 5.5 oz
- `810028246133` — Wx Chicken Formula in a Hydrating Purée, 5.5 oz
- `813778015523` — B.F.F. PLAY Duck & Tuna Trickster, 5.5 oz

The crawl artifact is `research/WERUVA-CURRENT-EVIDENCE.json`; the exact-current subset is `research/WERUVA-EXACT-CURRENT-UPCS.json`.

### Barcode-generation warning

Do not bulk-promote the old index UPC strings. A current first-party Shopify variant probe has shown generation replacements in this queue. Example: current Tic Tac Whoa! variants expose `813778018418` (3 oz) and `813778018272` (5.5 oz), while the old index candidate for 5.5 oz is `813778018203`. Old identities must remain historical/conflict evidence unless the old individual unit itself is deliberately represented as a historical formula generation.

Every candidate still requires exact current individual-unit UPC proof, check digit, global repository exclusion, complete formula fields, and conflict disposition before `source_verified`.

## Status

- candidates in campaign: 129 unique UPC strings
- canonical strict records before this campaign: 120
- exact-current UPC survivors identified: 13
- newly promoted in this worklog so far: 0
- current-formula first-party pages re-opened in pass 1: 8
- campaign remains in progress
