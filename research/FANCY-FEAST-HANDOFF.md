# Fancy Feast completion handoff

Updated: 2026-08-31
Branch: `agent/deep-research-fancy-feast`
Ledger: `research/deep-research-barcodes.json`
Draft PR: #10

This handoff is for the Fancy Feast completion campaign in `research/BRIEF-FANCY-FEAST.md`. The production seed is intentionally untouched. Batch 1 appended 20 `source_verified` records to the legacy Fancy Feast + Friskies shared ledger: 3 individual cans and 17 outer variety-pack UPCs.

## Coverage by range

The inventory regenerated immediately before Batch 1 matched the committed starting inventory: 106 Fancy Feast products under 115 held barcodes, 17 populated named ranges, six named ranges empty, and zero Fancy Feast boxes.

The table below expresses movement as **starting held barcodes → starting held barcodes plus staged Batch 1 records**. Variety packs are counted as staged barcodes, not as seeded compositions.

| Range | Before | After Batch 1 | Added |
|---|---:|---:|---|
| Classic Pâté | 10 | 16 | 1 individual can + 5 multipacks |
| Gravy Lovers | 8 | 11 | 2 individual cans + 1 multipack |
| Grilled | 8 | 12 | 4 multipacks |
| Sliced | 4 | 5 | 1 multipack |
| Delights With Cheddar | 4 | 5 | 1 multipack |
| Kitten | 4 | 5 | 1 multipack |
| Medleys | 24 | 27 | 3 multipacks |
| Savory Centers | 4 | 5 | 1 multipack |
| All other populated ranges | unchanged | unchanged | — |
| Fancy Feast outer boxes overall | 0 | 17 staged | 17 multipacks |

The six named-but-empty ranges remain the highest obvious coverage gaps:

- Roasted
- Purely
- Savory Cravings
- Broths
- Appetizers
- Royale

Classic Pâté remains a major individual-can gap even after settling Seafood Feast; Gravy Lovers and Grilled also remain incomplete.

## Batch 1 records

### Individual units

- `050000153558` — Fancy Feast Gravy Lovers Chicken Feast Paté in Gravy, 3 oz — `source_verified`
- `050000180721` — Fancy Feast Gravy Lovers Salmon Feast Paté in Gravy, 3 oz — `source_verified`
- `050000429349` — Fancy Feast Classic Seafood Feast, 3 oz — `source_verified`

### Multipacks

- `050000580064` — Gravy Lovers Poultry & Beef Collection, 24 x 3 oz
- `050000818174` — Grilled Poultry & Beef Collection, 24 x 3 oz
- `050000575466` — Grilled Seafood Collection, 24 x 3 oz
- `050000544417` — Sliced Poultry Favorites, 24 x 3 oz
- `050000504879` — Classic Paté Chicken & Beef Collection, 24 x 3 oz
- `050000428243` — Classic Paté Seafood Collection, 24 x 3 oz
- `050000292202` — Delights With Cheddar variety pack, 24 x 3 oz
- `050000500895` — Kitten Tender Feast variety pack, 24 x 3 oz
- `050000172986` — Savory Centers Paté Collection, 12 x 3 oz
- `050000585663` — Grilled Poultry & Beef Collection, 30 x 3 oz
- `050000292226` — Classic Paté Poultry & Beef Collection, 30 x 3 oz
- `050000580682` — Medleys White Meat Chicken Collection, 12 x 3 oz
- `050000574889` — Medleys Primavera Collection, 12 x 3 oz
- `050000572816` — Medleys Florentine Collection, 12 x 3 oz
- `050000586646` — Grilled Seafood Collection, 30 x 3 oz
- `050000585687` — Classic Paté Seafood Collection, 30 x 3 oz
- `050000575473` — Classic Paté Poultry & Beef Collection, 24 x 3 oz

All 17 box records deliberately have `contains: []`. Outer identity, pack size, unit size and UPC were proven; printed inner-can barcodes were not, so flavor/member names were not substituted for barcodes and no box was given a fake composition.

## The three shopper-missed codes from §3

### `050000153558`

Settled as the **individual 3 oz Fancy Feast Gravy Lovers Chicken Feast Paté in Gravy can**. The old suspicion in the assignment that this could be a Classic Seafood variety-pack/case code does not survive current evidence: a current single-unit retailer GTIN binds `00050000153558` to the 3 oz Chicken Feast Paté can, and Purina's current label deck A512323 supplies the matching formula and panel.

### `050000180721`

Settled as the **individual 3 oz Fancy Feast Gravy Lovers Salmon Feast Paté in Gravy can**. Current retail evidence identifies one 3 oz item and prints GTIN `00050000180721`; Purina deck A649923 supplies the current formula and panel.

### `050000429349`

Settled as the **individual 3 oz Fancy Feast Classic Seafood Feast can**. Target explicitly reports package quantity 1, 3 oz and UPC `050000429349`, resolving the case-versus-can ambiguity. Purina deck D667422 supplies the current formula and panel.

## Range names the brand entry lacks

None identified in Batch 1. Every Batch 1 record maps to an existing Fancy Feast range name. Do not invent a new range merely because a retailer shortens a collection name.

## Wrong-barcode recommendations

None produced by Batch 1. The three demand-proven codes all resolved to legitimate individual units rather than case/tray codes.

Existing do-not-file recommendations in the generated inventory remain unchanged and should not be edited by this research branch.

## Unresolved tail, by reason

### Named ranges with zero coverage

Roasted, Purely, Savory Cravings, Broths, Appetizers and Royale still require product-level discovery and exact sellable-unit UPC binding. Savory Cravings must be recorded as `food_form: "treat"`; Broths and Appetizers are topper-style products and should not be forced into dinner-like nutrition expectations.

### Large individual-can range gaps

Classic Pâté remains the largest ordinary wet-food shortfall. Gravy Lovers and Grilled also have many shelf SKUs not represented by individual-unit records. Search from exact UPC/GTIN evidence rather than filling a flavor list from names.

### Variety-pack inner barcodes

Batch 1 intentionally did not infer inner-can UPCs. `contains: []` is correct until printed member codes are directly proven. This is not a blocker for the outer multipacks themselves, which are `source_verified`.

### Exact package binding and formula generation

Future individual records should stay `needs_physical_label` when the same UPC is tied to conflicting generations or when a retailer only proves a case listing rather than the code printed on one unit. A current formula deck is not enough by itself to prove the barcode scope.

## Validation and commits

- User-authorized compatibility fix: `facf3de6d8a0e60c45628cd8943a1f64449d538f`
- Batch 1 research commit after history cleanup: `24325dd4ce6e30d93406d8cd2929e3c263275c64`
- Before Batch 1, `research/INVENTORY-FANCY-FEAST.md` was regenerated from the live checkout; it produced no content change.
- Before the Batch 1 research commit, the exact required command `node scripts/check-ledger.mjs research/deep-research-barcodes.json` returned `Clean.` on the live repository checkout: 93 records total, 73 grandfathered legacy records and 20 fully checked appends; 76 individual-unit records and 17 multipacks.
- The remote ledger was fetched back after the commit; the new tail parsed as JSON and the staged records/statuses matched the batch.
- Draft PR #10 remains open and unmerged.

## Where Batch 1 stopped

Batch 1 stopped at the assignment's 20-record limit, not because the brand is complete. The next pass should rebuild the live exclusion set, then prioritize the six empty ranges and additional Classic Pâté individual units before spending search time on already well-covered Medleys.
