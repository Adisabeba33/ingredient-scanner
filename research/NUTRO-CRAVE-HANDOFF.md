# Nutro and Crave — handoff (batch 047)

Both brands are Mars, and both sites are the build described in
TEMPTATIONS-HANDOFF §2. Web and shell were both available, and every checker
result below comes from a real run.

## Nutro

nutro.com: 113 product pages, 111 of which loaded, giving 172 sizes, each
with its own barcode under prefix **079105**. That prefix is new and has been
added to `data/gs1-prefixes.ts`.

| Status | Count |
|---|---:|
| source_verified | 27 |
| needs_physical_label | 145 (15 of them variety packs) |

Why the individual sizes stopped:

- **77**: their own section shows only marketing graphics.
- **~40**: an image, or the list itself, is shared with another product's
  page. One example is Adult Salmon and Large Breed Salmon.
- **6**: the two readings disagreed.
- **6**: no calorie line could be parsed. The treat panels print
  "3637 KCAL ME/CUP, 5 KCAL ME/TREAT"; the first unit is almost certainly
  meant to be /KG, but it is not corrected here.
- Panels that carry two recipes stop at step 3.

Seeded: 157 barcodes and 27 compositions. No variety pack states a count, so
none is seeded as a box. Four ranges were added from the taxonomy: Perfect
Portions, Crunchy Treats, Hearty Stew, Premium Loaf.

## Crave

cravepetfoods.com has only 10 product pages. Unlike the other Mars sites, the
size sections here **carry no per-size barcode**: each page has one sku.

- The 3 wet pages have one size each, so the sku binds to it.
- On the 7 dry pages, the sku is bound only where upcitemdb's title names
  one of the page's bag weights. That worked for 6 of them.

Crave's taxonomy is also unreliable: it calls a 12 lb bag a "can" and one
dry cat bag "Wet". Form and package therefore come from the product name.

Seeded: 9 barcodes and 6 compositions. None carries a range. The seed's
"Grain Free" and "High Protein" were shelf memory, and nothing on these
pages proves either.

A printed oddity, copied as printed: every Crave cat panel's AAFCO footnote
says "AAFCO **Dog** Food Nutrient Profiles".
