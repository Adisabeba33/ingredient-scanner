# PEDIGREE Deep Research — handoff

Checked: **2026-09-14**  
Branch created: **`agent/deep-research-pedigree`**  
Ledger prepared: **`research/deep-research-pedigree.json`**  
Batch: **1 — dry adult first, 20 records**

## 1. Batch result

The first batch deliberately stays inside dry adult, matching the order in `BRIEF-PEDIGREE.md`. It contains **20 individual retail bags**:

- `source_verified`: **17**
- `needs_physical_label`: **3**
- `candidate`: **0**
- `rejected`: **0**
- `individual_unit`: **20**
- `multipack`: **0**

The three `needs_physical_label` records are not weak research leftovers. They are classic Adult Dry UPCs caught directly in the brand's August 2026 formula transition. Pedigree announced on August 11, 2026 that it had reformulated its classic Adult Dry line with Vitamin GoodBites and new `+` packaging. Retailers still expose pre-reformulation label panels for some of the same UPC/size identities. Per `AGENTS.md`, those generations were not merged.

Primary source: https://www.pedigree.com/news-articles/dog-food-with-vitamin-goodBites-kibble

## 2. UPCs in Batch 1

| UPC | Range / identity | Size | Status |
|---|---|---:|---|
| `023100125541` | High Protein — Beef & Lamb | 3.5 lb | source_verified |
| `023100143767` | High Protein — Beef & Lamb | 14 lb | source_verified |
| `023100143545` | High Protein — Beef & Lamb | 18 lb | source_verified |
| `023100143323` | High Protein — Beef & Lamb | 44 lb | source_verified |
| `023100110349` | Small Dog — Grilled Steak & Vegetable | 3.5 lb | source_verified |
| `023100143828` | Small Dog — Grilled Steak & Vegetable | 12 lb | source_verified |
| `023100143675` | Small Dog — Grilled Steak & Vegetable | 14 lb | source_verified |
| `023100103648` | Small Dog — Roasted Chicken, Rice & Vegetable | 3.5 lb | source_verified |
| `023100143668` | Small Dog — Roasted Chicken, Rice & Vegetable | 14 lb | source_verified |
| `023100135243` | TENDER BITES — For Small Dogs Chicken & Steak | 3.5 lb | source_verified |
| `023100143866` | TENDER BITES — For Small Dogs Chicken & Steak | 12 lb | source_verified |
| `023100143699` | TENDER BITES — For Small Dogs Chicken & Steak | 14 lb | source_verified |
| `023100143705` | Large Breed — Roasted Chicken, Rice & Vegetable | 14 lb | source_verified |
| `023100143613` | Large Breed — Roasted Chicken, Rice & Vegetable | 16 lb | source_verified |
| `023100181776` | Large Breed — Roasted Chicken, Rice & Vegetable | 38 lb | source_verified |
| `023100143569` | Large Breed — Roasted Chicken, Rice & Vegetable | 40 lb | source_verified |
| `023100143682` | TENDER BITES — Chicken & Steak | 14 lb | source_verified |
| `023100103631` | Complete Nutrition — Roasted Chicken & Vegetable | 3.5 lb | needs_physical_label |
| `023100143590` | Complete Nutrition — Grilled Steak & Vegetable | 18 lb | needs_physical_label |
| `023100143422` | Complete Nutrition — Grilled Steak & Vegetable | 44 lb | needs_physical_label |

All 20 UPC-A check digits were independently validated and every `canonical_gtin14` is the UPC left-padded to 14 digits. A final exact-code repository search returned no match for any of these 20 codes.

## 3. Range answer

The six shelf-memory lines currently declared in `data/us-pet-brands.ts` are:

- Complete Nutrition
- Choice Cuts
- Chopped Ground Dinner
- High Protein
- Puppy
- DentaStix

Current Pedigree pages show that this list is incomplete. Batch 1 required three current shelf identities that deserve explicit range treatment rather than being silently collapsed into `Complete Nutrition`:

- **Small Dog** — current Pedigree dry pages use this as a distinct family.
- **Large Breed** — current Pedigree dry page uses this directly; older retailers still say `For Big Dogs` / `Complete Nutrition` for some UPCs.
- **TENDER BITES** — current Pedigree has both standard Adult TENDER BITES and TENDER BITES for Small Dogs.

Recommendation for the seeding pass: add these current ranges to the brand entry only after choosing the repository's final canonical spelling. Do not edit them from this research branch.

Current primary pages:
- High Protein Beef & Lamb: https://www.pedigree.com/products/dry/high-protein-adult-dry-dog-food-beef-and-lamb
- Small Dog Grilled Steak: https://www.pedigree.com/products/dry/small-dog-adult-dry-food-grilled-steak-and-vegetable
- Small Dog Roasted Chicken: https://www.pedigree.com/products/dry/small-dog-adult-dry-dog-food-roasted-chicken-rice-vegetable
- Small Dog TENDER BITES: https://www.pedigree.com/products/dry/small-dog-dry-food-tender-bites-chicken-steak
- Large Breed: https://www.pedigree.com/products/dry/large-breed-dry-dog-food-roasted-chicken-rice-and-vegetable
- Adult TENDER BITES: https://www.pedigree.com/products/dry/pedigree-tender-bites-adult-dry-dog-food-chicken-steak

## 4. GS1 prefix answer

**Yes: every Batch 1 Pedigree unit is under `023100`.** This confirms that the existing Mars Petcare US prefix entry applies to Pedigree too.

Do not convert this into a Pedigree-only prefix. `023100` is shared across Mars sibling brands, including Cesar. Prefix match is manufacturer-family evidence, never brand identity evidence.

Recommendation for seeding handoff: widen the existing prefix comment/description so Pedigree is named alongside the other Mars siblings, but keep the maker-level ownership wording.

No Batch 1 Pedigree code was found outside `023100`.

## 5. Brand boundary

**Cesar remains the dangerous near-neighbour.** It is Mars, dog, wet, uses the same broad barcode family, and sells small trays/packs that can look structurally similar in retailer data. A `023100` barcode is therefore not enough to call something Pedigree.

Batch 1 is dry-only and produced no Cesar near-miss that entered the ledger. The rule for later wet work is unchanged: the product itself must say PEDIGREE. Iams, Nutro and Royal Canin remain separate Mars rows as well.

## 6. Size ladders established or partially established

### High Protein — Beef & Lamb
Current manufacturer sizes: **3.5, 14, 18, 27, 30, 44 lb**.

Verified this batch:
- 3.5 lb — `023100125541`
- 14 lb — `023100143767`
- 18 lb — `023100143545`
- 44 lb — `023100143323`

Unresolved: the 27/30 lb retailer evidence collides around UPC `023100143453`; do not guess which exact size carries it. Physical/current exact-size evidence is required.

### Small Dog — Grilled Steak & Vegetable
Current manufacturer sizes: **3.5, 12, 14 lb**.

Verified:
- 3.5 lb — `023100110349`
- 12 lb — `023100143828`
- 14 lb — `023100143675`

### Small Dog — Roasted Chicken, Rice & Vegetable
Current manufacturer sizes: **3.5, 12, 14 lb**.

Verified:
- 3.5 lb — `023100103648`
- 14 lb — `023100143668`

Unresolved: 12 lb exact-size UPC binding still needs stronger evidence.

### TENDER BITES — For Small Dogs Chicken & Steak
Current manufacturer sizes: **3.5, 12, 14 lb**.

Verified:
- 3.5 lb — `023100135243`
- 12 lb — `023100143866`
- 14 lb — `023100143699`

### Large Breed — Roasted Chicken, Rice & Vegetable
Current manufacturer sizes: **14, 16, 38, 40 lb**.

Verified:
- 14 lb — `023100143705`
- 16 lb — `023100143613`
- 38 lb — `023100181776`
- 40 lb — `023100143569`

### TENDER BITES — Adult Chicken & Steak
Current manufacturer sizes: **14, 30, 38, 40 lb**.

Verified this batch:
- 14 lb — `023100143682`

The 30/38/40 lb ladder remains for the next adult-dry pass if the campaign continues before moving to Puppy.

### Classic Adult Dry — 2026 reformulation collision
Current manufacturer pages list:
- Grilled Steak & Vegetable: **14, 18, 27, 38, 40, 44 lb**
- Roasted Chicken & Vegetable: **3.5, 14, 18, 27, 38, 40, 44, 50 lb**

Known exact unit identities retained as `needs_physical_label`:
- Roasted Chicken 3.5 lb — `023100103631`
- Grilled Steak 18 lb — `023100143590`
- Grilled Steak 44 lb — `023100143422`

Why not verified: Pedigree's August 2026 release says classic Adult Dry was reformulated and moved to new `+` packaging. The current manufacturer pages represent the new generation, while exact-UPC retailer pages still expose old formula panels. A current readable pack/deck must connect the new formula to those UPCs.

## 7. Formula-generation conflicts worth preserving

Retailers are materially stale on several current dry products. The ledger uses retailer pages only to bind **UPC + exact sellable size** where necessary, and uses the current Pedigree manufacturer page for the current formula. Conflicts are written per record rather than blended away.

Examples:
- High Protein 14 lb retailer data still reports **3437 kcal/kg / 342 kcal/cup** while current Pedigree reports **3417 / 315**.
- Small Dog Grilled and Roasted retailer panels still show **1.5% linoleic acid** in places where current Pedigree reports **2.0%**.
- Large Breed 38 lb retailer ingredient copy reflects an older order.
- Adult TENDER BITES has current retailer copy reporting **3332 kcal/kg / 318 kcal/cup** while the current Pedigree page reports **3376 / 321**.

These are not arithmetic fixes. They are generation evidence and remain in `conflicts`.

## 8. Texture / presentation answer

For Batch 1 dry foods:
- `texture`: `kibble`
- `presentation`: `plain`

For later wet work the repository already has the two Pedigree-specific controlled values the brief calls out:
- Chopped Ground Dinner → `chopped_ground`
- Choice Cuts → `choice_cuts`

Do not replace them with generic `ground` or `cuts`.

### DentaStix vocabulary drift found
The brief says the engine already knows `dentastix` as a nutrition-role range, which is true, but the current `Texture` vocabulary does **not** contain a `dentastix` texture. The closest controlled texture is `biscuit`; however this campaign must not silently invent or reinterpret a controlled value. DentaStix should remain its own late batch and this mapping must be decided explicitly before seeding.

## 9. Wet multipacks / cases reconnaissance

Current Pedigree wet pages confirm that cases/variety packs are a major part of the line, including:

- Chopped Ground Dinner can variety packs in **12- and 24-count** formats.
- Choice Cuts pouch variety packs, including **30-count** formats.
- Chopped Ground pouch packs in **8-, 18- and 30-count** formats.
- High Protein Chopped Ground can variety packs in **12-count** formats.

These are **outer sellable packages** and must get their own `barcode_scope` and outer UPC. Do not use an outer carton UPC as one can/pouch, and do not require inner UPCs merely to verify an outer box when the outer identity/code/count are proven.

Current wet pages also contain some CMS/copy inconsistencies. Treat product photos or exact outer packaging as stronger evidence when the text disagrees.

## 10. Wrong-barcode recommendations

No Batch 1 UPC should be added to `wrong-barcodes.ts` based on current evidence.

Important non-findings:
- The unresolved High Protein 27/30 lb collision is **not** a reason to mark `023100143453` wrong yet; it is an exact-size-binding problem.
- A recalled lot does **not** make the product UPC a wrong barcode. Recall history belongs in recall metadata, not in `wrong-barcodes.ts`.
- `023100` being shared with Cesar is a brand-boundary fact, not a barcode error.

Later wet/case work is where actual case-vs-single wrong-barcode recommendations are most likely.

## 11. DentaStix answer so far

Current DentaStix product architecture is not a dry-food size ladder. It varies on at least two independent axes:

1. dog size: Toy/Small, Small/Medium, Large;
2. flavor: Original with Chicken, Beef, Fresh, Bacon, Dual Bacon + Chicken;

Then each can be sold in multiple **counts** (small pouches through large tubs). A 7-stick and a 28-stick pack are packaging/count variants of a chew identity, not automatically two different recipes.

Recommendation: research DentaStix in one isolated batch after food/cases, as the brief requires. First decide the canonical identity key (dog-size class + flavor), then model counts as package variants unless the pack shows a materially different recipe/formula.

Primary range page: https://www.pedigree.com/dog-treats/dentastix-oral-care-dog-treats

## 12. Mars manufacturer entry research

The repo has no general Mars Petcare manufacturer entry for Pedigree. Primary material found:

- Pedigree's 2026 GoodBites announcement says the new Adult formulas were **developed with animal nutritionists**.
- Current Pedigree product pages state the foods are **made in the USA with ingredients sourced from around the world** and show complete nutritional panels.
- Mars Petcare describes the **Waltham Petcare Science Institute** as its science center with more than 50 years of pet nutrition/health research and multidisciplinary scientists/veterinarians.

Primary sources:
- https://www.pedigree.com/news-articles/dog-food-with-vitamin-goodBites-kibble
- https://www.pedigree.com/products/dry/high-protein-adult-dry-dog-food-beef-and-lamb
- https://www.mars.com/about/our-businesses/mars-petcare/waltham-petcare-science-institute

Do **not** infer the remaining manufacturer criteria (for example, ownership of every manufacturing facility or feeding-trial policy for every Pedigree SKU) without primary evidence. This research is enough to start a Mars entry, not enough to fill unsupported criteria as `true`.

## 13. Recall research

### 2014 — metal fragments, Adult Complete Nutrition dry
The brief specifically asks for this older event. The best primary government corroboration found for the expansion is an Indiana state health bulletin reproducing Mars' expanded notice.

Original event:
- 15 lb Adult Complete Nutrition dry bags
- lot `432C1KKM03`
- Best Before `8/5/15`
- UPC printed as `23100 10944`
- originally 22 bags distributed through selected Dollar General stores

Expansion:
- 55 lb Adult Complete Nutrition dry bags
- lot `432E1KKM03`
- Best Before `8/7/15`
- UPC printed as `23100 10731`
- sold through Sam's Club in Michigan, Indiana and Ohio

A secondary source incorrectly repeats `432C1KKM03` for the 55 lb expansion. The government bulletin gives `432E1KKM03`; use the latter.

### 2024 — loose metal, 44 lb Grilled Steak & Vegetable
FDA primary notice:
- announcement: **May 17, 2024**; FDA posted **May 18, 2024**
- 315 bags
- 44 lb PEDIGREE Adult Complete Nutrition Grilled Steak & Vegetable
- Best By **March 4, 2025**
- lot `410B2TXT02`
- sold at Walmart in Arkansas, Louisiana, Oklahoma and Texas
- recall completed/terminated; no reported injury/illness in the notice

Primary: https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/mars-petcare-us-inc-voluntarily-recalls-315-bags-pedigreer-adult-complete-nutrition-grilled-steak

### 2026 — current and missing from the brief
This is newer than the brief and must not be ignored.

FDA primary notice, **July 2, 2026**:
- PEDIGREE Can High Protein Chopped Chicken & Duck Flavor wet dog food, **13.2 oz**
- two lots: `613C3KKCFC` and `613C1KKCFC`
- reason: product that had been sent for destruction appears to have been fraudulently diverted; hard/sharp **metal with plastic** may be present
- no other Pedigree or Mars Petcare US products affected by that announcement

Primary: https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/voluntary-recall-two-lots-pedigreer-can-high-protein-chopped-chicken-duck-flavor-wet-dog-food-due

Recommendation: the later seeding/metadata pass should add the verified Pedigree recall history to `data/recalls.ts`; this research branch must not touch that file.

## 14. Unresolved tail — grouped by reason

### Current-formula generation collision
- Classic Adult Dry post-August-2026 GoodBites formulas vs legacy retailer panels: exact current physical pack/deck needed for selected UPCs and likely the rest of this line.

### Exact-size UPC binding incomplete
- High Protein Beef & Lamb 27/30 lb (`023100143453` appears ambiguously in retailer evidence).
- Small Dog Roasted Chicken 12 lb.
- Adult TENDER BITES 30/38/40 lb not yet researched in this batch.
- Remaining classic Adult Dry size ladders.

### Range normalization needed before seeding
- Add/normalize `Small Dog`, `Large Breed`, and `TENDER BITES` in brand metadata.
- Preserve historical `For Big Dogs` / `Complete Nutrition` retailer naming as conflict/history, not as proof the current product line is different.

### Wet/case scope work not started
- Individual can/pouch identities, outer cases and variety packs need separate exact UPC research.
- Highest risk is an outer case barcode being mistaken for a single can/pouch.

### DentaStix shape not settled
- Need one dedicated batch and explicit controlled-texture decision.

### Manufacturer metadata incomplete
- Primary evidence supports nutrition-science involvement; do not fabricate unproven manufacturer criteria.

## 15. Where this session stopped and why

Research stopped after **exactly 20 dry-adult records**, the Batch 1 limit in the brief. The next research priority under the brief is **dry Puppy**, unless the current Adult Dry GoodBites physical-label gap is deliberately revisited first.

### Validation / execution note
The connected GitHub environment exposes repository reads/writes but no shell command runner, while the local container cannot resolve GitHub over the network. The exact repository command

```bash
node scripts/check-ledger.mjs research/deep-research-pedigree.json
```

therefore could not be executed against a live checkout in this session. Before repository write, the prepared ledger was validated locally against the same critical gates available to this environment: JSON parse, 20/20 UPC check digits, 20/20 canonical GTIN-14 values, controlled values, required arrays/objects, source-verified required fields, identity uniqueness, status/scope counts, and exact-code searches against the connected repository exclusion surfaces. That validation returned **0 structural errors and 0 structural warnings**.

On the user's explicit instruction to persist the completed research, Batch 1 was committed to the dedicated research branch despite the unavailable shell runner. This limitation is recorded here rather than falsely claiming an official checker execution. The PR must remain **draft / unmerged** until the canonical checker is run in a normal checkout.
