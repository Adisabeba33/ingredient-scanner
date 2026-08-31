# Assignment: Fancy Feast — finish the brand

This is a **completion** assignment, not a new brand. The catalog already holds
106 Fancy Feast products under 115 barcodes, all with full compositions. Fancy
Feast sells several hundred SKUs, and real shoppers are scanning the ones we
lack — that is what this is for.

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply here unchanged — read that too rather than having it
repeated.

---

## 0. The two commands

**Before you research anything**, regenerate the inventory:

```bash
node scripts/brand-inventory.mjs "Fancy Feast" > research/INVENTORY-FANCY-FEAST.md
```

**Before every commit**, run the checker:

```bash
node scripts/check-ledger.mjs research/deep-research-barcodes.json
```

ERROR blocks seeding and exits 1. WARN is a question to answer in `conflicts`.
A batch is not finished until the checker exits 0 and you have read every
warning.

---

## 1. `research/INVENTORY-FANCY-FEAST.md` — the anti-duplicate device

That file is committed beside this one. It lists **every Fancy Feast barcode
this repository already holds**, grouped by range, with variant, size, species,
form, life stage and whether a composition is stored — plus every code on the
do-not-file list, every code a research ledger already claims, and a flat
exclusion list of all of them at the bottom.

Three rules about it:

1. **Regenerate it before you start.** It is a function of the seed, not a
   hand-written list, precisely so it cannot go stale — but the copy in the
   repository was generated at some past moment and a batch may have landed
   since. Re-run the command above and work from your own output.
2. **Match on the barcode, not the name.** A maker renames a flavour without
   changing the code, and a rename is not a new product. A code in that
   inventory is done.
3. **Do not paste it into your notes and work from the paste.** That is exactly
   how the list stops being true.

The checker enforces this mechanically as well: it reads the live seed and
refuses any batch that repeats a held barcode. The inventory is for *planning*
— so you spend your searches where there is something to find — and the checker
is for *verification*.

---

## 2. Where the gaps are

### Six ranges the brand entry names and the catalog holds NOTHING from

These are the obvious targets, and three of them are unusual enough to say more
about:

- **Roasted**
- **Purely** — Fancy Feast's "natural" line; short ingredient lists.
- **Royale**
- **Savory Cravings** — a **treat** range. `lib/nutrition-role.ts` already
  matches it, so the catalog will judge it as a snack rather than as dinner
  without any change. Record `food_form: "treat"` and expect an as-fed panel
  that looks nothing like a canned dinner's.
- **Broths** — a **topper** range, already matched. Mostly water by design;
  that is not a defect and must not be "corrected".
- **Appetizers** — also a topper, also already matched.

Those three role detections mean these ranges are safe to research: the report
will not judge a broth as a bad dinner. That has been the most damaging class of
error in this project and it is already handled here.

### Ranges held only partially

The inventory gives exact counts. The biggest shortfalls by a wide margin:

- **Classic Pâté** — 10 held. This is Fancy Feast's largest wet range by far and
  the shelf carries roughly three times that.
- **Gravy Lovers** — 8 held.
- **Grilled** — 8 held.
- **Flaked**, **Sliced**, **Marinated Morsels** — 4–5 each.
- **Medleys** — 24 held, which is good coverage; low priority.

Work the big shortfalls before the small ones. A shopper is far likelier to be
holding a Classic Pâté tin than a Medleys one.

### Zero variety packs

**The catalog holds no Fancy Feast boxes at all**, and Fancy Feast sells a great
many. Every variety pack, multipack and case is a code somebody will scan and
get nothing for, and marking one costs less research than a single tin: a box
needs no composition, and **it does not need proven inner barcodes** to be
`source_verified` — outer identity, size and code are enough, with
`contains: []`. See §8 of `BRIEF-REVEAL.md`.

This is the cheapest large win in the assignment. Do not leave it to last.

---

## 3. Three codes to settle FIRST

These came off the "looked for, not found" list — real shoppers, in shops,
getting nothing — and a previous research pass marked all three
`source_verified` in `research/MISSING-SCAN-PET-FOOD-2026-08-30.md` **without
answering the identity question raised about them**. They were not seeded for
that reason. Settle them before anything else; demand for them is measured.

### `050000153558` — claimed: Gravy Lovers Chicken Feast Paté in Gravy, 3 oz

**The claim and the evidence disagree.** Search associates this code with a
**Classic Seafood Feast Variety Pack, case of 24** — different range, different
flavour, and a box rather than a can. Two secondary signals agree: every Gravy
Lovers product held sits in the `050000578xxx`, `050000292xxx` or
`050000580xxx` blocks, and `153558` is nowhere near them.

Three good outcomes: a single can of something (record it as that); a variety
pack (`barcode_scope: "multipack"`, no composition); or a case of a tin we
already hold, which belongs in `data/wrong-barcodes.ts` with `insteadUse`
pointing at the tin — say so in the handoff and the seeding pass makes that edit.

### `050000180721` — claimed: Gravy Lovers Salmon Feast Paté in Gravy, 3 oz

**Nothing was found for this code at all.** Start from the barcode, not the
name. If the name turns out to be wrong, the name is what gives way.

### `050000429349` — claimed: Classic Paté Seafood Feast, 3 oz

The best supported of the three, and no identity collision: the catalog holds no
Classic Pâté Seafood Feast. One caution — two listings describe it as "3-Ounce
Can, **Pack of 24**", which is usually a retailer selling a case *of* the
single-can UPC and is also exactly how a case code gets filed as a tin. **Prove
the code is on the single can.**

There is a fourth from that list, `050000577989` (Friskies), correctly held at
`needs_physical_label` — one UPC spanning a Turkey & Cheese and a Turkey & Liver
generation. Leave it alone unless you find a current physical label.

---

## 4. Two traps this brand has already sprung

Both are documented in `data/known-products.ts` and `docs/CATALOG-CONFLICTS.md`,
and both are about the **calorie basis** rather than the number:

- **Petites** is a twin-serve tub: two 1.4 oz halves under ONE retail barcode.
  The size is the whole 2.8 oz package, which is what the code is on; the
  calorie statement is **per half**, which is what the pack prints. Neither is
  wrong and they are not the same number.
- **Gems** is a box holding two 2 oz mousses and states calories **per gem**.
  Read "48 kcal" as the box and you have halved it.

The checker's calorie arithmetic will flag a mismatch here — read the warning
rather than silencing it, and record which basis the pack printed in
`verification_notes`.

Also: Fancy Feast has ranges one word apart that are different products.
`Party Mix` is a Friskies treat and `Party Pack'd` is a Friskies complete dry
food; within Fancy Feast, `Classic Pâté` and `Savory Centers` are both pâtés and
the second has a gravy pocket (`presentation: "gravy_center"`), while `Gems` has
gravy on the **outside** (`gravy_halo`). Those are real vocabulary values, they
exist because of this brand, and getting them right costs nothing.

---

## 5. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-fancy-feast` (from current `main`) |
| Ledger | **`research/deep-research-barcodes.json`** — the legacy shared file, reserved by `AGENTS.md` §1 for Fancy Feast + Friskies. Do **not** create a new one. |
| Handoff | `research/FANCY-FEAST-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The shared ledger already holds Fancy Feast and Friskies records. **Append.**
Never reorder, reformat, renumber or "tidy" a record you did not write, and
never touch a Friskies record.

**Never touch:** anything under `data/`, `app/`, `lib/`, `components/`,
`tests/`, `scripts/`, or any other `research/deep-research-*.json`. Adding a
range to the brand entry and putting a code on the wrong-barcodes list are the
seeding pass's job — you say what they should be, in the handoff.

**Do not create GitHub Actions workflows.** Two previous campaigns spent 20 of
25 and 23 of 26 commits on temporary runners that staged and restored
themselves. Write the JSON directly and commit it.

---

## 6. Batches of twenty

1. `git fetch` and re-read the remote ledger — it is shared, so it moves.
2. Regenerate the inventory and rebuild the exclusion set.
3. Research 20 records.
4. Append. Update `updated_at`.
5. **Run the checker.** Fix every ERROR, read every WARN.
6. One commit: `research: Fancy Feast batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
Fancy Feast batch N
  added:            20   (running total in the shared ledger: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  ranges touched:   <names>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
  new this batch:   <a range name the brand entry lacks, a wrong-barcode
                    recommendation, a vocabulary value you had to leave null>
```

Twenty is a limit, not a target. Never pad a batch to reach it.

---

## 7. The handoff

`research/FANCY-FEAST-HANDOFF.md`, written from the first batch and updated as
you go:

1. **Coverage by range** — before and after, so the next agent sees movement.
2. **Range names the brand entry lacks**, spelled as the packs spell them.
   Without them a product files under "Other" and the seeding test now refuses
   it outright.
3. **Wrong-barcode recommendations** — any case or tray code you proved, with
   the tin it should point at.
4. **The unresolved tail, by REASON** — not a list of barcodes but a list of
   blockers: formula generations colliding under one UPC, exact-size binding
   missing, no printed calorie statement, no complete panel, inner barcodes
   unproven. The next agent works by gap, not from record 1.
5. **The three settled codes from §3**, with what each turned out to be.
6. Where you stopped and why.

---

## 8. Done

- Inventory regenerated before starting; no held barcode re-researched.
- The three §3 codes answered.
- Every batch committed, checker clean, remote fetched back and verified.
- Handoff complete, including range names and wrong-barcode recommendations.
- Draft PR open, unmerged, one report per batch.
- Not one byte changed outside `research/deep-research-barcodes.json` and
  `research/FANCY-FEAST-HANDOFF.md`.

A wrong `source_verified` costs more than ten honest `needs_physical_label`
records. These reach shoppers standing in front of the actual tin.
