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

The manufacturer-catalog evidence proves that a substantial part of the original 129 queue is a historical UPC generation rather than the current barcode. These rows must not be promoted as if they were current.

Confirmed replacement examples from current Weruva variant data:

- Tic Tac Whoa! 5.5 oz: indexed `813778018203` -> current manufacturer variant `813778018272`.
- Meal of Fortune 2.8 oz: indexed `813778018951` -> current manufacturer variant `813778018876`; current 5.5 oz variant `813778018630`.
- Name 'Dat Tuna 2.8 oz: indexed `813778018944` -> current manufacturer variant `813778018869`.
- Name 'Dat Tuna 5.5 oz: indexed `813778018708` -> current manufacturer variant `813778018623`.
- The Slice is Right 2.8 oz: indexed `813778018937` -> current manufacturer variant `813778018852`.
- The Slice is Right 5.5 oz: indexed `813778018692` -> current manufacturer variant `813778018616`.
- Asian Fusion 3 oz: indexed `878408001031` -> current manufacturer catalog variant `878408000133`.
- Asian Fusion 5.5 oz: indexed `878408002038` -> current manufacturer catalog variant `878408000034`.

Important scope warning: Weruva's Shopify variant titles frequently include pack counts (for example `12pk`, `8pk`, `24pk`). A current manufacturer variant barcode therefore proves a current catalog/variant relationship, but does NOT by itself prove that the barcode is printed on one individual can/pouch. Replacement UPCs remain candidates until an independent individual-unit source or physical label proves `barcode_scope: individual_unit`.

This distinction prevents two errors at once: (1) promoting obsolete indexed UPCs as current and (2) accidentally substituting a case/multipack GTIN for an individual-unit UPC.

## Current manufacturer B.F.F. Originals confirmation

Current Weruva catalog pages still list B.F.F. Originals/Minced products including Tuna & Chicken 4Eva, Tuna & Pumpkin Valentine, and Tuna & Bonito Be Mine. The current manufacturer catalog confirms the product identities and current formula family, but the indexed Originals UPCs still require independent exact individual-unit barcode proof before strict promotion because the manufacturer storefront can sell pack variants.

## Status

- candidates in original campaign: 129 unique UPC strings
- canonical strict records before campaign: 120
- current-exact UPCs promoted after full strict gate: 13
- canonical strict records now: **133 source_verified**
- historical Slide N' Serve UPC identities independently reconfirmed: 11 (identity evidence only; not automatically current)
- explicit Family Food 5.5 generation conflict held: 1
- additional explicit current replacement mappings documented in Pass 2: 8 indexed size rows
- no case/multipack replacement barcode is promoted solely from Shopify variant data
- campaign remains in progress; remaining candidates are being dispositioned individually
