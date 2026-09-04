# 9Lives — status after the seeding pass

**All 38 `source_verified` records are in the catalog** (batch 026): 25
individual units becoming 18 products, and 13 outer packs as boxes with empty
`contains`. The two `needs_physical_label` 13 oz cans are correctly not seeded.

This ledger passed `scripts/check-ledger.mjs` with **zero errors on the first
run** — the first brand to do so. Only four warnings, all sub-2.5 kcal label
rounding, and the handoff below had already answered every one of them.

Registered from it during seeding:

- **`079100`** as a second 9Lives GS1 prefix. The handoff was right to flag it
  and right to hold: it is the Del Monte-era block, and it is not historical —
  eight products under it are on shelves now, including every large Daily
  Essentials bag. Both prefixes are live at once because a refreshed pack gets a
  new code while the old pack keeps selling.
- **Fourteen ranges** into `data/us-pet-brands.ts`, spelled as the packs spell
  them, accents and curly apostrophe included: Paté, Kitten Paté, Bites, Shreds,
  Senior Shreds, Morris' Catch, Kitten Essentials, PLUS High Protein, PLUS
  Urinary Tract Health, and the four variety-pack ranges. The three shelf-memory
  names this file identified as superseded — Meaty Pate, Tender Morsels, Protein
  Plus — were kept rather than deleted: a superseded range shows zero products
  forever, which costs nothing, while removing one still on a shelf files its
  products under "Other".

Fifteen flags carried into section K of `docs/CATALOG-CONFLICTS.md`.

Everything below is the campaign's own handoff, unchanged.

---

# 9Lives research handoff

Updated 2026-09-04. The campaign is active. Three batches now contain 40 records: 38 `source_verified` and 2 `needs_physical_label`; 27 are individual units and 13 are intentional outer multipacks.

## Owner

Confirmed: **Post Consumer Brands / For All Tails Pet Care**. The current 9Lives contact page gives the consumer-affairs addressee as “Post Consumer Brands / For All Tails Pet Care,” and Post Consumer Brands lists 9Lives in its current pet-food portfolio.

Sources:

- https://www.9lives.com/contact-us/
- https://www.postconsumerbrands.com/pet-food-brands/

## Ranges

- **Dry:** Daily Essentials; Kitten Essentials; Morris’ Catch; PLUS High Protein; PLUS Urinary Tract Health.
- **Wet textures/life-stage ranges:** Paté; Kitten Paté; Bites; Shreds; Senior Shreds; Morris’ Catch.
- **Current variety packs:** Seafood & Poultry Favorites; Poultry & Beef Favorites; Paté Favorites; Surf & Turf Favorites.

The third batch adds exact bindings for two Daily Essentials dry bags, seven individual wet cans, two outer four-packs, and the Surf & Turf Favorites 36-pack. Ten of those twelve records are source-verified. The two remaining 13 oz cans have exact valid UPCs and coherent LS001 snapshots, but incompatible current physical labels under those same UPCs; they are deliberately held at `needs_physical_label`. All twelve UPC-A check digits were independently validated; no sequential UPC was guessed.

## Renames resolved

- Current manufacturer pages use **Paté** while older retailer/catalog records commonly use **Meaty Paté**. Records use the current manufacturer spelling and retain the older name in verification notes where encountered.
- Current **Bites** and **Shreds** wording replaces several older **Hearty Cuts** and **Tender Morsels** shelf names. Exact refreshed UPC bindings are recorded only when a current retailer page and current manufacturer formula agree.
- `071190478962` is the current individual 5.5 oz **Bites With Real Chicken & Beef in Gravy** can. Older wholesalers index that same code as **Tender Slices** or **Hearty Cuts**; the current manufacturer name governs.
- Morris’ Catch Shreds is shortened to “With Real Ocean Fish” in the manufacturer headline, while Dollar General’s exact-UPC title and the ingredient deck identify salmon and sauce. The expanded package-facing variant is retained and the naming difference is documented as a conflict.
- The already-seeded `071190478450` Indoor Essentials / Indoor Complete rename was treated as excluded and was not researched again.

## GS1 prefixes

- `071190` — current refreshed 9Lives packaging seen across dry and wet records; registered to 9Lives (Post) per the assignment and corroborated by current retailer-bound package identities.
- `079100` — legacy owner-era 9Lives prefix still used on active Dollar General listings for Daily Essentials, Morris’ Catch, Senior Shreds, and Kitten Paté, plus the Paté Favorites 12-pack. Post acquired 9Lives from J.M. Smucker in 2023; register this prefix only after exact GS1-owner verification during seeding.

## Wrong-barcode recommendations

None. Outer 4-, 12-, and 24-can codes are intentional sellable multipack records, not substitutes for individual cans. Their formula fields remain empty and `contains` remains empty unless printed inner codes are independently proven.

## Source cautions answered

- `071190480576` Paté With Real Chicken prints 1040 kcal/kg and 160 kcal per 5.5 oz can. Nominal-weight multiplication gives about 162.2 kcal, a 1.4% difference. Both manufacturer values are preserved as printed; the small discrepancy is treated as label/nominal-fill rounding because no other current size exists for comparison.
- The checker also flags three newly captured printed pairs: `071190478962` gives 118.5 calculated versus 120 kcal/can, `071190480392` gives 168.4 versus 170, and the recorded `071190481108` LS001 snapshot gives 398.0 versus 400. Each pair comes from one coherent label or manufacturer panel and differs by no more than normal nominal-fill/label rounding; the printed values are preserved and the arithmetic is recorded in each record.
- The manufacturer Morris’ Catch dry ingredient statement omits a comma between the closed Minerals parenthesis and “Titanium Dioxide.” The verbatim text and top-level normalization preserve that source boundary rather than repairing it silently.
- The 3.15 lb PLUS Urinary code is `071190480309`. A Hy-Vee page exposes the malformed 13-digit string `0071190480300`; it was rejected. Full GTIN-14 retailer evidence independently establishes `00071190480309`.
- Directions for Me’s exact LS001 package transcriptions settle the manufacturer’s malformed “Sodium Nit, Sodium Nitrite” ending for Chicken & Tuna: the 5.5 oz `071190480347` and 13 oz `071190481238` labels each print one complete sodium-nitrite ingredient. The 5.5 oz transcription also omits a comma inside its vitamin block; that source text is preserved rather than silently repaired.
- Exact-size physical panels override generic manufacturer energy text for two 13 oz records: Chicken & Tuna `071190481238` prints 1045 kcal/kg and 385 kcal/can, while Super Supper `071190480842` prints 1060 kcal/kg and 390 kcal/can. The manufacturer pages repeat 5.5 oz per-can values across sizes; those disagreements are recorded.
- `071190480835` Bites Chicken 13 oz has two current physical presentations under one UPC. Chewy LS001 prints Modified Food Starch and 770 kcal/kg / 285 kcal/can; Dollar General visibly prints Potato Starch plus Modified Corn Starch and 803 kcal/kg / 296 kcal/can, but its full curved ingredient line and deck code are not readable. The manufacturer HTML matches LS001 ingredients but incorrectly prints the 5.5 oz value 120 kcal/can. No generations were combined.
- `071190481108` Paté Beef 13 oz likewise has two incompatible physical decks under one UPC. Chewy LS001 prints Ground Brewers Rice and 1080 kcal/kg / 400 kcal/can; Dollar General LS002 visibly includes Wheat Flour and prints 1125 kcal/kg / 415 kcal/can. The manufacturer HTML is a third incompatible source carrying Chicken & Tuna-style text and 165 kcal/can. The ledger preserves the coherent LS001 observation but holds the record at `needs_physical_label`.

## Unresolved tail, by reason

- **Formula generations colliding under one UPC:** Bites Chicken 13 oz `071190480835` and Paté Beef 13 oz `071190481108` need a dated shelf can with a readable lot/deck before either physical generation can be selected for seeding. Both are represented as `needs_physical_label`, not silently promoted.
- **Exact UPC proof still missing:** current 15.5 lb PLUS High Protein, 15.5 lb PLUS Urinary Tract Health, and 15.5 lb Daily Essentials bags. Repeated current-source searches establish the products and sizes but not a full independently bound retail UPC.
- **Alias generations:** `079100514175` (3.15 lb Plus Care), `079100581221` (3.15 lb Daily Essentials), and aggregator code `071190477897` (12 lb Daily Essentials) remain unadded without physical generation evidence. The current Paté Favorites outer code `071190480828` also collides on normalized identity and size with the already recorded legacy outer `079100831029`; seeding needs an explicit alias/generation policy before both can coexist.
- **Prefix registration:** current live listings still expose the legacy `079100` family. Its historical owner-era context is documented, but exact GS1-owner registration remains a seeding-pass task.

## Batch 3 report

```text
9Lives batch 3
  added:            12   (running total: 40)
  source_verified:  10 added / 38 total
  needs_physical:    2 added / 2 total
  individual_unit:   9 added / 27 total
  multipack:         3 added / 13 total
  ranges touched:   Daily Essentials; Paté; Bites; Surf & Turf Favorites
  checker:          clean / 4 warnings read and answered
  commit:           batch 3 commit; exact SHA in PR #11 report
  remote verified:  completed after publication; exact result in PR #11 report
  new this batch:   physical same-UPC generation collisions for two 13 oz cans
```

## Where work stopped

Batch 3 stops after the remaining strong web-accessible exact-size bindings were exhausted. Further ordinary web searching now repeats incomplete identifiers or incompatible generations. The next useful evidence is physical: dated shelf cans for the two 13 oz collisions, or full package/GS1 evidence for the three unresolved 15.5 lb bags and alias families. Do not complete truncated retailer identifiers or neighboring UPC families by check-digit arithmetic alone.
