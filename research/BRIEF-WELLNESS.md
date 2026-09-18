# Assignment: Wellness

You are researching **one brand: Wellness.** Its name is an ordinary English
word, it sits in a house of five sibling brands, and it has the longest recall
history of any brand briefed in this folder. §2, §3 and §7 are those three
facts.

`research/AGENTS.md` is the binding contract. Read it first, **including §3a** —
see §0.2 below. §7–§11 of `research/BRIEF-REVEAL.md` (vocabularies, guarantee
format, identity rules, multipack rules) apply unchanged.
`research/BRIEF-PURINA-ONE.md` §4 applies to every dry bag.

---

## 0. Before anything

### 0.1 Can you reach the sources?

```bash
for h in www.wellnesspetfood.com www.chewy.com www.petsmart.com www.fda.gov web.archive.org; do
  printf '%-30s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$h/")"
done
```

`000` with `CONNECT tunnel failed, response 403` means the egress policy is
blocking you. **Stop and report it** — do not start researching, and never route
around a 403. A campaign run against a blocked policy writes `candidate`
records, passes the checker and produces nothing seedable: it looks like
success and is not. `docs/RESEARCH-EGRESS.md` has the host list.

### 0.2 One ledger, and what to do when it outgrows your tooling

**One ledger per brand: `research/deep-research-wellness.json`. Batches append
to it. Never a second `deep-research-*.json` for this brand** — two files
holding the same codes make the checker report every barcode `already claimed`
and make the inventory count each code twice.

**A ledger runs about 6 KB a record**, so forty records is 235 KB and a
connector that writes files whole eventually cannot commit your batch at all.
Do not fight it and **do not build a runner**. `AGENTS.md` §3a is the supported
handover: write only the batch's new records, as a bare JSON array, to
`research/incoming/wellness-batch-NN.json`, say so, and stop. Split into `-a`
and `-b` if even that is too big. A shell-enabled pass merges them and deletes
the files. This works — the Orijen campaign delivered batch 3 that way after
losing a day to the alternative.

If you are stuck on **delivery** rather than research: say it in one message and
stop. "Still working" with no commit behind it reads as progress.

### 0.3 The two commands

```bash
node scripts/brand-inventory.mjs "Wellness" > research/INVENTORY-WELLNESS.md
node scripts/check-ledger.mjs research/deep-research-wellness.json
```

From a real shell; the inventory must be the generator's byte-for-byte output.
ERROR blocks seeding and exits 1; WARN is a question to answer in `conflicts`.

---

## 1. What the catalog holds

**Nothing**, in either repository: no products, no formulas, no boxes, no
ledger, no WellPet prefix in `data/gs1-prefixes.ts`, and no mention anywhere in
`Ingredients.help`.

The seed entry names eleven ranges — Complete Health, CORE, Simple, CORE Tiny
Tasters, CORE Digestive Health, Mini Meals, Bowl Boosters, Healthy Indulgence,
Divine Duos, Petite Entrees, Soft Puppy Bites — and all eleven are empty.

---

## 2. The brand name is a common word, and the folding proves it

Every other brief in this folder warns about a sibling brand. This one warns
about the **English language**.

`lib/brand-key.ts` folds a brand string to a key by exact match, then by the
**longest seeded name appearing inside it as whole words**. I ran it against
this brand before writing:

```
Wellness                           → Wellness      ✓
Wellness Complete Health           → Wellness      ✓
WELLNESS CORE                      → Wellness      ✓
Digestive Wellness                 → Wellness      ✗
Dental Wellness Chews              → Wellness      ✗
Purina Pro Plan Wellness Formula   → Pro Plan      ✓
```

The last line is the system working: "pro plan" is two words and beats
"wellness" outright. The two before it are the hazard — **any brand string
containing the word "wellness" and no longer seeded name lands on this brand.**
That is not hypothetical for a scanner: a model reading a front of pack can
easily lift "digestive wellness" or "dental wellness" out of a claim line and
put it in the brand field.

What this means for you:

- **You cannot rely on the brand string.** For every record, the evidence must
  be a page or pack that identifies **Wellness** as the maker's brand, not a
  product name that happens to contain the word.
- **Report every false fold you meet.** If you find a real product from another
  maker whose brand string would land here, name it in the handoff. That is a
  seeding-pass problem — possibly an alias or a guard — and nobody has seen the
  list yet.
- `brand` is `"Wellness"` on every record, spelled as the seed spells it.

---

## 3. Five siblings, one of them already taught to the engine

WellPet — now trading as **Wellness Pet Company**, which is a rename the seed
does not know — runs five brands, and **four are separate rows in
`data/us-pet-brands.ts`**:

| Brand | In the seed | Note |
|---|---|---|
| **Wellness** | yes | this assignment |
| **Old Mother Hubbard** | yes | biscuits |
| **Eagle Pack** | yes | dog |
| **Holistic Select** | yes | both |
| **Whimzees** | yes | dental chews — **already in `KNOWN_TREAT_LINES`** |

None is seeded with products, so unlike Orijen you cannot collide with live
rows. But the boundary is the same rule: the pack's own front says **Wellness**.
A Holistic Select bag filed here is a wrong record, and Whimzees is a treat
brand that the role detector already knows by name — if a Whimzees code reaches
this ledger, that is a boundary failure, not a bonus.

Note the owner string too: the seed records `owner: "WellPet"`. The company now
presents as Wellness Pet Company. Whether the seed should change, and what
`data/manufacturers.ts` should call the entity, is a handoff question — see §8.

---

## 4. Roles: one range is right, one is wrong, and I checked

`lib/nutrition-role.ts` stops the report judging a topper or a snack by the
standard for dinner. I ran the detector against this brand's own seeded ranges:

```
Bowl Boosters        → topper     ✓ already known
CORE Tiny Tasters    → unknown    ✓ correct — these are complete wet cat meals
Complete Health      → unknown    ✓ correct — a diet
CORE                 → unknown    ✓ correct — a diet
Healthy Indulgence   → unknown    ? check the pack, some are meal complements
Soft Puppy Bites     → unknown    ✗ WRONG — these are training treats
Kittles              → unknown    ✗ WRONG — crunchy cat treats, not in the seed at all
```

**`Soft Puppy Bites` is in the seed's own `lines` list and the detector does not
know it is a treat.** It will be judged as a puppy's whole diet. `Kittles` is
the same failure and is not even in the seed.

So: for every record, copy the pack's **AAFCO sentence verbatim** — "complete
and balanced for…" versus "for intermittent or supplemental feeding only" — and
let that decide the role. The range name is a hint, never the evidence.
`Healthy Indulgence` is the one to watch: some Wellness cat pouches are meal
complements rather than dinners, and the two look identical on a shelf.

Name every treat and topper range with its **exact printed name** in the
handoff, for `KNOWN_TREAT_LINES`. **Do not edit `lib/nutrition-role.ts`.**

Do the treats and toppers in a **separate, later batch**, after the diets.

---

## 5. Ranges and forms

Eleven names are seeded; expect the list to be incomplete and partly stale.
Establish the current one from packs. The rule that worked on Pro Plan and
Orijen: current manufacturer pages control `product_line`, formula, guarantees,
calories and adequacy; an older listing may be used **only** as
package-identity evidence binding an exact UPC to an exact printed size; never
write a range name as current because an old page still uses it.

Two form notes:

- **CORE RawRev** is kibble with freeze-dried raw pieces mixed in — the same
  shape as Instinct's Raw Boost. It is still a dry food; record what the pack is
  in `verification_notes` and do not invent a form value.
- Wellness sells **wet in cans, tubs, pouches and single-serve cups**
  (Tiny Tasters, Petite Entrees, Divine Duos). Texture is what it is cut into;
  presentation is what it is suspended in. Never merge them. Controlled values
  live in `BRIEF-REVEAL.md` §7.

Every range the entry lacks is a handoff recommendation. **Do not edit
`data/us-pet-brands.ts`.**

---

## 6. The GS1 prefix is unknown

`data/gs1-prefixes.ts` holds twenty-one prefixes and none belongs to this maker.
No lead could be confirmed while writing this brief — establish it from barcodes
you can read.

Report every prefix with what it was on, and specifically whether **Old Mother
Hubbard, Eagle Pack, Holistic Select or Whimzees share it**. If they do, the
prefix proves the maker and not the brand, exactly as `064992` proves Champion
without separating Orijen from Acana. Register nothing yourself.

---

## 7. Recalls: the longest history in this folder

`data/recalls.ts` in the app repository holds Hill's, For All Tails and Royal
Canin, and has **no Wellness entry**. It needs one. Six events turned up while
writing this brief:

| When | What | Why |
|---|---|---|
| Feb 2011 | Wellness canned cat food, certain lots — reportedly ~21.6M cans | insufficient thiamine (B1) |
| Jan 2012 | Wellness WellBar dog treats containing amaranth | state action (New Mexico), unapproved ingredient |
| May 2012 | Complete Health Super5Mix Large Breed Puppy, 15 lb and 30 lb, best-by 9–11 Jan 2013 | Salmonella — **see below** |
| Oct 2012 | Small Breed Adult Health dry dog food | excess moisture |
| Feb 2017 | seven canned cat food formulas | possible foreign material |
| Mar 2017 | one canned dog topper recipe | elevated beef thyroid hormone |

**Treat that table as leads, not data.** A `data/recalls.ts` row is written only
from a primary notice — open the FDA or manufacturer notices, transcribe lot
codes and best-by dates **as printed**, capture UPCs where the notice carries
them, and record both readings where sources disagree.

Three things make this brand's history unusually instructive, and all three
belong in the handoff:

1. **May 2012 is a co-packer recall.** WellPet was notified by **Diamond Pet
   Foods** about Salmonella at Diamond's Gaston, South Carolina plant. The
   notice names a facility, not a brand, and it covered several brands at once.
   This is the exact shape the American Journey brief warned about in the
   abstract — here it is concrete. It also tells you something about §8:
   whoever made that bag, it was not WellPet.
2. **Jan 2012 was a state action, not an FDA recall.** New Mexico ordered
   removal. Record what it actually was; do not promote it to a federal recall
   and do not quietly drop it either.
3. **Mar 2017 was a topper**, which is the same product class §4 is about.

Do not convert FDA adverse-event reports into recall rows. They are not recalls.

---

## 8. WellPet for `manufacturers.ts`

`data/manufacturers.ts` in `Ingredients.help` holds eleven makers and this one is
not among them, so a Wellness brand page is blocked until it is added.

`ownsPlants` is the interesting field and **the May 2012 recall is evidence
against a naive yes**: that bag was made by Diamond. Whether WellPet owns plants
now, and which products come from which, is a research question — the company
has said different things at different times. Establish it from primary
material, capture URLs and a checked-at date, and answer the other four criteria
the same way. Where there is no evidence, say so explicitly rather than
softening it.

Say also which entity the criteria are true of: **WellPet LLC** or **Wellness
Pet Company**. That file's header forbids inheriting a parent's answers and
documents Merrick as deliberately not given Purina's.

---

## 9. Where things go

| What | Where |
|---|---|
| Branch | `agent/deep-research-wellness` (from current `main`) |
| Ledger | `research/deep-research-wellness.json` (new — create it, and only it) |
| Inventory | `research/INVENTORY-WELLNESS.md` (generated, §0.3) |
| Handoff | `research/WELLNESS-HANDOFF.md` |
| Batch too big to write | `research/incoming/wellness-batch-NN.json`, per §0.2 |
| PR | one draft PR, opened on the first batch, left **draft and unmerged** |

The ledger begins as the shape in §4 of `AGENTS.md`, with
`"brand_scope": ["Wellness"]`.

**Nothing under `data/`, `app/`, `lib/`, `components/`, `tests/` or
`scripts/`** — in particular not `lib/nutrition-role.ts` or `lib/brand-key.ts`;
§2 and §4 are findings, not patches. No second ledger, no temporary Actions
workflow, no temporary files committed and then removed, and no fourth file:
the handoff's "next batch" section is where that goes.

---

## 10. Batches of twenty

1. `git fetch` and re-read the remote ledger.
2. Regenerate the inventory; rebuild the exclusion set from the live files.
3. Research up to 20 records.
4. **Append.** Update `updated_at`. Never rewrite an earlier record silently —
   §4 of `AGENTS.md` allows a correction only with the reason in
   `verification_notes` and in the commit message.
5. **Run the checker.** Zero ERRORs, every WARN answered.
6. One commit: `research: Wellness batch N — 20 records (X source_verified)`.
7. Push. Fetch the file back, parse it, confirm the count.
8. Post the batch report as a PR comment:

```
Wellness batch N
  added:            20   (running total: NN)
  source_verified:  NN   needs_physical_label: NN   candidate: NN   rejected: NN
  individual_unit:  NN   multipack: NN
  role:             complete NN   topper NN   treat NN   complementary NN
  ranges touched:   <names, spelled as the packs spell them>
  checker:          clean / N warnings read and answered
  commit:           <sha>
  remote verified:  fetched back, parsed, counts match
```

Twenty is a limit, not a target. Stopping early and saying why is a good
outcome.

Order: **dry dog, then dry cat, then wet cat, then wet dog, then multipacks,
then toppers and treats last.**

---

## 11. The handoff

`research/WELLNESS-HANDOFF.md`, written from the first batch and updated as you
go, not left to the end.

1. **Role by range** — §4, first. The AAFCO sentence per range, which ranges are
   toppers, treats or meal complements, and exact printed names for
   `KNOWN_TREAT_LINES`. Say explicitly what Soft Puppy Bites, Kittles and
   Healthy Indulgence turned out to be.
2. **False folds** — §2. Every product string you met that would land on this
   brand and should not.
3. **The range answer** — every `product_line` you used, spelled as the packs
   spell them; which of the eleven are current; every range the entry lacks.
4. **The sibling boundary** — anything you nearly filed that was Old Mother
   Hubbard, Eagle Pack, Holistic Select or Whimzees.
5. **GS1 prefixes** — §6, including whether the siblings share one.
6. **Recalls** — §7, settled from primary notices, in the shape
   `data/recalls.ts` uses. Flag the co-packer one as a co-packer one.
7. **The maker** — §8: which entity, what is provably true, what is not,
   and what the May 2012 recall implies about `ownsPlants`.
8. **Size ladders** — sizes and the UPC of each, so the seeding pass builds
   `packages[]` without re-deriving it.
9. **Multipacks and wrong-barcode recommendations.**
10. **The unresolved tail, by REASON** — blockers, not barcodes.
11. Where you stopped and why.

---

## 12. Done

- Egress checked **before** research.
- Exactly one ledger, appended to; §3a used if it outgrows the tooling.
- Inventory genuinely generated, not reconstructed.
- Every batch committed to the branch, checker clean, remote fetched back.
- Handoff complete, with the role answer first.
- Draft PR open, unmerged, one report per batch.
- Exactly three files changed, all under `research/`.

`needs_physical_label` is a result, not a failure. A wrong `source_verified` is
not: it reaches a shopper standing in front of the actual pack.

On this brand the two most likely wrong answers are both about a word. A bag of
Soft Puppy Bites judged as a puppy's dinner, because the range name says
nothing and nobody read the AAFCO line. And a product from another maker filed
here because its name contains "wellness" — the only brand in this folder whose
own name is a claim other makers print on their packaging.
