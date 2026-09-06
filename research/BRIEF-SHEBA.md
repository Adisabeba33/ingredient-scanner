# Assignment: Sheba

You are researching **one brand: Sheba.** Nothing else.

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply here unchanged — read that too rather than having it
repeated.

---

## 0. The two commands

Regenerate the inventory before you research anything:

```bash
node scripts/brand-inventory.mjs "Sheba" > research/INVENTORY-SHEBA.md
```

Run the checker before every commit:

```bash
node scripts/check-ledger.mjs research/deep-research-sheba.json
```

ERROR blocks seeding and exits 1. WARN is a question to answer in `conflicts`.
A batch is not finished until the checker exits 0 and every warning is read.

---

## 1. What the catalog already holds

**Nothing.** Zero Sheba products, zero barcodes, zero boxes. The brand entry
exists — owner **Mars**, cat only — and names four ranges, every one of which is
empty:

- **Perfect Portions**
- **Filets**
- **Bistro**
- **Meaty Tender Sticks**

Those four were written from shelf memory before any Sheba product was seeded,
so treat them as a starting point rather than the truth: confirm each one is
still a range the packs print, and report every range they do not cover. A range
missing from the brand entry files its products under "Other" on the coverage
page, and `lib/known-import.test.ts` now refuses to seed a product whose range
its brand entry does not name.

No GS1 prefix is registered for Sheba. Mars owns Royal Canin too, and that sits
under `030111` — do not assume Sheba shares it. Establish the prefix or
prefixes from the packs; several makers here run two or three at once.

---

## 2. Perfect Portions is the whole trap, and it is most of the brand

A Perfect Portions pack is **two servings under one retail barcode** — a twin
tray you snap apart, roughly 1.3 oz a side. That single fact decides three
fields on nearly every record in this campaign, and getting it wrong is the
most likely way this batch goes bad.

This catalog has met the shape twice and written down what it learned:

- **Fancy Feast Petites** is a twin-serve pot, two 1.4 oz halves under one code.
  `data/known-products.ts` says it plainly: *"The size below is the whole
  package, which is what the code is on; the calorie statement in the formula is
  per half, which is what the pack states. Neither is wrong and they are not the
  same number."*
- **Fancy Feast Gems** is a box of two 2 oz mousses stating calories **per gem**.
  Read "48 kcal" as the box and you have halved it.

So, for every Perfect Portions record:

- **`size` is the whole retail pack**, because that is what the barcode is on.
  If the pack prints "2.6 oz (two 1.3 oz servings)", the size is the pack.
- **`calorie_content` is copied with the basis the pack prints.** If the deck
  says kcal per serving, `unit_name` says so — do not double it to reach a pack
  figure, and do not halve a pack figure to reach a serving.
- **`package_type`**: `tray` if it is the snap-apart plastic twin tray, `tub` if
  it is the rigid pot. Both are in the vocabulary and `tub` is documented for
  exactly this twin-serve shape. Pick from the pack, not from habit.

The checker's calorie arithmetic will flag the mismatch between kcal/kg and a
per-serving figure on a pack-sized weight. **Read that warning rather than
silencing it** — record which basis the pack printed in `verification_notes`,
and it becomes a note rather than a defect.

---

## 3. Sheba is a global brand, and this catalog is US-first

Sheba sells across the UK, Europe and Asia with **different formulas under
different barcodes**, and its non-US pages are abundant and well indexed —
which makes them the easiest wrong answer available to you.

A UK, EU, Canadian or Australian page is **corroboration only**. It must never
fill a missing field on a US barcode when the two markets differ. A previous
brand had a Canadian 6 lb bag with a materially different deck from the US 3.5
lb bag; merging them would have written a food that is not in the bag.

If a US formula cannot be established from US evidence, the record is
`needs_physical_label`. That is a result, not a failure.

---

## 4. One range this catalog will get wrong unless you say so

**`Meaty Tender Sticks` is a treat range, and `lib/nutrition-role.ts` does not
recognise it.** Checked: it returns `unknown`, which means "judge it as
dinner". None of the words the detector looks for — treat, snack, chew, biscuit,
jerky — appear in that name.

A snack judged as a complete diet is marked down for not being balanced, which
no treat has ever claimed to be, and the owner is told their cat's snack is a
bad food. It is the single most damaging error class in this project and it has
happened on three brands already.

**Report it in the handoff** under "anything the repository must learn", with
the exact range name as the pack prints it, so the seeding pass adds it. Do the
same for any other Sheba range that is a snack, a topper or a supplement and
whose name does not say so.

Set `food_form: "treat"` on those records too — the checker uses it to pick the
right panel window, and a dried stick's panel looks nothing like a tray of
paté's.

---

## 5. Where the work is

Everything, since the catalog holds none of it. Sensible order:

1. **Perfect Portions** — the biggest range by far, and the one shoppers scan
   most. Get the twin-serve handling right on the first few and the rest follow.
2. **Bistro** and **Filets** — smaller wet ranges, ordinary panels.
3. **Meaty Tender Sticks** and any other snack range — few records, and they
   need §4 handled.
4. **The multipacks.** Sheba sells Perfect Portions in cartons of 12, 24 and
   more, and the catalog holds **no Sheba boxes at all**. Every one is a code
   somebody will scan and get nothing for, and a box is the cheapest record in
   the assignment: no composition, and **no proven inner barcodes required** to
   be `source_verified` — outer identity, size and code are enough, with
   `contains: []`. See §8 of `BRIEF-REVEAL.md`.

Careful in the other direction: a carton code filed as a single tray is the
failure `data/wrong-barcodes.ts` exists about. If you prove a code is a case of
a pack we hold, say so in the handoff with the pack it should point at.

---

## 6. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-sheba` (from current `main`) |
| Ledger | `research/deep-research-sheba.json` (new — create it) |
| Handoff | `research/SHEBA-HANDOFF.md` |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The ledger begins as the shape in §4 of `AGENTS.md`, with
`"brand_scope": ["Sheba"]`.

**Never touch:** anything under `data/`, `app/`, `lib/`, `components/`,
`tests/`, `scripts/`, or any other `research/deep-research-*.json`. Adding a
range to the brand entry, registering a prefix, teaching the role detector a
treat range and putting a code on the wrong-barcodes list are all the seeding
pass's job — you say what they should be, in the handoff.

**Do not create GitHub Actions workflows.** Two previous campaigns spent 20 of
25 and 23 of 26 commits on temporary runners that staged and restored
themselves. Write the JSON directly and commit it.

---

## 7. Batches of twenty

1. `git fetch` and re-read the remote ledger.
2. Regenerate the inventory; rebuild the exclusion set from the live files.
3. Research 20 records.
4. Append. Update `updated_at`.
5. **Run the checker.** Fix every ERROR, read every WARN.
6. One commit: `research: Sheba batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
Sheba batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  ranges touched:   <names>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
  new this batch:   <a range the brand entry lacks, a GS1 prefix, a snack range
                    the role detector will miss, a wrong-barcode recommendation>
```

Twenty is a limit, not a target. Never pad a batch to reach it.

---

## 8. The handoff

`research/SHEBA-HANDOFF.md`, written from the first batch and updated as you
go — not left to the end, because a campaign that stops unexpectedly should
still leave a usable trail.

1. **Brand identity** — confirm Mars as the owner, and say which US entity
   actually makes and labels it.
2. **Ranges** — every `product_line` you used, spelled exactly as the packs
   spell them, and which of the four shelf-memory names above turned out to be
   real. This is what unblocks seeding.
3. **The twin-serve question** — one paragraph: which ranges are twin-serve,
   what basis their calorie statements use, and whether the packs are trays or
   tubs.
4. **Snack, topper and supplement ranges whose names do not say so** — §4. Name
   them explicitly.
5. **GS1 prefixes** — every one you find, with whose it is.
6. **Market separation** — where a US formula differs from the UK/EU one under
   a similar name, so the next agent does not merge them.
7. **Wrong-barcode recommendations** — any case or carton code you proved, with
   the pack it should point at.
8. **The unresolved tail, by REASON** — not a list of barcodes but a list of
   blockers: formula generations colliding under one UPC, exact-size binding
   missing, no printed calorie statement, no complete panel, inner barcodes
   unproven. The next agent works by gap, not from record 1.
9. Where you stopped and why.

---

## 9. Done

- Inventory regenerated before starting.
- Every batch committed, checker clean, remote fetched back and verified.
- Handoff complete, including range names, the twin-serve answer and the snack
  ranges the detector will miss.
- Draft PR open, unmerged, one report per batch.
- Not one byte changed outside `research/deep-research-sheba.json` and
  `research/SHEBA-HANDOFF.md`.

`needs_physical_label` on a record is a result, not a failure. A wrong
`source_verified` is not: it reaches a shopper standing in front of the actual
pack. On this brand the most likely wrong answer is a calorie figure off by a
factor of two, which looks entirely reasonable on the page and is not.
