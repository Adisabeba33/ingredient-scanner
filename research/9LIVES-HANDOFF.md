# 9Lives research handoff

Updated 2026-09-02. The campaign is active. Two batches now contain 28 source-verified records: 18 individual units and 10 intentional outer multipacks.

## Owner

Confirmed: **Post Consumer Brands / For All Tails Pet Care**. The current 9Lives contact page gives the consumer-affairs addressee as “Post Consumer Brands / For All Tails Pet Care,” and Post Consumer Brands lists 9Lives in its current pet-food portfolio.

Sources:

- https://www.9lives.com/contact-us/
- https://www.postconsumerbrands.com/pet-food-brands/

## Ranges

- **Dry:** Daily Essentials; Kitten Essentials; Morris’ Catch; PLUS High Protein; PLUS Urinary Tract Health.
- **Wet textures/life-stage ranges:** Paté; Kitten Paté; Bites; Shreds; Senior Shreds; Morris’ Catch.
- **Current variety packs:** Seafood & Poultry Favorites; Poultry & Beef Favorites; Paté Favorites. Surf & Turf Favorites remains in the unresolved tail.

The second batch adds exact package/formula bindings for nine dry bags, nine individual 5.5 oz cans, and two outer four-packs. All 20 UPC-A check digits were independently validated; no sequential UPC was guessed.

## Renames resolved

- Current manufacturer pages use **Paté** while older retailer/catalog records commonly use **Meaty Paté**. Records use the current manufacturer spelling and retain the older name in verification notes where encountered.
- Current **Bites** and **Shreds** wording replaces several older **Hearty Cuts** and **Tender Morsels** shelf names. Exact refreshed UPC bindings are recorded only when a current retailer page and current manufacturer formula agree.
- Morris’ Catch Shreds is shortened to “With Real Ocean Fish” in the manufacturer headline, while Dollar General’s exact-UPC title and the ingredient deck identify salmon and sauce. The expanded package-facing variant is retained and the naming difference is documented as a conflict.
- The already-seeded `071190478450` Indoor Essentials / Indoor Complete rename was treated as excluded and was not researched again.

## GS1 prefixes

- `071190` — current refreshed 9Lives packaging seen across dry and wet records; registered to 9Lives (Post) per the assignment and corroborated by current retailer-bound package identities.
- `079100` — legacy owner-era 9Lives prefix still used on active Dollar General listings for Daily Essentials, Morris’ Catch, Senior Shreds, and Kitten Paté, plus the Paté Favorites 12-pack. Post acquired 9Lives from J.M. Smucker in 2023; register this prefix only after exact GS1-owner verification during seeding.

## Wrong-barcode recommendations

None. Outer 4-, 12-, and 24-can codes are intentional sellable multipack records, not substitutes for individual cans. Their formula fields remain empty and `contains` remains empty unless printed inner codes are independently proven.

## Source cautions answered

- `071190480576` Paté With Real Chicken prints 1040 kcal/kg and 160 kcal per 5.5 oz can. Nominal-weight multiplication gives about 162.2 kcal, a 1.4% difference. Both manufacturer values are preserved as printed; the small discrepancy is treated as label/nominal-fill rounding because no other current size exists for comparison.
- The manufacturer Morris’ Catch dry ingredient statement omits a comma between the closed Minerals parenthesis and “Titanium Dioxide.” The verbatim text and top-level normalization preserve that source boundary rather than repairing it silently.
- The 3.15 lb PLUS Urinary code is `071190480309`. A Hy-Vee page exposes the malformed 13-digit string `0071190480300`; it was rejected. Full GTIN-14 retailer evidence independently establishes `00071190480309`.

## Unresolved tail, by reason

- **Manufacturer-page contradictions requiring physical labels:** the current 13 oz Paté With Real Beef page carries a Chicken & Tuna adequacy statement and a 165 kcal/can value incompatible with its listed 1050 kcal/kg and 13 oz size; the current 13 oz Bites With Real Chicken page similarly prints 120 kcal/can alongside 770 kcal/kg. Neither was promoted.
- **Visible formula typo:** the current Paté With Real Chicken & Tuna ingredient statement contains the apparent duplicated fragment “Sodium Nit, Sodium Nitrite.” It still requires a physical-label check for the individual can.
- **UPC proof still missing:** current 15.5 lb PLUS High Protein and PLUS Urinary bags; Daily Essentials 12, 15.5, and 28 lb bags; the individual Bites Chicken & Beef can; Paté Super Supper individual can; and Surf & Turf Favorites 36-count outer pack.
- **Alias generations:** retailer/wholesale pages expose legacy codes such as `079100514175` (3.15 lb Plus Care) and `079100581221` (3.15 lb Daily Essentials) beside refreshed codes. They were not duplicated as separate live records without physical-label generation evidence.

## Where work stopped

Batch 2 stops after current dry-range coverage and the strongest independently bound individual wet cans. The next pass should prioritize physical-label evidence for the contradictory 13 oz pages, then exact full GTIN-14 evidence for the unresolved sizes and individual wet variants. Do not complete truncated Kroger identifiers or retailer families by check-digit arithmetic alone.
