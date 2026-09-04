# Weruva 129-candidate strict re-verification worklog

Started 2026-08-29 under `research/AGENTS.md`.

Baseline: canonical strict ledger = 120 `source_verified` records. Machine recount of all remaining `awaiting strict promotion` tables = 131 rows / 129 unique UPC strings. These 129 are candidates, not guaranteed promotable records.

## Pass 1 — Slide N' Serve / Classic / Pantry Pours

Current first-party formula pages were re-opened for Family Food, Jeopurrdy Licious, Let's Make a Meal, Love Connection, Meal of Fortune, Name 'Dat Tuna, The Newly Feds, The Slice is Right, Asian Fusion, and Grandma's Chicken Soup.

Independent exact-unit evidence reconfirmed these old indexed Slide N' Serve UPC identities as historical sellable-unit evidence: `813778018999`, `813778018753`, `813778018975`, `813778018982`, `813778018951`, `813778018944`, `813778018708`, `813778018968`, `813778018722`, `813778018937`, `813778018692`.

These are NOT automatically current-generation promotions. Current Weruva variant data shows replacements for several of the same product/size identities, so historical identity proof is retained separately from current barcode proof.

Family Food 5.5 oz remains a deliberate conflict hold: sources expose both `813778018609` and `813778018685` for the 5.5 oz / model 8524 generation. Do not silently promote either until the generation relationship is resolved.

## Current-exact promotion tranche

13 UPCs survived exact current-manufacturer barcode matching and passed the strict validator. They were appended to the canonical ledger on 2026-08-30 in commit `b626bf8ee127ae6a54bd3e9b163f767c20d301ba`:

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

Promotion receipt: `research/WERUVA-CURRENT13-PROMOTION.json`; exact-current evidence: `research/WERUVA-EXACT-CURRENT-UPCS.json`.

## Pass 2 — generation replacement disposition

Confirmed current manufacturer replacement examples:

- Tic Tac Whoa! 5.5 oz: indexed `813778018203` -> current manufacturer variant `813778018272`.
- Meal of Fortune 2.8 oz: indexed `813778018951` -> current manufacturer variant `813778018876`; current 5.5 oz variant `813778018630`.
- Name 'Dat Tuna 2.8 oz: indexed `813778018944` -> current manufacturer variant `813778018869`.
- Name 'Dat Tuna 5.5 oz: indexed `813778018708` -> current manufacturer variant `813778018623`.
- The Slice is Right 2.8 oz: indexed `813778018937` -> current manufacturer variant `813778018852`.
- The Slice is Right 5.5 oz: indexed `813778018692` -> current manufacturer variant `813778018616`.
- Asian Fusion 3 oz: indexed `878408001031` -> current manufacturer catalog variant `878408000133`.
- Asian Fusion 5.5 oz: indexed `878408002038` -> current manufacturer catalog variant `878408000034`.

Weruva storefront variant titles frequently include pack counts. Manufacturer Shopify barcode alone is therefore not accepted as individual-unit proof.

## Pass 3 — B.F.F. PLAY indexed-unit verification

A fresh retailer/manufacturer pass established strong exact-size evidence for the next indexed B.F.F. PLAY rows:

- `813778015615` — Chicken & Tuna Til' Then, 2.8 oz can. Pet Food Express lists the exact 2.8 oz sellable unit with UPC `813778015615`; National Pet Warehouse and additional retailers independently map the same code to the same 2.8 oz identity. Current Weruva page supplies the current formula: ingredients begin `Chicken Broth, Chicken, Tuna, Sardine...`; GA 10/2/1/83; 74 kcal/2.8 oz; 928 kcal/kg.
- `813778014588` — Chicken & Beef Best Buds, 2.8 oz can. The Pet Beastro exposes `813778014588` on a single-item page and provides the formula; National Pet Warehouse independently maps the same UPC to the 2.8 oz identity. Current Weruva catalog still lists Best Buds.
- `813778015103` — Chicken, Duck & Turkey Take a Chance, 2.8 oz can. Pet Food Express and CountryMax both identify the exact 2.8 oz unit with UPC `813778015103`. Current Weruva page provides the full formula, GA 7/3/1/84, 86 kcal/2.8 oz, 1075 kcal/kg.
- `813778015004` — Chicken & Lamb Laugh Out Loud, 5.5 oz can. Toronto Pets exposes the 5.5 oz variant with barcode `813778015004`; current Weruva page provides the full formula, GA 7/3/1/84, 88 kcal/2.8 oz and 1102 kcal/kg. The 5.5 oz unit calorie basis still needs direct printed/current evidence before strict append if not present elsewhere.
- `813778014816` — Chicken & Turkey Tiptoe, 3 oz pouch. Big Dog Little Dog and Cascade Pet Supply both identify the 3 oz pouch with this code; Toronto Pets independently exposes the same barcode on its 3 oz variant.
- `813778014540` — Chicken Cherish, 3 oz pouch. Toronto Pets exposes the exact 3 oz variant with barcode `813778014540`; current manufacturer formula page remains the preferred formula source.

`813778015127` (Laugh Out Loud 2.8 oz) and `813778014755` (Tubular 3 oz pouch) remain in this tranche but were not promoted merely from search absence/partial evidence; they continue to the next exact-unit pass.

None of the Pass 3 rows are appended merely because a retailer uses the same numeric string as SKU. Strict append still requires repository-wide exclusion, UPC check digit, complete current formula/GA/calories for the exact size, and no unresolved generation conflict.

## Current manufacturer B.F.F. Originals confirmation

Current Weruva catalog pages still list B.F.F. Originals/Minced products including Tuna & Chicken 4Eva, Tuna & Pumpkin Valentine, and Tuna & Bonito Be Mine. Indexed Originals UPCs still require independent exact individual-unit barcode proof before strict promotion.

## Status

- candidates in original campaign: 129 unique UPC strings
- canonical strict records before campaign: 120
- current-exact UPCs promoted after full strict gate: 13
- canonical strict records now: **133 source_verified**
- historical Slide N' Serve UPC identities independently reconfirmed: 11
- explicit Family Food 5.5 generation conflict held: 1
- explicit current replacement mappings documented: 8 indexed size rows
- next B.F.F. PLAY rows with new exact-size barcode corroboration in Pass 3: 6
- no Pass 3 record promoted until the remaining strict fields/exclusions are complete
- campaign remains in progress
