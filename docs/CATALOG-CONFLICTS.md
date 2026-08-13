# Catalog conflicts — what two sources disagree about, and what we stored

Every product in `data/known-formulas.ts` whose sources contradict each other,
what each source says, which one is in the catalog, and why.

**This file is the working list.** When a new batch arrives carrying a
disagreement, record it here at the same time as the data — not afterwards. The
`conflict` field on a formula is the one-sentence version a person sees in the
scanner; this is where the reasoning lives, so a decision made in five minutes
in August can be re-examined in November by somebody who was not there.

The process that produces these entries is written down separately, in
[SEEDING-A-BATCH.md](SEEDING-A-BATCH.md) — read that first if you are new to
this.

Nothing here is broken. These are places where a manufacturer's own label deck,
their own website, and a retailer's listing describe the same barcode
differently — which happens constantly, because a formula changes while a
barcode does not.

Last updated: 2026-08-13, after batch 010. 120 products, 31 with a conflict
note, 10 of those needing a physical pack.

---

## The rules these decisions follow

Stated once, so the individual entries can be short.

**1. The label deck beats the website beats the retailer.** A deck is the
artwork that was printed. A product page is marketing copy maintained
separately and often later. A retailer listing is a copy of a copy, sometimes
years old.

**2. Two lists that differ are two formulas, not one record to fix.** A barcode
outlives the recipe inside it. Friskies Pâté Ocean Whitefish & Tuna has run at
11% protein and at 9% under one UPC. Merging them destroys the only evidence
that happened, and picking one by arrival order is how the other stops existing.

**3. Deleting is the dangerous direction for an additive.** If a deck listing
Red 3 is current and we removed the colour to match a "no artificial colors"
page, the reader never sees a warning they scanned the tin to get. If the deck
is stale and we kept it, the reader gets a false alarm they can check against
the pack in their hand — and correct, with the mismatch button. Those two errors
are not the same size.

**4. Arithmetic is an independent witness.** A calorie statement is a second
measurement of the net weight: kcal/kg × pack weight has to equal kcal/pack.
Twice now that has settled a size dispute without anyone visiting a shop. A
typo breaks the arithmetic; a real reformulation keeps it.

**5. Nothing here is final.** Every stored row is `community` rank, which a
photograph of the real pack outranks. The whole point of the mismatch button is
that a reader holding the tin can end any of these arguments.

---

## A. Needs a physical pack (10)

Two sources disagree and no amount of desk work can settle it. Ordered by how
much the answer matters to a reader.

### A1. Artificial colour on four Fancy Feast Medleys Florentine · 3 oz

| UPC | Product | Deck | Deck lists |
|---|---|---|---|
| `050000570188` | White Meat Chicken Florentine | E670022 | Added Color |
| `050000570348` | Turkey Florentine | E670322 | Added Color |
| `050000572199` | Tuna Florentine | F670222 | Added Color, **Red 3** |
| `050000570492` | Wild Salmon Florentine | E670122 | Added Color, **Red 3** |

Purina's current product pages for all four say **no artificial colors**. Both
cannot describe the same tin.

**Stored:** the decks, colours included. See rule 3 — this is the case that rule
exists for. Red 3 is exactly the kind of thing somebody scans a pet food to find
out about.

**What settles it:** one physical can of any of the four. If the current pack
has no colour listed, all four decks are the old formula and the four entries
should be replaced together — they will have been reformulated as a range.

**Where this came from:** batch 008.

### A2. One ingredient present in the deck and absent from the website (4)

| UPC | Product | Disagreement |
|---|---|---|
| `050000543250` | Friskies Wild Favorites — Mini Bites, Haddock & Sweet Potato, 5.5 oz | Deck A633720 lists **Haddock** between Soy Flour and Sweet Potatoes; Purina's HTML renderer currently omits it. The product is named after the fish. |
| `050000502622` | Fancy Feast Gourmet Naturals — Chicken & Beef in Gravy, 3 oz | Deck B653921 lists **Vegetable Oil**; Purina's HTML list does not. The rest of the sequence agrees exactly. |
| `050000503667` | Friskies Ocean Favorites — Pâté, Salmon, Brown Rice & Peas, 5.5 oz | Deck B632321 says **Poultry By-Products** and **Peas**; the HTML says **Poultry By-Product Meal** and **Peas (Dried)**. |
| `050000503636` | Friskies Ocean Favorites — Pâté, Tuna, Brown Rice & Peas, 5.5 oz | Same as above. |

**Stored:** the decks.

On the last two, note that this is not a spelling difference. By-product *meal*
is rendered and dried rather than fresh — a different ingredient with a
different water content and a different position by weight. Merging the two
strings would produce a list that neither source printed.

On the Haddock: an omission in a renderer is much more likely than a fish being
removed from a product named after it, but "much more likely" is not "known".

**Where this came from:** batches 007 and 009.

### A3. Net weight and calories (2)

**`050000503681` — Friskies Ocean Favorites, Meaty Bits Salmon, Shrimp & Brown
Rice.** Purina's page says 5.4 oz; retailers still say 5.5 oz. Deck A632019
prints 967 kcal/kg and 150 kcal/can.

```
967 × 5.5 oz (155.9 g) = 150.8   ← agrees with the printed 150
967 × 5.4 oz (153.1 g) = 148.0
```

**Stored as 5.5 oz**, against the source document's instruction to file it as
5.4. The deck's own calorie line belongs to the larger can, and storing 5.4
beside it would make our record contradict itself. This reads as a downsizing in
progress: both cans on shelves, one deck not yet reprinted.

**What settles it:** a can with 5.4 oz printed on it. If it also prints 150
kcal/can, Purina has not updated the calorie line and we keep 5.5 with a note.
If it prints ~148, the new deck exists and both fields change together.

**`050000423248` — Friskies Pâté Country Style Dinner, 5.5 oz.** Two calorie
statements for one barcode:

```
deck J605224 :  1151 kcal/kg · 179 kcal/can    1151 × 155.9 g = 179.5  ✓
Purina page  :  1093 kcal/kg · 170 kcal/can    1093 × 155.9 g = 170.4  ✓
```

Both pairs are internally consistent. **A typo cannot do that** — it breaks the
arithmetic. So these are two real formulas at different energy densities, and
the deck's is stored.

**Where this came from:** batches 004 and 007.

---

## B. Settled at the desk — an older record against a current deck (20)

No shop trip needed. A retailer or an archived copy carries a formula the
manufacturer has since replaced; the current deck wins by rule 1, and the note
exists so the older version is not mistaken for a mistake.

### B1. Protein guarantee changed under a stable barcode (5)

| UPC | Product | Older record | Stored |
|---|---|---|---|
| `050000424948` | Friskies Pâté — Ocean Whitefish & Tuna | 11% min | 9% min |
| `050000423347` | Friskies Pâté — Salmon Dinner | 10% min + artificial colours | 9% min, no colours |
| `050000420445` | Friskies Pâté — Liver & Chicken | different protein guarantee | 9% min |
| `050000423149` | Friskies Meaty Bits — With Beef | 11% min, turkey, Added Color | 10% min, none of those |
| `050000421947` | Friskies Meaty Bits — Chicken Dinner | 11% min | 10% min (G610022) |

These are the reason rule 2 exists. `050000424948` is the canonical example and
the one quoted in `data/known-formulas.ts`.

### B2. Artificial colour removed since (4)

| UPC | Product | Older record |
|---|---|---|
| `050000170166` | Friskies Prime Filets — Ocean Whitefish & Tuna in Sauce | G611419: Added Color + Red 3, 766 kcal/kg |
| `050000577965` | Friskies Tasty Treasures — Chicken in Gravy (With Liver) | A627719: Added Color + Red 3, 137 kcal/can |
| `050000293315` | Friskies Extra Gravy — Chunky With Beef | Added Color |
| `050000579921` | Friskies Shreds — Turkey & Giblets in Gravy | Added Color |

Same shape as A1 and the opposite verdict, because here the two sources are
*dated* rather than merely different: an older deck against a newer deck is a
sequence, not a contradiction.

### B3. Retailer data that is simply wrong (4)

| UPC | Product | What the retailer has |
|---|---|---|
| `050000575008` | Fancy Feast Kitten — Tender Turkey | Target still exposes an old field containing Added Color; deck D662122 has none |
| `050000574988` | Fancy Feast Kitten — Ocean Whitefish | Target's ingredient text is OCR-corrupted; deck D662022 is the master |
| `050000544097` | Fancy Feast Gems — Tuna | Target's field is truncated mid-vitamin and carries a different formula code; deck A638422 is the master |
| `050000589968` | Fancy Feast Gems — Turkey | Target's title says 4.9 oz/2pk; Purina says a 4 oz box of two |

The Gems size was settled by arithmetic (rule 4): at 930 kcal/kg a 2.45 oz gem
would be 64.6 kcal and the deck prints 52, which is a 2 oz gem. Stored as 4 oz.

### B4. Older formula, detail unrecorded (4)

| UPC | Product | Note |
|---|---|---|
| `050000421848` | Friskies Pâté — Turkey & Giblets | Older records exist under a different formula |
| `050000421541` | Friskies Pâté — Mixed Grill | Older records exist under a different formula |
| `050000100446` | Friskies Prime Filets — Chicken & Tuna | Deck H611023 is current; older retailer records carry an earlier one |
| `050000412204` | Friskies Shreds — Turkey & Cheese | Some retailer copies carry generic "Vegetable Oil" and "Non-Fat Milk" where the current deck has MCT oil and dried whey |

The source documents said only that an older version exists, without giving it.
If one of these ever needs resolving, the old formula will have to be found
again — worth knowing before somebody assumes the note means more than it says.

### B5. A retailer naming the wrong animal (1)

| UPC | Product | What the retailer says | Stored |
|---|---|---|---|
| `050000191024` | Fancy Feast Medleys — Barbacoa, 3 oz | Target: "Barbacoa **Beef** Flavor" | **Pork** Barbacoa (deck A648523) |

Settled without a pack because the ingredient list settles it: the deck leads
with **Pork Broth, Pork** and contains no beef anywhere. Purina's own
description says pork.

Worth its own entry rather than a line in B3, because this is not a formula
being out of date — it is a product identified as the wrong meat. Somebody
avoiding beef, or feeding a cat that reacts to it, is exactly the person who
would trust a retailer's flavour name and be wrong.

**Where this came from:** batch 010.

### B6. A calorie statement reformulated (1)

| UPC | Product | Older | Deck A507925 |
|---|---|---|---|
| `050000241200` | Friskies Fully Load'd — Salmon, Wild Rice, Carrots & Spinach, 5.5 oz | 958 kcal/kg · 149 kcal/can | **937 kcal/kg · 146 kcal/can** |

```
958 × 155.9 g = 149.4  ✓
937 × 155.9 g = 146.1  ✓
```

Same shape as Country Style Dinner in A3 and the opposite verdict, because here
the two are dated: an older page against a newer deck is a sequence. Both pairs
check out, so it is a real reformulation and not a typo — rule 4 — and the
current deck wins by rule 1.

### B7. An ingredient a retailer drops (1)

| UPC | Product | Missing from retailer copies | Stored |
|---|---|---|---|
| `050000236091` | Friskies Fully Load'd — Tuna, Rice, Spinach & Tomatoes, 5.5 oz | **Wheat Gluten**, third | deck A508025, with it |

Third position is a lot of a tin, and wheat gluten is something people look for.
Unlike the Haddock case in A2 this needs no pack: it is a retailer omission
against the manufacturer's own deck, which rule 1 already answers.

---

## C. Barcodes that must never be filed against these products (5)

Every one of these passes its own UPC-A check digit and circulates in real
listings. **Nothing about the number itself says it belongs to a different
object** — which is precisely why they are a test
(`lib/known-import.test.ts`, "never files a case or sibling code against a
single package") and not a comment.

| Wrong code | What it actually is | Correct code for the product |
|---|---|---|
| `050000504299` | case of Fancy Feast Petites Tender Beef tubs | `050000002603` |
| `050000503650` | case of Friskies Ocean Favorites Tuna pâté | `050000503636` |
| `050000579938` | 24-can case of Friskies Shreds Turkey & Giblets | `050000579921` |
| `050000574537` | **unconfirmed** — appears in Turkey Primavera multipack listings, may or may not be a case | `050000574520` |
| `050000962648` | **not a case at all** — the White Meat Chicken Primavera **Paté**, a different texture and formula sharing the flavour name | `050000574582` (the broth version) |

The last one is the dangerous one. A case code attached to a single tin gives
the right ingredients under the wrong barcode; a *sibling product* code gives
the wrong ingredients under a plausible barcode, and nothing on the page would
look odd.

---

## D. Data the model cannot hold yet

### D1. Calcium guarantee — 3 products, unresolved

`050000502585` carries the 28th conflict note in the catalog, and it is this and
nothing else: the deck agrees with every other source, and the only thing wrong
is that we cannot store one of its figures. The other two say it as a second
sentence after a retailer problem, which is why they are counted in B3.


Three kitten decks guarantee **Calcium (min) 0.3%** and it is not stored:

- `050000575008` Fancy Feast Kitten — Tender Turkey
- `050000574988` Fancy Feast Kitten — Ocean Whitefish
- `050000502585` Fancy Feast Gourmet Naturals — Wild Alaskan Salmon (Kitten)

`GuaranteedAnalysis` has no calcium field. Adding one is **not** a one-repo
change: the consumer app drops keys it does not recognise when it reads a stored
panel back, so writing `calciumMin` from the scanner alone would put a figure in
the database that nothing can ever read — worse than not storing it, because it
would look stored.

**To do it properly:** add the field to `lib/guaranteed-analysis.ts` in *both*
repositories, to `NO_ANALYSIS`, to `readStoredAnalysis`, and a row to the
consumer's `GuaranteedAnalysisPanel`. No SQL: the column is `jsonb`.

Growth needs calcium, so this is most useful on exactly the products that state
it. Every kitten batch from here will add to the list.

### D2. Life stage — done, batch 009

Recorded for completeness because it was open for three batches. `lifeStage?:
"kitten" | "adult" | "all"` now exists on `KnownProduct`. It is optional and
absent means the deck stated none; reading "adult" out of silence would turn an
absence into a claim.

The two cases that made a field necessary rather than a naming convention:
Gourmet Naturals sells a kitten paté inside an otherwise adult range, and
Friskies Shreds Whitefish & Sardines (`050000579907`) is approved for kitten
growth *and* adult maintenance in a range where everything else is adult.

---

## E. Transcription decisions, revisitable

Not conflicts between sources — conflicts between what a source document wrote
and what a label can plausibly print. Recorded because each was a judgement and
each could be wrong.

### E1. Ten vitamin block orderings, none merged

`data/known-formulas.ts` carries ten constants — `V`, `V_PATE`, `V_E_FIRST`,
`V_E_FIRST_A_MID`, `V_NIACIN_FIRST`, `V_NO_K`, `V_PLAIN`, `V_GEMS`,
`V_MEDLEYS`, `V_PATE_SHORT` — because that many genuinely different orderings
and notations turned up across 120 decks.

Ten looks absurd for one premix until you notice no two are the same document.
`V_PATE` and `V_PATE_SHORT` are the same twelve in the same order, written with
"(Vitamin B-1)" and with "(B1)". `V_MEDLEYS` uses the short letters too but
drops the gloss from biotin and folic acid while keeping menadione's in full.
Merging any pair would make the file tidier and make it describe a label nobody
printed.

The one worth knowing about: **`V_NO_K`**, for Prime Filets Salmon & Beef
(`050000100422`), whose deck closes the vitamin bracket *before* menadione and
lists it separately after. The source asked that it not be normalised on import
and a test now pins it. A bracket is a group the label drew.

### E2. Shorthand expanded back — batch 006

Batch 006 arrived written as `KCl`, `B3 niacin`, `B6 pyridoxine HCl`, `Vitamin K
menadione sodium bisulfite complex`. None of that is label text: a US label
names ingredients by their AAFCO definitions, and no deck prints a chemical
formula or a leading vitamin number.

**Expanded back** to Potassium Chloride, Niacin, Pyridoxine Hydrochloride,
Menadione Sodium Bisulfite Complex — undoing the source's compression rather
than editing a label. A test refuses any stored composition containing `KCl`,
`HCl` or a bare B-number.

**Not** expanded in the other direction: the parenthetical glosses the sibling
ranges carry ("Niacin (Vitamin B-3)") were not added, because whether those
decks print them is exactly what the shorthand destroyed.

### E3. Medleys notation kept as written — batch 008

The Medleys decks gloss the B vitamins `(B1)` rather than `(Vitamin B-1)`, give
biotin and folic acid no gloss at all, and still write menadione's `(Vitamin K)`
in full.

That inconsistency is the evidence. A source compressing uniformly would have
shortened the K too. So `V_MEDLEYS` is neither expanded to match the other
ranges nor stripped to bare names.

### E4. Petites notation kept as written — batch 005

Every Petites deck prints plain names — "Thiamine Mononitrate" where other
ranges print "Thiamine Mononitrate (Vitamin B-1)". Kept as given (`V_PLAIN`).
Adding the glosses because the siblings carry them would be putting words on a
label that may not have them.

---

## How to add a new one

When a batch arrives with a disagreement:

1. Store the deck version in `data/known-formulas.ts` with a one-sentence
   `conflict` note — that is what a person sees in the scanner's import panel.
2. Add an entry here under **A** if only a physical pack can settle it, or **B**
   if the desk already settled it. Say what each source claims, which is stored,
   and what would change the answer.
3. If the disagreement is about a barcode belonging to a different object, add
   it to **C** *and* to the test in `lib/known-import.test.ts`. A comment is not
   enough: these codes pass their own check digits.
4. Update the counts in the header.
5. Run the arithmetic before writing anything down. kcal/kg × pack weight has
   already settled two disputes that looked like they needed a shop trip.
