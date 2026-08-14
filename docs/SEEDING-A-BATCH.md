# Seeding a batch — the whole process

How a document of pet food products, pasted into a chat, becomes rows a shopper
can scan. Written so somebody picking this up in a new conversation can do the
next batch without being told any of it twice.

Seventeen batches, 203 products under 230 barcodes, all with formulas, have gone
through this. Everything below is what was actually done, including the parts
that were got wrong first.

---

## 0. The shape of it

The operator finds product data — Purina label decks, retailer listings — and
pastes a batch into the chat. Ten products is typical. Each carries a barcode,
an ingredient list in printed order, a guaranteed analysis, a calorie statement,
and sometimes a warning that two sources disagree.

Then:

1. **Verify before typing anything.** Arithmetic catches more than reading does.
2. **Write the data** — identity in one file, composition in another.
3. **Record any disagreement** in `docs/CATALOG-CONFLICTS.md`, at the same time,
   not afterwards. A test enforces this.
4. **Run the checks**, commit, push to `main` and to the working branch.
5. **Tell the operator what you found** — especially anything you did
   differently from what the document asked, and why.
6. **They press "Write N to the catalog"** in the scanner's Seeded formulas
   panel. Nothing reaches the database until they do.

You never write to the database. The seed lives in TypeScript; an admin-gated
route reads it and upserts. That separation is deliberate — see §7.

---

## 1. Where things live

Two repositories, both checked out beside each other.

| Repo | What it is |
|---|---|
| `ingredient-scanner` | The admin capture tool. **The seed lives here.** |
| `Ingredients.help` | The consumer app that shoppers scan with. Reads the same Supabase tables. |

Inside the scanner:

| Path | Holds |
|---|---|
| `data/known-products.ts` | Identity: brand, range, variant, texture, presentation, life stage, packages with barcodes. |
| `data/known-formulas.ts` | Composition: the ingredient list verbatim, the guaranteed analysis, calories. Keyed by the UPC exactly as printed. |
| `data/us-pet-brands.ts` | Brands and their ranges. A new range must be added here or coverage files it under "Other". |
| `lib/presentation.ts` | The controlled vocabularies: `Texture` and `Presentation`. |
| `lib/known-import.test.ts` | Where the rules below are enforced. Read it before inventing a new one. |
| `docs/CATALOG-CONFLICTS.md` | Every source disagreement, with the reasoning. |
| `scripts/check-batch.mjs` | The pre-flight check. |
| `scripts/match-vitamins.mjs` | Matches an incoming vitamin block against every constant. Run it; do not eyeball it. |
| `app/api/known-products/import/route.ts` | What actually writes to the catalog when the operator presses the button. |

| `data/wrong-barcodes.ts` | Codes that belong to a case, a multipack, or a different product. Read by the test AND by the checker. |

A product may have no formula. It then shows on the coverage page as a barcode
to go and find, and the import steps over it. Right now all 230 have one.

---

## 2. Verify first

### 2.1 Run the checker

Build a TSV — one line per product, `upc`, `oz`, `kcalPerKg`, `kcalPerUnit`,
label:

```
050000659951	3	813	69	Medleys Beef Ragú
050000660018	3	811	69	Medleys Beef & Pork Milanese
```

```bash
node scripts/check-batch.mjs batch.tsv
```

It checks the UPC-A check digit, the GS1 prefix, collision with the existing
seed and with itself, and whether the calorie statement agrees with the net
weight.

**`oz` is the weight the calorie figure is about, not always the pack.** A
Fancy Feast Petites tub is 2.8 oz and states calories per 1.4 oz serving; a Gems
box is 4 oz and states them per 2 oz gem. Pass the serving.

### 2.2 What a failing calorie check usually means

Not a typo. Three times it has meant something worth writing down:

- **A retailer's net weight is wrong.** Target listed a Gems box as 4.9 oz. At
  930 kcal/kg a 2.45 oz gem would be 64.6 kcal and the deck printed 52 — a 2 oz
  gem. Purina was right, and no shop trip was needed.
- **A pack is being downsized.** Ocean Favorites Salmon & Shrimp: the page says
  5.4 oz, retailers say 5.5, and the deck's own calorie line only works at 5.5.
  Stored 5.5 against the source document's instruction, and said so.
- **Two statements both check out.** Country Style Dinner: 1151/179 and
  1093/170, both internally consistent for a 5.5 oz can. **A typo cannot do
  that.** Two formulas, not one error.

So when it fails: try the other plausible pack sizes before believing anybody.

### 2.3 Check what the checker cannot

- **Is this barcode a case or a multipack?** Ten codes have turned up that
  pass their own check digit and belong to a different object. The checker knows
  them (`data/wrong-barcodes.ts`) — but read what it says rather than only the
  ok/FAIL, because a code can earn its way OFF that list: `050000962648` was on
  it for three batches as "the paté, not the broth version", and in batch 011
  the paté's own deck arrived and it became an ordinary product. See §6.
- **Do two products in the batch share a composition?** The test suite catches
  it (`no two products share a composition`), but know that it is a real
  hazard — Mariner's Catch and Sea Captain's Choice differ by two swapped
  ingredients and one vitamin ordering.
- **Does the panel read as as-fed?** Moisture 60–90% and protein ≤20% for WET
  food; 5–20% and ≤50% for dry. A dry-matter figure typed into an as-fed panel
  would wreck every comparison drawn from it. Tested, per form — see §2.4.

### 2.4 If the batch is dry food, treats, or several sizes of one product

Batches 001–016 were all single-size wet cans. Batch 017 was the first that was
not, and — exactly like the first Hill's batch — most of the work was undoing
places where "a canned dinner" had been written down as if it meant "a product".

1. **One product, several barcodes.** `packages` takes them all; do NOT file a
   3 lb bag and a 16 lb bag as two products. `KNOWN_FORMULAS` is still keyed by
   barcode, so each size gets its own entry, and a test checks they agree on
   the recipe.
2. **The panel bounds are per food form.** Wet is moisture 60–90%, protein
   ≤20%. Dry is moisture 5–20%, protein ≤50%. Those are as-fed figures in both
   cases; a bag really is 34% protein. Do not "fix" data to fit a bound.
3. **Calories are per CUP or per PIECE**, not per package, so rule 4 is
   unavailable — a cup is a volume and there is nothing for the arithmetic to
   check. Leave the kcal columns as `-` in the checker input rather than
   inventing a pack figure. Say out loud that the batch went in without the
   arithmetic witness.
4. **A treat is not a food form.** The ledger writes `food_form: "treat"`;
   the model stores `foodForm: "dry"` and lets `lib/nutrition-role.ts` say it
   is a treat, from the range name at import time. Check the range is in that
   module's list. Getting it wrong makes the report judge a bag of snacks for
   not being a balanced diet.
5. **Check the range name against the deck, not the ledger.** Batch 017's
   ledger said `product_line: "Dry Cat Food"` for twenty barcodes. The real
   ranges — Seafood Sensations, Gravy Swirlers, Land & Sea Adventures, Party
   Pack'd — were in `product_name` and in the deck's own filename in the source
   URL. Filing them all as "Dry Cat Food" would have made the coverage page
   useless for the whole dry shelf.
6. **Watch for one-word-apart ranges.** Friskies sells *Party Mix* (treats) and
   *Party Pack'd* (a complete dry food). Only one of them should ever be
   excused from the everyday standard.

### 2.5 If the batch is a maker we have not seeded before

Batches 001–014 were all Nestlé Purina. Batch 015 was the first Hill's, and
almost everything that needed doing was a place where "Purina" had been written
down as if it meant "a pet food maker". Expect the same and look for it
deliberately — a new maker's first batch is where those show up, and each one
looks like the data being wrong until you read the code.

What batch 015 needed, as a checklist for the next one:

1. **`data/gs1-prefixes.ts`** — add the six-digit prefix and whose it is, or the
   checker calls every row in the batch a failure. That file explains why
   twenty false failures is worse than no check.
2. **`data/us-pet-brands.ts`** — the brand must be there, and every range must
   be in its `lines`. Both are tested. Check what `brandKey()` actually resolves
   before assuming: `"Hill's"` does not match `"Hill's Science Diet"`.
3. **Which string is the brand?** Hill's sells *Science Diet* and *Prescription
   Diet* as separate brands and the company name appears on neither shelf as the
   thing being chosen. Store what a shopper would name.
4. **Ask what the maker does not print.** Hill's states no ash and no taurine on
   any product — Purina states both on all 160. Anything the model marks
   required because every Purina deck has it will need widening, and the right
   fix is to widen the type, never to supply a plausible figure. See §5.
5. **Do the ingredient lists use a different notation?** Hill's writes
   `vitamins (…)` in lower case with parentheses where Purina writes
   `VITAMINS […]`. Both are fine — copy what is printed (§4) — but check that
   the consumer's splitter handles it before assuming, since that is what
   produces the numbered list a reader checks against their can.
6. **Does the maker sell through a vet channel?** If so, `lib/vet-diet.ts` must
   recognise the range, and there is a test that it does. Getting this wrong is
   the worst single error available here: the report drops to judging a
   prescribed therapeutic food by whether it has meat near the top.

---

## 3. Writing the identity — `data/known-products.ts`

```ts
{
  brand: "Fancy Feast",
  line: "Medleys",                  // must exist in data/us-pet-brands.ts
  variant: "Beef Ragú Recipe With Tomatoes & Pasta in a Savory Sauce",
  species: "cat",
  texture: "shredded",              // what it is CUT into
  presentation: "in_sauce",         // what it is SUSPENDED IN
  foodForm: "wet",
  proteins: ["beef", "tomatoes", "pasta"],
  lifeStage: "adult",               // optional — omit when the deck says nothing
  packages: [{ size: "3 oz", container: CAN, upc: "050000659951", scope: UNIT }],
}
```

**`texture` and `presentation` are two different questions** and keeping them
apart is the point of `lib/presentation.ts`. "Flaked Salmon in Gravy" is
`flaked` + `in_gravy`. Answering "gravy" to "what texture is it?" is the exact
mistake that module exists to stop.

**`presentation` predicts composition**, which is what makes it worth getting
right: a gravy or a sauce is thickened, nearly always with carrageenan, guar or
xanthan. `impliesThickener()` reads it.

**`lifeStage` is optional and absent means the deck stated none.** Most adult
food says "maintenance of adult cats" in its AAFCO statement and nothing on the
front; reading "adult" out of silence would turn an absence into a claim.

**Add a new range** to `data/us-pet-brands.ts` before using it, or the coverage
page files the products under "Other".

### When to extend the vocabulary, and when not to

Both have happened. The test is whether the new value **predicts something
different**.

Extended, and why:

- `gravy_center` — Savory Centers is a pâté with a pocket of gravy inside it.
  Not a bath, not plain.
- `gravy_halo` — Gems is a moulded mousse with a ring of gravy around it. The
  mirror image of the above.
- `in_water` gained "in savory juices" — three Medleys use the phrase and carry
  **no gums at all**, so the thickener prediction is the opposite of a gravy's.
- `container: "tub"` and `"box"` — Petites twin-tubs and Gems boxes.
- `lifeStage` — see §5.

Refused, and why:

- A fourth kind of gravy for **Glaz'd & Infuz'd**. A glaze is gravy on the
  outside of pieces; all three decks carry xanthan AND locust bean gum, so it
  predicts exactly what a gravy predicts. The range name carries the
  distinction. Adding a value for a spelling is over-fitting.
- A separate texture for **"Mini Bites"** against "Meaty Bits". Different sizes
  of one idea; `bits` covers both.
- A value each for **velouté, béchamel and demi-glace**. Three named French
  sauces and, for this field, three sauces. Naming a value after each would
  split a shelf on the strength of a menu.

---

## 4. Writing the composition — `data/known-formulas.ts`

```ts
"050000659951": {
  ingredients: `Beef Broth, Beef, Wheat Gluten, …, ${V_MEDLEYS}.`,
  analysis: withCalories(ga(10.0, 1.5, 1.5, 82.0, 3.5, 0.05), 813, 69),
  verifiedAt: VERIFIED_010,
  conflict: "…",   // only when two sources disagree
}
```

`ga(protein, fat, fibre, moisture, ash, taurine)` — all as printed, minima and
maxima exactly as the deck states them. **`taurine` may be `null`**: four Fancy
Feast Delights With Cheddar decks state no taurine figure although the
ingredient is in the list. Null is "not stated", never zero.

`withCalories(analysis, kcalPerKg, kcalPerUnit, unitName = "can")` — pass
`"serving"` for Petites, `"gem"` for Gems.

### The one rule that matters: copy, do not tidy

**The order is the data.** American labels print by descending weight, so moving
one item rewrites what the product is.

Nothing is normalised, expanded, reordered or harmonised with a sibling:

- **Nothing is added.** Fancy Feast Ocean Whitefish & Tuna guarantees 0.05%
  taurine and does not list taurine among its ingredients. Writing it in because
  the panel mentions it would be inventing a line on a label.
- **Nothing is moved.** Prime Filets Salmon & Beef closes its vitamin bracket
  *before* menadione and lists it after. A bracket is a group the label drew.
  Pinned by a test.
- **Nothing is unified.** Savory Centers writes "Iron Sulfate" and "Calcium
  Iodate" where its siblings write "Ferrous Sulfate" and "Potassium Iodide".
  Same elements, the range's own names.
- **Small differences are copied, not smoothed.** Five Gems decks say "Meat
  By-Product" singular and the sixth says plural. Either it is real or the
  source has a typo; flattening it destroys the evidence for both.

### The exception: source shorthand is expanded back

Batch 006 arrived written as `KCl`, `B3 niacin`, `B6 pyridoxine HCl`. None of
that can be on a pack — a US label names ingredients by their AAFCO
definitions, and no deck prints a chemical formula or a leading vitamin number.
That is the source compressing, not the label.

So it was expanded back to Potassium Chloride, Niacin, Pyridoxine
Hydrochloride. **A test refuses any stored composition containing `KCl`, `HCl`
or a bare B-number.**

Not expanded in the other direction: the parenthetical glosses siblings carry
("Niacin (Vitamin B-3)") were **not** added, because whether those decks print
them is exactly what the shorthand destroyed.

### The vitamin and mineral constants

There are ten vitamin block constants. That looks absurd for one premix until
you notice no two are the same document — each is an ordering, a notation, or
both, observed on a deck.

| Constant | What distinguishes it |
|---|---|
| `V` | The common one: thiamine first, A mid, full "(Vitamin B-1)" glosses |
| `V_PATE` | Friskies Pâté ordering — B6 and B2 before A |
| `V_E_FIRST` | Leads with vitamin E |
| `V_E_FIRST_A_MID` | E first, A in the middle |
| `V_NIACIN_FIRST` | Savory Centers — niacin first, A near the end |
| `V_NO_K` | `V` with menadione **outside** the bracket, after it |
| `V_PLAIN` | Petites — bare names, no glosses at all |
| `V_GEMS` | Gems ordering, bare names |
| `V_MEDLEYS` | Short letters "(B1)", biotin and folic acid bare, K full |
| `V_PATE_SHORT` | `V_PATE`'s order in short letters, biotin and folic glossed |

**Do not eyeball this. Run the script:**

```bash
node scripts/match-vitamins.mjs "thiamine mononitrate, Vitamin E supplement, …"
```

It prints EXACT MATCH and the constant to reuse, or the three nearest with the
differing entries listed. Reusing one that is nearly right is worse than adding
one: nearly right is a label nobody printed.

Two worked examples, and the second is why the script exists.

**Batch 012** looked like `V_MEDLEYS` and came out **2 of 12 different** —
biotin and folic acid, bare there and glossed "(B7)" and "(B9)" here. Reusing it
would have stripped two glosses off ten labels.

**Batch 013** was checked by a comparison typed out by hand, and the hand-typed
version was wrong. It reported `V_MEDLEYS` at five differences when `V_PLAIN`
was **one** away. The cause: `V_NO_K` is the one constant whose string does not
end at its closing bracket — its deck prints menadione after the group — so a
regex anchored on `]";` ran past it and ate the next declaration. The check then
compared against eleven constants while reporting twelve. A check that silently
examines less than it claims is worse than no check, because it is trusted.

Minerals are written inline rather than as constants, because they vary in one
or two entries at a time. The two common shapes: with `Magnesium Proteinate`
and without.

---

## 5. When the data has nowhere to go

Twice a batch has carried a fact the model could not hold. Both times the
answer was the same shape.

**Do not drop it silently.** Write it into the formula's `conflict` note so it
survives, tell the operator, and add the field when it has happened enough to
be worth a proper change.

- **`lifeStage`** — added in batch 009, after three batches of losing it.
  Fancy Feast Kitten could carry it in `line` because "Kitten" is the range
  name; Gourmet Naturals sells a kitten paté *inside* an adult range, and a
  Shreds deck is approved for kittens *and* adults, and neither can be written
  as a name.
- **Calcium** — still open. Three kitten decks guarantee `Calcium (min) 0.3%`
  and there is no field. It is **not** a one-repo change: the consumer app
  drops keys it does not recognise when reading a stored panel back, so writing
  `calciumMin` from the scanner alone would put a figure in the database that
  nothing can read. See `docs/CATALOG-CONFLICTS.md` §D1 for what a proper fix
  touches.

---

## 6. When two sources disagree

This is common enough to have its own document:
**[CATALOG-CONFLICTS.md](CATALOG-CONFLICTS.md)** — read the five rules at the
top before deciding anything. In short:

1. Label deck beats website beats retailer.
2. Two differing lists are two formulas, not one record to fix.
3. **Deleting is the dangerous direction for an additive.** A colour wrongly
   removed is a warning the reader never sees; a colour wrongly kept is a false
   alarm they can check against the pack in their hand.
4. Arithmetic is an independent witness.
5. Nothing is final — every row is `community` rank, which a photograph of the
   real pack outranks.

Write the one-sentence version into `conflict` on the formula (that is what a
person sees in the import panel), and the reasoning into the document. **A test
fails if a formula has a `conflict` note and the document does not mention its
barcode.**

### Barcodes that belong to something else

Five so far. Every one passes its own UPC-A check digit and appears in real
listings, so **nothing about the number says it is wrong**.

| Wrong code | Actually | Correct |
|---|---|---|
| `050000504299` | case of Petites Tender Beef | `050000002603` |
| `050000503650` | case of Ocean Favorites Tuna | `050000503636` |
| `050000579938` | 24-can case of Shreds Turkey & Giblets | `050000579921` |
| `050000574537` | unconfirmed, in Turkey Primavera multipack listings | `050000574520` |
| `050000962648` | **a different product** — Primavera **Paté**, same flavour name | `050000574582` |

The last is the dangerous kind: a case code gives the right ingredients under
the wrong barcode, a sibling product gives the **wrong ingredients under a
plausible barcode**, and nothing on the page looks odd.

Add new ones to the table **and** to the test
(`never files a case or sibling code against a single package`). A comment does
not stop anybody.

---

## 7. Finish

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

All four, every time. The test suite is where the rules above live: it has
caught a taurine assumption that was true of the first forty products and not
of pet food, a coverage test that had quietly stopped testing its own claim,
and several transcription slips.

Commit, then push to **both**:

```bash
git push origin main
git push origin main:claude/catalog-scanner-mrxmam
```

Write the commit message for somebody reading it in a year: what arrived, what
you checked, and **every decision where you did something other than what the
source document said**, with the reason. Those are the ones worth finding again.

### Then tell the operator

- what was added, and the running total;
- anything you did differently from the document, and why — they may know
  something you do not;
- anything a physical pack would settle;
- that they need to press **"Write N to the catalog"** in the Seeded formulas
  panel. The seed is TypeScript; nothing is in the database until that button.

The import writes rows as `source: "community"` — better than an open database,
outranked by a photograph of the real pack. It never overwrites a differing
composition of equal standing; those are reported as conflicts for a person.
It clears stale cached reports for the codes it writes.

---

## 8. Things worth knowing that are not obvious

- **A `barcode_cache` row without an ingredient list is worse than no row.** It
  fails `isServableRow()` in the consumer app, which reads as a recent MISS and
  stops the open databases being asked for a week. That is why identity-only
  products stay out of the catalog and live on the coverage page instead.
- **`canonicalBarcode()` pads to GTIN-14**, so "050000429943" and
  "0050000429943" are one key. Store the UPC as printed, as a **string** —
  leading zeros are not decoration.
- **`compositionKey()` is a detector, not a decision.** It fingerprints
  brand + ingredients to notice when two records are the same recipe. Two
  products sharing one means a list was pasted twice.
- **Sandbox limits.** No Supabase keys, no model API key, and outbound HTTPS to
  third-party sites is blocked. You cannot fetch a Purina page or read the
  live database — everything above is checkable without them, which is why the
  process looks like this.
- **Screenshots find things tests do not.** Playwright with
  `/opt/pw-browsers/chromium`, `serviceWorkers: 'block'` (the PWA service
  worker intercepts routes otherwise), and `permissions: ['camera']`. Three real
  UI defects were caught this way that green tests had missed.
