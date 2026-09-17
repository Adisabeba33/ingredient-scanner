# Which brand to seed next — the shelf order

A seeding order for `data/us-pet-brands.ts`, ranked by how likely a shopper
standing in a **PetSmart, Petco or Tractor Supply** aisle is to be holding the
pack. Nothing else — not how interesting the brand is, not how clean its
ingredient list is, not how easy the research would be.

## Why this file exists

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

- **Store presence was NOT read off a live planogram.** No agent here can walk a
  PetSmart. It comes from what the model knows plus a handful of searches; the
  Tractor Supply house brands and the Petco artificial-ingredient ban were
  checked against sources, the rest was not.
- **It is a queue, not a verdict.** A brand lower down that somebody actually
  scans jumps the queue immediately — a real scan outranks this whole file.
- **Ranks will be wrong in places.** Being wrong about the order of #7 and #12
  costs nothing. Being wrong about the shape of the first tier would cost
  months, which is why the first tier is only brands that are unmistakable.

One fact that reshapes the ranking and is easy to get wrong: **Petco removed
every food with artificial colours, flavours or preservatives in 2019.**
Pedigree, Iams, Purina Dog Chow and Cat Chow, Friskies and Fancy Feast are not
on a Petco shelf. They are still enormous — at Tractor Supply, at Walmart, in
every supermarket — so this does not demote them. It means "in all three
chains" is not the test; "in the chain where its shoppers are" is.

---

## Tier 1 — seed these first

Every one is a top-of-mind brand with an aisle of its own, and none has a single
row in the catalog.

| # | Brand | Species | Where | Why it is here |
|---|-------|---------|-------|----------------|
| 1 | **Pro Plan** | both | PetSmart, Petco, TSC | The premium bag at all three chains at once. The single biggest hole in the catalog. **Brief written:** `research/BRIEF-PRO-PLAN.md`. |
| 2 | **Pedigree** | dog | TSC, Walmart, grocery | Highest-volume dog food in the US by units. Not at Petco (artificial). **Brief written:** `research/BRIEF-PEDIGREE.md`. |
| 3 | **Sheba** | cat | PetSmart, TSC, grocery | **Already half-done** — 19 boxes seeded, zero formulas. Cheapest tier-1 win. |
| 4 | **Iams** | both | PetSmart, TSC, Walmart | Mid-market default for dogs and cats. Not at Petco. |
| 5 | **Wellness** | both | PetSmart, Petco | The natural-channel default; Complete Health and CORE are both big ranges. |
| 6 | **Nutro** | both | PetSmart, Petco, TSC | Mars's natural line — one of the few Mars brands Petco still carries. |
| 7 | **Taste of the Wild** | both | TSC, Petco | The Tractor Supply premium bag. Diamond, so it shares a plant with 4health. |
| 8 | **Cesar** | dog | PetSmart, TSC, grocery | Small-dog wet trays, bought weekly, dozens of SKUs. |
| 9 | **Temptations** | cat | PetSmart, TSC, Walmart | Highest-volume cat treat in the country. |
| 10 | **Beneful** | dog | PetSmart, TSC, Walmart | Purina's mass dog shelf. Not at Petco. |

## Tier 2 — the rest of the weekly shop

| Brand | Species | Where | Note |
|-------|---------|-------|------|
| **Purina Dog Chow** | dog | TSC, Walmart, grocery | The value bag. |
| **Purina Cat Chow** | cat | TSC, Walmart, grocery | Same shelf, cats. |
| **Purina** (umbrella) | both | TSC, Walmart | Moist & Meaty, Kit & Kaboodle, Puppy/Kitten Chow. |
| **Beyond** | both | Petco, PetSmart | Purina's natural line, and Petco-legal. |
| **Meow Mix** | cat | TSC, Walmart, grocery | Post's cat volume. Pairs with 9Lives, already seeded. |
| **Greenies** | both | PetSmart, Petco, TSC | Dental chews, all three chains. |
| **Milk-Bone** | dog | everywhere | The default biscuit. |
| **Instinct** | both | PetSmart, Petco | Raw-coated kibble, large facing in both. |
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
  Frisco, Wag) — online only, never on a shelf. 5 brands.
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
  preservatives, and the brands it took off the shelf —
  [Fortune](https://fortune.com/2018/11/14/petco-stop-selling-food-artificial-ingredients/),
  [dvm360](https://www.dvm360.com/view/petco-bans-pet-food-and-treats-with-artificial-ingredients)

Everything else above is shelf memory. Correct it from a real shop, not from
another model.
