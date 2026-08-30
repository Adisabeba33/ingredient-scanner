# Assignment: Reveal

You are researching **one brand: Reveal.** Nothing else.

`research/AGENTS.md` is the binding contract and you must read it first. This
file adds what is specific to this brand and what six completed campaigns have
taught us about what actually blocks a ledger from reaching the catalog.

---

## 0. The one command that matters

Before every commit:

```bash
node scripts/check-ledger.mjs research/deep-research-reveal.json
```

Bare node, no install, no network. It reads the live catalog, the live
`texture`/`presentation` vocabularies, the wrong-barcode list and every other
ledger.

- **ERROR** — blocks seeding, exits 1. Fix before committing.
- **WARN** — a question. Answer it in `conflicts` or `verification_notes`.

**A batch is not finished until this exits 0**, and not finished until you have
read every warning. Six previous brands arrived correct against the prose
contract and still needed a day of hand repair, always for format defects this
script now catches by itself. Use it and almost nothing below can go wrong.

---

## 1. What this repository already knows about Reveal

Not much, and one thing matters.

**Reveal is already listed in `data/us-pet-brands.ts` — with no ranges at all:**

```ts
{ name: "Reveal", owner: "Independent", species: "both" },
```

An empty `lines` list means the coverage page has no shelf to file anything
under, and **every product you research would land in a bucket called "Other"**
until somebody adds the range names. So one of your deliverables is the list of
range names as the packs print them, in the handoff (§7). This is not
bookkeeping: `lib/known-import.test.ts` now refuses to seed a product whose
range is not in its brand's entry, so the seeding pass is blocked without it.

The owner is recorded as "Independent". Confirm or correct it.

No barcode of this brand is in the seed, in `data/wrong-barcodes.ts`, or in any
existing research ledger. You are starting from zero, which the checker will
confirm on your first run.

---

## 2. Step zero: establish the brand before researching a single barcode

Write these into the handoff as its first section:

- the exact spelling on the pack, capitalisation included — "Baby Blue" versus
  "Baby BLUE" cost a previous brand every kitten product on the coverage page;
- the legal maker and where the food is produced;
- **which markets, and whether the formula differs between them.** Reveal is
  understood to be a non-US company selling into the US, which makes this the
  live question rather than a formality. This catalog is US-first: a UK, EU or
  Canadian page is corroboration only and must **never** fill a missing field on
  a US barcode when the two markets' formulas differ. A previous brand had a
  Canadian 6 lb bag with a materially different deck from the US 3.5 lb bag, and
  merging them would have written a food that is not in the bag;
- the GS1 company prefix or prefixes. **A maker may run more than one** — Blue
  Buffalo's 3 lb and 5 lb bags of one recipe sit under two — and a non-US maker
  will carry EAN-13 rather than UPC-A, which this toolchain handles.

If the brand does not resolve, or what you find is another company's sub-range
rather than a brand, **stop and report that.** An empty answer is a real result;
an invented one poisons everything downstream.

---

## 3. The thing that is different about this brand

If Reveal's proposition is what its marketing says it is — a very short list of
named whole ingredients, "Chicken Breast, Chicken Broth" and little else — then
**most of its compositions will be under five ingredients.**

That is fine. It is expected, it is already handled, and it must not be
"fixed":

- `compositionKey` deliberately returns null below five ingredients or thirty
  characters, because a four-item list is not specific enough to say two
  products are the same food. Read `lib/composition-key.ts` for the reasoning.
- The importer has a text-equality fallback for exactly this case, added when
  Ziwi Peak's single-organ chews ("Lamb Trachea.") reported themselves as
  conflicts against themselves on every run.
- The checker will not complain about a short list.

**So do not pad.** Do not add water that the label does not list, do not
expand a vitamin block the deck does not print, do not merge a sibling flavour's
extra lines to make a record look complete. A three-ingredient list copied
exactly is a better record than a five-ingredient list that is partly invented,
and the second kind is undetectable once written.

The same applies to the guaranteed analysis: a minimal food may print a minimal
panel. Use `null` where the label prints nothing, and say so in
`verification_notes`. Missing evidence is not zero.

---

## 4. A lead worth ten minutes, not a fact

Shoppers have scanned codes this catalog does not hold. One of them is:

```
5060218988663      (EAN-13, check digit valid)
```

`506` is **GS1 UK**, and `5060218` is a UK company prefix. That is consistent
with a UK-registered pet-food company and nothing more — it is a hypothesis, not
evidence. **Check whether that prefix is Reveal's.** If it is, that single code
tells you the company prefix to search the rest of the range under, which is the
cheapest lead in this assignment.

These other unfound codes are all valid barcodes under makers this catalog does
not know. Most are certainly other brands; glance at them once and move on if
they are not Reveal:

```
810050200189   810291007837   694990012503   071190478450
009800892204   009800895007   009800513048
014100085607   024100939961   63003444   05001200
```

Do not force a match. A code assigned to the wrong brand is worse than a code
left unassigned.

---

## 5. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-reveal` (from current `main`) |
| Ledger | `research/deep-research-reveal.json` |
| Handoff | `research/REVEAL-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

**Never touch these:**

- `data/known-products.ts`, `data/known-formulas.ts`, `data/known-multipacks.ts`
- `data/us-pet-brands.ts`, `data/gs1-prefixes.ts`, `data/wrong-barcodes.ts`
- anything under `app/`, `lib/`, `components/`, `tests/`, `scripts/`
- any other `research/deep-research-*.json`

Read whatever you like; write only your own two files. Seeding into the catalog
is a separate, human-triggered pass — including adding Reveal's ranges to the
brand entry and its prefix to `data/gs1-prefixes.ts`. Your job is to say what
they should be, not to write them.

**Do not create GitHub Actions workflows.** Two previous campaigns spent 20 of
25 and 23 of 26 commits on temporary runners that staged, audited and restored
themselves. Every one was avoidable: write the JSON directly and commit it. The
campaign that worked fastest did 30 records in 2 commits doing exactly that.

---

## 6. Batches of twenty

Per batch, in order:

1. `git fetch` and re-read the remote ledger.
2. Rebuild the exclusion set from the live files (§2 of `AGENTS.md`).
3. Research 20 records.
4. Append. Update `updated_at`.
5. **Run the checker.** Fix every ERROR; read every WARN.
6. One commit: `research: Reveal batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report (§8) as a PR comment.

Twenty is a limit, not a target. If the brand runs out at 63 records, the last
batch is 3 and that is correct. Never pad a batch with weak records to reach the
number.

---

## 7. The rules the checker enforces

You do not need to memorise these — the script checks them. They are here so
that when it complains you know what it is protecting.

### Barcodes

Quoted **strings**, never numbers. Valid check digit at 8, 12, 13 or 14 digits,
computed rather than trusted from a snippet. `canonical_gtin14` is the code
left-padded with zeros to 14. A GTIN-14 whose first digit is 1–8 is a
**packaging level** of the code beneath it, not a different company — never
strip that digit to make a code "work". A retailer SKU, ASIN, TCIN, model or
deck number is not a barcode.

### Controlled vocabularies — these exact strings, or `null`

`life_stage`: `adult` `senior` `kitten` `puppy` `all` — and nothing else. A pack
printing "Mature" is `senior`; keep the printed word in `variant` and note the
mapping in `conflicts`.

`food_form`: `wet` `dry` `treat` `supplement` `unknown`

`package_type`: `can` `pouch` `tub` `tray` `bag` `box` `canister` `other`

`barcode_scope`: `individual_unit` `multipack` `case` `tray` `unknown`

`research_status`: `candidate` `source_verified` `needs_physical_label`
`rejected` `promoted_to_seed`

`texture` — **what it is cut or shaped into**, or `null`:
`pate` `loaf` `mousse` `minced` `ground` `chopped_ground` `flaked` `shredded`
`morsels` `chunks` `cuts` `choice_cuts` `slices` `filets` `bits` `stew`
`medley` `kibble` `biscuit` `freeze_dried` `air_dried` `steam_dried`
`dehydrated` `fresh` `raw` `unknown`

`presentation` — **what it is suspended in**, or `null`:
`in_gravy` `extra_gravy` `in_sauce` `in_broth` `in_jelly` `in_water`
`gravy_center` `gravy_halo` `plain` `unknown`

A presentation is never a texture and never a package type. Previous ledgers
wrote `"can"`, `"bite"`, `"dehydrated"` and `"gravy"` there and every one had to
be unpicked by hand. **`null` is always allowed and always better than a guess.**

Reveal is likely to need `in_broth` more than most brands. If you genuinely need
a value the vocabulary lacks, use `null` and propose it in the handoff with the
pack that justifies it. Do not edit `lib/presentation.ts`.

### Guaranteed analysis

`other_printed_guarantees` is an **array of objects**, never free text:

```json
{ "nutrient": "Omega-3 Fatty Acids", "basis": "min", "value": 0.3, "unit": "percent" }
```

Three ledgers each invented a different sentence format — `"Vitamin A (Min)
12,000 IU/kg"`, `"DHA 0.07% min"` — and each needed its own parser written by
hand at seeding time. The checker rejects strings here. A parenthetical gloss
stays part of the name: `"Ascorbic Acid (Vitamin C)"` is what the panel prints.

Two physics checks run automatically:

- **The panel cannot sum past the pack.** protein + fat + moisture + ash + fibre
  above 100% means a figure was mistranscribed.
- **Calories cannot exceed what the panel can make.** Modified Atwater on the
  guarantees, doubled for slack — protein and fat are minima, moisture a
  maximum, so a real food beats its own ceiling and the worst honest ratio
  across 1010 seeded panels is 1.69.

### Calories

Record every printed basis. `kcal_per_unit` needs a `unit_name`. Where a per-kg
and a per-container figure are both printed, the script checks them against the
printed size. **Read that warning rather than silencing it** — it has settled
real questions about which size a barcode belongs to, and it has caught a
maker's own two statements disagreeing with each other.

### Identity

- No two records may carry the same printed identity **at the same size**. Two
  barcodes cannot both be "Indoor Chicken Recipe, 11 lb"; a word is missing from
  one of the names, and a previous brand lost a record to exactly that.
- `variant` is **the name minus the range**, not the pack. "6 inch, 5 count" is
  a size; "Beef Bully Stick" is a variant.
- `variant` carries no annotations. "Beef Recipe 5.5 lb historical generation"
  is a variant plus a note; the note goes in `conflicts`.
- **Species is part of identity.** The same name on a cat tin and a dog tin is
  two products with two recipes.
- Two *different* products sharing one ingredient list to the letter is
  sometimes real — a rename in flight — and sometimes a deck pasted onto the
  wrong barcode. The checker warns; say which in `conflicts`.

---

## 8. Multipacks

A variety pack carries one barcode outside and a different one on each item
inside. **The outer code names no food.** The back of such a box prints every
member's ingredient list one after another, and that text parses, fingerprints
and scores exactly like a real composition while describing nothing that exists.

- `barcode_scope: "multipack"`.
- **Never assemble a composition for a box from its members.** Leave
  `ingredients_verbatim` null. A previous campaign produced 84 boxes carrying
  stitched-together decks and all 84 had to be reworked.
- For a variety pack, the panel and calories are null too — there is no single
  formula.
- `contains` — the barcodes **printed on the inner units**, as an array. A box
  never lists itself. Never invent an inner code from a standalone SKU.
- `pack_count` and `unit_size` where the box prints them.

**A box does not need proven inner barcodes to be `source_verified`.** This is
the instruction the last campaign got wrong: it left 44 outer packs at
`needs_physical_label` solely because no inner code could be proven, and every
one was seedable. The catalog marks a box with `found = false`, `reason =
'multipack'` and an **empty** `contains`, and that mark alone is what stops a
shopper being invited to photograph the carton. If the box's own identity, size
and barcode are proven, it is `source_verified` with `contains: []`.

---

## 9. Report after every batch

Post as a PR comment and keep a running copy in the handoff:

```
Reveal batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
  new this batch:   <anything the repository does not know — a GS1 prefix, a
                    range name, a vocabulary value you had to leave null>
```

---

## 10. The handoff document

`research/REVEAL-HANDOFF.md`, written from the first batch and updated as you
go — not left to the end, because a campaign that stops unexpectedly should
still leave a usable trail.

1. **Brand identity** — everything from §2, plus whether "Independent" is the
   right owner.
2. **Ranges** — every `product_line` value you used, spelled exactly as the
   packs spell them. **This brand's entry has none**, so this section is what
   unblocks seeding. Say plainly if a product genuinely has no range and is sold
   under the bare brand name.
3. **The market question** — one paragraph: does the US formula differ from the
   UK/EU one, and how did you tell?
4. **Coverage** — ranges done, partial, untouched.
5. **The unresolved tail, by REASON** — not a list of barcodes but a list of
   blockers: formula generations colliding under one UPC, exact-size binding
   missing, no printed calorie statement, no complete panel, no adequacy
   statement, inner barcodes unproven. The next agent works by gap, not from
   record 1.
6. **Anything the repository must learn** — the GS1 prefix and its owner, range
   names, any vocabulary value that does not exist, any treat range whose name
   contains no word meaning "treat". That last is not cosmetic: a snack judged
   as dinner is told it is a bad food.
7. **Where you stopped and why.**

---

## 11. When to stop researching a record

`needs_physical_label` is a result, not a failure. Stop when the exact UPC and
identity are known, repeated current-source searches return the same incomplete
evidence **or** two current generations remain materially incompatible, and no
manufacturer deck, label PDF or package image resolves it. Reopen only when a
genuinely new high-quality source appears.

Do not lower the bar to raise the count. One wrong `source_verified` costs more
than ten honest `needs_physical_label` records, because it reaches a shopper as
fact.

---

## 12. Definition of done

- The brand is established, or its non-existence reported.
- Every batch committed, checker clean, remote fetched back and verified.
- `research/REVEAL-HANDOFF.md` complete, **including the range names**.
- Draft PR open, unmerged, one batch report per batch.
- Not one byte changed outside `research/deep-research-reveal.json` and
  `research/REVEAL-HANDOFF.md`.
