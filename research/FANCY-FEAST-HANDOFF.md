# Fancy Feast completion handoff

Updated: 2026-09-04
Branch: `agent/deep-research-fancy-feast`
Ledger: `research/deep-research-barcodes.json`
Draft PR: #10

This handoff covers the Fancy Feast completion campaign in `research/BRIEF-FANCY-FEAST.md`. The production seed remains untouched. Batch 1 added 20 `source_verified` records. Batch 2 added 20 records: 17 `source_verified` and 3 `needs_physical_label`. Batch 3 adds 16 records: 14 `source_verified` outer packs and 2 Roasted individual cans marked `needs_physical_label`. Across the three campaign batches, 56 Fancy Feast records have been appended to the legacy shared Fancy Feast + Friskies ledger.

## Coverage by range

The live inventory was regenerated again immediately before Batch 3 with `node scripts/brand-inventory.mjs "Fancy Feast"`. It still reported 106 seeded products under 115 seeded barcodes and six named-but-empty ranges because the generator reports production seed coverage separately from staged research. Its mechanical flat exclusion set had grown to 165 codes after Batch 2.

The table distinguishes seeded/catalog coverage from staged research. Staged multipacks are barcodes, not inferred compositions.

| Range | Before campaign | After Batch 1 | After Batch 2 | After Batch 3 | Batch 3 addition |
|---|---:|---:|---:|---:|---|
| Appetizers | 0 | 0 | 7 | 7 | — |
| Purely | 0 | 0 | 10 | 10 | — |
| Savory Cravings | 0 | 0 | 3 | 3 | — |
| Roasted | 0 | 0 | 0 | 2 | 2 individual cans (`needs_physical_label`) |
| Broths | 0 | 0 | 0 | 3 | 3 outer multipacks |
| Classic Pâté | 10 | 16 | 16 | 17 | 1 outer multipack |
| Gravy Lovers | 8 | 11 | 11 | 12 | 1 outer multipack |
| Grilled | 8 | 12 | 12 | 12 | — |
| Sliced | 4 | 5 | 5 | 6 | 1 outer multipack |
| Marinated Morsels | 5 | 5 | 5 | 6 | 1 outer multipack |
| Creamy Delights | 2 | 2 | 2 | 3 | 1 outer multipack |
| Gourmet Naturals | 10 | 10 | 10 | 11 | 1 outer multipack |
| Petites | 7 | 7 | 7 | 9 | 2 outer multipacks |
| Delights With Cheddar | 4 | 5 | 5 | 5 | — |
| Kitten | 4 | 5 | 5 | 6 | 1 outer multipack |
| Medleys | 24 | 27 | 27 | 29 | 2 outer multipacks |
| Savory Centers | 4 | 5 | 5 | 5 | — |
| Fancy Feast outer boxes overall | 0 | 17 staged | 22 staged | 36 staged | 14 multipacks |

Batch 2 removed Appetizers, Purely and Savory Cravings from the zero-coverage list. Batch 3 stages the first Roasted and Broths records. Royale is now the only named range with no staged or seeded barcode, although Roasted still has no promotable `source_verified` individual unit and Broths still has no individual-pouch formula record.

## Batch 1 summary

### Individual units

- `050000153558` — Gravy Lovers Chicken Feast Paté in Gravy, 3 oz — `source_verified`
- `050000180721` — Gravy Lovers Salmon Feast Paté in Gravy, 3 oz — `source_verified`
- `050000429349` — Classic Seafood Feast, 3 oz — `source_verified`

### Multipacks

Batch 1 also added 17 `source_verified` outer variety-pack UPCs across Gravy Lovers, Grilled, Sliced, Delights With Cheddar, Kitten, Medleys, Savory Centers and Classic Pâté. Every box deliberately has `contains: []`: the outer identity was proven, but printed inner-can barcodes were not.

## Batch 2 records

### Appetizers — seven individual 1.1 oz trays

- `050000001286` — Oceanfish With a Shrimp Topper — `source_verified` (Purina deck B639721)
- `050000001293` — Skipjack Tuna With a Sole Topper — `source_verified` (B639821)
- `050000001309` — Light Meat Tuna With a Scallop Topper — `source_verified` (B639521)
- `050000001316` — Wild Alaskan Salmon — `source_verified` (B639621)
- `050000002689` — Flaked Tongol Tuna — `source_verified` (B639121)
- `050000002696` — White Meat Chicken and Flaked Tuna — `source_verified` (B639221)
- `050000002702` — White Meat Chicken and Shredded Beef — `source_verified` (B639321)

These are cat-food complements, not complete-and-balanced dinners. Their official decks supply the full ingredient order, guaranteed analysis and calories. The Wild Alaskan Salmon selector/retailer size disagreement is documented: 17 kcal at 557 kcal/kg implies about 1.08 oz and supports the exact-GTIN retailer's 1.1 oz package.

### Purely — five individual 2 oz trays

- `050000004522` — Natural Tender Tongol Tuna Entrée — `source_verified` (Purina deck F640418)
- `050000004584` — Natural Flaked Skipjack Tuna Entrée — `source_verified` (E-6400)
- `050000004591` — Natural White Meat Chicken Entrée — `source_verified` (F640518)
- `050000004560` — Natural Seabass and Shrimp Entrée — `needs_physical_label`
- `050000004577` — Natural White Meat Chicken and Shredded Beef Entrée — `needs_physical_label`

Purely is discontinued. The first three exact UPCs have retrievable official Purina decks and no evidence of a later formula generation. Seabass and Shrimp has a historical full-label transcript but no retrievable official deck. Chicken and Beef has exact unit identity plus a historical panel, but the source generation is mixed with Appetizers naming and no authoritative full ingredient list was found. Neither unresolved tray was promoted to `source_verified`.

### Purely — five outer 10 × 2 oz multipacks

- `050000580125` — Seabass and Shrimp — `source_verified`
- `050000580132` — Flaked Skipjack Tuna — `source_verified`
- `050000580156` — Tender Tongol Tuna — `source_verified`
- `050000580163` — White Meat Chicken — `source_verified`
- `050000580170` — White Meat Chicken and Shredded Beef — `source_verified`

All five are outer sale-unit codes with `contains: []`. Some retailer URLs expose the 13-digit catalog stem rather than the final UPC-A digit; the ledger records the standard check-digit reconstruction and corroborating pack evidence. No inner-tray barcode is inferred from an outer code.

### Savory Cravings — three individual 1 oz treat boxes

- `050000002627` — Salmon Flavor — `source_verified`
- `050000002986` — Tuna Flavor — `source_verified` (Purina deck A642421)
- `050000002979` — Chicken Flavor — `needs_physical_label` (Purina deck A642521 versus current page)

Chicken remains unresolved because two official Purina sources disagree: deck A642521 prints 6340 kcal/kg and 3.5 kcal/square and says “natural chicken flavor,” while the current product page reports 6439 kcal/kg and 3.6 kcal/piece and shortens the ingredient wording. The exact UPC identity is solid, but a current physical back label is required to select the applicable formula generation.

## Batch 3 records

### Roasted — two individual 3 oz cans

- `050000123773` — Roasted Chicken Feast — `needs_physical_label`
- `050000123780` — Roasted Turkey Feast — `needs_physical_label`

The exact 3 oz individual-can identities and UPCs are well supported. Chicken also has a complete historical retailer transcription attributed to deck C-6981. Neither can is promoted because no applicable official current/final Purina deck was retrievable, and current retail now shows a 2.8 oz Roasted Turkey entrée rather than the older 3 oz unit. A physical 3 oz back label is required to settle the applicable formula generation; Turkey also lacks a complete retrievable ingredient and calorie statement.

### Broths — three outer 12 × 1.4 oz multipacks

- `050000960422` — Classic Seafood Collection — `source_verified`
- `050000960491` — Creamy Collection — `source_verified`
- `050000543359` — Seafood Bisque Collection — `source_verified`

These records cover only the outer sale units. Current Purina pages establish the first two pack identities, and exact-UPC retailer pages bind all three cartons. They deliberately have no box-level formula and `contains: []`. This does not resolve the separate checker problem for individual Broths pouches.

### Other outer multipacks

- `050000544295` — Petites Gravy Collection, 12 × 2.8 oz twin tubs — `source_verified`
- `050000544301` — Petites Gravy Collection, 24 × 2.8 oz twin tubs / 48 servings — `source_verified`
- `050000500321` — Gourmet Naturals Pâté Variety Pack, 12 × 3 oz — `source_verified`
- `050000258192` — Marinated Morsels Poultry & Beef Variety Pack, 24 × 3 oz — `source_verified`
- `050000500000` — Sliced Poultry & Beef Collection Variety Pack, 24 × 3 oz — `source_verified`
- `050000572823` — Medleys Florentine Collection Variety Pack, 18 × 3 oz — `source_verified`
- `050000574896` — Medleys Tuscany Collection Variety Pack, 12 × 3 oz — `source_verified`
- `050000292110` — Gravy Lovers Poultry & Beef Collection Variety Pack, 30 × 3 oz — `source_verified`
- `050000215621` — Classic Paté Seafood Collection Variety Pack, 12 × 3 oz — `source_verified`
- `050000168828` — Kitten Classic Paté Ocean Whitefish & Turkey Collection Variety Pack, 12 × 3 oz — `source_verified`
- `050000172306` — Creamy Delights Poultry & Seafood Collection Variety Pack, 24 × 3 oz — `source_verified`

For the two Petites boxes, `pack_count` counts physical 2.8 oz twin tubs; retailer “24” or “48” serving language counts the two snap-apart 1.4 oz halves. Every outer pack retains `contains: []` because member names are not member barcodes.

One otherwise valid candidate, `050000370344`, was deliberately left out. Its Chicken Gourmet Wet Cat Food Variety Pack mixes Classic Paté and Chunky cans, so assigning the box to either existing product line would be false. The batch was not padded to 20 with a cross-line mapping.

## The three shopper-missed codes from §3

- `050000153558` is the individual 3 oz Gravy Lovers Chicken Feast Paté in Gravy can, not a Classic Seafood case.
- `050000180721` is the individual 3 oz Gravy Lovers Salmon Feast Paté in Gravy can.
- `050000429349` is the individual 3 oz Classic Seafood Feast can; Target's package quantity 1 evidence settles can versus case.

All three were completed as `source_verified` in Batch 1.

## Range names the brand entry lacks

None identified in Batches 1–3. Every staged record maps to an existing Fancy Feast range. The cross-line Chicken Gourmet pack `050000370344` was excluded instead of inventing a range or misassigning it, so no brand-range recommendation is warranted from the committed evidence.

## Wrong-barcode recommendations

None produced. No researched outer code was substituted for an individual-unit UPC, and the three shopper-missed codes resolved to legitimate individual cans.

Existing do-not-file recommendations in the generated inventory remain unchanged and must not be edited by this research branch.

## Unresolved tail, by reason

### Named ranges still at zero

- Royale

Royale is international and still requires trustworthy sellable-unit barcode binding. Several web panels appear to contain dry-food percentages on 85 g wet-product pages, so none were staged by inference.

Roasted and Broths are no longer literally zero, but their important gaps remain: both Roasted individual records need a physical label, and only Broths outer multipacks have been staged.

### Deliberately excluded conflicts

- `050000001323` — Appetizers White Meat Chicken: current calorie evidence conflicts across generations. Do not mark `source_verified` without a current physical label.
- `050000004683` — Purely White Meat Chicken and Flaked Tuna: sources conflict on formula generation. Do not copy the current Appetizers formula onto this discontinued Purely UPC.
- `050000004560`, `050000004577`, `050000002979`, `050000123773`, and `050000123780` are staged as `needs_physical_label` with the precise missing/conflicting evidence recorded in place.

### Broths checker edge case

The current checker adds guaranteed minimum protein/fat to maximum moisture/fibre/ash as though those bounds were a measured mass balance. A legitimately printed Broths panel can therefore exceed 100 and receive a false blocking error. Do not erase printed ash or alter label values to satisfy the arithmetic. Batch 3 safely adds outer cartons, which carry no single formula; individual Broths pouches should still wait for corrected checker semantics.

### Remaining ordinary shelf gaps

Classic Pâté remains the largest ordinary wet-food shortfall. Gravy Lovers and Grilled also remain incomplete. Search from exact UPC/GTIN evidence rather than filling a flavor list from names.

### Variety-pack inner barcodes

All staged boxes intentionally retain `contains: []` until printed member codes are directly proven. Flavor names are not barcodes.

## Validation and commits

- User-authorized compatibility fix: `facf3de6d8a0e60c45628cd8943a1f64449d538f`
- Batch 1 research commit: `24325dd4ce6e30d93406d8cd2929e3c263275c64`
- Batch 2 research commit: `728656ef0a30918bc178cb8f30c841656bb9349d`
- Batch 3 research commit: the commit containing this handoff; its SHA is reported in draft PR #10 after remote verification.
- Before Batch 3, the live inventory was regenerated and the exclusion set was rebuilt.
- The exact required command `node scripts/check-ledger.mjs research/deep-research-barcodes.json` returned `Clean.`: 129 records total, 73 grandfathered legacy records, 124 `source_verified`, 5 `needs_physical_label`, 93 individual-unit records and 36 multipacks.
- Batch 2 itself is 20 records: 17 `source_verified`, 3 `needs_physical_label`; 15 individual units and 5 multipacks.
- Batch 3 itself is 16 records: 14 `source_verified`, 2 `needs_physical_label`; 2 individual units and 14 multipacks.
- Draft PR #10 remains open, draft and unmerged.

## Where Batch 3 stopped

Batch 3 stopped at 16 records because the remaining discovered candidates were not equally safe, not because the brand is complete. The next pass should rebuild the live exclusion set, then prioritize the ordinary individual-can tail in Classic Paté, Gravy Lovers and Grilled. Royale requires exact international barcode evidence; individual Broths formulas require corrected checker bound semantics; and Roasted requires physical-label evidence. Do not fill the batch limit with cross-line cartons or related UPC guesses.
