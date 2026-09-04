# Fancy Feast completion handoff

Updated: 2026-09-04
Branch: `agent/deep-research-fancy-feast`
Ledger: `research/deep-research-barcodes.json`
Draft PR: #10

This handoff covers the Fancy Feast completion campaign in `research/BRIEF-FANCY-FEAST.md`. The production seed remains untouched. Batch 1 added 20 `source_verified` records. Batch 2 adds 20 more records: 17 `source_verified` and 3 `needs_physical_label`. Across the two campaign batches, 40 Fancy Feast records have been appended to the legacy shared Fancy Feast + Friskies ledger.

## Coverage by range

The live inventory was regenerated immediately before Batch 2 with `node scripts/brand-inventory.mjs "Fancy Feast"`. It still reported 106 seeded products under 115 seeded barcodes and six named-but-empty ranges; its mechanical exclusion list had grown to 145 codes because it included Batch 1 and the historical ledger claims.

The table distinguishes seeded/catalog coverage from staged research. Staged multipacks are barcodes, not inferred compositions.

| Range | Before campaign | After Batch 1 | After Batch 2 | Batch 2 addition |
|---|---:|---:|---:|---|
| Appetizers | 0 | 0 | 7 | 7 individual trays |
| Purely | 0 | 0 | 10 | 5 individual trays + 5 outer multipacks |
| Savory Cravings | 0 | 0 | 3 | 3 individual treat boxes |
| Classic Pâté | 10 | 16 | 16 | — |
| Gravy Lovers | 8 | 11 | 11 | — |
| Grilled | 8 | 12 | 12 | — |
| Sliced | 4 | 5 | 5 | — |
| Delights With Cheddar | 4 | 5 | 5 | — |
| Kitten | 4 | 5 | 5 | — |
| Medleys | 24 | 27 | 27 | — |
| Savory Centers | 4 | 5 | 5 | — |
| Fancy Feast outer boxes overall | 0 | 17 staged | 22 staged | 5 multipacks |

Batch 2 removes Appetizers, Purely and Savory Cravings from the zero-coverage list. The named ranges still at zero are Roasted, Broths and Royale.

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

## The three shopper-missed codes from §3

- `050000153558` is the individual 3 oz Gravy Lovers Chicken Feast Paté in Gravy can, not a Classic Seafood case.
- `050000180721` is the individual 3 oz Gravy Lovers Salmon Feast Paté in Gravy can.
- `050000429349` is the individual 3 oz Classic Seafood Feast can; Target's package quantity 1 evidence settles can versus case.

All three were completed as `source_verified` in Batch 1.

## Range names the brand entry lacks

None identified in Batch 1 or Batch 2. Every staged record maps to an existing Fancy Feast range. No brand-range recommendation is warranted.

## Wrong-barcode recommendations

None produced. No researched outer code was substituted for an individual-unit UPC, and the three shopper-missed codes resolved to legitimate individual cans.

Existing do-not-file recommendations in the generated inventory remain unchanged and must not be edited by this research branch.

## Unresolved tail, by reason

### Named ranges still at zero

- Roasted
- Broths
- Royale

These require product-level discovery and exact sellable-unit UPC binding.

### Deliberately excluded conflicts

- `050000001323` — Appetizers White Meat Chicken: current calorie evidence conflicts across generations. Do not mark `source_verified` without a current physical label.
- `050000004683` — Purely White Meat Chicken and Flaked Tuna: sources conflict on formula generation. Do not copy the current Appetizers formula onto this discontinued Purely UPC.
- `050000004560`, `050000004577`, and `050000002979` are staged as `needs_physical_label` with the precise missing/conflicting evidence recorded in place.

### Broths checker edge case

The current checker adds guaranteed minimum protein/fat to maximum moisture/fibre/ash as though those bounds were a measured mass balance. A legitimately printed Broths panel can therefore exceed 100 and receive a false blocking error. Do not erase printed ash or alter label values to satisfy the arithmetic. Resolve the checker semantics before committing such a record, or leave the record out of a clean batch.

### Remaining ordinary shelf gaps

Classic Pâté remains the largest ordinary wet-food shortfall. Gravy Lovers and Grilled also remain incomplete. Search from exact UPC/GTIN evidence rather than filling a flavor list from names.

### Variety-pack inner barcodes

All staged boxes intentionally retain `contains: []` until printed member codes are directly proven. Flavor names are not barcodes.

## Validation and commits

- User-authorized compatibility fix: `facf3de6d8a0e60c45628cd8943a1f64449d538f`
- Batch 1 research commit: `24325dd4ce6e30d93406d8cd2929e3c263275c64`
- Batch 2 research commit: the commit containing this handoff; its SHA is reported in draft PR #10 after remote verification.
- Before Batch 2, the live inventory was regenerated and the exclusion set was rebuilt.
- The exact required command `node scripts/check-ledger.mjs research/deep-research-barcodes.json` returned `Clean.`: 113 records total, 73 grandfathered legacy records, 110 `source_verified`, 3 `needs_physical_label`, 91 individual-unit records and 22 multipacks.
- Batch 2 itself is 20 records: 17 `source_verified`, 3 `needs_physical_label`; 15 individual units and 5 multipacks.
- Draft PR #10 remains open, draft and unmerged.

## Where Batch 2 stopped

Batch 2 stopped at the assignment's 20-record limit, not because the brand is complete. The next pass should rebuild the live exclusion set, then prioritize Roasted, Royale and the remaining individual-can tail. Broths should wait until the checker bound-arithmetic issue is resolved rather than forcing valid printed label values through an invalid mass-balance assumption.
