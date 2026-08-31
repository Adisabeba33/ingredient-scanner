# Assignment: 9Lives

You are researching **one brand: 9Lives.** Nothing else.

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply here unchanged — read that too rather than having it
repeated.

---

## 0. The two commands

Regenerate the inventory before you research anything:

```bash
node scripts/brand-inventory.mjs "9Lives" > research/INVENTORY-9LIVES.md
```

Run the checker before every commit:

```bash
node scripts/check-ledger.mjs research/deep-research-9lives.json
```

ERROR blocks seeding and exits 1. WARN is a question to answer in `conflicts`.
A batch is not finished until the checker exits 0 and every warning is read.

---

## 1. What the catalog already holds

**One product.** `research/INVENTORY-9LIVES.md` is committed beside this file
and is the full picture:

| barcode | range | variant | size |
|---|---|---|---|
| `071190478450` | Indoor Essentials | Chicken & Salmon Flavors | 3.15 lb bag |

It was seeded as batch 025 — and not from a research campaign. Somebody scanned
that bag in a shop, the app had nothing for them, and it came off the "looked
for, not found" list. That one record is your anchor: it is the only 9Lives deck
this catalog has ever seen, and everything you add should be consistent with it
in style and rigour.

Four ranges the brand entry names hold **nothing**:

- **Daily Essentials**
- **Meaty Pate**
- **Tender Morsels**
- **Protein Plus**

The brand is recorded as **cat only**. A dog product under this brand would be a
surprise worth flagging rather than filing.

GS1 prefix **071190** is registered as 9Lives (Post). If you meet a 9Lives pack
under a different prefix — the brand has changed hands repeatedly and legacy
codes may sit under an older owner's — the checker will report it as unknown;
name the owner in `verification_notes` and in the handoff.

---

## 2. Two things that are specific to this brand

### The names move and the barcodes do not

This is 9Lives' defining hazard and it has already bitten once. The bag seeded
above is sold as **Indoor Essentials** by the maker and by Dollar General and
Amazon, and indexed as **Indoor Complete** by Walmart and by wholesalers — same
3.15 lb bag, same UPC `071190478450`. A previous research pass took the barcode
from a page titled "Indoor Complete" and the ingredient deck from a page titled
"Indoor Essentials" without noticing it had two names in one record.

So, for this brand above all others: **match on the barcode, never on the
name.** When two sources disagree about what a code is called, that is usually a
rename rather than two products — but prove it, and record both names in
`verification_notes` so the next person is not puzzled twice.

Report the **current** name in `product_line` and `variant`, since that is what
files on the coverage page and what a shopper reads.

### The deck is the whole point of this brand

The one 9Lives composition this catalog holds opens with **whole ground corn**
and carries **Red 40, Yellow 5, Yellow 6, Blue 1, BHA and titanium dioxide**.

That is not a defect in the record. It is the record. 9Lives is a budget brand,
and a shopper comparing it against a premium bag is exactly who this catalog is
for — the artificial colours and the corn-first order are the facts that answer
their question.

**Copy the list exactly and never tidy it.** Do not drop a colour because it
looks like noise, do not collapse a preservative into "preservatives", do not
reorder. §8 of the contract says copy, do not tidy, and on this brand a tidied
list would delete the finding.

The same applies to the panel. A budget dry food runs high carbohydrate and the
guaranteed analysis will look thin next to a premium brand's. Record what is
printed and nothing more; `null` where the label prints nothing.

---

## 3. A research technique that works on this brand

9Lives sells through Dollar General, Walmart, Family Dollar and grocery chains,
and several of those put **the bare UPC in the page URL**. Dollar General's
product path ends in the twelve digits with the leading zero stripped:

```
https://www.dollargeneral.com/p/<slug>/71190478450
```

That is how the Indoor Essentials identity was settled when two names were in
play — a page whose own address carries the code is strong evidence for the
barcode-to-product binding, which is the half that is usually hardest.

Use it for the **barcode**, and take the **formula** from `9lives.com` or a
label deck. §6 of the contract allows the two halves to come from different
sources and this brand is the case it was written for.

---

## 4. Where the work is

### Wet food is most of this brand

Meaty Pate and Tender Morsels are large wet ranges in 5.5 oz cans, and the
catalog has none of either. Start there — it is the biggest block of missing
product and the panels are straightforward.

Watch the form boundary the checker enforces: a wet panel is roughly 78–82%
moisture and under 20% protein as fed; a dry panel is 10–12% moisture and can
reach 30%+. A dry-matter figure pasted into an as-fed panel reads as impossibly
low moisture, and that is what the check catches.

### Zero variety packs, and 9Lives sells many

The catalog holds **no 9Lives boxes at all**, and this brand sells 12-can and
24-can variety packs heavily. Every one is a code somebody will scan and get
nothing for.

A box is the cheapest record in this assignment: no composition, and **no proven
inner barcodes required** to be `source_verified` — outer identity, size and
code are enough, with `contains: []`. See §8 of `BRIEF-REVEAL.md`. Do not leave
these to last.

Be careful in the other direction too: a 24-can case code filed as a single tin
is the failure `data/wrong-barcodes.ts` exists about. If you prove a code is a
case of a tin we hold, say so in the handoff with the tin it should point at —
the seeding pass makes that edit.

### Confirm the owner

The brand entry records **Post**. 9Lives has moved Del Monte → Big Heart Pet
Brands → J.M. Smucker → Post, and "Post" may or may not still be right. Confirm
from the pack or a corporate source and say so in the handoff.

---

## 5. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-9lives` (from current `main`) |
| Ledger | `research/deep-research-9lives.json` (new — create it) |
| Handoff | `research/9LIVES-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The ledger begins as the shape in §4 of `AGENTS.md`, with
`"brand_scope": ["9Lives"]`.

**Never touch:** anything under `data/`, `app/`, `lib/`, `components/`,
`tests/`, `scripts/`, or any other `research/deep-research-*.json`. Adding a
range to the brand entry, registering a prefix and putting a code on the
wrong-barcodes list are the seeding pass's job — you say what they should be, in
the handoff.

**Do not create GitHub Actions workflows.** Two previous campaigns spent 20 of
25 and 23 of 26 commits on temporary runners that staged and restored
themselves. Write the JSON directly and commit it.

---

## 6. Batches of twenty

1. `git fetch` and re-read the remote ledger.
2. Regenerate the inventory; rebuild the exclusion set from the live files.
3. Research 20 records.
4. Append. Update `updated_at`.
5. **Run the checker.** Fix every ERROR, read every WARN.
6. One commit: `research: 9Lives batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
9Lives batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  ranges touched:   <names>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
  new this batch:   <a range name the brand entry lacks, a second GS1 prefix, a
                    wrong-barcode recommendation, a rename you had to resolve>
```

Twenty is a limit, not a target. If the brand runs out at 47 records the last
batch is 7, and that is correct. Never pad a batch to reach the number.

---

## 7. The handoff

`research/9LIVES-HANDOFF.md`, written from the first batch and updated as you
go — not left to the end, because a campaign that stops unexpectedly should
still leave a usable trail.

1. **Owner** — confirmed or corrected, with the source.
2. **Ranges** — every `product_line` you used, spelled as the packs spell them,
   and for each one whether it is a rename of something the brand entry already
   lists. Without this a product files under "Other" and the seeding test now
   refuses it outright.
3. **Renames resolved** — the "Indoor Complete / Indoor Essentials" problem
   again, wherever you meet it: which name is current, which retailers still use
   the old one, and the barcode that proves they are one product.
4. **GS1 prefixes** — 071190 and any other you find, with whose it is.
5. **Wrong-barcode recommendations** — any case or tray code you proved, with
   the tin it should point at.
6. **The unresolved tail, by REASON** — not a list of barcodes but a list of
   blockers: formula generations colliding under one UPC, exact-size binding
   missing, no printed calorie statement, no complete panel, inner barcodes
   unproven. The next agent works by gap, not from record 1.
7. Where you stopped and why.

---

## 8. Done

- Inventory regenerated before starting; the one held barcode not re-researched.
- Every batch committed, checker clean, remote fetched back and verified.
- Handoff complete, including range names, renames and the owner.
- Draft PR open, unmerged, one report per batch.
- Not one byte changed outside `research/deep-research-9lives.json` and
  `research/9LIVES-HANDOFF.md`.

`needs_physical_label` on a record is a result, not a failure. A wrong
`source_verified` is not: it reaches a shopper standing in front of the actual
bag, and on this brand the thing they are standing there to check is the
ingredient list.
