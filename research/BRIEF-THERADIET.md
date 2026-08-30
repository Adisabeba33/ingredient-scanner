# Assignment: TheraDiet

You are researching **one brand: TheraDiet.** Nothing else.

`research/AGENTS.md` is the binding contract and you must read it first. This
file does not replace it. It adds the things six completed brand campaigns have
taught us about what actually blocks a ledger from reaching the catalog — and
one command that checks all of them for you.

---

## 0. The one command that matters

Before every commit, run:

```bash
node scripts/check-ledger.mjs research/deep-research-theradiet.json
```

It runs under bare node, needs no install and no network. It reads the live
catalog, the live vocabularies and every other ledger, and it reports:

- **ERROR** — blocks seeding. Exit code 1. Fix before committing.
- **WARN** — a question, not a failure. Read every one and either fix it or
  answer it in `conflicts` / `verification_notes`.

**A batch is not finished until this exits 0.** Do not commit a batch that
errors, and do not commit a batch whose warnings you have not read.

This is the difference between this assignment and the ones before it. Six
brands arrived correct against the prose contract and still needed a day of
hand repair, always for the same seven format reasons. The script now catches
all seven. Use it and none of section 4 below can go wrong.

---

## 1. Step zero: prove the brand exists before researching a single barcode

**TheraDiet is not a brand this repository has ever seen, and the assignment
does not say who makes it.** Before any batch, establish and write down:

- the exact spelling on the pack (capitalisation included — "Baby Blue" vs
  "Baby BLUE" cost a previous brand every kitten product on the coverage page);
- the manufacturer or parent company;
- the market (this catalog is US-first; a Canadian or EU page is corroboration
  only, never a source for a US barcode's formula);
- whether it is sold through veterinarians, through shops, or both;
- its GS1 company prefix or prefixes — **a maker may run more than one at
  once**, and Blue Buffalo's 3 lb and 5 lb bags of one recipe sit under two.

Put this in the handoff document (§7) as its first section.

**If the brand does not resolve** — nothing found, or what is found is another
brand's sub-range rather than a brand — **stop and report that.** Do not
research a brand you had to guess the identity of. An empty answer here is a
real and useful answer; an invented one poisons everything downstream.

---

## 2. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-theradiet` (create it from current `main`) |
| Ledger | `research/deep-research-theradiet.json` |
| Handoff | `research/THERADIET-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

**Never touch these**, under any circumstances:

- `data/known-products.ts`, `data/known-formulas.ts`, `data/known-multipacks.ts`
- `data/us-pet-brands.ts`, `data/gs1-prefixes.ts`, `data/wrong-barcodes.ts`
- anything under `app/`, `lib/`, `components/`, `tests/`, `scripts/`
- any other `research/deep-research-*.json`

Seeding into the catalog is a separate, human-triggered pass. Your output is
evidence. Read whatever you like; write only your own two files.

**Do not create GitHub Actions workflows.** Previous campaigns spent 20 of 25
and 23 of 26 commits on temporary runners that staged, audited and restored
themselves. Every one of those was avoidable: write the JSON file directly and
commit it. The brand that worked fastest did 30 records in 2 commits by doing
exactly that.

---

## 3. Batches of twenty

Work in batches of **20 records**. Per batch, in order:

1. `git fetch` and re-read the remote ledger. Another pass may have moved it.
2. Rebuild the exclusion set from the live files (§2 of `AGENTS.md`).
3. Research 20 records.
4. Append them. Update `updated_at`.
5. **Run `node scripts/check-ledger.mjs`.** Fix every ERROR.
6. One commit: `research: TheraDiet batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report (§6) as a PR comment.

Twenty is a real limit, not a target — if the brand runs out at 137 records,
the last batch is 17 and that is correct. Do not pad a batch with weak records
to reach the number.

---

## 4. What the checker enforces, and why each one exists

You do not have to remember these; the script does. They are here so that when
it complains you know what it is protecting.

### Barcodes

- Quoted **strings**, never numbers. A leading zero is data.
- Valid check digit at 8, 12, 13 or 14 digits — computed, not trusted from a
  search snippet.
- `canonical_gtin14` is the code left-padded with zeros to 14. Nothing else.
- A GTIN-14 whose first digit is 1–8 is a **packaging level** of the code
  beneath it, not a different company. `10818336014311` is the inner pack of
  `0818336014311`. Never strip that digit to make a code "work".
- Not a barcode: a retailer SKU, ASIN, TCIN, model number, deck code, or a
  neighbouring product's UPC with a digit changed.

### The controlled vocabularies — use these exact strings or `null`

`life_stage`: `adult` `senior` `kitten` `puppy` `all` — **and nothing else.**
A pack printing "Mature" is `senior`; keep the printed word in `variant` and
say so in `conflicts`. Inventing a sixth value gives the catalog a stage it
cannot store.

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

A presentation is never a texture and never a package type. Three previous
ledgers wrote `"can"`, `"bite"` and `"dehydrated"` there and each one had to be
unpicked by hand. **`null` is always allowed and always better than a guess.**

If the brand genuinely needs a value the vocabulary lacks, use `null` and
propose the new value in the handoff with the pack that justifies it. Do not
add it yourself — `lib/presentation.ts` is not yours to edit.

### Guaranteed analysis

`other_printed_guarantees` must be an **array of objects**:

```json
{ "nutrient": "Omega-6 Fatty Acids", "basis": "min", "value": 2.5, "unit": "percent" }
```

Never free text. Three ledgers each invented a different sentence format —
`"Vitamin A (Min) 12,000 IU/kg"`, `"DHA 0.07% min"` — and each needed its own
parser written by hand at seeding time. The checker rejects strings here.

The gloss stays part of the name: `"Ascorbic Acid (Vitamin C)"` is what the
panel prints, and §8 of the contract says copy, do not tidy.

Two physical checks the script runs for you:

- **The panel cannot sum past the pack.** protein + fat + moisture + ash +
  fibre > 100% means at least one figure was mistranscribed. A previous ledger
  had a jerky at 27% protein, 11% fat and 82% moisture; that record could not
  be seeded at all.
- **Calories cannot exceed what the panel can make.** Modified Atwater on the
  guarantees themselves, doubled for slack. A previous ledger printed 7484
  kcal/kg beside a panel topping out near 3560.

### Calories

Record every printed basis. `kcal_per_unit` needs a `unit_name` — a number per
nothing cannot be checked. When both a per-kg and a per-container figure are
printed, the script does the arithmetic against the printed size and warns if
they disagree. **Read that warning rather than silencing it:** it has settled
real questions about which size a barcode belongs to, and it has also caught a
maker's own two statements disagreeing with each other.

### Identity

- No two records may carry the same printed identity **at the same size**. Two
  barcodes cannot both be "Indoor Chicken Recipe, 11 lb" — a word is missing
  from one of the names, and a previous brand lost a record to exactly that.
- `variant` is **the name minus the range**, not the pack. "6 inch, 5 count" is
  a size; "Beef Bully Stick" is a variant. If the pack truly has nothing but a
  size to distinguish it, say so in `verification_notes`.
- `variant` carries no annotations. "Beef Recipe 5.5 lb historical generation"
  is a variant plus a note; the note belongs in `conflicts`.
- **Species is part of identity.** The same name on a cat bag and a dog bag is
  two products with two recipes.
- Two *different* products carrying one ingredient list to the letter is
  sometimes real — a rename in flight sells one recipe under two names at once
  — and sometimes a deck pasted onto the wrong barcode. The script warns; you
  must say which in `conflicts`.

---

## 5. Multipacks — read this even if you think you know it

A variety pack carries one barcode outside and a different one on each item
inside. **The outer code names no food.** The back of such a box prints every
member's ingredient list one after another, and that text parses, fingerprints
and scores exactly like a real composition while describing nothing that
exists.

So:

- `barcode_scope: "multipack"`.
- **Never assemble a composition for a box from its members.** Leave
  `ingredients_verbatim` null. A previous campaign produced 84 boxes carrying
  decks stitched together from the tins inside, and all 84 had to be reworked.
- For a **variety pack** (several different recipes), the guaranteed analysis
  and calories are null too. There is no single formula.
- For a **single-flavour case** (12 of one tin), you may record what the carton
  prints, but the catalog will not store it. The member's own record is where
  that composition belongs.
- `contains` — the barcodes **printed on the inner units**, as an array. A box
  never lists itself. Never invent an inner code from a standalone SKU.
- `pack_count` and `unit_size` where the box prints them.

**A box does not need proven inner barcodes to be `source_verified`.** This is
the correction that matters most, and the last campaign got it wrong: it left
44 outer packs at `needs_physical_label` solely because no inner code could be
proven, and every one of them was seedable. The catalog marks a box with
`found = false`, `reason = 'multipack'` and an **empty** `contains`, and that
mark alone is what stops a shopper being invited to photograph the carton. If
the box's own identity, size and barcode are proven, it is `source_verified`
with `contains: []`.

---

## 6. Report after every batch

Post as a PR comment, and keep a running copy in the handoff:

```
TheraDiet batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
  new this batch:   <anything the repository does not know yet — a GS1 prefix,
                    a range name, a vocabulary value you had to leave null>
```

---

## 7. The handoff document

`research/THERADIET-HANDOFF.md`, written from the first batch and updated as
you go — not left to the end, because a campaign that stops unexpectedly should
still leave a usable trail.

It must contain:

1. **Brand identity** — everything from §1.
2. **Ranges** — every `product_line` value you have used, spelled exactly as
   the packs spell them. The seeding pass copies this list into the brand
   entry, and a range that is not there files every product under "Other".
3. **Coverage** — which ranges are done, which are partial, which untouched.
4. **The unresolved tail, by REASON** — not a list of barcodes but a list of
   blockers: formula generations colliding under one UPC, exact-size binding
   missing, no printed calorie statement, no complete panel, no adequacy
   statement, inner barcodes unproven. The next agent works by gap, not by
   starting at record 1.
5. **Anything the repository must learn** — a GS1 prefix, a range name, a
   vocabulary value that does not exist, a treat range whose name contains no
   word meaning "treat". That last one is not cosmetic: a snack judged as
   dinner is told it is a bad food.
6. **Where you stopped and why.**

---

## 8. When to stop researching a record

`needs_physical_label` is a result, not a failure. Stop when:

- the exact UPC and product identity are known;
- repeated current-source searches return the same incomplete evidence;
- **or** two current generations remain materially incompatible;
- and no manufacturer deck, label PDF or package image resolves it.

Reopen it only when a genuinely new high-quality source appears.

Do not lower the bar to raise the count. A `source_verified` record that is
wrong costs more than ten honest `needs_physical_label` records, because it
reaches a shopper as fact.

---

## 9. Definition of done

- The brand is established, or its non-existence is reported.
- Every batch committed, checker clean, remote fetched back and verified.
- `research/THERADIET-HANDOFF.md` complete.
- Draft PR open, unmerged, with a batch report per batch.
- Not one byte changed outside `research/deep-research-theradiet.json` and
  `research/THERADIET-HANDOFF.md`.
