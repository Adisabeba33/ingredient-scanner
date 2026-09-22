# Closing the seed gap the Petco survey found

`data/us-pet-brands.ts` opens by saying what it is not:

> Written from what the model knew at training time. It is NOT a scrape of a
> retailer, and nothing in here was checked against a live catalogue: **the
> network in the environment this was written in cannot reach Chewy, Petco or
> PetSmart.**

`research/PETCO-BRANDS.md` is the first time one of those three was reached. It
walked Petco's food facets on 2026-09-21 and found **76 qualifying dog and cat
food brands**. This document is the assignment for turning that survey into
seed rows, and it is a separate job from any brand campaign — nothing here
researches a product or a barcode.

---

## What the survey claimed, and what checking it found

The survey listed 26 Petco labels with no exact row, then narrowed to 18 it
called high-confidence. That narrowing was checked against the file by hand.
**Three of the 18 are already modelled**, and they are the interesting ones:

| Petco shows it as | The seed already has it as |
|---|---|
| `Cats in the Kitchen` | three `lines` of **Weruva** — plus `Cats in the Kitchen Kitten` and `Cats in the Kitchen Paté` |
| `Dogs in the Kitchen` | a `line` of **Weruva** |
| `Weruva Wx` | two `lines` of **Weruva** — `Wx` and `Wx Phos Focused` |

So the actionable list is **15**, not 18. The survey said its own list
"overstates the actionable gap"; this is the part it did not catch.

### The 15 genuinely absent

Verified absent from `data/us-pet-brands.ts` as any substring:

```
Badlands Ranch      Dr. Marty          McLovin's Pet             Weruva Awesome
Bark Bowls          Finley's           Nature's Protection …     Your Pet's Kitchen
CARU                Gentle Giants      Ultimate Pet Nutrition
Blue Buffalo        Inaba              Under the Weather
  Natural Vet Diet  Jiminy's
```

---

## The question these three raise, which is the real work

**Is a Petco brand facet a brand, or is it a range?**

The Weruva entry answers it one way, deliberately, and explains itself:

> Weruva is renaming as we watch — "Cats in the Kitchen" is becoming "Weruva
> Cat", and "Wx" is becoming "Wx Phos Focused" — so both halves of each pair
> are listed, because both are in shops right now under different barcodes.

Petco answers it the other way: separate brand pages, separate facets, and a
shopper who navigates to `petco.com/brand/weruva-wx` never passes Weruva.

**Neither is wrong, and this matters because `brandKey()` and the coverage page
file by exact match.** `docs/SEEDING-A-BATCH.md` §2.5 has the precedent —
`"Hill's"` does not match `"Hill's Science Diet"` — and the Blue Buffalo entry
carries the cost written out: one lower-case letter in `Baby BLUE` sent every
kitten product to "Other".

So decide deliberately, per case, and write the reason in a comment the way the
Weruva and Blue Buffalo entries do:

- **`Weruva Awesome`** — genuinely absent, and the sibling of two things
  already modelled as ranges. Adding it as a brand while `Wx` stays a range
  would model one company two ways in one file.
- **`Blue Buffalo Natural Veterinary Diet`** — Blue Buffalo is seeded to 78
  products and this is not among its ranges. A veterinary line is the case
  where getting it wrong is worst: `lib/vet-diet.ts` decides whether the report
  judges a prescribed therapeutic food by whether it has meat near the top.
  **Check that module before choosing**, and check what it already does for
  Hill's Prescription Diet and Royal Canin Veterinary Diet, which the seed
  models as separate brands.
- **`Diamond`** — not in the 15, because `Diamond Naturals` already carries
  `aliases: ["diamond"]`, so a Petco Diamond bag resolves there today. Whether
  that is right is open: Diamond sells a plain `Diamond` line that is not
  Diamond Naturals, and an alias that quietly absorbs it hides a real brand.
- **`Whole Earth Farms`** — currently a `line` of Merrick; Petco gives it its
  own facet. Same question as the Weruva three.
- **`Hill's`, `Purina Pro Plan`, `Purina Beneful`, `Purina Kitten Chow`,
  `Purina Puppy Chow`, `Royal Canin Veterinary Diet`** — retailer display
  names for brands the seed already holds under the name a shopper would say.
  `docs/SEEDING-A-BATCH.md` §2.5 rule 3: **store what a shopper would name.**
  These are candidates for `aliases`, not for new rows.

---

## What to actually do

1. **Add the 15**, each with `name`, `owner`, `species` — and `lines` **only
   where the Petco brand page proves them.** The file header is explicit that
   it would rather stay quiet than invent a range, and a `lines` entry that
   does not exist shows zero products forever.
2. **Add `aliases`** for the retailer display names above, so a Petco-sourced
   scan resolves instead of landing in "Other".
3. **Decide the five modelling questions** in the section above, in comments,
   in the file. A decision without its reason gets reversed by the next agent.
4. **Do not touch** `data/known-products.ts`, `data/known-formulas.ts` or any
   ledger. This is a seed-list change and nothing else.
5. `npm run typecheck && npm run lint && npm test`. `lib/known-products.test.ts`
   and the brand tests enforce most of the rules above; read them before
   inventing a new one.

---

## What this does not cover

- **Treats, chews, supplements and toppers.** The survey is food only, by
  design. It says nothing about whether Petco stocks Temptations, Milk-Bone or
  Pup-Peroni, and their absence from it is not evidence.
- **PetSmart and Tractor Supply.** No survey exists. Both are named targets, so
  the same job is waiting twice over — and on the evidence of what this one
  found, it is worth doing. `docs/SHELF-PRIORITY.md` already names the gap it
  cannot see: Tractor Supply's house brands, **4health** and **Retriever**,
  have no row in the seed file at all.
- **Whether any of these brands is worth a campaign.** That is
  `docs/CURATION-QUEUE.md` and `docs/SHELF-PRIORITY.md`. A brand row only means
  a scan has somewhere to land.
