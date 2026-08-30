# Missing scanned pet-food UPC research — 2026-08-30

## Purpose

This is a cross-brand handoff created from real `Looked for, not found` scanner hits. It is **not** a canonical `deep-research-*.json` brand ledger, because `research/AGENTS.md` requires one assigned brand per ledger and reserves `deep-research-barcodes.json` for Fancy Feast + Friskies only.

The purpose of this document is to give the catalog/import agent a complete, source-traceable promotion packet for the six pet-food UPCs. Production insertion is still a separate explicit step.

All six UPC-A check digits were recomputed and pass. Repository code search on current `main` returned no match for any of the six exact UPC strings. None appears in the current `data/wrong-barcodes.ts` list checked for this pass.

## Promotion summary

| UPC | Product | Research decision |
|---|---|---|
| `050000577989` | Friskies Tasty Treasures — current product is **With Turkey and Liver in Gravy**, 5.5 oz | **NEEDS PHYSICAL LABEL** — UPC survived a material name/formula generation change from older Turkey & Cheese listings |
| `050000429349` | Fancy Feast Classic Paté Seafood Feast, 3 oz | **SOURCE VERIFIED / READY FOR CATALOG PROMOTION** |
| `050000153558` | Fancy Feast Gravy Lovers Chicken Feast Paté in Gravy, 3 oz | **SOURCE VERIFIED / READY FOR CATALOG PROMOTION** |
| `050000180721` | Fancy Feast Gravy Lovers Salmon Feast Paté in Gravy, 3 oz | **SOURCE VERIFIED / READY FOR CATALOG PROMOTION** |
| `071190478450` | 9Lives Indoor Essentials Dry Cat Food, 3.15 lb | **SOURCE VERIFIED / READY FOR CATALOG PROMOTION** |
| `017800012638` | Purina ONE +Plus Hairball Formula Dry Cat Food, 3.5 lb | **SOURCE VERIFIED / READY FOR CATALOG PROMOTION** |

---

## 1. UPC `050000577989`

### Identity

- Canonical GTIN-14: `00050000577989`
- Barcode scope: individual unit
- Brand: Friskies
- Manufacturer: Nestlé Purina PetCare Company
- Species: cat
- Product line: Tasty Treasures
- Current product name: **Friskies Tasty Treasures With Turkey and Liver in Gravy**
- Variant: With Turkey and Liver in Gravy
- Recipe: turkey, liver
- Life stage: adult
- Food form: wet
- Texture: chunks
- Presentation: in_gravy
- Package type: can
- Printed size: 5.5 oz

### Current formula evidence

Current Purina product page:

`https://www.purina.com/cats/shop/friskies-tasty-treasures-turkey-liver-gravy-wet-cat-food`

Current ingredient statement shown by Purina, order preserved:

> Water Sufficient for Processing, Liver, Meat By-Products, Poultry By-Product, Fish, Turkey, Chicken, Rice, Artificial And Natural Flavors, Guar Gum, Potassium Chloride, Magnesium Proteinate, Zinc Sulfate, Ferrous Sulfate, Manganese Sulfate, Copper Sulfate, Potassium Iodide, Tricalcium Phosphate, Carrageenan, Salt, Taurine, Choline Chloride, Thiamine Mononitrate (Vitamin B-1), Vitamin E Supplement, Niacin (Vitamin B-3), Calcium Pantothenate (Vitamin B-5), Pyridoxine Hydrochloride (Vitamin B-6), Riboflavin Supplement (Vitamin B-2), Vitamin B-12 Supplement, Biotin (Vitamin B-7), Vitamin A Supplement, Folic Acid (Vitamin B-9), Menadione Sodium Bisulfite Complex (Vitamin K), Vitamin D-3 Supplement

Current calories:

- 1046 kcal/kg
- 163 kcal/can

Current Purina page describes the recipe as complete and balanced for adult cats.

### Barcode evidence

Current Dollar General single-unit page:

`https://www.dollargeneral.com/p/x/50000577989`

The item path/body carries `50000577989`; restoring the standard leading zero yields UPC-A `050000577989`, whose check digit independently validates. The page identifies the current 5.5 oz Turkey and Liver product.

Corroborating 2025 distributor evidence with the **same exact UPC**:

`https://www.admc.us/wp-content/uploads/2022/02/2024-North-Complete-Price-List_4.9.25-compressed.pdf`

That source instead identifies `050000577989` as **Tasty Treasures Turkey & Cheese in Gravy**, 5.5 oz.

Older Turkey & Cheese page showing an older/different formula generation:

`https://www.heb.com/product-detail/purina-friskies-tasty-treasures-turkey-and-cheese-in-gravy-cat-food/1461770`

### Conflict / decision

This is a genuine formula-generation conflict under a stable UPC. Older evidence ties the exact UPC to **Turkey & Cheese**, while current Purina and current retail evidence tie it to **Turkey & Liver**, with a materially different ingredient statement.

The accessible current manufacturer HTML does not provide enough evidence to safely fill the complete current Guaranteed Analysis panel under the same UPC, and importing an older Turkey & Cheese GA would mix generations.

**Research status: `needs_physical_label`.**

Do **not** seed either formula under this UPC until a current physical 5.5 oz can (barcode + ingredient panel + GA + calorie panel in the same package generation) or a current Purina label deck resolves the generation completely.

---

## 2. UPC `050000429349`

### Identity

- Canonical GTIN-14: `00050000429349`
- Barcode scope: individual unit
- Brand: Fancy Feast
- Manufacturer: Nestlé Purina PetCare Company
- Species: cat
- Product line: Classic Paté / Timeless Favorites
- Product name: **Fancy Feast Classic Paté Seafood Feast**
- Variant: Seafood Feast
- Recipe: ocean fish
- Life stage: all
- Food form: wet
- Texture: pate
- Presentation: plain
- Package type: can
- Printed size: 3 oz

### Barcode evidence

Current Target single-unit page, package quantity 1, 3 oz, exact UPC:

`https://www.target.com/p/-/A-14777635`

It explicitly reports UPC `050000429349`.

Independent current retail corroboration:

`https://www.cub.com/store/cub/products/74089-purely-fancy-feast-grain-free-pate-wet-cat-food-classic-pate-seafood-feast-3-oz`

It also explicitly reports UPC `050000429349`, size 3 oz.

### Manufacturer formula evidence

Current Purina product page:

`https://www.purina.com/cats/shop/fancy-feast-timeless-favorites-classic-pate-seafood-wet-cat-food`

Official Purina label deck:

`https://www.purina.com/sites/default/files/product-label-deck-file/2023-05/6674-d667422-fancy-feast-classic-seafood-feast-gourmet-cat-food-wet.pdf`

Label/deck code: `D667422`

Ingredients, complete printed order:

> Ocean fish, meat by-products, liver, fish broth, artificial and natural flavors, tricalcium phosphate, guar gum, MINERALS [potassium chloride, magnesium proteinate, zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, potassium iodide], VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), Vitamin A supplement, menadione sodium bisulfite complex (Vitamin K), pyridoxine hydrochloride (Vitamin B-6), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, biotin (Vitamin B-7), folic acid (Vitamin B-9), Vitamin D-3 supplement], salt.

Guaranteed Analysis:

- Crude Protein (Min): 12.0%
- Crude Fat (Min): 3.5%
- Crude Fiber (Max): 1.5%
- Moisture (Max): 78.0%
- Ash (Max): 3.25%
- Taurine (Min): 0.05%

Calories:

- 1036 kcal/kg
- 88 kcal/can

Nutritional adequacy: formulated for all life stages.

Calorie cross-check: 1036 kcal/kg × ~0.085 kg = ~88.1 kcal per nominal 3 oz can, agreeing with the printed 88 kcal/can after normal package/label rounding.

**Research status: `source_verified`.**

---

## 3. UPC `050000153558`

### Identity

- Canonical GTIN-14: `00050000153558`
- Barcode scope: individual unit
- Brand: Fancy Feast
- Manufacturer: Nestlé Purina PetCare Company
- Species: cat
- Product line: Gravy Lovers
- Product name: **Fancy Feast Gravy Lovers Chicken Feast Paté in Gravy**
- Variant: Chicken Feast Paté in Gravy
- Recipe: chicken
- Life stage: all
- Food form: wet
- Texture: pate
- Presentation: in_gravy
- Package type: can
- Printed size: 3 oz

### Barcode evidence

Current ShopRite single-can page:

`https://www.shoprite.com/product/purina-fancy-feast-gravy-lovers-chicken-feast-in-gravy-pat-gourmet-cat-food-3-oz-id-00050000153558`

The page identifies one 3 oz can and exposes GTIN-14 `00050000153558`, equivalent to UPC-A `050000153558`.

### Manufacturer formula evidence

Current Purina product page:

`https://www.purina.com/cats/shop/fancy-feast-gravy-lovers-chicken-pate-gravy-wet-cat-food`

Official Purina label deck:

`https://www.purina.com/sites/default/files/product-label-deck-file/2024-05/5123-a512323-fancy-feast-gravy-lovers-chicken-feast-pate-in-gravy-gourmet-cat-food-lj4.pdf`

Label/deck code: `A512323`

Ingredients, complete printed order:

> Chicken broth, chicken, meat by-products, liver, fish, artificial and natural flavors, MINERALS [potassium chloride, magnesium proteinate, zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, potassium iodide], guar gum, carrageenan, tricalcium phosphate, taurine, choline chloride, salt, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), Vitamin A supplement, menadione sodium bisulfite complex (Vitamin K), pyridoxine hydrochloride (Vitamin B-6), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, biotin (Vitamin B-7), folic acid (Vitamin B-9), Vitamin D-3 supplement].

Guaranteed Analysis:

- Crude Protein (Min): 8.5%
- Crude Fat (Min): 4.0%
- Crude Fiber (Max): 1.5%
- Moisture (Max): 82.0%
- Ash (Max): 3.25%
- Taurine (Min): 0.05%

Calories:

- 976 kcal/kg
- 83 kcal/can

Nutritional adequacy: growth of kittens and maintenance of adult cats; stored as `all` under repository vocabulary.

Calorie cross-check: 976 kcal/kg × ~0.085 kg = ~83.0 kcal/can.

**Research status: `source_verified`.**

---

## 4. UPC `050000180721`

### Identity

- Canonical GTIN-14: `00050000180721`
- Barcode scope: individual unit
- Brand: Fancy Feast
- Manufacturer: Nestlé Purina PetCare Company
- Species: cat
- Product line: Gravy Lovers
- Product name: **Fancy Feast Gravy Lovers Salmon Feast Paté in Gravy**
- Variant: Salmon Feast Paté in Gravy
- Recipe: salmon
- Life stage: adult
- Food form: wet
- Texture: pate
- Presentation: in_gravy
- Package type: can
- Printed size: 3 oz

### Barcode evidence

Current ShopRite single-can page:

`https://www.shoprite.com/sm/planning/rsid/616/product/purina-fancy-feast-gravy-lovers-salmon-feast-in-gravy-pat-gourmet-cat-food-3-oz-id-00050000180721`

It explicitly reports UPC/GTIN `00050000180721` on the 3 oz Salmon Feast Paté product. Removing the two GTIN padding zeros gives UPC-A `050000180721`, whose check digit independently validates.

### Manufacturer formula evidence

Current Purina product page:

`https://www.purina.com/cats/shop/fancy-feast-gravy-lovers-salmon-pate-gravy-wet-cat-food`

Official Purina label deck:

`https://www.purina.com/sites/default/files/product-label-deck-file/2024-05/6499-a649923-fancy-feast-gravy-lovers-salmon-feast-pate-in-gravy-gourmet-cat-food-lj6.pdf`

Label/deck code: `A649923`

Ingredients, complete printed order:

> Fish broth, salmon, chicken, meat by-products, liver, glycine, natural and artificial flavors, MINERALS [potassium chloride, magnesium proteinate, zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, potassium iodide], guar gum, tricalcium phosphate, carrageenan, choline chloride, taurine, salt, VITAMINS [thiamine mononitrate (Vitamin B-1), Vitamin E supplement, niacin (Vitamin B-3), calcium pantothenate (Vitamin B-5), Vitamin A supplement, menadione sodium bisulfite complex (Vitamin K), pyridoxine hydrochloride (Vitamin B-6), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, biotin (Vitamin B-7), folic acid (Vitamin B-9), Vitamin D-3 supplement].

Guaranteed Analysis:

- Crude Protein (Min): 8.5%
- Crude Fat (Min): 4.0%
- Crude Fiber (Max): 1.5%
- Moisture (Max): 82.0%
- Ash (Max): 3.25%
- Taurine (Min): 0.05%

Calories:

- 965 kcal/kg
- 82 kcal/can

The current retailer page states maintenance of adult cats. The current label generation should therefore be stored as adult unless the catalog importer directly observes a broader adequacy statement on the current manufacturer deck.

Calorie cross-check: 965 kcal/kg × ~0.085 kg = ~82.0 kcal/can.

**Research status: `source_verified`.**

---

## 5. UPC `071190478450`

### Identity

- Canonical GTIN-14: `00071190478450`
- Barcode scope: individual unit
- Brand: 9Lives
- Manufacturer: not asserted here; preserve as `null` unless the current physical pack/manufacturer source explicitly names the legal manufacturer
- Species: cat
- Product line: Indoor Essentials
- Product name: **9Lives Indoor Essentials Dry Cat Food**
- Variant: Chicken & Salmon Flavors
- Recipe: chicken, salmon
- Life stage: adult
- Food form: dry
- Texture: kibble
- Presentation: plain
- Package type: bag
- Printed size: 3.15 lb

### Barcode evidence

Current Universal Wholesale listing:

`https://uwidirect.com/products/9-lives-cat-food-2319-indoor-complete`

It explicitly reports:

- UPC `071190478450`
- Size `3.15LB/BAG`
- Case pack 4 (the item UPC is for the bag; case quantity is separately identified)

### Manufacturer formula evidence

Current 9Lives product page:

`https://www.9lives.com/product/9lives-indoor-essentials-dry-cat-food/`

Ingredients, complete order from the current manufacturer page:

> Whole Ground Corn, Chicken By-Product Meal, Soybean Meal, Meat And Bone Meal, Whole Wheat, Corn Protein Meal, Animal Fat (Preserved With Mixed Tocopherols), Natural Flavor (Preserved With Mixed Tocopherols), Soybean Hulls, Salmon Meal, Phosphoric Acid, Dehydrated Alfalfa Meal, Salt, Titanium Dioxide (Color), Choline Chloride, Vitamins (Vitamin E Supplement, Niacin Supplement, Vitamin A Supplement, Thiamine Mononitrate, Riboflavin Supplement, D-Calcium Pantothenate, Pyridoxine Hydrochloride, Vitamin B12 Supplement, Menadione Sodium Bisulfite Complex [Source Of Vitamin K Activity], Folic Acid, Biotin, Vitamin D3 Supplement), Taurine, Minerals (Ferrous Sulfate, Zinc Oxide, Manganous Oxide, Copper Sulfate, Sodium Selenite, Calcium Iodate), Potassium Chloride, Red 40, Lactic Acid, BHA (Used As A Preservative), Yellow 5, Yellow 6, Blue 1, Rosemary Extract.

Guaranteed Analysis:

- Crude Protein (Min): 28.0%
- Crude Fat (Min): 9.0%
- Crude Fiber (Max): 4.0%
- Moisture (Max): 12.0%
- Calcium (Min): 1.2%
- Phosphorus (Min): 1.0%
- Iron (Min): 180 mg/kg
- Selenium (Min): 0.4 mg/kg
- Vitamin E (Min): 100 IU/kg
- Taurine (Min): 0.1%

Calories:

- 3360 kcal/kg
- 305 kcal per 8 oz measuring cup

Nutritional adequacy: adult maintenance.

**Research status: `source_verified`.**

---

## 6. UPC `017800012638`

### Identity

- Canonical GTIN-14: `00017800012638`
- Barcode scope: individual unit
- Brand: Purina ONE
- Manufacturer: Nestlé Purina PetCare Company
- Species: cat
- Product line: +Plus
- Product name: **Purina ONE +Plus Hairball Formula Dry Cat Food**
- Variant: Hairball Formula
- Recipe: chicken
- Life stage: adult
- Food form: dry
- Texture: kibble
- Presentation: plain
- Package type: bag
- Printed size: 3.5 lb

### Barcode evidence

Single-bag retail corroboration with exact UPC:

`https://jordan.desertcart.com/products/22312480-purina-onenatural-cat-food-for-hairball-control-plus-hairball-formula-3-5-lb-bag`

The listing explicitly identifies UPC `017800012638` and one 3.5 lb bag.

Additional corroboration:

`https://www.ubuy.tg/en/product/3VMGOP2IS-purina-one-natural-dry-cat-food-hairball-formula-3-5-lb-bag`

### Manufacturer formula evidence

Current Purina product page:

`https://www.purina.com/cats/shop/purina-one-hairball-control-dry-cat-food`

Official Purina label PDF linked from the product:

`https://www.purina.com/sites/default/files/products/files/M418520_Purina_ONE_Hairball_Formula_Natural.pdf`

Label/deck code: `M418520`

Ingredients, complete printed order:

> Chicken, corn gluten meal, chicken by-product meal (source of glucosamine), rice flour, soybean meal, beef fat preserved with mixed-tocopherols, whole grain corn, powdered cellulose, soybean hulls, liver flavor, chicken meal (source of glucosamine), phosphoric acid, calcium carbonate, salt, caramel color, dried carrots, dried peas, choline chloride, potassium chloride, taurine, MINERALS [zinc sulfate, ferrous sulfate, manganese sulfate, copper sulfate, calcium iodate, sodium selenite], VITAMINS [Vitamin E supplement, niacin (Vitamin B-3), Vitamin A supplement, calcium pantothenate (Vitamin B-5), thiamine mononitrate (Vitamin B-1), riboflavin supplement (Vitamin B-2), Vitamin B-12 supplement, pyridoxine hydrochloride (Vitamin B-6), folic acid (Vitamin B-9), Vitamin D-3 supplement, biotin (Vitamin B-7), menadione sodium bisulfite complex (Vitamin K)], Vitamin E supplement.

Guaranteed Analysis:

- Crude Protein (Min): 34.0%
- Crude Fat (Min): 14.0%
- Crude Fiber (Max): 4.5%
- Moisture (Max): 12.0%
- Linoleic Acid (Min): 1.4%
- Calcium (Min): 1.0%
- Phosphorus (Min): 0.9%
- Zinc (Min): 150 mg/kg
- Selenium (Min): 0.35 mg/kg
- Vitamin A (Min): 10,000 IU/kg
- Vitamin E (Min): 100 IU/kg
- Taurine (Min): 0.15%
- Omega-6 Fatty Acids (Min): 1.5%

Calories:

- 3977 kcal/kg
- 445 kcal/cup

Nutritional adequacy: Purina feeding tests substantiate complete and balanced nutrition for maintenance of adult cats.

**Research status: `source_verified`.**

---

## Required catalog-import behavior

1. Promote only the five `source_verified` records after the normal production-seeding duplicate checks.
2. Do **not** promote UPC `050000577989` yet. The stable UPC spans materially different Turkey & Cheese vs. Turkey & Liver generations; a current physical label is required to prevent a formula-generation mix.
3. Preserve zero-padded UPC strings and the GTIN-14 values above.
4. Preserve ingredient order exactly; do not alphabetize or normalize away parenthesized vitamin/mineral blocks.
5. Store all non-core printed guarantees for 9Lives and Purina ONE rather than dropping them just because the basic GA interface has fewer common fields.
6. Re-run the repository duplicate/collision checks immediately before production promotion because other research branches may have moved since this handoff was written.

## Repository checks performed for this handoff

- Read `research/AGENTS.md` and followed its evidence/status rules.
- Checked current repository code search for all six exact UPC strings; no current `main` match was returned.
- Checked `data/wrong-barcodes.ts`; none of these six is listed there.
- Reused repository controlled vocabulary from `lib/presentation.ts` (`pate`, `chunks`, `kibble`, `in_gravy`, `plain`).
- Recomputed all six UPC-A check digits.
- Kept this as a cross-brand handoff rather than creating an invalid multi-brand `deep-research-*.json` ledger.

Access date for this research pass: **2026-08-30**.
