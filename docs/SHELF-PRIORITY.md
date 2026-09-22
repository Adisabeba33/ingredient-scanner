# Which brand to seed next — the shelf order

A seeding order for `data/us-pet-brands.ts`, ranked by how likely a shopper
standing in a **PetSmart, Petco or Tractor Supply** aisle is to be holding the
pack. Nothing else — not how interesting the brand is, not how clean its
ingredient list is, not how easy the research would be.

## Why this file exists

> **A narrower queue now sits on top of this file.**
> `docs/CURATION-QUEUE.md` holds the twenty brands the operator named as the
> holes an ordinary shopper falls into, worked one at a time with a brief each.
> Six of them are brands this file deprioritised as off-shelf — Ol' Roy,
> Special Kitty, Pure Balance, Kindfull, American Journey, Frisco — because the
> question changed from "which aisle are we serving?" to "whose pack is in the
> hand holding the phone?". That file's "Why the ranking moved" explains it.
> This file still ranks the other 134 empty brands.

The seed list holds 172 brands and 16 of them have anything at all. Worked in
list order that is eighteen months of batches before the app answers a scan in
a supermarket. Worked in shelf order, the first ten brands cover most of what
people actually buy every week.

The three chains are the ones named as the target: they are where the daily
traffic is. Grocery and Walmart overlap heavily with Tractor Supply's mass
shelf, so a brand marked **TSC** below is usually a Walmart brand too.

## What this ranking is and is not

Same honesty rule as the header of `data/us-pet-brands.ts`, and it matters more
here because a ranking invites you to trust it:

- **Store presence is read off a live planogram for exactly one chain.**
  `research/PETCO-BRANDS.md` surveyed Petco's own food facets on 2026-09-21 and
  every Petco claim below now comes from it. **PetSmart and Tractor Supply have
  had no such survey**; those columns are what the model knows plus a handful
  of searches, and the paragraph below this list is what that is worth.
- **It is a queue, not a verdict.** A brand lower down that somebody actually
  scans jumps the queue immediately — a real scan outranks this whole file.
- **Ranks will be wrong in places.** Being wrong about the order of #7 and #12
  costs nothing. Being wrong about the shape of the first tier would cost
  months, which is why the first tier is only brands that are unmistakable.

**This file used to carry a "fact that reshapes the ranking" here, and it was
wrong.** It said that Petco's 2019 removal of foods with artificial colours,
flavours and preservatives had taken Pedigree, Iams, Purina Dog Chow and Cat
Chow, Friskies and Fancy Feast off the Petco shelf. `research/PETCO-BRANDS.md`
walked Petco's own food facets on 2026-09-21 and found all six:

| Brand | This file said | Petco's own pages, 2026-09-21 |
|---|---|---:|
| Fancy Feast | not on a Petco shelf | **166** (4 dry + 162 wet) |
| Friskies | not on a Petco shelf | **58** |
| Iams | not on a Petco shelf | **≥35** |
| Pedigree | not on a Petco shelf | **27** (9 dry + 18 wet) |
| Beneful | not at Petco | **21** (5 dry + 16 wet) |
| Purina Dog Chow | not on a Petco shelf | **7** |
| Purina Cat Chow | not on a Petco shelf | **3** |

The 2019 removal happened; the inference drawn from it did not survive seven
years, and nothing in this repository could have noticed, because a ranking
written from shelf memory has no way to check itself. **That is what the survey
is for, and it is why the honesty rules above are not decoration.**

The rule the old paragraph was reaching for still stands, and now it stands on
evidence rather than on a press release: "in all three chains" is not the test;
**"in the chain where its shoppers are"** is. Those six brands are enormous at
Tractor Supply, at Walmart and in every supermarket whether or not Petco also
carries them.

`research/PETCO-BRANDS.md` covers **one** of the three chains and **food only**
— treats, chews, supplements and toppers are out of its scope, so it says
nothing about whether Petco stocks Temptations, Milk-Bone or Pup-Peroni.
PetSmart and Tractor Supply have had no survey at all. Every claim about them
below is still memory.

---

## Tier 1 — seed these first

Every one is a top-of-mind brand with an aisle of its own, and none has a single
row in the catalog.

| # | Brand | Species | Where | Why it is here |
|---|-------|---------|-------|----------------|
| 1 | **Pro Plan** | both | PetSmart, Petco, TSC | The premium bag at all three chains at once. The single biggest hole in the catalog. **Brief written:** `research/BRIEF-PRO-PLAN.md`. |
| 2 | **Pedigree** | dog | TSC, Walmart, grocery, **Petco** | Highest-volume dog food in the US by units. Petco carries 27 (surveyed). **Brief written:** `research/BRIEF-PEDIGREE.md`. |
| 3 | **Sheba** | cat | PetSmart, TSC, grocery | **Already half-done** — 19 boxes seeded, zero formulas. Cheapest tier-1 win. |
| 4 | **Iams** | both | PetSmart, TSC, Walmart, **Petco** | Mid-market default for dogs and cats. Petco carries ≥35 (surveyed). **Briefs written:** `research/BRIEF-IAMS.md`, `research/BRIEF-IAMS-FORMULAS.md`. |
| 5 | **Wellness** | both | PetSmart, Petco | The natural-channel default; Complete Health and CORE are both big ranges. **Brief written:** `research/BRIEF-WELLNESS.md`. |
| 6 | **Nutro** | both | PetSmart, Petco, TSC | Mars's natural line — one of the few Mars brands Petco still carries. |
| 7 | **Taste of the Wild** | both | TSC, Petco | The Tractor Supply premium bag. Diamond, so it shares a plant with 4health. |
| 8 | **Cesar** | dog | PetSmart, TSC, grocery, **Petco** | Small-dog wet trays, bought weekly, dozens of SKUs. Petco carries it; the survey would not give a food-only count because the page mixes in meal toppers. |
| 9 | **Temptations** | cat | PetSmart, TSC, Walmart | Highest-volume cat treat in the country. |
| 10 | **Beneful** | dog | PetSmart, TSC, Walmart, **Petco** | Purina's mass dog shelf. Petco carries 21 (surveyed). |

## Tier 2 — the rest of the weekly shop

| Brand | Species | Where | Note |
|-------|---------|-------|------|
| **Purina Dog Chow** | dog | TSC, Walmart, grocery, Petco | The value bag. Petco carries 7 (surveyed). |
| **Purina Cat Chow** | cat | TSC, Walmart, grocery, Petco | Same shelf, cats. Petco carries 3 (surveyed). |
| **Purina** (umbrella) | both | TSC, Walmart | Moist & Meaty, Kit & Kaboodle, Puppy/Kitten Chow. |
| **Beyond** | both | Petco, PetSmart | Purina's natural line, and Petco-legal. |
| **Meow Mix** | cat | TSC, Walmart, grocery, Petco | Post's cat volume. Petco carries 23 (9 dry + 14 wet, surveyed). Pairs with 9Lives, already seeded. |
| **Greenies** | both | PetSmart, Petco, TSC | Dental chews, all three chains. Petco also lists 4 Smart Essentials **dry foods** (surveyed); its other 7 Petco listings are toppers. |
| **Milk-Bone** | dog | everywhere | The default biscuit. |
| **Instinct** | both | PetSmart, Petco | Raw-coated kibble, large facing in both. **Brief written:** `research/BRIEF-INSTINCT.md`. |
| **Stella & Chewy's** | both | PetSmart, Petco | Freeze-dried; premium end of both chains. |
| **Victor** | dog | TSC | Working-dog bag; very strong at Tractor Supply. |
| **Diamond Naturals** | both | TSC | Value premium at TSC. |
| **Nulo** | both | PetSmart, Petco | |
| **Natural Balance** | both | PetSmart, Petco, TSC | L.I.D. is the limited-ingredient default. |
| **Freshpet** | both | PetSmart, Petco, TSC | Its own fridge in all three. |
| **Rachael Ray Nutrish** | both | PetSmart, TSC, Walmart | |
| **Orijen** / **Acana** | both | PetSmart, Petco | Two brands, one maker; seed together. **Brief written:** `research/BRIEF-ORIJEN.md`. |
| **Tiki Cat** | cat | Petco, PetSmart | Closest neighbour to Weruva, which is done. |
| **Pup-Peroni** | dog | everywhere | |
| **DentaLife** | both | PetSmart, TSC | |
| **Alpo** | dog | TSC, Walmart, grocery | |

## Tier 3 — store own-brands

Deliberately separate. Each one is enormous **inside one chain** and invisible
outside it, so the value depends entirely on whose shoppers we are serving. A
Petco shopper meets WholeHearted more often than any national brand.

| Brand | Chain | Note |
|-------|-------|------|
| **WholeHearted** | Petco | Petco's own food; huge facing. |
| **Simply Nourish** | PetSmart | |
| **Authority** | PetSmart | |
| **Only Natural Pet** | PetSmart | |
| **Reddy**, **Good Lovin'**, **Well & Good** | Petco | Treats and chews more than food. |
| **Made by Nacho** | Petco | Petco-exclusive cat brand. |

## Gap — Tractor Supply's house brands are not in the seed file at all

Checked: `data/us-pet-brands.ts` has no entry for any of these, so they cannot
be seeded and will never show on the coverage page until somebody scans one.

- **4health** — Tractor Supply exclusive, made by Diamond. On the evidence
  this is the largest single food brand in a TSC store, and it is missing.
- **Retriever** — TSC's value bag, made by Sunshine Mills.
- **Producer's Pride** — TSC, mostly poultry and livestock feed; check scope
  before adding, since this catalog is dogs and cats.

If Tractor Supply is a real target, adding 4health and Retriever to the seed
file is worth more than any single tier-2 campaign.

## Explicitly deprioritised

Not because they are small, but because they are not on these three shelves.
34 of the 156 unfilled brands fall here:

- **Chewy and Amazon own-brands** (American Journey, Tiny Tiger, Soulistic,
  Frisco, Wag) — online only, never on a shelf. 5 brands. American Journey is
  briefed anyway (`research/BRIEF-AMERICAN-JOURNEY.md`): the shelf test is the
  wrong one for a bag somebody already owns and scans in their own kitchen, and
  Chewy is folding these labels into one brand, `Chewy Made`, which the seed
  file does not know about.
- **Direct-to-consumer fresh** (The Farmer's Dog, Ollie, Nom Nom, Spot & Tango,
  Smalls, Jinx, Maev, Sundays, Cat Person, Wild Earth, Raised Right,
  Life's Abundance, A Pup Above, JustFoodForDogs) — subscription, no aisle.
  14 brands. JustFoodForDogs is the one exception: it has in-store freezers at
  Petco, so it belongs in tier 3 if Petco is the priority.
- **Canadian lines** (GO! Solutions, NOW FRESH, Gather, SUMMIT, Nutrience, Zoe,
  First Mate, Horizon, Carna4, Boréal, Smack, Big Country Raw, Naturawls,
  Corey Nutrition, Catit) — not US chain distribution. 15 brands.
- **Other retailers' own-brands** (Ol' Roy, Special Kitty, Pure Balance,
  Vibrant Life, Kindfull, Boots & Barkley, Kirkland Signature, Member's Mark)
  — Walmart, Target, Costco and Sam's Club. Worth doing the day one of those
  chains becomes a target; not today.

## Where the catalog stands

16 of 172 seed brands hold anything, from `data/known-products.ts` and
`data/known-multipacks.ts`:

| Brand | Products | Boxes |
|-------|---------:|------:|
| Royal Canin | 198 | — |
| Fancy Feast | 142 | 42 |
| Weruva | 79 | — |
| Blue Buffalo | 78 | 44 |
| I and love and you | 73 | 85 |
| Friskies | 70 | — |
| Hill's Science Diet | 63 | — |
| Merrick | 58 | — |
| Ziwi Peak | 53 | — |
| 9Lives | 19 | 13 |
| Hill's Prescription Diet | 11 | — |
| Purina ONE | 6 | — |
| B.F.F. | 6 | — |
| Reveal | 5 | 7 |
| TheraDiet | 3 | — |
| **Sheba** | **0** | **19** |

Sheba is the anomaly and the reason it sits in tier 1: batch 1 seeded outer
cartons only and stopped before any Perfect Portions formula, on purpose —
see `research/SHEBA-HANDOFF.md`. The research is done and the campaign is
half-finished.

Regenerate these numbers rather than trusting them:

```
grep -oP '^\s*brand: "\K[^"]+' data/known-products.ts | sort | uniq -c | sort -rn
grep -oP '^\s*brand: "\K[^"]+' data/known-multipacks.ts | sort | uniq -c | sort -rn
```

## Sources

Only the two claims that were actually checked:

- 4health is Tractor Supply exclusive and made by Diamond; Retriever is TSC's
  Sunshine Mills value line — [Tractor Supply](https://www.tractorsupply.com/tsc/brand/4health/dog-food),
  [Dog Food Advisor](https://www.dogfoodadvisor.com/forums/topic/tractor-supply-4health-dog-foods-who-makes-it/)
- Petco's 2019 removal of foods with artificial colours, flavours and
  preservatives —
  [Fortune](https://fortune.com/2018/11/14/petco-stop-selling-food-artificial-ingredients/),
  [dvm360](https://www.dvm360.com/view/petco-bans-pet-food-and-treats-with-artificial-ingredients).
  The removal is sourced; **the list of brands it supposedly took off the
  shelf was not**, and the survey below disproved it. The two sources are
  kept because the event is real and the inference was ours.
- **Petco's current food shelf, brand by brand** — `research/PETCO-BRANDS.md`,
  walked 2026-09-21 from Petco's own facets and brand pages. 76 qualifying
  food brands, 13 candidate labels rejected as toppers or treats, one
  Petco-owned food brand (WholeHearted). This is the only claim in this file
  read off a live shelf rather than remembered.

Everything else above is shelf memory. Correct it from a real shop, not from
another model.
