# Assignment: Pro Plan

You are researching **one brand: Purina Pro Plan.** Nothing else. Purina makes
at least nine brands in this catalog and this assignment covers exactly one of
them — §3 is about why that sentence is the hardest part of the job, and why
this particular brand is the one most likely to be contaminated by a sibling.

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply here unchanged — read that too rather than having it
repeated here. `research/BRIEF-PURINA-ONE.md` is the nearest sibling campaign
and its §4 (size ladders) and §6 (calories per cup, supermarket health claims)
apply to this brand word for word.

---

## 0. The two commands

Regenerate the inventory before you research anything:

```bash
node scripts/brand-inventory.mjs "Pro Plan" > research/INVENTORY-PRO-PLAN.md
```

Run the checker before every commit:

```bash
node scripts/check-ledger.mjs research/deep-research-pro-plan.json
```

ERROR blocks seeding and exits 1. WARN is a question to answer in `conflicts`.
A batch is not finished until the checker exits 0 and every warning is read.

---

## 1. What the catalog already holds

**Nothing. Not one row.** This was checked file by file before the brief was
written, and it is worth stating precisely because "nothing" is the rarest
starting point in this repository and it changes how you work:

| File | Pro Plan rows |
|---|---|
| `data/known-products.ts` | 0 |
| `data/known-formulas.ts` | 0 |
| `data/known-multipacks.ts` | 0 |
| `data/wrong-barcodes.ts` | 0 |
| `research/deep-research-*.json` | no ledger exists |
| `docs/CATALOG-CONFLICTS.md` | one mention, and it is *about Purina ONE* — Pro Plan appears only as the analogy |

What does exist is a brand entry in `data/us-pet-brands.ts` with twelve range
names and two aliases, and **that entry is the only Pro Plan knowledge this
repository has.** §2 is about why you should not believe it.

Pro Plan is the premium bag at PetSmart, Petco and Tractor Supply
simultaneously — the only brand in `docs/SHELF-PRIORITY.md` that is tier-1 in
all three chains at once. It is the largest hole in the catalog, and unlike
Purina ONE it does not even have one scanned product to anchor from.

**One thing is already done, in the other repository.** `data/manufacturers.ts`
in `Ingredients.help` already lists `"purina pro plan"` and `"pro plan"` under
`nestle-purina`, with five sourced quality criteria. That is the expensive half
of a brand page and it exists. The moment products land, a Pro Plan page is one
entry in `data/brands.ts` away. Nothing for you to do about it — but it means
this campaign pays off on both sides at once, and it is worth knowing that the
maker facts are settled so you do not go researching them.

---

## 2. The range list is wrong in both directions, and you are the one who finds out how

The brand entry names twelve ranges:

> Savor, Sport, Focus, Complete Essentials, Sensitive Skin & Stomach,
> Bright Mind, True Nature, Development, Grain Free, Puppy Starter, LiveClear,
> Veterinary Diets

That list is shelf memory written from training data, exactly as the header of
`data/us-pet-brands.ts` says. Two independent reasons to distrust it here more
than usual:

**Purina restructured the Pro Plan lineup and renamed ranges.** Some of those
twelve are current, some are the previous generation, and at least one — `Savor`
— appears on a retailer's own brand page *and* in coverage of the rename, which
means a retailer page is not going to settle it. The pack is.

**Ranges exist that this list has never heard of.** `AdvantEDGE` launched in
April 2026 — adult and senior, dogs and cats, Digestive Support+ and
Senior Support+ — and is on shelves now. Retailer brand pages also expose
`Select` and `Finesse`, neither of which the entry names. Expect more.

So: **establish the current range list from packs, and report it.** Every
`product_line` you use must be spelled the way the pack spells it, not the way
this file spells it. A range that is real and missing is a finding; a range in
the list that no current pack prints is also a finding. Both go in the handoff.

**Do not edit `data/us-pet-brands.ts`.** That is the seeding pass's job and
§9 says so. You say what it should be.

---

## 3. The brand boundary, and the trap that is already documented

Pro Plan sits in a house of brands this catalog keeps deliberately separate:

| Brand | What it is |
|---|---|
| **Pro Plan** | this assignment |
| **Purina ONE** | the tier below it — **seeded, 6 products, has its own ledger** |
| **Purina** | the plain-Purina ranges — Moist & Meaty, Kit & Kaboodle, Puppy/Kitten Chow |
| **Fancy Feast**, **Friskies** | cat, `050000`, heavily seeded already |
| **Purina Dog Chow**, **Purina Cat Chow**, **Beneful**, **Alpo** | separate rows again |

They share a maker, a website, a barcode family and — this is the part that
bites — **range names.**

**`LiveClear` is a Pro Plan range AND a Purina ONE range.** Both current, both
allergen-reducing chicken formulas, both on purina.com under sibling paths,
different foods. This is not a hypothetical: `research/PURINA-ONE-HANDOFF.md`
§3 names it as the campaign's headline hazard, in the other direction —
"Never use a Pro Plan LiveClear deck or barcode as evidence for Purina ONE."

You are the mirror of that instruction. **Never use a Purina ONE LiveClear deck
or barcode as evidence for Pro Plan.** And unlike the Purina ONE agent, you have
six seeded Purina ONE products sitting in `data/known-products.ts` that you can
collide with directly. Rebuild the exclusion set from the live files at the
start of every batch and check every candidate code against it.

`brand` is `"Pro Plan"` on every record — the name as `data/us-pet-brands.ts`
spells it. Never `"Purina"`, never `"Purina Pro Plan"` in the `brand` field;
that spelling is an alias and `lib/brand-key.ts` folds it, but the ledger is
written with the canonical name.

For every record: the pack's own front says **PRO PLAN**. If the evidence comes
off a page that does not say Pro Plan on the product itself, it is not evidence
for this ledger.

---

## 4. One brand, two channels — a shape this catalog has not held before

This is the genuinely new thing about this campaign, and the part most likely to
produce a *correctness* bug rather than a catalog nit. Read it twice.

Pro Plan sells, under one brand name:

1. **`Pro Plan Veterinary Diets`** — EN Gastroenteric, HA Hydrolyzed,
   NF Kidney Function, OM Overweight Management, UR Urinary St/Ox, DM Dietary
   Management and the rest. Prescription-only, through vet clinics and
   Purina Vet Direct. This **is** a therapeutic diet. `lib/vet-diet.ts` matches
   the phrase `"veterinary diets"` and will flag it, correctly, and it must.
2. **Supermarket bags printing health words** — Urinary Tract Health, Weight
   Management, Sensitive Skin & Stomach, Adult 7+. These are **not** therapeutic
   diets. The header comment of `lib/vet-diet.ts` names *Pro Plan's Urinary
   Tract Health specifically* as the exact case it refuses to flag, and
   `docs/CATALOG-CONFLICTS.md` records a retailer filing it under "Veterinary
   Diet" as a source error.

Why this matters more than a mislabel: the vet flag tells the report to stop
applying the everyday "is there real named meat near the top" standard. Flag a
supermarket bag and the report goes quiet about an ordinary food it should judge.
Miss a real renal diet and the report calls a prescription food cynically cheap
to somebody whose vet put their dog on it. Both reach a shopper. Both are the
same error in opposite directions.

Every previous campaign had one channel or the other. Hill's had both — and
there they are **two brands with two seed entries**, Science Diet and
Prescription Diet, joined by the `family` field. Here it is **one seed entry
with `Veterinary Diets` as a `lines` value.**

That may be wrong, and deciding it is not your call. What *is* your job:
research both channels, keep them cleanly distinguishable in the ledger, and
answer this in the handoff — **does Pro Plan Veterinary Diets need its own seed
entry the way Hill's Prescription Diet has one, with `family: "Pro Plan"`?**
Give the evidence: how the packs brand themselves, whether a shopper reads them
as one brand or two, how many SKUs sit on each side. The seeding pass decides.

---

## 5. Size ladders: this is a dry-bag brand

Pro Plan's volume is dry, and dry sells the same recipe up a ladder of bag sizes
— 6, 16.5, 24, 34, 47 lb are all shapes this brand uses — **each with its own
UPC.** The catalog's shape for that is one product with several entries in
`packages[]`. `research/BRIEF-PURINA-ONE.md` §4 has the two opposite mistakes
in full; they apply here unchanged and this brand has more ladders than that one:

1. **Splitting one recipe into five products** because five listings had five codes.
2. **Merging two sizes' evidence** — bind every UPC to the exact printed size.

And the third: **a 47 lb bag is an individual unit.** Big is not a case.

**Calories on dry are stated per cup.** Purina decks print kcal/kg and kcal/cup.
Copy both with the basis the pack prints, do not derive one from the other, and
if the pack's own two figures disagree record both and say so in `conflicts`.

---

## 6. Multipacks: the catalog holds zero Pro Plan boxes

Pro Plan wet sells as single cans, tubs and pouches **and** as 12- and 24-count
cases and variety packs carrying their own barcodes. This catalog holds **not
one.** Every one of those codes is a thing somebody will scan and get nothing
for, and a box is the cheapest record in the assignment: no composition, and no
proven inner barcodes required to be `source_verified` — outer identity, size
and code are enough, with `contains: []`. §8 of `BRIEF-REVEAL.md` has the rules.

If you prove a code is a case of a pack we hold, say so in the handoff with the
pack it should point at, for `data/wrong-barcodes.ts`.

---

## 7. The GS1 prefix is an open question — treat it as one

`data/gs1-prefixes.ts` registers two prefixes for this maker: `050000`
(Fancy Feast, Friskies) and `017800` (Purina ONE, Alpo), plus `022808` for
Merrick. **Neither is known to cover Pro Plan, and no Pro Plan code exists in
this repository to take a prefix from** — the inventory script says so out loud.

`038100` turns up against Purina Pro Plan in third-party UPC databases. **This
is a lead, not a fact.** A UPC-database row is not proof and an attempt to
confirm it against GS1 did not. Establish which prefix each pack actually
carries from the barcode you can see, and report every prefix you find with
what it was on. Blue Buffalo, 9Lives and Weruva each turned out to run two or
three prefixes at once on the same shelf; assume nothing.

If Pro Plan does sit on a prefix the file does not know, that is a
`data/gs1-prefixes.ts` recommendation in the handoff — not an edit.

---

## 8. A recall the other repository does not have

`data/recalls.ts` in `Ingredients.help` holds Hill's, For All Tails and
Royal Canin. **There is no Purina entry at all.** There should be one:

> **Purina Pro Plan Veterinary Diets EL Elemental** dry dog food, recalled for
> potentially elevated vitamin D. Announced 8 February 2023 and **expanded
> 10 March 2023** after a supplier error affected two further lots preceding
> the original dates. Prescription-only distribution — vet clinics, Purina Vet
> Direct, select retailers. Two confirmed cases of vitamin D toxicity in dogs,
> both recovered off the diet. No other Purina product affected.

If you touch EL Elemental in this campaign, capture the recall properly: both
announcement dates, the affected lot codes and best-by dates as printed, the
UPCs, and an **FDA or manufacturer** source — not a blog aggregating one. Put it
in the handoff as a `data/recalls.ts` recommendation for the other repository,
in the shape that file's existing entries use. It is not your file and you do
not edit it.

Do not go hunting for other Purina recalls as a task of its own. If one crosses
your path with a primary source, record it the same way.

---

## 9. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-pro-plan` (from current `main`) |
| Ledger | `research/deep-research-pro-plan.json` (new — create it) |
| Inventory | `research/INVENTORY-PRO-PLAN.md` (generated, §0) |
| Handoff | `research/PRO-PLAN-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The ledger begins as the shape in §4 of `AGENTS.md`, with
`"brand_scope": ["Pro Plan"]`.

**Never touch:** anything under `data/`, `app/`, `lib/`, `components/`,
`tests/`, `scripts/`, or any other `research/deep-research-*.json`. Adding
`AdvantEDGE` to the brand entry, retiring a dead range name, registering a GS1
prefix, splitting out Veterinary Diets, putting a code on the wrong-barcodes
list and adding the recall are **all the seeding pass's job** — you say what
they should be, in the handoff.

**If the ledger grows past what your tooling can write**, do not fight it and do
not build a runner: §3a of `research/AGENTS.md` is the supported handover —
write only the batch's new records to `research/incoming/`, say so, and stop.

**Do not create GitHub Actions workflows.** Two previous campaigns spent 20 of
25 and 23 of 26 commits on temporary runners that staged and restored
themselves. Write the JSON directly and commit it.

---

## 10. Batches of twenty

1. `git fetch` and re-read the remote ledger.
2. Regenerate the inventory; rebuild the exclusion set from the live files —
   **including the six seeded Purina ONE products** (§3).
3. Research 20 records.
4. Append. Update `updated_at`.
5. **Run the checker.** Fix every ERROR, read every WARN.
6. One commit: `research: Pro Plan batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
Pro Plan batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  channel:          retail NN   veterinary NN
  ranges touched:   <names, spelled as the packs spell them>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
  new this batch:   <a range the brand entry lacks, a GS1 prefix, a size ladder
                    proven end to end, a wrong-barcode recommendation>
```

Twenty is a limit, not a target. Never pad a batch to reach it — the last
campaign that stopped at five records and said why was doing the job correctly.

A sensible order, given the catalog holds nothing: **dry dog, then dry cat, then
wet dog, then wet cat, then the multipacks, then Veterinary Diets last.** Dry
dog is where this brand's volume and its size ladders are; getting the first
ladder right makes every later one mechanical. Veterinary Diets goes last
deliberately — by then you will know the retail side well enough to tell the two
channels apart without thinking about it, which is the whole risk in §4.

---

## 11. The handoff

`research/PRO-PLAN-HANDOFF.md`, written from the first batch and updated as you
go — not left to the end, because a campaign that stops unexpectedly should
still leave a usable trail.

1. **The range answer** — every `product_line` you used, spelled as the packs
   spell them. Which of the twelve shelf-memory names are current, which are the
   previous generation, and every range you found that the entry lacks
   (`AdvantEDGE`, `Select`, `Finesse`, anything else). This is what unblocks
   seeding and it is the single most valuable thing in the document.
2. **The Veterinary Diets answer** — §4. Own seed entry or a `lines` value, with
   the evidence, not the preference.
3. **The brand boundary** — every product you nearly filed here that turned out
   to be Purina ONE, plain Purina, Cat Chow, Dog Chow or Beneful. Name them, so
   the next agent does not repeat the near-miss. LiveClear especially.
4. **Size ladders** — for each recipe you completed, the sizes and the UPC of
   each, so the seeding pass builds `packages[]` without re-deriving it.
5. **GS1 prefixes** — every one you find, with whose it is, and specifically
   whether `038100` is real and whether any Pro Plan product sits outside it.
6. **Multipacks** — the box codes you proved, with counts and unit sizes.
7. **Wrong-barcode recommendations** — any case or carton code you proved was
   being sold as a single unit, with the pack it should point at.
8. **The recall** — §8, in the shape `data/recalls.ts` uses, if you touched it.
9. **The unresolved tail, by REASON** — not a list of barcodes but a list of
   blockers: formula generations colliding under one UPC, exact-size binding
   missing, no printed calorie statement, no complete panel, inner barcodes
   unproven. The next agent works by gap, not from record 1.
10. Where you stopped and why.

---

## 12. Done

- Inventory regenerated before starting.
- Every batch committed, checker clean, remote fetched back and verified.
- Handoff complete, including the range answer, the Veterinary Diets answer and
  the size ladders.
- Draft PR open, unmerged, one report per batch.
- Not one byte changed outside `research/deep-research-pro-plan.json`,
  `research/INVENTORY-PRO-PLAN.md` and `research/PRO-PLAN-HANDOFF.md`.

`needs_physical_label` on a record is a result, not a failure. A wrong
`source_verified` is not: it reaches a shopper standing in front of the actual
pack.

On this brand there are two most-likely wrong answers, and they are different
sizes of wrong. The common one is a Purina ONE deck under a Pro Plan name — same
maker, same website, same range name, different food. The expensive one is a
supermarket bag flagged as a prescription diet, or a prescription diet missed:
that one does not just misname a product, it changes what the report says to
somebody whose vet chose the food.
