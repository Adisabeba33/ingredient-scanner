# Assignment: Iams, second campaign — the formulas

You are **not** researching barcodes. That job is done: 133 Iams UPCs are
staged with brand, range, variant, size and species proven, and you must not
add, renumber or re-derive a single one of them.

You are filling in what those records do not have: **the ingredient list, the
guaranteed analysis and the calorie statement.** 120 of the 133 have none.

`research/AGENTS.md` is still the binding contract — §8 (formula proof) and
§10 (status gates) are the two sections this campaign lives inside.
`research/BRIEF-IAMS.md` is the first campaign's assignment and still holds for
everything about brand identity: §3 (Iams is two companies) and §7 (Perfect
Portions) apply here unchanged.

---

## 1. Read the worklist first, and understand why it is short

```bash
node scripts/formula-worklist.mjs research/deep-research-iams.json > research/WORKLIST-IAMS.md
```

(Before the merge pass, point it at `research/incoming/iams-batch-*.json`
instead. Regenerate it; do not work from the copy in the repository, which is
stale the moment somebody captures a panel.)

It says this:

| | |
|---|---:|
| Barcode records | **133** |
| Distinct recipes behind them | **63** |
| Recipes with a complete panel | **5** |
| Recipes with a partial panel | **3** |
| **Recipes with no ingredients at all** | **55** |

**Composition is a property of the recipe, not of the bag size.** One
Minichunks Chicken & Whole Grain panel answers six barcodes. `High Protein`
for cats answers five. Twenty-eight of the 55 answer two or more each.

So the work is **58 panels, not 120 pages**, and an agent that walks the
barcode list instead of the recipe list does roughly twice the work for the
same result. Walk the worklist.

---

## 2. Where the text actually is

The first campaign produced 13 compositions out of 133 records, and the reason
is worth knowing before you repeat it: **iams.com renders its ingredient and
guaranteed-analysis panels as images.** The campaign read the pages, found no
text, and correctly refused to invent any.

Here is what its 271 source URLs actually were:

```
iams.com           100 records   — identity and size ladders; panels are images
admc.us             61 records   — distributor catalog: UPC↔size, no formula
snipp / Mars PDFs   32 records   — official UPC exhibits, no formula
target.com          23 records   — THE ONLY SOURCE THAT YIELDED TEXT
kroger.com          11 records
```

And here is what it never opened, not once:

```
chewy.com          0        petsmart.com       0        amazon.com     0
petco.com          0        tractorsupply.com  0        samsclub.com   0
```

Target appears in **12 of the 13 records that have a composition** and in only
11 of the 120 that do not. That is your signal. The text exists at retail; the
first campaign simply spent its effort on barcode discovery instead.

### The order to try, and why

1. **Chewy.** The largest single gap. Its pet-food pages carry a nutritional
   information section with the ingredient statement, the guaranteed analysis
   and the calorie content as **text**, per recipe and per size. Start here.
2. **Petco** and **PetSmart.** The same shape, and — this is the point —
   *independent* of Chewy. §3 is about why you want two.

   For Petco this is not a guess: `research/PETCO-BRANDS.md` walked its food
   facets on 2026-09-21 and found **at least 35 Iams foods** — a confirmed
   minimum of 15 dry dog, 13 dry cat and 7 wet cat, with wet dog present too —
   at `petco.com/brand/iams`. The panels are there. Go and get them.

   That survey also disproved a claim this repository was making in writing:
   `docs/SHELF-PRIORITY.md` had Iams down as "not at Petco", reasoning from
   Petco's 2019 removal of foods with artificial ingredients. Both that file
   and `research/BRIEF-PEDIGREE.md` §7 have been corrected. **If you meet
   another "do not bother looking there" in a brief, treat it as a claim with
   an expiry date** and say so in your handoff.
3. **Target.** Already proven to work on this brand. Finish what the first
   campaign started rather than treating it as exhausted.
4. **The images on iams.com.** See §4. This is not a last resort; for some
   recipes it is the strongest evidence available.

### What is not a source

- **Canadian and European pages.** The first campaign rejected these
  deliberately and so do you — `BRIEF-IAMS.md` §3. A composition panel written
  to EU rules is a different product's label.
- **Barcode databases** (`upcitemdb` and the rest). `AGENTS.md` §6 allows them
  as corroboration and never as the proof.
- **Another model's answer, or your own memory of a label.** If you cannot
  point at the page, you do not have it.

---

## 3. Two sources, because the drift is real

The first campaign found something that changes how you work: **retailer panels
on this brand disagree with each other, and the disagreement is real
reformulation, not a transcription error.**

It hit this on Perfect Portions Healthy Adult Chicken `019014802296` — a fresh
Target panel exposed a materially different ingredient deck from the one
captured a pass earlier. It logged a `conflict` and refused to promote. That
was the right call and it is now the standing rule:

- **A panel is taken whole, from one page.** Never assemble ingredients from
  one snapshot, the guaranteed analysis from another and the calories from a
  third. That is how you produce a label nobody ever printed.
- **Two independent retailers agreeing verbatim** is strong. One retailer alone
  is a `candidate`, not a finished record.
- **A manufacturer panel beats both**, however you read it.
- **When two sources disagree, that is two formulas, not one error to fix.**
  Record both in `conflicts`, keep the record at `needs_physical_label`, and
  say which is more likely current and why. `docs/CATALOG-CONFLICTS.md` holds
  the five rules; read them before deciding anything.

---

## 4. Reading a panel that is an image

The first campaign would not transcribe the iams.com panels because
`AGENTS.md` §8 says *"do not shorten, tidy, reorder, translate, infer, or
silently repair OCR."* It read that as "do not read images at all." That is
stricter than the rule and it cost most of this brand's formula coverage.

**The correct reading: an image of the label on the maker's own site IS the
label.** Under §6 evidence priority that is a manufacturer source — above any
retailer's transcription of it. Reading it is allowed. What is forbidden is
the word `silently`.

So:

- **Transcribe exactly what is rendered**, in printed order, including the
  maker's own spellings and bracket placement. `docs/SEEDING-A-BATCH.md` §4 is
  the law here: nothing is added, nothing is moved, nothing is unified with a
  sibling, and small differences are copied rather than smoothed.
- **If one character is not legible, the record is not finished.** Set
  `needs_physical_label`, say in `verification_notes` exactly which word or
  figure you could not read, and move on. Never guess a digit in a guaranteed
  analysis. Never complete a truncated ingredient name from what it "must be".
- **Say in `formula_source` that the panel was read from an image**, with the
  image's own URL where you can get it. A future pass must be able to tell a
  transcribed panel from a copied text one.
- **Cross-check with a retailer's text panel where one exists.** If the
  transcription and the retailer text agree, say so in `verification_notes` —
  that is two independent witnesses and it is the strongest thing this campaign
  can produce without a physical pack.

---

## 5. The arithmetic, which is an independent witness

`docs/SEEDING-A-BATCH.md` §2.2 is worth reading in full, because a failing
calorie check on this repository has three times meant something real rather
than a typo.

- **Wet — Perfect Portions.** The tray is 2.6 oz and the calorie statement is
  per **serving**, which is half of it. `unit_name: "serving"`. Do not multiply
  a per-serving figure by two to get a per-tray number and do not divide a
  per-tray figure to get a serving; record what is printed.
- **Dry — every bag.** Calories are printed per **cup**, and a cup is a volume.
  There is nothing for the arithmetic to check. Record `kcal_per_kg` and, when
  printed, the per-cup figure with `unit_name: "cup"`. **Never manufacture a
  per-bag number.** Say in the handoff that the dry records went in without the
  arithmetic witness.
- **Where both a per-kg and a per-unit figure are printed**, compare them
  against the nominal weight and record the result and the rounding tolerance
  in `verification_notes`. Do not manufacture agreement.

---

## 6. Four defects in the staged records — fix them as you go

The checker was never run against these records; the first campaign had no
shell. It has now been run, and it reports **45 errors across 22 of the 133
records**. Three classes are mechanical, one is not.

### 6.1 Six barcodes fail their UPC-A check digit

```
019014830365  ProActive Health High Protein Chicken & Beef   5 lb
019014830389                                                 15 lb
019014830396                                                 30 lb
019014830402                                                 38.5 lb
019014808420  ProActive Health Healthy Weight cat            3.5 lb
019014808444                                                 7 lb
```

All six came from "normalising" a 13-digit retailer display string by removing
a leading zero. The handoff states that each result passes its check digit.
**None of these six does** — the transformation shifted the body. A code with
an invalid check digit is forbidden outright by `AGENTS.md` §7.

Do not patch the check digit to whatever makes the arithmetic work — that
invents a barcode. Go back to the retailer string, work out what the code
actually is, and if you cannot, mark the record `rejected` and say so. Six
wrong codes matter more than fifty missing panels.

### 6.2 Eight records use vocabulary that does not exist

`texture: "cuts_in_gravy"` and `presentation: "gravy"` are not in
`lib/presentation.ts`. The correct values are already there and they are two
separate questions:

```
texture:      "cuts"        ← what the meat is CUT into
presentation: "in_gravy"    ← what it is SUSPENDED in
```

Answering "gravy" to "what texture is it?" is the exact mistake that module
exists to prevent. Affects `019014803217`, `019014802708`, `019014807963`,
`019014803224`, `019014803231`, `019014807956`, `019014807970`, `019014807987`.

### 6.3 Nine records write guarantees as sentences

`other_printed_guarantees` holds strings like `"Vitamin E min 60 IU/kg"`. The
contract is an object:

```json
{ "nutrient": "Vitamin E", "basis": "min", "value": 60, "unit": "IU/kg" }
```

Three previous ledgers each invented their own sentence format and each needed
its own parser written by hand. Use the object.

### 6.4 An adult and a kitten formula share one deck, to the letter

```
019014802296  Perfect Portions Healthy Adult Pâté Chicken
019014802333  Perfect Portions Healthy Kitten Pâté Chicken
```

Byte-identical `ingredients_verbatim`, and yet different guaranteed analyses
(fibre 1% against 1.5%; the adult states ash and taurine, the kitten states
neither). A kitten food and an adult food with the same ingredient deck is
not impossible, but it is exactly what a list pasted twice looks like, and the
differing panels say these are two products.

**Re-capture both from scratch, separately.** Do not reconcile them. If the
decks genuinely are identical, prove it on two sources and say so in
`conflicts`. While you are there: the kitten record's `product_name` contains
"Perfect Portions" twice.

---

## 7. And one defect the checker cannot see

`variant` is dropping the part of the name that identifies the product.

```
019014805822  product_name: "...Advanced Health Mobility Support Chicken & Whole Grain Recipe..."
              variant:      "Chicken & Whole Grain"

019014805747  product_name: "...Advanced Health Healthy Digestion Chicken & Whole Grain Recipe..."
              variant:      "Chicken & Whole Grain Recipe"
```

Two different products — Mobility Support and Healthy Digestion — whose
`variant` strings are the same flavour phrase. The sub-range is the thing a
shopper is choosing between, and it survives only in `product_name`.

This matters at seeding, not in the ledger: `variant` is what reaches
`data/known-products.ts`, and two products that differ only in a field nobody
carries forward are two products the catalog cannot tell apart. Worse, a
seeding pass that merges by brand + line + variant would merge two recipes.

**Put the sub-range into `variant`** as the pack prints it — "Mobility Support
Chicken & Whole Grain" — for every Advanced Health record and anywhere else the
pattern appears. Check the whole staged set for it; Immune Health has the same
shape across dog and cat.

---

## 8. Where things go

| What | Where |
|---|---|
| The panels you capture | onto the **existing** records, by UPC. Do not create records. |
| A batch too large to write whole | `research/incoming/iams-formulas-batch-NN.json` — records keyed by `upc`, same §3a rule |
| Source disagreements | `conflicts` on the record, and `docs/CATALOG-CONFLICTS.md` |
| The regenerated worklist | `research/WORKLIST-IAMS.md` |
| Vocabulary, range and prefix recommendations | the handoff — not the data files |
| `data/known-products.ts`, `data/known-formulas.ts` | **not you.** `AGENTS.md` §14 |

Branch: `claude/brand-curation-database-geiqse`.

Before every commit:

```bash
node scripts/check-ledger.mjs research/deep-research-iams.json
```

It must exit 0. It currently exits with 45 errors, so a run that still reports
45 means you have changed nothing it can see.

---

## 9. Batches of ten recipes

Ten recipes, then stop and report — not ten barcodes. A recipe is the unit of
work here and ten of them is between ten and thirty records.

Order them the way the worklist does, most barcodes first. The top six recipes
alone answer 25 barcodes; the bottom twenty answer one each. Front-load the
work that pays for several codes at once, so that a campaign cut short still
leaves the catalog usefully further along.

---

## 10. The handoff

Append to `research/IAMS-HANDOFF.md`, continuing its existing structure. It
must carry `AGENTS.md` §15 plus:

1. **Capabilities** — web access, shell, and whether you could read images.
   First sentence, before any count.
2. **Recipes closed** — how many of the 55, with how many barcodes behind them.
3. **Per source** — how many panels came from Chewy, Petco, PetSmart, Target,
   and how many were transcribed from manufacturer images.
4. **Disagreements found** — every recipe where two sources differed, and what
   you did about it.
5. **The four defects** — which of §6.1–6.4 and §7 you fixed and which remain.
6. **Checker** — the exit code and the error count, from a real run.

And every decision where you did something other than what this brief says,
with the reason.

---

## 11. Done

- The checker exits **0**.
- Every recipe in the worklist either has a complete panel or a stated reason
  it cannot.
- No record's ingredient list came from two pages.
- No barcode was added, changed or removed except the six in §6.1, and any
  change to those is explained.
- The handoff says how many of the 133 records now carry a composition.

That last number is the whole point of this campaign. The first one proved what
the barcodes are. This one answers what is in the bag.
