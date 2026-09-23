# Meow Mix — handoff (batch 046)

## 1. Source and method

meowmix.com (J.M. Smucker) is not a Mars build, and it is the easiest maker
site met so far. Every product page prints the **Ingredient Statement,
Guaranteed Analysis, Calorie Content and AAFCO statement as page text**, so
the composition is copied as text: nothing was transcribed from an image.
All 47 URLs from the sitemap loaded. 37 of them are product pages, and the
rest are category pages.

**Barcode ↔ size is the hard part.** A page carries one `gtin12` in its
structured data and ALL its barcodes in the "Find Product" button
(`data-mm-ids`), and it lists its sizes separately, with nothing pairing the
two. So:

- when there is one barcode and one size, they are bound;
- otherwise each barcode is bound only when its upcitemdb.com title names a
  weight equal to one of the page's own sizes;
- the rest stay as **candidates**: real barcodes of that recipe, but with no
  size, so they cannot be seeded.

The recipe is one per page, so the page's composition belongs to every
barcode the page lists.

## 2. Tally

59 records:

| Status | Count |
|---|---:|
| source_verified | 31 single packs, plus 2 boxes seeded |
| needs_physical_label | 10 |
| candidate | 16 |

The needs_physical_label records are 5 variety cartons with no range, and a
few packs where the page gives no composition or its list is shared with
another page.

## 3. The calorie finding

Fifteen pages print "N kcal/oz" for a figure their own kcal/kg cannot
produce (3404 kcal/kg against "305 kcal/oz"). That figure fits a cup, or a
whole 2.75 oz tub, and not an ounce. For those, kcal/kg is stored and the
per-unit figure is not. See `docs/CATALOG-CONFLICTS.md`, batch 046.

## 4. Seeded

36 barcodes, 31 compositions, and 2 twelve-count cartons.

- **Prefixes:** 829274 is new. So is 851599, which is on Hairball Control.
  One variety pack sits in 9Lives' Del Monte-era 079100 block.
- **Ranges added:** Hairball Control, Kitten Lil Nibbles, Chunks in Gravy,
  Paté in Gravy, Tenders in Sauce.
- The treats (Irresistibles and the Gravy Bursts treats) resolve as treats
  from their names.

## 5. Next

16 candidate barcodes need a size: a retailer listing or a photograph of the
bag.
