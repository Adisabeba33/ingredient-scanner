# American Journey research handoff

Checked: 2026-09-17  
Branch: `agent/deep-research-american-journey`  
Ledger: `research/deep-research-american-journey.json`

## 1. Rename answer — first, before volume

**Current answer: the transition is mixed, not a single cut-over.**

For the core Grain-Free dry-dog recipes researched in batch 1, Chewy's live listings now identify the product brand as **Chewy Made** and explicitly label them **FORMERLY AMERICAN JOURNEY**. Chewy's FAQ says the name and packaging changed and that these products now carry the Chewy Made name. The older sellable packages in the barcode evidence are **American Journey** packages.

At the same time, Chewy's own current "Best Chewy Dog Foods" page still lists at least one **American Journey Protein & Grains** dry food with **NEW LOOK COMING SOON**. Therefore both old American Journey and new Chewy Made branding are still present in the current catalog during the transition. Do not globally assume every American Journey SKU has already changed.

There is inconsistent wording inside Chewy's own transition copy: some FAQ answers say the foods will carry the **Chewy Made** name, while earlier rollout answers say the **Chewy** brand/name. For this ledger, keep `brand: "American Journey"` as required by the brief. For production seeding, the safest recommendation is **alias/transition handling rather than destructive rename now**: preserve American Journey for old barcodes and allow Chewy Made/Chewy packaging to resolve to the same brand family only after barcode-level identity is proven.

### Did UPC change with the rename?

**Unresolved — do not assume either outcome.**

Batch 1 proves four old American Journey individual-unit UPCs and exact sizes. The current Chewy Made pages do not expose a UPC, and no primary current package image/source found in this pass binds a readable new-package barcode to those recipes. Chewy says the product/nutrition is the same, but that statement is not barcode evidence.

So:
- old UPCs remain real and must remain scannable;
- no old UPC is declared to survive the rename;
- no new UPC is declared to replace it;
- physical current-pack barcode evidence is required to close this question recipe by recipe.

This is the main blocker and the reason batch 1 stops below 20 rather than padding the ledger with weak records.

## 2. Batch 1 coverage

Dry dog only, as required.

Four exact historical American Journey dry-dog packages were added:
- `192268124304` — Grain-Free Salmon & Sweet Potato — 24 lb
- `192268124212` — Grain-Free Lamb & Sweet Potato — 24 lb
- `192268124311` — Grain-Free Salmon & Sweet Potato — 4 lb
- `192268124137` — Grain-Free Beef & Sweet Potato — 4 lb

All four are `individual_unit`. All four UPC-A check digits were recomputed and are valid. All four remain `needs_physical_label` because package-generation / rename-barcode continuity is not proven.

The old core size ladder included 4-lb and 24-lb bags. Current Chewy Made core listings observed in this pass show 12-lb and 24-lb bags plus two-bag bundles; the 4-lb size is no longer offered on those current pages. Treat 4-lb as a real historical package, not as a current Chewy Made size.

## 3. Range answer

Repository seed currently names:
- Grain Free
- Landmark
- Active Life
- Protein First

Batch 1 touched only the old **Grain Free** family.

Current Chewy naming adds descriptors such as **Complete Nutrition High Protein Grain-Free** and **Limited Ingredient** / **Limited Ingredient Diet**. Do not rewrite the seed range list from titles alone in this batch. The current transition is still mixed, and the production seeding pass should decide whether these become new range names or aliases after more packs are checked.

A current Chewy page also still exposes **American Journey Protein & Grains**, which is not one of the four seed names and should be investigated as a likely missing/current range before seeding.

## 4. GS1 / company-prefix finding

All four proven old UPCs begin `192268...`:
- 192268124304
- 192268124212
- 192268124311
- 192268124137

The repository has no registered Chewy prefix. This batch does **not** register `192268`; it records only that this number family appears repeatedly on old American Journey packages. It is not yet proven whether the prefix belongs to Chewy, a co-packer, or a broader private-label program, nor whether Chewy Made kept it.

## 5. Single-source / formula-generation notes

American Journey is Chewy-exclusive. Chewy's current product pages are primary for the current Chewy Made presentation, but they do not expose UPCs.

Historical UPC binding in this batch comes from retailer/inventory evidence. Because no current primary source binds those old UPCs to the new package, current Chewy Made ingredient/GA/calorie panels were **not** copied onto the old UPC records.

That conservative choice is deliberate. A rename statement is not enough to prove that every historical package code represents the exact current formula generation.

## 6. Size ladders

Proven in batch 1:

### Salmon & Sweet Potato
- 4 lb — `192268124311`
- 24 lb — `192268124304`
- Current Chewy Made listing observed: 12 lb, 24 lb, 48-lb bundle (2 × 24 lb)
- Current 12-lb UPC: not yet proven
- Whether 24-lb UPC stayed `192268124304`: not yet proven

### Lamb & Sweet Potato
- 24 lb — `192268124212`
- Current Chewy Made listing observed: 12 lb, 24 lb, 48-lb bundle
- Current 12/24-lb UPCs: not yet proven

### Beef & Sweet Potato
- 4 lb — `192268124137`
- Old Chewy 4-lb listing is discontinued
- Current Chewy Made listing observed: 12 lb, 24 lb, 48-lb bundle
- Current 12/24-lb UPCs: not yet proven

## 7. Multipacks

Not researched in batch 1. Dry dog individual units only.

## 8. Wrong-barcode recommendations

None from batch 1.

## 9. Recalls

No American Journey recall notice was found in the FDA/primary-source recall search performed for this pass. Chewy's old product FAQ explicitly says no American Journey product has ever been recalled.

FDA adverse-event report files do contain consumer reports naming American Journey products. Those are **not recalls** and are not evidence by themselves that a product was defective or causal. Do not convert adverse-event reports into a recall entry.

## 10. Chewy for `manufacturers.ts`

Chewy is the brand owner/retailer, not proven here as the physical manufacturer. Chewy says its private-label foods are produced with production partners and that Grain-Free recipes are manufactured in the United States (older American Journey answers name Kansas). Batch 1 does not identify the legal co-packer for these four UPCs.

Recommendation for the seeding pass: do not mark Chewy as `ownsPlants: true`. Treat ownership of plants, feeding trials, staff nutritionist and published research as evidence questions, not assumptions. Current public material found here supports partner production, not Chewy-owned manufacturing.

## 11. Unresolved tail, by reason

1. **Rename UPC continuity** — no readable current-package barcode / primary current UPC.
2. **Current 12-lb size codes** — current pages list the size but do not expose UPC.
3. **Historical 4-lb transition** — old 4-lb codes are real, but current core pages no longer sell that size.
4. **Formula generation bridge** — do not paste current Chewy Made formula data onto old American Journey UPCs without package-level proof.
5. **Prefix ownership** — repeated `192268` family observed, owner not proven.
6. **Range vocabulary during transition** — old Grain Free versus current Complete Nutrition High Protein Grain-Free / other descriptors needs a seeding decision.

## 12. Where batch 1 stopped and why

Stopped at **4 records**, below the limit of 20, because the brief explicitly prioritizes the rename/UPC question over volume. More old UPCs can be harvested, but doing so before proving how current Chewy Made packages encode the same recipes would create a larger unresolved tail rather than more seedable records.

## Batch 1 report

```text
American Journey batch 1
  added:            4   (running total: 4)
  source_verified:  0   needs_physical_label: 4   candidate: 0   rejected: 0
  individual_unit:  4   multipack: 0
  brand as printed/listed: American Journey 4 historical   Chewy Made 0 UPC-bound current   unclear current barcode 4
  ranges touched:   Grain Free
  checker:          clean / 0 warnings (current-main checker logic; expected unknown prefix 192268 noted)
  commit:           this batch commit (SHA posted in PR report)
  remote verified:  performed after commit; result posted in PR report
```
