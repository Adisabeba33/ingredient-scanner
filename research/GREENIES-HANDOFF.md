# Greenies — handoff (batch 045)

## 1. Capabilities

Web through Chromium, and a shell, in one session. Every checker result below
comes from a real run.

## 2. Source

greenies.com, the same Mars build as the other brand sites. Its sitemap
answered in the browser (86 product pages, 85 loaded), and every size has its
own section, barcode and panel images (see TEMPTATIONS-HANDOFF §2). One
difference in the markup: the size selector here puts `href` before
`data-size-id` and has no `title`, so sizes are now read from the button's own
`<span>`. The harvester handles both builds.

## 3. Tally

169 records, all under prefix **642863** (new, added to `data/gs1-prefixes.ts`):

| Status | Count |
|---|---:|
| source_verified | 17 |
| needs_physical_label | 145 |
| candidate | 7 |

The candidates are barcodes the page lists at the same size as another code for
the same product. They are kept as leads, not seeded.

Why the individual units stopped:

- **112**: no panel in the size's own section. It shows only marketing
  graphics, or the image did not load. This is most of the dog dental range.
- **20**: the size's own two images **disagree with each other**. A full label
  panel sits next to a separate GA/calorie graphic with different figures (for
  example fibre 8% and 3616 kcal/kg against 10% and 3480). On Pill Pockets
  Salmon, the full panel's AAFCO line names *Feline Greenies Dental Treats*.
  Two generations on one page mean a photograph decides.
- **9**: an image is shared with another product's page (Occupy Twists).
- **2**: no ingredient list.

All 17 verified records are cat products: Feline SmartBites, Feline Pill
Pockets and Smart Purees. All are route A.

## 4. Seeded

- 144 barcodes and 17 compositions. **16 supplements are not seeded**:
  greenies.com gives their format as "Not Applicable" and the container is not
  guessed. The 2 variety packs state no count.
- Ranges added from Mars' taxonomy: SmartBites, Smart Purees, Smart Topper,
  Occupy Twists, Anytime Bites, Supplements.
- `lib/nutrition-role.ts`: **Smart Topper is a topper**. Without that entry the
  brand-wide "greenies" rule would read it as a treat. Supplements already
  resolve as supplements from their names. Both are tested.

## 5. Pedigree, tried in the same session

pedigree.com refuses its sitemap and `/all-products` even in the browser. Of
30 product URLs (26 from web search, 4 more reached by crawling) only 4 loaded,
3 distinct products, and none carried a panel image. Nothing was seeded. Pedigree is retailer-only from
this environment, like Whiskas.
