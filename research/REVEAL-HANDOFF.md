# Reveal Deep Research Handoff

Updated: 2026-08-30  
Branch: `agent/deep-research-reveal`  
Ledger: `research/deep-research-reveal.json`  
Contract: `research/AGENTS.md` + `research/BRIEF-REVEAL.md`

## 1. Brand identity

**Pack spelling:** `Reveal`.

Reveal is a brand of **MPM Products Limited**, UK company number 04610825. Reveal's current privacy notice identifies MPM Products Limited as the entity behind `revealpetfood.com`; the current US Reveal contact footer names **MPM Products USA Inc.**, 125 Townpark Drive Suite 300, Kennesaw, GA 30144.

The repository currently describes Reveal's owner as `Independent`. That is no longer a useful ownership description. MPM owns Reveal, Applaws and Encore. 3i completed the sale of MPM in September 2025 to **Partners Group**, so the useful ownership chain for a later catalog update is:

`Reveal → MPM Products Limited → Partners Group`

Sources:
- https://revealpetfood.com/au/privacy-notice/
- https://revealpetfood.com/contact/
- https://www.3i.com/investor-relations/annual-report-2026/downloads/3i-Group-2026-Business-Review.pdf
- https://www.partnersgroup.com/en/news-and-views/press-releases/investment-news/detail?news_id=96e3ca2a-9543-4b93-a0d6-551fa20136f3

**Species:** every current Reveal product encountered in this pass is for cats. Partners Group also describes MPM as a premium cat-food business. The repository's current `species: "both"` entry should be reviewed during the separate seeding/catalog-maintenance pass; this research branch does not edit it.

**Production:** Reveal's current FAQ says its wet food is made in Thailand and explains its Thai manufacturing partner. Exact-country statements should still be kept package-specific: do not assume every historical or non-wet Reveal SKU comes from one factory or country.

Source:
- https://revealpetfood.com/faq/why-is-your-wet-food-made-in-thailand/

## 2. Ranges / product_line values

### Confirmed range used in this ledger

- `Entrées` — current product-family wording used by Reveal for the complete pâté recipes and the Fish Paté Selection multipack.

### Products genuinely sold under the bare Reveal name in batch 1

The legacy broth tins and the sampled treats are presented by Reveal as product names/categories, not as a printed shelf range comparable to `Entrées`. They therefore use `product_line: null` rather than inventing `Broth`, `Treats`, `Wet Food`, or another category as a range.

This matters for seeding. Reveal's `data/us-pet-brands.ts` entry currently has no `lines`; at minimum `Entrées` must be added in the separate seeding pass. Bare-brand products need an explicit seeding decision rather than being silently assigned a made-up range.

## 3. US versus UK/EU/Australia market question

Do **not** use a non-US Reveal panel to fill a missing US field.

Batch 1 found direct evidence that the same legacy US-coded recipes can carry materially different nutrition panels across Reveal's current US pages, current US retailer/multipack pages, and MPM's Australia pages that expose US-suffixed SKU codes. Examples include the fat/fiber assignment being reversed and several legacy broth pages showing moisture/protein values incompatible with the corroborating wet-food panel.

Those are not cosmetic spelling differences. They can represent stale web data, a renderer defect, or different formula/label generations. The exact UPC and product identity can still be proven, but nine legacy tins are kept at `needs_physical_label` rather than merging market generations.

## 4. Coverage after batch 1

**Partial**
- `Entrées`: Fish Paté Selection 12-count outer multipack.
- Legacy complementary broth tins: nine exact 2.47 oz unit UPCs researched; identity is established, formula generation remains unresolved.
- Legacy broth assortments: four 12-count outer multipacks.
- Treats: Fish Bone Broth with Tuna Fillet, Chicken Bone Broth with Chicken Breast, Freeze Dried Tuna Bites, Whole Salmon Loin, plus Chicken Purée and Tuna Purée four-pouch outer packs.

**Untouched / substantially incomplete**
- Individual `Entrées` recipes and remaining assortment packs.
- Kitten products.
- Dry food.
- Remaining freeze-dried, loin, broth and lickable treats.
- Other current wet formats, pouches/cups and assortment configurations.
- Any discontinued/historical tail not present in the active US market.

## 5. Unresolved tail by reason

### Current formula generation collision on legacy 2.47 oz broth tins

Nine exact UPC/size identities are known, but current web evidence does not establish one trustworthy current US printed guaranteed-analysis generation. The conflict repeats across several recipes: individual Reveal page vs current Reveal multipack page, exact-UPC US retailer page, or MPM Australia page carrying a US-suffixed SKU.

**Blocker:** one clear current physical US can, or a current manufacturer label/deck image for the exact UPC/size. Until then, do not choose the prettier panel and do not combine fields across sources.

### Inner unit barcodes on outer multipacks

The seven outer packs in batch 1 have proven outer UPCs and sizes and are therefore `source_verified` multipacks. Their `contains` arrays are intentionally empty because no source used here proves the barcodes printed on the inner units.

This is **not** a blocker to seeding the outer box. The empty `contains` value is correct under `BRIEF-REVEAL.md`.

## 6. What the repository must learn

- **GS1/company prefix:** `886817` belongs to the MPM Products product family. It is not Reveal-exclusive; MPM also uses the block for other house brands, so the seeding pass should name the owner as **MPM Products**, not `Reveal`.
- **Range name:** `Entrées`.
- **Owner:** replace/review `Independent`; the brand owner is MPM Products Limited and MPM is owned by Partners Group.
- **Species:** current Reveal catalog encountered here is cat-only; review the repository's existing `both`.
- **Treat classification:** several Reveal snacks are sold under bare product names rather than a range containing the word “Treat”. Their ledger `food_form` is deliberately `treat`; do not let the absence of a “Treats” line make the catalog judge them as complete meals.
- **Vocabulary:** batch 1 did not require any new `texture` or `presentation` value. Where the physical form did not map cleanly, the field is `null` instead of inventing a synonym.
- **Rejected lead:** `5060218988663` from the assignment lead is not evidence for Reveal and `5060218` must not be registered to Reveal.

## 7. Where this pass stopped

Batch 1 stops at exactly 20 new records. It intentionally prioritizes exact UPC/size identities that can be defended without inferring neighboring codes.

Running totals after batch 1:
- records: 20
- source_verified: 11
- needs_physical_label: 9
- candidate: 0
- rejected: 0
- individual_unit: 13
- multipack: 7

## Batch reports

### Reveal batch 1

```text
Reveal batch 1
  added:            20   (running total: 20)
  source_verified:  11   needs_physical_label: 9   candidate: 0   rejected: 0
  individual_unit:  13   multipack: 7
  checker:          clean / 3 warnings read and answered
  commit:           recorded in the PR comment after commit
  remote verified:  pending until push/fetch-back
  new this batch:   MPM prefix 886817; range Entrées; owner correction; bare-brand treat/broth products
```

Checker warnings read and answered:
- `886817013552`: 95% moisture is expected for a liquid fish bone-broth treat.
- `886817006905`: 28% protein is expected for a moist single-ingredient salmon loin treat.
- `886817013545`: 95% moisture is expected for a liquid chicken bone-broth treat.

All three values remain exactly as the current Reveal manufacturer panel prints them.

The commit SHA cannot be embedded in the file that creates that same commit without a self-reference. The exact SHA is recorded in the PR batch comment after the commit; the next handoff update can also carry it.
