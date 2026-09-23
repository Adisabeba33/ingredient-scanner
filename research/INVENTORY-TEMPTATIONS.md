# Temptations inventory — research start

Generated: 2026-09-23

This is the campaign inventory, not a claim that the visible product index is exhaustive.

## Maker-site facts established

- The public Temptations site exposes product pages under `/products/treats/`, `/products/dry/`, and `/products/wet/`.
- The public treats index currently exposes 64 visible results; `docs/NEXT-AGENT-BRIEF.md` records 85 product pages for the Mars-site harvest. The campaign therefore keeps discovering direct, seasonal and older URLs rather than treating 64 as the ceiling.
- Product pages expose a size selector and label-panel images.
- Classic Tasty Chicken currently exposes sizes: 1 oz, 1.7 oz, 3 oz, 6.3 oz, 16 oz (twice in the rendered selector), 30 oz and 48 oz. A page-level sku therefore must not be assigned blindly to every size.
- Classic Tasty Chicken's current maker nutrition panel prints ingredients and guaranteed analysis but no exact calorie line on that panel. The marketing copy says less than 2 calories per treat; that is not substituted for the exact step-2 calorie field.
- The site also carries complete-food dry and wet products. Do not force all Temptations identities to `food_form: "treat"`; only actual treat products get that value.

## Direct pages confirmed in the first discovery pass

| Surface | Product page | Sizes seen | Campaign note |
|---|---|---|---|
| Treat | Tasty Chicken Flavor | 1, 1.7, 3, 6.3, 16, 16, 30, 48 oz | Classic; multi-size page |
| Treat | MixUps BACKYARD COOKOUT | 1.7, 3, 6.3, 16, 30 oz | MixUps |
| Treat | Mixups Tasty Human | 3, 16 oz | seasonal/Halloween; evidence direct page remains live |
| Treat | JUMBO Stuff Tasty Chicken Flavor | 2.47 oz in maker benefit copy | Jumbo Stuff |
| Treat | MixUps Catmas Casserole Catnip Fever Flavor | 3, 16 oz | seasonal/holiday; direct page remains live |
| Dry | Tasty Chicken Flavor Dry Cat Food | 6.3, 13.5, 20 lb | complete-food dry |
| Dry | Tasty Chicken Flavor Dry Cat Food (separate 3.15-lb URL) | 3.15 lb | separate maker URL |
| Dry | Tasty Chicken Flavor Adult Dry Cat Food, Holiday Edition | 3.15 lb | seasonal package |
| Wet | Tasty Chicken Flavor Paté in Gravy | 3.5 oz | complete-food wet |
| Wet | Tasty Chicken Flavor Bites in Gravy | 3.5 oz | complete-food wet |

## First panel transcription — Tasty Chicken Flavor

Maker panel image:
`https://www.temptationstreats.com/sites/g/files/fnmzdf3061/files/migrate-product-files/images/mgmr272eap2dhqr7q0yf.png`

First reading only — **not sufficient to claim an independent dual transcription**:

Ingredients:
`Chicken By-Product Meal, Ground Corn, Animal Fat (preserved with Mixed Tocopherols), Wheat Flour, Brewers Rice, Dried Meat By-Products, Natural Flavors, Brewers Dried Yeast, Potassium Chloride, Choline Chloride, Salt, Caramel Color, DL-Methionine, Taurine, Calcium Carbonate, Vitamin E Supplement, Zinc Sulfate, Natural Tuna Flavor, Ferrous Sulfate, Dried Cheese, Mixed Tocopherols (preservative), Copper Sulfate, Vitamin A Supplement, Citric Acid (preservative), Niacin Supplement, Vitamin B12 Supplement, Riboflavin Supplement, Manganese Sulfate, Thiamine Mononitrate, D-Calcium Pantothenate, Pyridoxine Hydrochloride (Vitamin B6), Vitamin D3 Supplement, Biotin, Potassium Iodide, Folic Acid, Rosemary Extract`

Guaranteed analysis:
- Crude Protein (min.) 28.0%
- Crude Fat (min.) 21.0%
- Crude Fiber (max.) 4.5%
- Moisture (max.) 10.0%

The panel does not print the exact calorie field required by the campaign decision table. Until an exact calorie witness and exact size-to-barcode mapping are captured, this recipe must not be promoted merely from this image.

## Integrity observations

1. The Classic Tasty Chicken page repeats one ingredient image across several rendered size variants. This is useful recipe evidence but does not prove that a single page sku belongs to all displayed sizes.
2. The page says the treats are 100% nutritionally complete and balanced for adult maintenance, while their product form remains a treat. Nutrition-role handling must preserve that distinction.
3. Seasonal direct pages (Tasty Human, Catmas Casserole, holiday dry bag) demonstrate why the current visible index cannot be used as the complete historical/direct-page inventory.

## Next campaign pass

Continue URL discovery, extract structured-data skus, validate every UPC-A check digit, establish exact sku-to-size mapping, and capture exact calorie evidence. Records lacking one of those witnesses stop at `needs_physical_label`; no status is upgraded from marketing copy.
