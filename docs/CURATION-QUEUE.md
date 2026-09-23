# The curation queue — the twenty brands a shopper is actually holding

`docs/SHELF-PRIORITY.md` ranks all 172 seed brands by shelf presence. This file
is narrower and harder: it is the **operator's own list** of the brands whose
absence is felt at the till, worked **one brand at a time**, with a named
assignment per brand and a status that is either DONE or not.

The list came from the operator, not from this repository's ranking, and where
the two disagree the operator wins. Six brands here — Ol' Roy, Special Kitty,
Pure Balance, Kindfull, American Journey, Frisco — sit under
"Explicitly deprioritised" in `SHELF-PRIORITY.md` because the three target
chains were PetSmart, Petco and Tractor Supply. Naming them puts Walmart,
Target and a Chewy carton in somebody's kitchen back on the target list. That is
a business decision and it is recorded here rather than argued with; see
§"Why the ranking moved" below.

**154 of 172 seed brands hold nothing.** These twenty are the ones where that
emptiness meets an ordinary weekly shop.

---

## How a brand moves through this queue

One brand, one agent, one campaign, in this order:

1. **Brief** — `research/BRIEF-<BRAND>.md`, written from the repository before
   the agent starts. It names the brand boundary, the prerequisites, and the
   traps specific to that maker. The brief is the assignment.
2. **Inventory** — `node scripts/brand-inventory.mjs "<Brand>" > research/INVENTORY-<BRAND>.md`,
   regenerated at the moment the campaign starts, never pasted.
3. **Ledger** — `research/deep-research-<brand-slug>.json`, built under the
   binding contract in `research/AGENTS.md`. Evidence, not catalog data.
4. **Checker green** — `node scripts/check-ledger.mjs research/deep-research-<slug>.json`
   exits 0 and every WARN has been answered.
5. **Seed** — the `source_verified` records are promoted into
   `data/known-products.ts` and `data/known-formulas.ts` per
   `docs/SEEDING-A-BATCH.md`.
6. **Handoff** — `research/<BRAND>-HANDOFF.md`, and the row below flips.

A campaign that stops at step 3 with `candidate` records has produced nothing
seedable. That is not a failure of effort; it is what a blocked egress policy
looks like from the inside — read `docs/RESEARCH-EGRESS.md` **before** starting
any brand here.

---

## A brand is two campaigns, not one

The Iams campaign taught this and it is now the expected shape. Step 3 above
is really two jobs with different sources, different failure modes and
different units of work, and running them as one produces a campaign that is
90% finished at either end and useful at neither.

**Campaign A — the barcodes.** Prove which code is which product at which
printed size. Its sources are distributor catalogs, manufacturer UPC exhibits
and retailer listings. Its unit is the barcode. Iams's ran to 133 records.

**Campaign B — the formulas.** Fill in the ingredient list, the guaranteed
analysis and the calories. Its sources are retailers that publish panels as
text, and the maker's own label images. **Its unit is the recipe, not the
barcode** — one Minichunks panel answers six codes, and Iams's 133 barcodes
collapse to 63 recipes. `scripts/formula-worklist.mjs` does that collapse and
prints what is left, which is the difference between 58 pages and 133.

The order matters: A first, because B is a join onto A's proven identities and
needs nothing more than the recipe and the size to go looking.

What the Iams run cost by not separating them: the campaign spent its whole
budget on A, reported 133 records and 13 compositions, and never opened
Chewy, Petco or PetSmart — the three retailers that publish the text it was
missing. Not because it was careless, but because it was answering the
barcode question, and on that question those three sites add nothing.

**Write both briefs up front.** A brand is not seeded until B is done.

### When A and B are one campaign

The split is forced by the SOURCE, not by the work. Where the maker publishes
a readable label deck, that one document carries the ingredient statement, the
guaranteed analysis, the calories and the adequacy statement — so campaign B
is a PDF read per product rather than a hunt across shops, and it rides along
with A.

That is the case for Purina and Hill's, the only two makers here that publish
decks, and it is why `research/BRIEF-PURINA-CAT-CHOW.md` is one file covering
both. Check before you write two briefs: if `data/known-formulas.ts` holds
`label_deck_code` values for a maker, its decks are readable and the brand is
a one-pass job.

It is also the whole reason Iams cost three passes. Its maker renders every
panel as an image, so the formula had to be assembled from shops, and then the
shops disagreed.

### And a campaign C that should not have been needed

Iams needed a third pass, because campaign B stopped one page short of the
gate. It captured 114 complete panels from Chewy and then held every one at
`needs_physical_label`, on the grounds that a single retailer's panel is not
proof.

No other campaign here has used that bar. **124 of Blue Buffalo's 133
`source_verified` records name a retailer as the formula source**, one of them
on a shop transcription plus a single corroborating Chewy page. Seven of the
seventeen ledgers hold **zero** label deck codes and are `source_verified`
anyway — three of them entirely — because a deck code exists only where the
maker publishes label-deck PDFs, which is Purina and Hill's and nobody else.

So campaign B's brief must say what the gate actually is, in numbers, or the
agent will invent a stricter one and stop just short of it. Two independent
retailers agreeing is the bar. Say so.

---

## The queue

Status is one of: **QUEUED**, **BRIEFED** (assignment written, research not
started), **RESEARCHING**, **SEEDING**, **DONE**.

### Wave 1 — national brands, one maker family at a time

Grouped by maker on purpose. A maker's first batch is where the engine
prerequisites show up (`docs/SEEDING-A-BATCH.md` §2.5), and paying that cost
once buys the siblings behind it.

| # | Brand | Species | Maker | Status | Why here |
|---|-------|---------|-------|--------|----------|
| 1 | **Iams** | both | Mars | **SEEDED** — batch 037: 121 barcodes, 98 compositions. 15 contested panels held back in `research/IAMS-CONTESTED-PANELS.md` | Tier-1 #4, and the cheapest door into the Mars house: five brands on this list are Mars and the app repo has **no Mars manufacturer entry at all**. |
| 2 | **Purina Cat Chow** | cat | Nestlé Purina | **SEEDED** — batch 038: 26 barcodes, 26 compositions, one campaign. 3 unproven 12 lb UPCs held in `research/PURINA-CAT-CHOW-UPC-LEADS.json` | The value bag in every supermarket, and the cheapest campaign available: Purina publishes label-deck PDFs in text, four prefixes are proven and 13 vitamin constants are written. |
| 3 | **Purina Dog Chow** | dog | Nestlé Purina | **SEEDED** — batch 039: 32 barcodes, 32 compositions, one campaign. `Puppy` left empty for want of a front-of-pack witness | Same shelf, dogs. Ran straight after #2 on the same decks and prefix; `Little Bites` confirmed as a real range. |
| 4 | **Beneful** | dog | Nestlé Purina | **SEEDED** — batch 040: 61 barcodes, 35 compositions, after a correction pass that rejected 10 barcodes and demoted 42 statuses | Tier-1 #10. Half wet, and the campaign that taught this repo what over-promotion looks like. |
| 5 | **Alpo** | dog | Nestlé Purina | **SEEDED** — batch 041 | 54 barcodes, 12 compositions. The prefix is `011132`, not `017800` as the brief assumed — the one 017800 "Alpo" code was a Beneful treat. 42 identity rows are photographs to take; the five wet cans' calories say the can is now 13 oz. |
| 6 | **Cesar** | dog | Mars | **SEEDED** — batches 042, 044 | 66 barcodes, 43 compositions, 22 boxes, all from cesar.com read size by size. 25 units wait on route B or a photograph. |
| 7 | **Temptations** | cat | Mars | **SEEDED** — batch 043 | 99 barcodes, 12 compositions, read size by size from temptationstreats.com (each size has its own barcode and label images). Not only treats: complete dry food and wet trays are dinner in `lib/nutrition-role.ts`. New prefix `058496`. |
| 8 | **Greenies** | both | Mars | QUEUED | Dental chews in all three chains. Already in `KNOWN_TREAT_LINES`; Pill Pockets is a supplement-shaped edge case. |
| 9 | **Whiskas** | cat | Mars | QUEUED | **`lines: []`** — the brand entry names no ranges at all, so every product lands under "Other" until that is fixed. See prerequisites. |
| 10 | **Meow Mix** | cat | Post | QUEUED | Post's cat volume. Pairs with 9Lives, which is seeded, so the Post prefix family is partly mapped. |
| 11 | **Kibbles 'n Bits** | dog | Post | QUEUED | Post sibling of #10; run it immediately after while the prefix work is warm. |

### Wave 2 — store own-brands

Each is enormous inside exactly one chain and invisible outside it. Worth the
whole wave only because the operator named those chains as targets.

| # | Brand | Species | Chain | Status | Note |
|---|-------|---------|-------|--------|------|
| 12 | **Ol' Roy** | dog | Walmart | QUEUED | **`lines: []`**. The highest-volume dog food in America by units sold. |
| 13 | **Special Kitty** | cat | Walmart | QUEUED | **`lines: []`**. Ol' Roy's cat counterpart, same aisle. |
| 14 | **Pure Balance** | both | Walmart | QUEUED | Walmart's premium tier; three ranges already named. |
| 15 | **WholeHearted** | both | Petco | QUEUED | Petco's own food, five ranges named. A Petco shopper meets it more often than any national brand. |
| 16 | **Simply Nourish** | both | PetSmart | QUEUED | Five ranges named. |
| 17 | **Authority** | both | PetSmart | QUEUED | **`lines: []`**. |
| 18 | **Kindfull** | both | Target | QUEUED | **`lines: []`**. Target's own brand, launched 2021. |
| 19 | **American Journey** | both | Chewy | QUEUED | Brief already written: `research/BRIEF-AMERICAN-JOURNEY.md`. Chewy is folding its labels into `Chewy Made`, which the seed file does not know. |
| 20 | **Frisco** | both | Chewy | QUEUED | **`lines: []`**. Mostly hard goods and treats; check the food scope before briefing. |

---

### A sibling brief inherits rather than repeats

`research/BRIEF-PURINA-DOG-CHOW.md` is the first brief written as a delta. It
names the six sections of the Cat Chow brief that carry over unchanged — the
promotion gate, the deck source, the vitamin constants, the prefixes, where
things go, batch size — and then says only what is different: a sharper
boundary trap, a longer size ladder, a different worked example.

Do this for every sibling after the first in a maker family. A brief that
repeats its sibling is a brief that will disagree with it in six months, and
the sections most worth keeping identical are exactly the ones an agent is
most likely to re-derive differently.

---

### The status is a lookup, not a judgement

Both failures above came from a brief that described the gate in prose and
expected the agent to weigh it up. `research/BRIEF-ALPO.md` §1 replaces that
with a decision table the agent walks in order — bad check digit, then six
named fields, then where the composition came from, and only then the status.

The evidence rule is now stated as two routes and nothing else:

- **A** — the maker's own surface, a `purina.com` deck or product page. One
  such source is enough.
- **B** — two INDEPENDENT retailers showing the same panel, agreeing on the
  ingredient order. Two different companies' own pages; a site republishing
  Chewy is not a second Chewy.

Neither route, or the two retailers disagree → `needs_physical_label`, and the
barcode is seeded as identity for somebody to photograph.

Write the next brief this way too. A gate an agent has to interpret will be
interpreted, and the two interpretations available are the two failures above.

---

### Two ways a campaign fails, and they are opposite

Iams captured 114 complete panels and promoted **zero**, because it invented a
gate stricter than the one this repository uses. Three passes to undo.

Beneful promoted **85 of 89**, of which 42 had no ingredient list, no analysis
or no calories, and ten had the label deck's URL sitting in the ingredients
field. One correction pass, ten rejected barcodes, forty-two demoted statuses.

Both came from the same brief section, read in opposite directions — the
Beneful brief inherited Cat Chow §4, which had been written hard against the
Iams over-caution. That section now names both failures and says the thing
that is actually true: **the gate is not a judgement call.** §10 lists what
must be captured, and a record either has those fields filled from a source
somebody read, or it does not.

The lesson for writing these: a rule written against the last failure will
produce its mirror image. Say what the rule IS, not what the last campaign got
wrong.

---

## Prerequisites that block whole groups

Found by reading the repository, not by guessing. Each one is cheap now and
expensive after a campaign has already written records against it.

### 1. No Mars manufacturer entry — blocks #1, #6, #7, #8, #9

`Ingredients.help/data/manufacturers.ts` has entries for Nestlé Purina, Hill's
and Post, and **none for Mars**. Five brands in wave 1 are Mars. Without that
entry none of them can have the maker-quality panel the app shows for a Purina
or a Hill's product, and `docs/RESEARCH-EGRESS.md` names `mars.com` and
`marspetcare.com` as the hosts the five criteria have to come from.

This is app-repo work, and it is a **separate assignment** from any brand
campaign — see `research/BRIEF-IAMS.md` §"What this campaign does not do".

### 2. Six brands name no ranges — blocks #9, #12, #13, #17, #18, #20

`Whiskas`, `Ol' Roy`, `Special Kitty`, `Authority`, `Kindfull` and `Frisco`
carry no `lines` array in `data/us-pet-brands.ts`. `docs/SEEDING-A-BATCH.md` §3
is explicit about what that costs: a product whose range is not in that file is
filed under "Other" and a whole shelf goes missing from the coverage page.

The ranges must be added **from the packs the campaign actually reads**, not
from memory, which means the brief for each of those brands has to carry the
range-discovery step as an explicit deliverable rather than assuming the entry
is ready.

### 3. No GS1 prefix for any of the twenty except the Purina four

`data/gs1-prefixes.ts` holds `050000`, `017800` and `038100` for Purina,
`023100` for Mars Petcare US, `071190`/`079100` for Post. That covers #2–#5 and
#10–#11 outright, and probably #6–#9 through the Mars block.

It covers **none of the store brands**, and an unknown prefix makes
`scripts/check-batch.mjs` call every row in the batch a failure — the exact
twenty-false-failures problem `data/gs1-prefixes.ts` documents in its own
header. Each store-brand campaign must add its prefix before its first check
run, and say plainly whether the prefix was confirmed at GS1 or merely observed
on packs.

**Iams has no entry.** Iams packs are believed to carry a prefix of their own
rather than Mars's `023100`, in the same way Merrick keeps `022808` under
Purina and Champion keeps `064992` under Mars. That is a lead, not a fact, and
`research/BRIEF-IAMS.md` §4 is where the campaign is told to settle it.

---

## Why the ranking moved

`SHELF-PRIORITY.md` says of Walmart, Target and Chewy own-brands: "Worth doing
the day one of those chains becomes a target; not today." The operator's list
makes that day today, for six brands.

The reasoning in `SHELF-PRIORITY.md` still stands on its own terms — those
brands genuinely are invisible in a PetSmart. What changed is the question. The
old one was "which aisle are we serving?"; the new one is "whose pack is in the
hand holding the phone?", and a bag of Ol' Roy in a Walmart cart is a scan
exactly as often as a bag of Pro Plan in a PetSmart one.

That also makes the SHELF-PRIORITY line about American Journey the general rule
rather than the exception it was written as: **the shelf test is the wrong one
for a bag somebody already owns and scans in their own kitchen.**

Neither file is retired. `SHELF-PRIORITY.md` still ranks the other 134 empty
brands; this file governs these twenty.

---

## Where the catalog stands

Regenerate rather than trusting the numbers:

```bash
grep -oP '^\s*brand: "\K[^"]+' data/known-products.ts | sort | uniq -c | sort -rn
grep -oP '^\s*brand: "\K[^"]+' data/known-multipacks.ts | sort | uniq -c | sort -rn
```

At the time this file was written, 18 of 172 brands held products, and **not
one of the twenty above was among them**.
