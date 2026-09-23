# Cesar — handoff (batch 042)

## 1. Capabilities

Web access through Chromium and a shell, in the same session. Every checker
result below is from a real run.

## 2. Step tally

The maker's sitemap lists 103 product pages. Four answered 403 on every attempt
and carried no barcode, so they are not records (they are listed in §9).
99 records:

| Step | Individual units | Variety packs | Total |
|---|---:|---:|---:|
| 1 — rejected (bad barcode) | 0 | 0 | 0 |
| 2 — stopped (a field not captured) | 29 | 41 | 70 |
| 3 — stopped (route, agreement, integrity) | 0 | — | 0 |
| 4 — source_verified | 29 | — | 29 |

Why the 29 units stopped at step 2:

- 18 — the panel image cesar.com links returns 403 from cesar.com itself
- 8 — the panel stops before the calorie line
- 4 — the page lists several sizes under one sku, so the size of this barcode
  is not established (2 Softies, 2 dry bags; one of those also has no panel)
- 1 — the panel image shows the guarantees but not the ingredients
  (Wholesome Bowls Chicken, Sweet Potatoes & Green Beans)

(Some records have two reasons, so the list sums to more than 29.)

## 3. Route

All 29 source_verified records are **route A**: the maker's own page. None
used route B.

## 4. Disagreements

No two readings of the same panel disagreed on ingredients, guarantees or
calories. One reading differed from the other by a space in a guarantee line.

One maker-page defect: the **Filet Mignon & Chicken Mini-Pouch** page
(`023100146171`, a variety pack) shows the **Wood-Grilled Chicken** panel, byte
for byte. It is a variety pack and carries no composition, so nothing wrong
reached the catalog, but it is the reason for step-3 integrity check 1.

## 5. The prefix

`023100` on all 99 records, which is already in `data/gs1-prefixes.ts` as
Mars Petcare US. Sixteen pages print it as `23100…`, 11 digits; restored as
described in BRIEF-CESAR §2.

## 6. Ranges

Mars' own "Sub brand" taxonomy. All six in `data/us-pet-brands.ts` were met.
Four added: **Warm Bowls**, **Wholesome Meals**, **Mini-Pouch**, **Softies**.
The dry bags print no range (`line: null`).

## 7. Treats

`food_form: "treat"`: `023100103280`, `023100103273`, `023100103297` (Softies).

## 8. Checker

`node scripts/check-ledger.mjs research/deep-research-cesar.json` exits **0**:
one warning, Classic Loaf Lamb (`023100014043`), 1095 kcal/kg × 3.5 oz = 108.6
against 110 printed, 1.3% out, within this campaign's 3% tolerance.

## 9. Next

- **Route B for the 29 stopped units**: two independent retailers. Target
  rendered in Chromium; Chewy (429), Petco (403) did not.
- **Four pages that never answered**: `cesar-wholesome-meals-chicken-carrots-barley-green-beans`,
  `classic-loaf-sauce-chicken-liver`, `simply-crafted-chicken-carrots-potatoes-peas`,
  `filet-mignon-new-york-strip-flavors-12-ct-multipack`.
- **The next four Mars brands** run the same site build: start with
  `scripts/harvest-maker-pages.mjs` and BRIEF-CESAR §2.
