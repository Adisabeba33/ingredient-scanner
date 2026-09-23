# Temptations — handoff (batch 043)

Supersedes the partial handoff an earlier agent wrote from a runtime with no
shell and no browser: it found the brand's shape correctly (multi-size pages,
complete foods as well as treats) but could not collect a barcode. Its 17
leads in `TEMPTATIONS-CANDIDATES.json` are all covered by the ledger now.

## 1. Capabilities

Web through Chromium, and a shell, in one session. Every checker result below
comes from a real run.

## 2. How the pages were read, and the thing that changed the method

temptationstreats.com is the same Mars build as cesar.com, with one difference
that matters. **Every size on a page is its own section** (`data-pdp-size-id`),
with its own barcode in the "Buy Now" block (`data-mm-ids`) and **its own label
images**. Those images differ between sizes. The Tasty Chicken page has 8 sizes,
8 guaranteed-analysis images and 3 different ingredient images. So:

- barcode ↔ size comes from the page itself, per section. Multi-size pages are
  no longer a dead end: 122 sizes on 47 pages, each with its own barcode;
- a composition is attached only to the size whose section showed it. It is
  never spread across the page.

`scripts/harvest-maker-pages.mjs` now works this way (`sizes[]` per page, one
download per distinct image file). The sitemap and `/products` returned 403 on
this site, so the script falls back to crawling product pages ("pets may also
like" links) from seeds.

## 3. Tally

112 records from 47 pages:

| Status | Count | Why |
|---|---:|---|
| source_verified | 12 | route A, both readings agree, no shared image, one recipe per product |
| needs_physical_label | 97 | see below |
| candidate | 2 | a second barcode listed as "16 OZ" on the same page as another 16 OZ; not seeded |
| rejected | 1 | `02310018010`: 11 digits that already start with 0, so not a dropped leading zero |

Why the 87 individual units stopped (the other 10 records are variety packs):

- 44 — the panel prints no calorie line. Classic and MixUps panels only say
  "less than 2 kcal per treat" on a marketing graphic, which is not the label.
- 26 — no readable panel: 20 sizes' images return 403 from the maker's own
  site, and the rest show only marketing graphics.
- 5 — guarantees and calories are shown but no ingredient list.
- 9 — the same ingredient image file, byte for byte, is shown on different
  products' pages. **One image listing "Natural Tuna Flavor" appears on the
  Tasty Chicken, Tempting Tuna and Savory Salmon pages.** The Creamy Puree and
  Lickable Puree pages share images, and so do Jumbo Stuff Tasty Chicken and
  Classic Enticing Trout.
- 2 — Classic Blissful Catnip 3 oz prints "Dried Cheese" and 16 oz prints
  "Dried Cheddar Cheese": two label generations under one name, so neither is
  stored.
- 1 — the two readings disagreed.

## 4. Route

All 12 are route A.

## 5. Prefixes

`023100` (Mars) on 103 records; **`058496`** on 8. The latter is new and is added
to `data/gs1-prefixes.ts` as observed, on the 3 oz and 6.3 oz Classic pouches.

## 6. Ranges and food roles

Mars' "Sub brand" values. Added: Lickable Puree, Lickable Spoons, Kitten,
Indoor Care, Paté in Gravy, Bites in Gravy. The dry bags carry no range.

**Temptations is no longer only treats.** `lib/nutrition-role.ts` read the brand
name alone as a treat, which would have waved the complete dry food and wet
trays through every everyday standard. Paté in Gravy, Bites in Gravy and the
dry bags now read as dinner under Temptations. Tested both ways.

## 7. Checker

`node scripts/check-ledger.mjs research/deep-research-temptations.json`:
0 errors before seeding. After seeding it reports "99 barcodes are already in
the catalog", which is expected. The warnings are:

- Lickable Puree calories are per tube, and the carton's size is the whole
  carton;
- the shared-list families above.

The checker now also skips identity collisions for `candidate` records, as it
already did for `rejected`. Neither is ever seeded.

## 8. Next

- 20 sizes whose panel image the site cannot serve, and 44 with no calorie
  line: route B or a photograph.
- The 30 OZ and 48 OZ sizes of Classic almost all have their panels 403.
- **Cesar can be revisited with this method.** Its dry bags and two Softies
  stopped at step 2 for "several sizes under one sku", which the per-size
  sections now resolve.
