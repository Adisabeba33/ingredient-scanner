# Weruva 129-candidate campaign — disposition counter

Authoritative progress counter for the 129 unique UPC candidates originally enumerated in `research/WERUVA-POST-30-INDEX.md`.

A candidate counts as **closed** only when it has a final disposition: either promoted through the full `source_verified` gate, or removed from the current-generation queue with a documented final reason such as historical/replaced. Merely researched, corroborated, or partially gated candidates do **not** reduce the remaining count.

## Counter

- Original unique candidates: **129**
- Closed: **21**
  - promoted to canonical Weruva research ledger as `source_verified`: **13**
  - finalized as historical/replaced current-generation candidates: **8**
- Remaining unresolved / not finally dispositioned: **108**
- Canonical Weruva ledger after the promoted tranche: **133 `source_verified` records**

## Closed — promoted (`source_verified`)

These 13 passed the strict gate and were appended in commit `b626bf8ee127ae6a54bd3e9b163f767c20d301ba`:

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

## Closed — historical/replaced in current-generation queue

These 8 indexed size rows are finalized as old UPC generations because current Weruva manufacturer variant evidence exposes a replacement code for the same product/size identity. The replacement Shopify code is **not** automatically treated as an individual-unit UPC; it remains a separate candidate until unit scope is independently proven.

- `813778018203` — Tic Tac Whoa! 5.5 oz → current manufacturer variant `813778018272`
- `813778018951` — Meal of Fortune 2.8 oz → current manufacturer variant `813778018876`
- `813778018944` — Name 'Dat Tuna 2.8 oz → current manufacturer variant `813778018869`
- `813778018708` — Name 'Dat Tuna 5.5 oz → current manufacturer variant `813778018623`
- `813778018937` — The Slice is Right 2.8 oz → current manufacturer variant `813778018852`
- `813778018692` — The Slice is Right 5.5 oz → current manufacturer variant `813778018616`
- `878408001031` — Asian Fusion 3 oz → current manufacturer catalog variant `878408000133`
- `878408002038` — Asian Fusion 5.5 oz → current manufacturer catalog variant `878408000034`

## Active strict gate — not yet counted closed

The following B.F.F. PLAY indexed UPCs have now passed UPC-A check-digit validation and have exact-size distributor/retailer corroboration plus current Weruva formula evidence, but remain open until the entire `research/AGENTS.md` gate is complete:

- `813778015615` — Chicken & Tuna Til' Then, 2.8 oz
- `813778014588` — Chicken & Beef Best Buds, 2.8 oz
- `813778015103` — Chicken, Duck & Turkey Take a Chance, 2.8 oz
- `813778014755` — Chicken & Tuna Tubular, 3 oz pouch
- `813778014816` — Chicken & Turkey Tiptoe, 3 oz pouch
- `813778014540` — Chicken Cherish, 3 oz pouch

All six UPC-A check digits validate. Current manufacturer pages provide exact-size formula/GA/calories for these sizes. A final repository-wide exclusion/current-generation check is still required before any append.

## Open conflict hold

- `813778018609` — Family Food 5.5 oz remains unresolved because evidence also exposes `813778018685` for the same 5.5 oz/model generation. It is not counted closed.

PR #3 must remain DRAFT / OPEN. No production seed files are changed by this campaign.
