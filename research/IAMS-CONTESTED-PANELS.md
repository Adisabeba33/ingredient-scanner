# Iams — 15 barcodes whose composition is contested

**These fifteen barcodes are seeded in `data/known-products.ts` and have NO
entry in `data/known-formulas.ts`, on purpose.** They are not missing. Their
composition was researched, captured and then deliberately withheld from the
catalog.

This file exists so that somebody — an agent on a later pass, or a person in a
shop with a phone — can pick them up and finish them.

---

## Why they are out

Two large retailers publish different ingredient decks for the same barcode.
Not different wording: a **different order**, and on an American label the order
is the data, because the list is printed by descending weight. Petco moves
Ground Flaxseed ahead of Chicken Fat; Petco prints soybean meal and brewers
dried yeast where the stored panel has neither. One of the two is a stale
snapshot of a reformulated product. There is no way from a desk to say which.

Storing one of them anyway would be worse than storing nothing, for a reason
that is specific to how this catalog works:

**The conflict note never reaches the shopper.** `conflictNote` in
`app/api/known-products/import/route.ts` is built into the import panel's
report — what the operator sees before pressing the button — and is **not**
written into `barcode_cache`. The database row gets `ingredients_text`,
`guaranteed_analysis` and `source: "community"`, and nothing that says two
sources disagreed. So a shopper scanning one of these bags would be shown an
ingredient list, with no signal, that has roughly even odds of being the
previous generation of the food.

That is the failure this repository's own rule names: *a plausible wrong number
is worse than a missing one.* An absent composition sends a reader to the pack
in their hand. A confidently wrong one does not.

Four other Iams barcodes are also seeded without a composition for the same
family of reason — see §"The one composition that was NOT stored" in
`docs/CATALOG-CONFLICTS.md` for the Perfect Portions kitten case, which is a
different shape of the same refusal.

## What is NOT in doubt

- **The barcode itself.** All fifteen pass their UPC-A check digit and sit
  under GS1 prefix `019014` with the rest of the brand.
- **Which product it is.** Brand, range, variant, species, food form and
  printed bag size are bound by a manufacturer or distributor source and are
  seeded normally. A shopper scanning one of these gets the product named
  correctly; they just get no ingredient list.

So the coverage page shows these as what they are: **a barcode we know, whose
composition is still to be found.**

---

## How to finish one

Cheapest first.

1. **Photograph the pack.** This settles it outright and outranks everything —
   a real capture beats a `community` row without asking. Any of the four
   recipes below, any size, and the whole recipe closes at once: the panel is
   a property of the recipe, not of the bag.
2. **Read the manufacturer's own panel.** `iams.com` renders it as an image
   rather than text, which is why this campaign never had it. An agent that
   can read images can transcribe it — verbatim, in printed order, and
   `needs_physical_label` the moment one character is illegible. That is a
   manufacturer source and it outranks both retailers.
3. **Find a date.** If either retailer panel carries a "last updated" or a
   pack-dated deck code, the newer one is the current generation and the older
   becomes documented history rather than a competitor.

Whichever settles it, write the winning panel into `data/known-formulas.ts`
with a `conflict` note naming what the loser said, add the barcode to
`docs/CATALOG-CONFLICTS.md`, and delete that recipe's section from this file.
When the file is empty, delete the file.

**Do not** resolve one by merging the two panels, by taking the ingredients
from one and the guarantees from the other, or by picking whichever is longer.
Two differing lists are two formulas, not one record to fix.

---

## The four recipes

### ProActive Health — Chicken & Whole Grain Recipe — 6 barcodes

| barcode | size |
|---|---|
| `019014610860` | 3.3 lb |
| `019014711086` | 7 lb |
| `019014610907` | 15 lb |
| `019014700714` | 30 lb |
| `019014700769` | 38.5 lb |
| `019014805020` | 44 lb |

**What disagrees.** Corroboration pass 2026-09-21: current Petco Minichunks Chicken & Whole Grain panel is a different formula generation from the stored Target panel. Petco prints soybean meal, brewers dried yeast, flaxseed, peas and carrots and guarantees crude fat 14.5%, vitamin E 130 IU/kg, omega-6 3.25% and omega-3 0.35%; stored Target panel has crude fat 14.0%, vitamin E 60 IU/kg and omega-6 2.5% with a materially different ingredient deck. Do not promote; current-vs-legacy formula identity requires physical-label/version resolution.

**Stored in the ledger:** the Target panel, whole, from one page — `research/deep-research-iams.json`, record `019014610860`. The competing panel is described in the conflict note above but was NOT captured field by field; a pickup pass should read it again rather than trust this paraphrase.

### Advanced Health — Healthy Digestion Chicken & Whole Grain Recipe — 4 barcodes

| barcode | size |
|---|---|
| `019014805747` | 6 lb |
| `019014805754` | 13.5 lb |
| `019014805761` | 27 lb |
| `019014805778` | 36 lb |

**What disagrees.** Corroboration pass 2026-09-21: current Petco Healthy Digestion panel is a different formula generation from the stored Chewy panel. Petco moves Ground Flaxseed ahead of Chicken Fat, moves Carrots and Dried Bacillus subtilis Fermentation Product, changes vitamin/mineral wording/order, and prints Calcium 1.0%, Omega-6 3.25%, Omega-3 0.35% and Bacillus subtilis 600 million CFU/lb without the stored Chewy Selenium 0.35 mg/kg and Vitamin E 60 IU/kg guarantees. Do not promote; retain needs_physical_label as formula/version conflict.

**Stored in the ledger:** the Chewy panel, whole, from one page — `research/deep-research-iams.json`, record `019014805747`. The competing panel is described in the conflict note above but was NOT captured field by field; a pickup pass should read it again rather than trust this paraphrase.

### ProActive Health — Lamb & Rice Recipe — 4 barcodes

| barcode | size |
|---|---|
| `019014803316` | 15 lb |
| `019014803347` | 30 lb |
| `019014803330` | 38.5 lb |
| `019014805358` | 44 lb |

**What disagrees.** Corroboration pass 2026-09-21: current Petco Lamb & Rice / Minichunks Lamb & Rice panel is a different formula generation from the stored Chewy panel. Petco prints Ground Barley (not Ground Whole Grain Barley), adds Soybean Meal, places Corn Gluten Meal after Soybean Meal, and guarantees Selenium 0.35 mg/kg, Vitamin E 60 IU/kg and Omega-6 1.75%; the stored Chewy panel has a materially different ingredient order/deck and no captured additional guarantees. Do not promote; retain as formula/naming-version conflict pending physical-label resolution.

**Stored in the ledger:** the Chewy panel, whole, from one page — `research/deep-research-iams.json`, record `019014803316`. The competing panel is described in the conflict note above but was NOT captured field by field; a pickup pass should read it again rather than trust this paraphrase.

### Advanced Health — Healthy Digestion — 1 barcodes

| barcode | size |
|---|---|
| `019014830060` | 4.5 lb |

**What disagrees.** Current-formula conflict: current Chewy Healthy Digestion panel reports 26% protein, 14% fat, 4% fiber and 3649 kcal/kg / 380 kcal/cup, while this staged UPC record carries 25% protein, 13% fat, 5% fiber and 3570 kcal/kg / 364 kcal/cup. Kroger still identifies UPC 019014830060 as the 4.5 lb product, so treat this as formula-generation drift pending physical-label dating.

**Stored in the ledger:** the Chewy panel, whole, from one page — `research/deep-research-iams.json`, record `019014830060`. The competing panel is described in the conflict note above but was NOT captured field by field; a pickup pass should read it again rather than trust this paraphrase.
