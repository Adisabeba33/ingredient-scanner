# Assignment: Purina ONE

You are researching **one brand: Purina ONE.** Nothing else. Purina makes at
least nine brands and this assignment covers exactly one of them — §2 is about
why that sentence is the hardest part of this job.

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply here unchanged — read that too rather than having it
repeated here.

---

## 0. The two commands

Regenerate the inventory before you research anything:

```bash
node scripts/brand-inventory.mjs "Purina ONE" > research/INVENTORY-PURINA-ONE.md
```

Run the checker before every commit:

```bash
node scripts/check-ledger.mjs research/deep-research-purina-one.json
```

ERROR blocks seeding and exits 1. WARN is a question to answer in `conflicts`.
A batch is not finished until the checker exits 0 and every warning is read.

---

## 1. What the catalog already holds

**One product.** `017800012638` — +Plus Hairball Formula, 3.5 lb dry cat food.
That is the entire holding, and it did not come from a research campaign: it
came off the "looked for, not found" list, because somebody scanned it in a
shop and got nothing.

Purina ONE is a national supermarket brand with several hundred SKUs. This is
the largest single gap in the catalog, and it is the gap most likely to be
standing in front of a shopper right now.

The brand entry names seven ranges. **Six hold nothing:** `SmartBlend`,
`True Instinct`, `Tender Selects Blend`, `Natural`, `Healthy Kitten`,
`Healthy Puppy`. Only `+Plus` holds the one product above.

`017800` is registered to Nestlé Purina in `data/gs1-prefixes.ts` — this is one
of the few brands here that starts with a known prefix. Do not treat that as
settled for every product: Purina runs `050000` as well (Fancy Feast, Friskies),
and Blue Buffalo, 9Lives and Weruva each turned out to run two or three prefixes
at once on the same shelf. Establish which prefix each pack carries; report any
you find that is neither.

---

## 2. The brand boundary is the whole job

Purina ONE sits inside a house of brands that this catalog keeps deliberately
separate, and nearly every way this campaign can go wrong is a product from a
sibling brand written into the Purina ONE ledger.

The siblings, all in `data/us-pet-brands.ts` as their own rows:

| Brand | What it is |
|---|---|
| **Purina ONE** | this assignment |
| **Pro Plan** | the premium line above it |
| **Purina** | the plain-Purina ranges — Moist & Meaty, Kit & Kaboodle, Puppy Chow, Kitten Chow |
| **Fancy Feast**, **Friskies** | cat, `050000`, heavily seeded already |
| **Beneful**, **Alpo**, **Cat Chow**, **Dog Chow** | separate rows again |

They share a maker, a website, a barcode family and — this is the part that
bites — **range names**. `LiveClear` is a Pro Plan range AND a Purina ONE
range. Both are current, both are allergen-reducing chicken formulas, both live
on purina.com under sibling paths, and their decks are different foods. A Pro
Plan LiveClear panel written into a Purina ONE record is a wrong
`source_verified`: it reaches a shopper holding the other bag.

So for every record: the pack's own front says **Purina ONE**. Not "Purina",
not "a Purina brand", not "Pro Plan". If the evidence for a formula comes off a
page that does not say Purina ONE on the product itself, it is not evidence for
this ledger.

`brand` is `"Purina ONE"` on every record. Never `"Purina"` — the coverage page
groups by brand and `lib/brand-key.ts` resolves "purina one" ahead of "purina"
precisely so the two do not merge. Writing `"Purina"` would file the product
under the Moist & Meaty row.

---

## 3. A range the brand entry does not name, and one it may name wrongly

**`LiveClear` is a Purina ONE range and it is missing from the brand entry.**
Checked: purina.com publishes a Purina ONE LiveClear product page with adult and
kitten dry formulas, and the brand entry's `lines` does not list it. Every
LiveClear product you research files under **"Other"** on the coverage page
until somebody adds it, and `lib/known-import.test.ts` now **refuses to seed a
product whose range its brand entry does not name** — so this blocks seeding
rather than merely looking untidy.

Report it in the handoff, spelled exactly as the bag spells it. Do the same for
every other range you meet that the seven above do not cover.

**`SmartBlend` needs checking in the other direction.** It was Purina ONE's
flagship descriptor for years and it is receding from current packaging while
remaining everywhere in retailer listings and older photographs. That is the
worst combination available: a listing-driven researcher will keep filing 2026
bags under a range the 2026 bag no longer prints.

The rule is the same one as always — **the pack decides**. If the current bag
prints SmartBlend, the range is SmartBlend. If it prints nothing but "Purina
ONE Natural", the range is what it prints. Say in the handoff which of the
seven shelf-memory names turned out to be real, which are historical, and what
the current packs actually print instead. That is what unblocks seeding.

---

## 4. One recipe, many bags — and the two opposite mistakes

Purina ONE dry sells the same recipe in a ladder of sizes — 3.5, 6.3, 7, 8, 14,
16.5, 22, 31.1, 40 lb are all shapes this brand uses — **each with its own
UPC**. The catalog's shape for that is one product with several entries in
`packages[]`: one recipe, several barcodes. See any Fancy Feast or Blue Buffalo
product in `data/known-products.ts`.

Two mistakes, in opposite directions, and both are easy here:

1. **Splitting one recipe into five products** because five listings had five
   codes. The coverage page then shows five foods that are one food.
2. **Merging two sizes' evidence.** Bind every UPC to the **exact printed
   size**. A 16.5 lb bag's code on a 40 lb record is a wrong answer that reads
   perfectly reasonable, and `research/AGENTS.md` §7 requires exact-size
   binding for a reason.

And the third, which is not a size question at all: **a 40 lb bag is an
individual unit.** Big is not a case. A case has several sealed retail packs
inside it — see §5.

---

## 5. Multipacks: the catalog holds zero Purina ONE boxes

Purina ONE wet cat food sells as single 3 oz cans **and** as 12- and 24-count
packs carrying their own barcodes, and this catalog holds **not one** Purina ONE
box. Every one of those codes is a thing somebody will scan and get nothing for,
and a box is the cheapest record in the assignment: no composition, and **no
proven inner barcodes required** to be `source_verified` — outer identity, size
and code are enough, with `contains: []`. §8 of `BRIEF-REVEAL.md` has the rules.

A lead, worth ten minutes and not a fact: **`017800151283`** turns up on
retailer databases as a Purina ONE 3 oz × 24 wet cat pack. Prove it or discard
it — a UPC-database row is not proof, and `data/wrong-barcodes.ts` exists
because a case code filed as a single can is a mistake this project has already
made.

Careful in that direction too: if you prove a code is a case of a pack we hold,
say so in the handoff with the pack it should point at.

---

## 6. Two things the checker will say, and what the right answer is

**"Urinary Tract Health" is not a prescription diet.** Purina ONE +Plus prints
health claims — Hairball Formula, Indoor Advantage, Urinary Tract Health,
Ideal Weight — on food sold in a supermarket. `lib/vet-diet.ts` deliberately
does **not** flag those, and its comment names Pro Plan's Urinary Tract Health
as the exact case it refuses to flag. Do not report them as vet-channel and do
not put a vet word in the product name that the pack does not print. Flagging a
supermarket bag as prescription-only is the same category error as missing a
real one, in the other direction.

**Calories on dry are stated per cup.** Purina decks print kcal/kg and
kcal/cup. Copy both with the basis the pack prints — `unit_name` says "cup" —
and do not derive one from the other. The checker cross-checks them against the
stated cup weight; if the pack's own two figures disagree, record both and say
so in `conflicts` rather than making them agree. A TheraDiet bag did exactly
that last batch and both printed values were kept.

---

## 7. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-purina-one` (from current `main`) |
| Ledger | `research/deep-research-purina-one.json` (new — create it) |
| Handoff | `research/PURINA-ONE-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The ledger begins as the shape in §4 of `AGENTS.md`, with
`"brand_scope": ["Purina ONE"]`.

**Never touch:** anything under `data/`, `app/`, `lib/`, `components/`,
`tests/`, `scripts/`, or any other `research/deep-research-*.json`. Adding
`LiveClear` to the brand entry, correcting the range list, registering a
prefix and putting a code on the wrong-barcodes list are all the seeding pass's
job — you say what they should be, in the handoff.

**Do not create GitHub Actions workflows.** Two previous campaigns spent 20 of
25 and 23 of 26 commits on temporary runners that staged and restored
themselves. Write the JSON directly and commit it.

---

## 8. Batches of twenty

1. `git fetch` and re-read the remote ledger.
2. Regenerate the inventory; rebuild the exclusion set from the live files.
3. Research 20 records.
4. Append. Update `updated_at`.
5. **Run the checker.** Fix every ERROR, read every WARN.
6. One commit: `research: Purina ONE batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
Purina ONE batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  ranges touched:   <names>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
  new this batch:   <a range the brand entry lacks, a GS1 prefix, a size ladder
                    proven end to end, a wrong-barcode recommendation>
```

Twenty is a limit, not a target. Never pad a batch to reach it — the last
campaign that stopped at five records and said why was doing the job correctly.

A sensible order, given the catalog holds one product: **dry cat, then dry dog,
then wet cat, then wet dog, then the multipacks.** Dry is where this brand's
volume is and where the size ladders are; getting the ladder right on the first
recipe makes every later one mechanical.

---

## 9. The handoff

`research/PURINA-ONE-HANDOFF.md`, written from the first batch and updated as
you go — not left to the end, because a campaign that stops unexpectedly should
still leave a usable trail.

1. **Ranges** — every `product_line` you used, spelled exactly as the packs
   spell them; which of the seven shelf-memory names are real, which are
   historical, and `LiveClear` confirmed. This is what unblocks seeding.
2. **The SmartBlend answer** — one paragraph on what current packs print and
   what should happen to that entry.
3. **The brand boundary** — any product you nearly filed here that turned out to
   be Pro Plan, plain Purina, Cat Chow or Dog Chow. Name them, so the next agent
   does not repeat the near-miss.
4. **Size ladders** — for each recipe you completed, the sizes and the UPC of
   each, so the seeding pass can build `packages[]` without re-deriving it.
5. **GS1 prefixes** — every one you find, with whose it is, and specifically
   whether any Purina ONE product sits outside `017800`.
6. **Multipacks** — the box codes you proved, with counts and unit sizes.
7. **Wrong-barcode recommendations** — any case or carton code you proved was
   being sold as a single unit, with the pack it should point at.
8. **The unresolved tail, by REASON** — not a list of barcodes but a list of
   blockers: formula generations colliding under one UPC, exact-size binding
   missing, no printed calorie statement, no complete panel, inner barcodes
   unproven. The next agent works by gap, not from record 1.
9. Where you stopped and why.

---

## 10. Done

- Inventory regenerated before starting.
- Every batch committed, checker clean, remote fetched back and verified.
- Handoff complete, including the range answer and the size ladders.
- Draft PR open, unmerged, one report per batch.
- Not one byte changed outside `research/deep-research-purina-one.json` and
  `research/PURINA-ONE-HANDOFF.md`.

`needs_physical_label` on a record is a result, not a failure. A wrong
`source_verified` is not: it reaches a shopper standing in front of the actual
pack. On this brand the most likely wrong answer is a Pro Plan deck under a
Purina ONE name — same maker, same website, same range name, different food.
