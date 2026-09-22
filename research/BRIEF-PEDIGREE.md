# Assignment: Pedigree

You are researching **one brand: Pedigree.** Nothing else. Mars owns at least
eleven brands in this catalog, one of them already seeded to 198 products, and
this assignment covers exactly one — §2 is the boundary.

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply here unchanged — read that too rather than having it
repeated here. `research/BRIEF-PURINA-ONE.md` §4 (size ladders, the two
opposite mistakes) and §6 (calories per cup) apply to this brand word for word:
it is the same shape of business, a national supermarket brand sold mostly as
dry bags up a ladder of sizes.

---

## 0. The two commands

Regenerate the inventory before you research anything:

```bash
node scripts/brand-inventory.mjs "Pedigree" > research/INVENTORY-PEDIGREE.md
```

Run the checker before every commit:

```bash
node scripts/check-ledger.mjs research/deep-research-pedigree.json
```

ERROR blocks seeding and exits 1. WARN is a question to answer in `conflicts`.
A batch is not finished until the checker exits 0 and every warning is read.

---

## 1. What the catalog holds: no data, and three pieces of engine knowledge

**No data at all.** Checked file by file before this brief was written:

| File | Pedigree rows |
|---|---|
| `data/known-products.ts` | 0 |
| `data/known-formulas.ts` | 0 |
| `data/known-multipacks.ts` | 0 |
| `data/wrong-barcodes.ts` | 0 |
| `research/deep-research-*.json` | no ledger exists |
| `docs/CATALOG-CONFLICTS.md` | 0 |

The brand entry in `data/us-pet-brands.ts` names six ranges — Complete
Nutrition, Choice Cuts, Chopped Ground Dinner, High Protein, Puppy, DentaStix —
and all six are empty. Pedigree is the highest-volume dog food in the United
States by units and this catalog has never held one of its barcodes.

**But the engine already knows this brand,** which is unusual and worth knowing
before you start, because it means part of the vocabulary question is settled
and you should not re-open it:

1. **`lib/presentation.ts`** carries two textures that exist *because of
   Pedigree*: `chopped_ground` and `choice_cuts`. Its comment says so outright —
   "'chopped ground' must beat 'ground', and 'choice cuts' must beat 'cuts', or
   Pedigree's two wet ranges collapse into one."
2. **`lib/presentation.test.ts`** locks that ordering with Pedigree's own
   product names as the test case, and a further comment refuses to put "cuts in
   gravy" in the texture list so that Blue Buffalo's ordinary "Cuts in Gravy"
   does not land under Pedigree's Choice Cuts range.
3. **`lib/nutrition-role.ts`** already lists **`dentastix`** among the ranges
   whose whole purpose is not being dinner.

So: three modules were taught about Pedigree before a single product was
seeded. **Use those spellings.** `chopped_ground` and `choice_cuts` are the
controlled values for those two ranges and you do not invent alternatives; a
Chopped Ground Dinner record written with `texture: "ground"` is wrong against
code that already exists to prevent exactly that.

---

## 2. The brand boundary

Pedigree sits in a Mars house this catalog keeps deliberately separate, and one
sibling is the most heavily seeded brand in the entire repository:

| Brand | What it is |
|---|---|
| **Pedigree** | this assignment |
| **Royal Canin** | Mars, **198 products seeded**, prefix `030111`, its own ledger |
| **Sheba** | Mars cat, **campaign in flight** — 19 boxes seeded, zero formulas |
| **Cesar** | Mars dog wet, small trays — **the closest neighbour and the real risk** |
| **Iams**, **Eukanuba**, **Nutro** | Mars dog dry, separate rows |
| **Temptations**, **Greenies**, **Whiskas**, **Crave** | separate rows again |

**Cesar is the boundary that will actually bite.** It is Mars, it is dog, it is
wet, it sells in small single-serve trays, it shares a barcode family with
Pedigree, and both brands print flavour names built the same way. A Cesar tray
filed as Pedigree is the near-miss this campaign will keep almost making. When
you nearly make it, write it down — §12.4 exists for that.

`brand` is `"Pedigree"` on every record, spelled as `data/us-pet-brands.ts`
spells it. For every record: the pack's own front says **PEDIGREE**. If the
evidence comes off a page that does not say Pedigree on the product itself, it
is not evidence for this ledger.

---

## 3. The GS1 prefix is probably already registered — confirm it, do not assume it

`data/gs1-prefixes.ts` holds `023100`, registered as
**"Mars Petcare US (Sheba and siblings)"**, and its comment anticipated this
assignment:

> Registered as Mars rather than as Sheba … a code under it that turns out to be
> a sibling brand is not a wrong barcode.

That is a much better starting point than the Pro Plan campaign got. It is still
not a fact about Pedigree until you have read a Pedigree barcode.

Two things to establish and report:

- **Does Pedigree sit under `023100`?** Confirm from actual packs, not from the
  comment. If it does, the prefix entry's parenthetical should be widened —
  a handoff recommendation, not an edit.
- **Does anything sit outside it?** Mars runs `030111` for Royal Canin, so this
  maker already runs prefixes by business unit. Blue Buffalo, 9Lives and Weruva
  each turned out to run two or three at once. Report every prefix you find with
  what it was on.

---

## 4. This is a dry-bag brand, and the bags go very large

Pedigree's volume is dry, and dry sells the same recipe up a ladder of bag sizes
— 3.5, 15, 17, 18, 30, 44, 50, 55 lb are shapes this brand uses — **each with
its own UPC**. The 55 lb bag is not a guess: a 2014 FDA recall (§8) names a
55 lb Pedigree Adult Complete Nutrition bag sold at Sam's Club.

`research/BRIEF-PURINA-ONE.md` §4 has the two opposite mistakes in full. They
apply here and this brand has more ladders than that one:

1. **Splitting one recipe into five products** because five listings had five codes.
2. **Merging two sizes' evidence** — bind every UPC to the exact printed size.

And the third: **a 55 lb bag is an individual unit.** Big is not a case. A case
has several sealed retail packs inside it — see §6.

**Calories on dry are stated per cup.** Copy kcal/kg and kcal/cup both, with the
basis the pack prints, and do not derive one from the other. If the pack's own
two figures disagree, record both and say so in `conflicts`.

---

## 5. DentaStix is a treat range, and it is enormous

`DentaStix` is one of the six named ranges and it is not food. It is a dental
chew, sold in small/medium/large by dog size, in pouches from a few sticks to
tubs of 50+, in fresh/original/beef variants, and it has more SKUs than some
whole brands in this catalog.

`lib/nutrition-role.ts` already knows the range name, so the role detector will
call it `treat` correctly without being taught. That is not permission to skip
the field: record what the pack's own AAFCO sentence says and let the detector
agree with you.

Two consequences for the work:

- **A treat has no complete-and-balanced guarantee** and is not supposed to. Do
  not report a missing AAFCO complete statement on a DentaStix pack as a gap.
- **Do it in its own batch, late.** Mixing dental chews into a dry-food batch is
  how a size ladder gets confused with a count ladder — "Large, 7 sticks" and
  "Large, 28 sticks" are not two sizes of one recipe in the way two bags are.
  Decide the shape once, in one batch, with the checker in front of you.

---

## 6. Multipacks: Pedigree wet sells mostly in cases, and we hold zero

Pedigree's wet business is cases far more than singles: Chopped Ground Dinner in
12- and 22-count can packs, Choice Cuts in pouch and tray variety packs, each
carrying its own barcode. This catalog holds **not one** Pedigree box.

A box is the cheapest record in the assignment: no composition, and no proven
inner barcodes required to be `source_verified` — outer identity, size and code
are enough, with `contains: []`. §8 of `BRIEF-REVEAL.md` has the rules.

The inverse matters more on this brand than on most: because cases dominate the
shelf, **a case code filed as a single can is the likeliest wrong record you
will produce.** `data/wrong-barcodes.ts` exists because this project has already
made that mistake. If you prove a code is a case of a pack we hold, say so in
the handoff with the pack it should point at.

---

## 7. Where the evidence will and will not come from

**This section used to say "Petco does not stock Pedigree" and send you
elsewhere. It was wrong, and it is corrected here rather than quietly deleted,
because the mistake is the instructive part.**

`research/PETCO-BRANDS.md` walked Petco's own food facets on 2026-09-21 and
found **27 Pedigree dog foods — 9 dry and 18 wet** — with a live brand page at
`petco.com/brand/pedigree`. The old text reasoned from the 2019 removal of
foods with artificial colours, flavours and preservatives, in whose coverage
Pedigree was named. Whatever that removal did, it did not leave Pedigree off
the shelf in 2026.

So Petco is a source for this brand, not a dead end.

The lesson is bigger than one retailer. A brief that tells an agent a source
is empty is stronger than a brief that says nothing, because the agent will
not look — and if the claim is stale, nothing in the campaign can discover it.
The Iams campaign lost most of its formula coverage to the same shape of
error: it never opened Chewy, Petco or PetSmart, and came back with 13
compositions out of 133 records. **Treat a "do not bother looking there" in
any brief as a claim with an expiry date, and say so in your handoff if you
find one that has passed.**

Where Pedigree sells: Walmart, Target, Tractor Supply, Dollar General,
Sam's Club, grocery, Amazon, Chewy, PetSmart **and Petco**. Evidence priority
in `AGENTS.md` §6 is unchanged — manufacturer deck first, retailer listing
second, UPC database never on its own.

---

## 8. Two things the other repository is missing, and you are the one who finds them

Both go in the handoff as recommendations for `Ingredients.help`. **You do not
edit that repository and you do not edit these files.**

**A. There is no Mars manufacturer entry at all.** `data/manufacturers.ts` holds
eleven makers — Purina, Hill's, Royal Canin, Blue Buffalo, ZIWI, Weruva,
Merrick, MPM, For All Tails, NatPets, Rayne — and **Mars is not among them**.
Royal Canin is there under its own name as "Royal Canin USA, Inc." with
`brands: ["royal canin"]`, and the header of that file forbids inheriting it:
ownership is NOT inherited, and Merrick is documented as deliberately not given
Purina's answers for exactly this reason.

So a Pedigree brand page is **blocked** until a Mars Petcare entry exists with
its own five criteria and its own sources. This is the opposite of the Pro Plan
campaign, where Purina already covered the brand. If your research turns up
primary Mars material on the five criteria — staff nutritionist, feeding trials,
owns its plants, quality programme, publishes research — capture it with URLs
and a checked-at date, in the shape that file's entries use. It is not the main
job. It is a by-product worth minutes, and it unblocks the page.

**B. There is no Pedigree recall on record.** `data/recalls.ts` holds Hill's,
For All Tails and Royal Canin only. Mars Petcare US recalled **Pedigree Adult
Complete Nutrition dry dog food in August 2014 for metal fragments** — 15 lb
bags sold through Dollar General, expanded to 55 lb bags sold through Sam's
Club, no illnesses reported.

**Secondary sources disagree about the details** — bag counts (22 versus 315),
and whether the expanded lot was plain Adult Complete Nutrition or the Grilled
Steak recipe. That disagreement is the reason this is a research task and not a
copy-paste: **settle it from the FDA primary pages**, record lot codes and
best-by dates as printed, with the UPCs if the notice carries them. If the two
announcements are genuinely two recalls, say so; if one expands the other, say
that. A recall entry that is confidently wrong about which bag is worse than no
entry.

Do not go hunting for other Mars recalls as a task of its own. If one crosses
your path with a primary source, record it the same way.

---

## 9. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-pedigree` (from current `main`) |
| Ledger | `research/deep-research-pedigree.json` (new — create it) |
| Inventory | `research/INVENTORY-PEDIGREE.md` (generated, §0) |
| Handoff | `research/PEDIGREE-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The ledger begins as the shape in §4 of `AGENTS.md`, with
`"brand_scope": ["Pedigree"]`.

**Never touch:** anything under `data/`, `app/`, `lib/`, `components/`,
`tests/`, `scripts/`, or any other `research/deep-research-*.json`. Widening the
`023100` prefix comment, correcting the range list, adding a texture, putting a
code on the wrong-barcodes list, adding the Mars manufacturer entry and adding
the recall are **all somebody else's job** — you say what they should be, in the
handoff. In particular **do not edit `lib/presentation.ts`**: if you find a
Pedigree texture the list cannot express, that is a finding, not a patch.

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
   **including the 198 seeded Royal Canin products and the 19 Sheba boxes**, the
   two Mars siblings you can collide with today.
3. Research 20 records.
4. Append. Update `updated_at`.
5. **Run the checker.** Fix every ERROR, read every WARN.
6. One commit: `research: Pedigree batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
Pedigree batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  ranges touched:   <names, spelled as the packs spell them>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
  new this batch:   <a range the brand entry lacks, a GS1 prefix, a size ladder
                    proven end to end, a wrong-barcode recommendation>
```

Twenty is a limit, not a target. Never pad a batch to reach it — the last
campaign that stopped at five records and said why was doing the job correctly.

A sensible order, given the catalog holds nothing: **dry adult, then dry puppy,
then wet cans (Chopped Ground Dinner), then wet pouches and trays (Choice Cuts),
then the cases, then DentaStix last.** Dry adult is where the volume and the
size ladders are; getting the first ladder right makes every later one
mechanical. DentaStix goes last for the reason in §5.

---

## 11. The handoff

`research/PEDIGREE-HANDOFF.md`, written from the first batch and updated as you
go — not left to the end, because a campaign that stops unexpectedly should
still leave a usable trail.

1. **The range answer** — every `product_line` you used, spelled as the packs
   spell them. Which of the six shelf-memory names are current, which are the
   previous generation, and every range you found that the entry lacks. This is
   what unblocks seeding.
2. **GS1 prefixes** — whether Pedigree sits under `023100`, and whether anything
   sits outside it. With what each was on.
3. **The brand boundary** — every product you nearly filed here that turned out
   to be Cesar, Iams, Nutro or Royal Canin. Name them, so the next agent does
   not repeat the near-miss. Cesar especially.
4. **Size ladders** — for each recipe you completed, the sizes and the UPC of
   each, so the seeding pass builds `packages[]` without re-deriving it.
5. **Textures** — any Pedigree wet shape `lib/presentation.ts` cannot express,
   with the exact printed phrase. Do not patch it; report it.
6. **Multipacks** — the box codes you proved, with counts and unit sizes.
7. **Wrong-barcode recommendations** — any case or carton code you proved was
   being sold as a single unit, with the pack it should point at. Expect several
   on this brand.
8. **DentaStix** — what shape it wants: how counts and dog sizes relate, and
   whether a count is a `packages[]` entry or a separate product.
9. **The Mars manufacturer entry** — §8A, whatever you found, with URLs and
   dates, or an explicit "nothing primary found" so the next person does not
   repeat the search.
10. **The recall** — §8B, settled from FDA primary pages, in the shape
    `data/recalls.ts` uses.
11. **The unresolved tail, by REASON** — not a list of barcodes but a list of
    blockers: formula generations colliding under one UPC, exact-size binding
    missing, no printed calorie statement, no complete panel, inner barcodes
    unproven. The next agent works by gap, not from record 1.
12. Where you stopped and why.

---

## 12. Done

- Inventory regenerated before starting.
- Every batch committed, checker clean, remote fetched back and verified.
- Handoff complete, including the range answer, the prefix answer and the size
  ladders.
- Draft PR open, unmerged, one report per batch.
- Not one byte changed outside `research/deep-research-pedigree.json`,
  `research/INVENTORY-PEDIGREE.md` and `research/PEDIGREE-HANDOFF.md`.

`needs_physical_label` on a record is a result, not a failure. A wrong
`source_verified` is not: it reaches a shopper standing in front of the actual
pack.

On this brand the two most likely wrong answers are both quiet ones. A Cesar
tray written as Pedigree — same maker, same barcode family, same shelf logic,
different food. And a case code filed as a single can, on a brand whose wet
business is mostly cases: that one sends a shopper who scanned a 22-can box to a
record describing one can, and nothing about the record looks wrong.
