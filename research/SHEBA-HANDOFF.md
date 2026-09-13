# Sheba research handoff

Updated: 2026-09-07
Branch: `agent/deep-research-sheba`
Ledger: `research/deep-research-sheba.json`

## 1. Brand identity

- Shelf brand: **SHEBA**. Ledger brand key remains `Sheba`, matching the repository brand entry.
- Owner: **Mars**. Current SHEBA US pages are Mars-operated, and current US label transcriptions identify **Mars Petcare US, Franklin, TN 37067** as the responsible US entity.
- The current US assortment is distinct from UK/EU Sheba. This campaign uses US barcodes and US evidence only for formula fields. Non-US pages are not used to fill US data gaps.

## 2. Ranges

Current US evidence confirms these range / sub-brand names in use:

- **Perfect Portions** — real and current. Paté and Cuts in Gravy are major format families inside it.
- **Gravy Indulgence** — current and **missing from `data/us-pet-brands.ts`**.
- **Selections Filets in Broth** — current meal-complement range and **missing from `data/us-pet-brands.ts`**.
- **Kitten** / SHEBA Wet Kitten Food — current and **missing from the four shelf-memory names**.
- **Meaty Tender Sticks** — real and current. It is a treat range.
- **Bistro** — the current all-products page still exposes a Bistro filter, so the shelf-memory name is not discarded; batch 1 did not add a Bistro UPC yet.
- **Filets** by itself is too broad for the current US packs researched here; the current printed family is **Selections Filets in Broth**.

The current SHEBA all-products page also exposes additional live families not yet researched in this batch: **Sheba Grilled**, **PREMIUM Purée**, and **Selections Bisques**. These are future coverage targets and likely need brand-entry additions if their packs use those names.

## 3. Twin-serve handling

Perfect Portions and Gravy Indulgence are twin-serve retail trays: one retail twin-pack is about **2.64 oz total, two 1.32 oz servings**. For individual twin-packs, `size` must describe the whole package carrying the barcode, while calories must preserve the printed basis (often per serving). Batch 1 deliberately starts with outer consumer cartons/cases only; no individual Perfect Portions formula was promoted from incomplete calorie evidence.

## 4. Snack / topper / supplement ranges the role detector must learn

- **Meaty Tender Sticks** = `food_form: treat`. The name contains none of `treat`, `snack`, `chew`, `biscuit`, `jerky`, so `lib/nutrition-role.ts` must be taught this exact range during seeding.
- **Selections Filets in Broth** = meal complement / intermittent or supplemental feeding, not a complete dinner. It should be mapped as a supplement/meal-complement role during seeding even though the range name itself does not say `supplement`.

## 5. GS1 prefixes

Every Sheba code in batch 1 is in the **023100** UPC-A family. Independent current retail evidence ties these codes to Sheba, and the same 023100 family is used across Mars Petcare products. Recommendation for seeding: register/confirm `023100` for **Mars Petcare US** rather than borrowing Royal Canin's `030111` prefix.

## 6. Market separation

US Sheba must remain separate from UK/EU/AU Sheba. Current US packs in this batch use UPC-A 023100… and US formulations / pack structures. Non-US Sheba has different barcodes and often different recipes, so no foreign-market formula text was used to complete a US record.

## 7. Wrong-barcode recommendations

No candidate from batch 1 should be put on the wrong-barcode list merely for being an outer carton. The carton/case codes are intentionally recorded with `barcode_scope: multipack` or `case` and no stitched composition. If seeding later decides a same-formula 12-tray shipping case should redirect to a proven individual tray code, add that only after the individual tray barcode is independently proven.

## 8. Unresolved tail by reason

- **Individual Perfect Portions / Gravy Indulgence:** exact UPC and formula are easy to find, but current accessible manufacturer nutrition blocks are image-based and calorie basis can be per half. Do not source-verify an individual tray until the US calorie statement and exact basis are read from a current label/deck.
- **Bistro:** current site filter says the family exists, but batch 1 did not yet bind current US barcodes to exact Bistro products.
- **Selections single trays:** current individual tray codes are visible for several recipes, but the batch prioritized the shopper-scannable 12-tray cases plus the 8-pack variety carton. Individual formula records remain for a later pass.
- **Additional live families:** Sheba Grilled, PREMIUM Purée, and Selections Bisques are visible on the current US catalog and remain untouched.
- **Inner barcodes:** outer multipacks are seedable with `contains: []`; do not hold them at `needs_physical_label` solely because inner UPCs are unproven.

## 9. Batch 1

Sheba batch 1
  added:            20   (running total: 20)
  source_verified:  20   needs_physical_label: 0   candidate: 0   rejected: 0
  individual_unit:  0    multipack: 15   case: 5
  ranges touched:   Perfect Portions; Kitten; Gravy Indulgence; Selections Filets in Broth; Meaty Tender Sticks
  checker:          clean
  commit:           this batch commit (see draft PR report for SHA)
  remote verified:  pending post-commit readback
  new this batch:   023100 Mars prefix family; Gravy Indulgence; Selections Filets in Broth; Kitten; role-detector gaps for Meaty Tender Sticks and Selections Filets in Broth

## 10. Where this pass stops

Batch 1 stops after 20 new records as required. It intentionally favors high-confidence outer cartons/cases rather than padding the batch with individual wet trays whose calorie basis is not yet proven from a current US label.
