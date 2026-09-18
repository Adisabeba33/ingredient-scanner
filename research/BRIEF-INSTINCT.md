# Assignment: Instinct

You are researching **one brand: Instinct.** It is a raw-food maker, and that
single fact is why this assignment is harder than it looks: §3 and §4 are about
two places where **this catalog has no correct answer yet** for what Instinct
sells, and both are yours to find rather than to invent.

`research/AGENTS.md` is the binding contract. Read it first — including **§3a**,
which is new and matters to you (see §0.2 below). §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply unchanged. `research/BRIEF-PURINA-ONE.md` §4 applies to
any dry bag.

---

## 0. Before anything

### 0.1 Can you reach the sources?

```bash
for h in www.instinctpetfood.com www.petsmart.com www.chewy.com www.fda.gov web.archive.org; do
  printf '%-28s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$h/")"
done
```

`000` with `CONNECT tunnel failed, response 403` means the egress policy is
blocking you. **Stop and report it.** A campaign run against a blocked policy
harvests barcodes out of search-result URLs, writes `candidate` records, passes
the checker and produces nothing seedable — it looks like success and is not.
See `docs/RESEARCH-EGRESS.md`. Never route around a 403.

### 0.2 One ledger, and what to do when it gets too big

**One ledger per brand: `research/deep-research-instinct.json`. Batches append
to it. There is never a second `deep-research-*.json` for this brand** — two
files holding the same codes make the checker report every barcode as
`already claimed` and make the inventory count each code twice. That has
happened, on data that was entirely correct.

**And a ledger outgrows a connector.** It runs about 6 KB a record, so forty
records is 235 KB and a tool that can only write a file whole eventually cannot
commit your batch at all. **Do not fight it and do not build a runner.**
`AGENTS.md` §3a is the supported handover: write only the batch's new records,
as a bare JSON array, to `research/incoming/instinct-batch-NN.json`, say so, and
stop. A shell-enabled pass merges them and deletes the file. Three campaigns
lost most of a day to this before it was written down.

If you are stuck on **delivery** rather than on research: say it in one message
and stop. "Still working" with no commit behind it reads as progress.

### 0.3 The two commands

```bash
node scripts/brand-inventory.mjs "Instinct" > research/INVENTORY-INSTINCT.md
node scripts/check-ledger.mjs research/deep-research-instinct.json
```

Run them from a real shell; the inventory must be the generator's byte-for-byte
output. ERROR blocks seeding and exits 1. WARN is a question to answer in
`conflicts`.

---

## 1. What the catalog holds

**Nothing**, in either repository. No products, no formulas, no boxes, no
ledger; no Instinct, Nature's Variety or Agrolimen anywhere in
`Ingredients.help`; and no prefix for this maker in `data/gs1-prefixes.ts`.

The brand entry names seven ranges — Raw Boost, Original, Limited Ingredient
Diet, Be Natural, Ultimate Protein, Raw Longevity, Raw Meals — and all seven
are empty.

**Two things in the repository look like Instinct and are not.** Do not let
either fool you, or fool a text search you run:

- `data/known-products.ts` holds three rows whose `variant` contains
  **"Instinctive"** — *Adult Instinctive Loaf in Sauce* and siblings. They are
  **Royal Canin**, which is seeded to 198 products.
- `data/known-formulas.ts` and `docs/CATALOG-CONFLICTS.md` each use the English
  word *instinct* in a comment about how a list reads.

So a grep for "instinct" in this repository returns hits today and the brand
still holds zero. Match on the barcode, never on the word.

---

## 2. Two name collisions, both with brands already seeded

This is the §2 of every brief in this folder, and Instinct's version is unusual:
the collisions are not with a sibling from the same maker, they are with **two
unrelated brands that are already in the catalog.**

| Looks like Instinct | Actually | Status in catalog |
|---|---|---|
| **"True Instinct"** | a range of **Purina ONE** — it is in that brand's `lines` in `data/us-pet-brands.ts` | Purina ONE is **seeded**, 6 products, and has its own ledger |
| **"Instinctive"** | Royal Canin variant wording | Royal Canin is **seeded**, 198 products |
| **"Instinct"** | this assignment | zero |

A Purina ONE True Instinct bag filed here is a wrong `source_verified` that
reaches a shopper holding the other bag, and unlike most near-misses in this
folder **you can collide with it in the live files today.** Rebuild the
exclusion set from `data/known-products.ts` and every
`research/deep-research-*.json` at the start of every batch, and check each
candidate code against it.

For every record: the pack's own front says **Instinct**. Not "Nature's
Variety", not "True Instinct", not "Instinctive". `brand` is `"Instinct"` on
every record, spelled as the seed spells it.

**One more sibling, and it is not in the seed at all.** The same company also
owns **Prairie**. It is out of scope; if a Prairie product nearly enters this
ledger, name it in the handoff so the next agent knows the shape of the
near-miss.

---

## 3. The food form this catalog cannot express yet

Instinct's core business is **frozen raw** — Raw Bites, Raw Medallions, Raw
Patties, Raw Meals — and **freeze-dried raw**. Neither is dry food and neither
is wet food.

Look at what the catalog can currently store:

- `lib/food-form.ts` defines `FoodForm` as `"dry" | "wet" | "semi-moist" |
  "unknown"`. There is no `frozen` and no `raw`. `"semi-moist"` exists in the
  type and, checked just now, **is used nowhere in the repository.**
- `data/known-products.ts` narrows further still: its `foodForm` field is typed
  `"wet" | "dry"` and nothing else.

That header explains why the field exists at all, and it is worth reading before
you decide anything: the form changes **how an ingredient list must be read**.
A wet food's list is ordered by weight as packed, water included, so
"Chicken, Chicken Broth, Chicken Liver" is an ordinary pâté rather than a padded
one. A frozen raw patty is 70% moisture and its list reads like a wet food's;
a freeze-dried medallion has almost none and reads like a dry food's. **Calling
both "wet" because they are moist, or both "dry" because they are not in a can,
would make the report misread the ingredient list of one of them.**

**This is a finding to report, not a field to invent.** You do not edit
`lib/food-form.ts` and you do not put a value in the ledger that the §9 contract
does not list. What you do:

1. Record, per product, **what the pack actually is** — frozen raw, freeze-dried
   raw, kibble, kibble coated with freeze-dried raw (that is what Raw Boost is),
   canned — in `verification_notes`, in plain words.
2. Record the **moisture guarantee** in every case. It is the number that
   settles which way the list reads, and for this brand it is the most
   load-bearing figure on the panel.
3. In the handoff, say what `FoodForm` needs: a new value, two values, or a
   different field. With the counts — how many of your records are frozen, how
   many freeze-dried, how many ordinary dry. The seeding pass decides; it cannot
   decide without those numbers.

Expect the checker to complain. When it does, that is the gap talking. Answer it
in `conflicts` rather than forcing a value.

---

## 4. Raw Boost Mixers reads as dinner, and I checked

`lib/nutrition-role.ts` exists to stop the report judging a topper or a snack by
the standard for dinner. Its `KNOWN_TREAT_LINES` and topper phrases carry the
scars of three earlier campaigns — Ziwi's air-dried chews, I and love and you's
snack ranges, Reveal's Whole Loin.

I ran the detector against this brand's range names before writing this:

```
Raw Boost Mixers     → unknown
Raw Boost            → unknown
Raw Meals            → unknown
Frozen Raw Bites     → unknown
Meal Mixers          → topper        ← Stella & Chewy's, which the list knows
```

Read that carefully, because only one line is a problem.

`Raw Meals`, `Raw Boost` and `Frozen Raw Bites` returning `unknown` is
**correct**: they are complete diets, `unknown` means "say nothing", and the
everyday standard should apply.

**`Raw Boost Mixers` returning `unknown` is wrong.** It is a topper — freeze-dried
raw pieces you spoon over food — and it will be judged as though it were a
meal. The phrase list holds `"meal mixer"` and `"meal mixers"`, added for
Stella & Chewy's, and Instinct's range name does not contain either.

So: **establish from each pack which of Instinct's ranges are toppers and which
are complete diets**, using the AAFCO sentence on the pack — "complete and
balanced" versus "for intermittent or supplemental feeding only" — copied
verbatim. That sentence is the evidence; the range name is only a hint. Then
name the exact printed range names in the handoff so the seeding pass can teach
`nutrition-role.ts`. Do not edit that file.

Do the toppers and any treat ranges in a **separate, later batch**, after the
complete diets.

---

## 5. The ranges, and the maker's own name has changed

Seven names are seeded. Expect the list to be incomplete and partly stale, and
establish the current one from packs. The rule that worked on Pro Plan and
Orijen applies unchanged: current manufacturer pages control `product_line`,
formula, guarantees, calories and adequacy; an older listing may be used **only**
as package-identity evidence binding an exact UPC to an exact printed size;
never write a range name as current because an old page still uses it.

**And the company renamed itself.** The seed records `owner: "Nature's
Variety"`. Nature's Variety rebranded as **Instinct**; the business is owned by
**Agrolimen**, of Barcelona, and it still runs the separate **Prairie** brand.
So the `owner` string is the old company name, and what the parent should be
called is a handoff question — note how `data/manufacturers.ts` in the app repo
forbids inheriting a parent's answers, and see §8.

Every range the entry lacks is a handoff recommendation. **Do not edit
`data/us-pet-brands.ts`.**

---

## 6. The GS1 prefix is unknown

`data/gs1-prefixes.ts` holds twenty-one prefixes and **not one belongs to this
maker**. No lead could be confirmed while writing this brief, so you get none —
establish it from barcodes you can read.

Report every prefix you find with what it was on, and specifically whether
**Prairie shares it**. If it does, the prefix proves the maker and not the
brand, exactly as `064992` proves Champion without separating Orijen from Acana.
Register nothing yourself; that file belongs to the seeding pass.

---

## 7. Recalls: this time there are some

The last two campaigns ended in an explicit negative. **This one does not.**
Instinct, as Nature's Variety, has a real recall history and `data/recalls.ts`
in the app repository has **no entry for it at all** — it holds Hill's, For All
Tails and Royal Canin only.

Three events turned up while writing this brief, all **raw** products, which is
this brand's core business rather than an edge case:

| When | What | Why |
|---|---|---|
| February 2010 | chicken medallions (3 lb), chicken patties (6 lb), chicken chubs (2 lb), Best By 10 Nov 2010 | Salmonella |
| February 2013 | Instinct Raw Organic Chicken Formula medallions and patties, Best By 4 Oct 2013 | foreign body / choking hazard |
| July 2015 | Instinct Raw Chicken Formula Bites for Dogs (4 lb, 7 lb) and Patties (6 lb), Best By 27 Apr 2016 | Salmonella |

**Treat that table as leads, not as data.** It comes from trade coverage, and a
`data/recalls.ts` row is written only from a primary notice. Open the FDA or
manufacturer notices, transcribe lot codes and best-by dates **as printed**, and
capture the UPCs where the notice carries them. Where the sources disagree,
record both readings — a recall entry that is confidently wrong about which bag
is worse than no entry.

Two cautions specific to raw food:

- A **salmonella** recall on a raw product is not evidence the brand is
  careless: raw food carries that risk by construction and the makers say so on
  the pack. Record the event, not a verdict.
- Consumer **adverse-event reports** in FDA's files are not recalls and must
  never become one. That trap was named in the American Journey campaign and it
  applies here with more force, because a raw brand attracts more of them.

Put the result in the handoff as a `data/recalls.ts` recommendation. You do not
edit that file or that repository.

---

## 8. Agrolimen and Instinct for `manufacturers.ts`

`data/manufacturers.ts` in `Ingredients.help` holds eleven makers and this one is
not among them, so an Instinct brand page is blocked until it is added.

Unlike the last campaign, **this maker looks like a genuine manufacturer.**
Public material places its headquarters in St. Louis and **manufacturing in
Lincoln, Nebraska**. If that holds up, `ownsPlants` is a real **yes** — which is
the opposite of Chewy, where the honest answer was no.

Do not take that from this brief. Confirm it from primary material, capture URLs
and a checked-at date, and answer the other four criteria the same way — staff
nutritionist, feeding trials, quality programme, published research. Where there
is no evidence, say so explicitly rather than softening it.

One question for the handoff: whether the entry should be **Agrolimen** (the
owner), **Instinct Pet Food** (the operating company, and the name on the pack)
or both. The header of that file is explicit that ownership is not inherited,
and documents Merrick as deliberately not given Purina's answers. Say which
entity the five criteria are actually true of.

---

## 9. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-instinct` (from current `main`) |
| Ledger | `research/deep-research-instinct.json` (new — create it, and only it) |
| Inventory | `research/INVENTORY-INSTINCT.md` (generated, §0.3) |
| Handoff | `research/INSTINCT-HANDOFF.md` |
| Batch too big to write | `research/incoming/instinct-batch-NN.json`, per §0.2 |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The ledger begins as the shape in §4 of `AGENTS.md`, with
`"brand_scope": ["Instinct"]`.

**Nothing under `data/`, `app/`, `lib/`, `components/`, `tests/` or
`scripts/`.** In particular do not touch `lib/food-form.ts` or
`lib/nutrition-role.ts` — §3 and §4 are findings for the seeding pass, not
patches. No second ledger, no temporary Actions workflow, no temporary files
committed and then removed, and do not write yourself a fourth file: the
handoff's "next batch" section is where that goes.

---

## 10. Batches of twenty

1. `git fetch` and re-read the remote ledger.
2. Regenerate the inventory; rebuild the exclusion set from the live files —
   **including the seeded Purina ONE and Royal Canin rows** (§2).
3. Research up to 20 records.
4. **Append** to the same ledger. Update `updated_at`. Never rewrite an earlier
   record silently; §4 of `AGENTS.md` allows a correction only with the reason in
   `verification_notes` and in the commit message.
5. **Run the checker.** Zero ERRORs, every WARN answered.
6. One commit: `research: Instinct batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
Instinct batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  pack is:          frozen raw NN   freeze-dried NN   kibble NN   raw-coated kibble NN   canned NN
  role:             complete NN   topper NN   treat NN   unknown NN
  ranges touched:   <names, spelled as the packs spell them>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
```

Twenty is a limit, not a target. Stopping early because §3's form question is
unresolved is a **good** outcome, not a failed batch.

Order: **the shelf-stable complete diets first** — kibble and Raw Boost — then
canned, then frozen raw, then freeze-dried complete, then Mixers and treats
last. Shelf-stable first because those records fit the schema the catalog
already has; the frozen ones are where §3 bites, and by then you will have the
counts the handoff needs.

---

## 11. The handoff

`research/INSTINCT-HANDOFF.md`, written from the first batch and updated as you
go, not left to the end.

1. **The food-form answer** — §3, and put it first. What each pack actually is,
   with counts, and what `FoodForm` needs. This is the finding that unblocks
   seeding and nothing else in the document is worth as much.
2. **Role by range** — §4. The AAFCO sentence per range, which ranges are
   toppers or treats, and the exact printed names for `KNOWN_TREAT_LINES`.
   Say explicitly whether Raw Boost Mixers is a topper by its own pack.
3. **The range answer** — every `product_line` you used, spelled as the packs
   spell them; which of the seven are current; every range the entry lacks.
4. **The collisions** — anything you nearly filed that turned out to be Purina
   ONE True Instinct, Royal Canin, or Prairie. §2.
5. **GS1 prefixes** — §6, including whether Prairie shares one.
6. **The maker** — §8: which entity, what is provably true, what is not.
7. **Recalls** — §7, settled from primary notices, in the shape
   `data/recalls.ts` uses. Both dates and lot codes as printed.
8. **Size ladders** — sizes and the UPC of each, so the seeding pass builds
   `packages[]` without re-deriving it.
9. **Multipacks and wrong-barcode recommendations.**
10. **The unresolved tail, by REASON** — blockers, not a list of barcodes: form
    unrepresentable, exact-size binding missing, no printed calorie statement,
    role unclear from the pack.
11. Where you stopped and why.

---

## 12. Done

- Egress checked **before** research.
- Exactly one ledger, appended to, never duplicated; §3a used if it outgrows the
  tooling.
- Inventory genuinely generated, not reconstructed.
- Every batch committed to the branch, checker clean, remote fetched back.
- Handoff complete, with the food-form answer first.
- Draft PR open, unmerged, one report per batch.
- Exactly three files changed, all under `research/`.

`needs_physical_label` is a result, not a failure. A wrong `source_verified` is
not: it reaches a shopper standing in front of the actual pack.

On this brand the two most likely wrong answers are both quiet. A Purina ONE
True Instinct bag written in here — the only near-miss in this folder that
collides with data already in the catalog. And a frozen raw patty stored as
"wet" or a freeze-dried medallion stored as "dry", because the field offered
nothing better: that one does not just mislabel a product, it changes how the
report reads its ingredient list.
