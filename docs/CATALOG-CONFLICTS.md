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

Last updated: 2026-08-14, after batch 018. 282 barcodes across 247 products,
99 with a conflict note, 10 of those needing a physical pack.

Two makers: Nestlé Purina (200 barcodes) and Hill's (82). Two food forms since
batch 017, which brought the first dry food and the first treats — and with them
the first products sold under several barcodes at once, one per bag size.

Batches 015–016 were the first non-Purina ones and their conflicts are a
different shape: B13, B14, B15 and B16 are all a maker disagreeing with
**itself**. Batch 017 then found the same fault on Purina's site at scale — see
B18.

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

## B. Settled at the desk — an older record against a current deck (90)

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

### B8. A deck's own wording against a webpage's (1)

| UPC | Product | Deck C670521 | Purina online |
|---|---|---|---|
| `050000962600` | Fancy Feast Medleys — Chicken Florentine Paté, 3 oz | **Vegetable Oil** | may name the oil more specifically |

Stored as the deck reads. A more specific oil name is a different ingredient
claim, not a clarification of the same one — somebody avoiding a particular oil
is answered differently by "vegetable oil" and by any name that replaces it.
Inventing the specific name to match a webpage would be writing the label.

**Where this came from:** batch 011.

### B9. A deck's wording against the same maker's webpage (5)

The pattern that arrived in bulk with batch 012: Purina's own site presents an
ingredient list that differs from the deck it links to. Rule 1 settles all four
— the deck is the artwork that was printed — but two of them are worth reading,
because "minor wording difference" is what the source called them and two of
them are not that.

| UPC | Product | Deck says | The website says |
|---|---|---|---|
| `050000292592` | Gravy Lovers — Salmon & Sole, 3 oz | **Vegetable Oil**, **Magnesium Proteinate** | Vegetable Glycerin, Magnesium Sulfate |
| `050000292639` | Gravy Lovers — Chicken & Beef, 3 oz | **Chicken and Beef Broth** (one entry) | Chicken Broth, Beef Broth (two) |
| `050000292615` | Gravy Lovers — Chicken Hearts & Liver, 3 oz | deck C702622 | minor differences incl. the mineral block |
| `050000434640` | Sliced — Chicken Hearts & Liver, 3 oz | deck E700322 | minor wording and mineral-list differences |
| `050000428748` | Fancy Feast Flaked — Fish & Shrimp Feast, 3 oz | **Vegetable Oil** (deck D690120) | Vegetable Glycerin |

**Not minor, the first one.** Glycerin is a humectant and oil is a fat; a
proteinate is a chelated mineral and a sulfate is not. Those are four different
substances, not two spellings, and somebody reading a list for fat content or
for chelated minerals gets a different answer from each.

**Not minor, the second either.** One combined broth and two separate broths
are different claims about what is in the tin and in what proportion — the
combined entry says nothing about the ratio, the split entries place each by
weight.

The other two the source itself described only as "minor", without listing
what. Recorded anyway: *minor* is a judgement somebody made, and the next
person to compare the two pages should know it was already looked at.

**The fifth is the glycerin fault again**, two batches and one brand later, and
on that row Target agrees with the deck against Purina's own widget. That is
what settles it: a single page showing the wrong ingredient is a bad page, and
the same wrong ingredient appearing twice — while the retailer reads the deck
correctly — is Purina's ingredient renderer substituting a term. Worth knowing
before the next one, because the instinct on seeing one source disagree is to
go looking for which source is stale, and here neither is: one of them is
rewriting.

**Where this came from:** batches 012 and 014.

### B10. One maker, two dated decks (6)

The batch that arrived through Deep Research rather than as a pasted document
brought a kind we had seen singly and never in bulk: Purina's *own* older deck
against Purina's *own* current one, with both deck codes known.

That makes them the easiest conflicts in this file. Two dated decks from one
maker are a sequence, not a contradiction — rule 1 — so none needs a pack.

| UPC | Product | Superseded deck | Current deck | What changed |
|---|---|---|---|---|
| `050000573950` | Friskies Indoor — Chunky Chicken & Turkey | H608118 | **I608123** | lost added color and xanthan gum; fibre 2.3 → 2.75%; 887 → 896 kcal/kg |
| `050000574100` | Friskies Indoor — Meaty Bits Saucy Seafood | I608718 | **J608723** | lost added color and Red 3; fibre 2.3 → 2.7%; 850 → 848 kcal/kg |
| `050000574124` | Friskies Indoor — Flaked Ocean Whitefish | I608318 | **J608323** | lost added color and Red 3; spinach moved after the meat by-products; fibre 2.2 → 2.6% |
| `050000293292` | Friskies Extra Gravy — Chunky With Chicken | B626618 | **C626622** | list no longer opens Water, Liver, Meat By-Products; lost poultry and added color; 822 → 818 kcal/kg |
| `050000293353` | Friskies Extra Gravy — Chunky With Turkey | Target's live panel | **C626822** | Target still shows added color and mono/dicalcium phosphate; Purina's page says no artificial colours and links a deck with neither |
| `050000574070` | Friskies Indoor — Meaty Bits Homestyle Turkey Dinner | Purina's widget and Target's panel | **I608623** (Sept 2024) | lost added color; fibre 2.3 → 2.75% |

**Every row here lost an artificial colour.** Read against A1 — where four Medleys decks still *list* Added Color and Red 3
against a page that denies them — this is the same reformulation reaching
different ranges at different times, and it is decent evidence that the Medleys
decks really are the stale ones. Not proof. Still worth a pack.

**Four of the five Friskies Indoor products we hold are in this table**, which
changes what the next Indoor product means. One is coincidence; a range moving
together is a reformulation with a date on it, so an Indoor panel still showing
added color should be assumed superseded and checked against Purina's current
deck, rather than filed as a fresh disagreement. The fibre figure moves with the
colour every time — 2.2–2.3% up to 2.6–2.75% — which gives a second, independent
tell on a retailer panel that does not print its deck code.

(The fifth, `050000574001` Indoor Pâté Chicken Dinner, has no conflict note at
all. That is not evidence it escaped the reformulation — only that no source we
saw disagreed about it.)

**Where this came from:** batches 013 and 014, promoted from
`research/deep-research-barcodes.json`.

### B11. A website that links the right deck from the wrong page (1)

| UPC | Product | The fault |
|---|---|---|
| `050000582334` | Friskies Tasty Treasures — With Turkey and Chicken, 5.5 oz | Purina's site routes deck B627823 from a differently named Tasty Treasures product page |

The deck itself is unambiguous — it says "With Turkey and Chicken" — and a
Kroger single-can page independently matches both that identity and the paté
format. Stored on the deck's own wording.

**A navigation fault on a website is not evidence about a tin.** Worth its own
entry because it is the first conflict here that is about a link rather than
about a list, and the next one will be easier to recognise.

### B12. A retailer's panel is a superseded formula (5)

B10 is two dated decks from one maker. This is the commoner and weaker version:
a retailer's panel carries a formula the maker has replaced, and only the
current deck is dated. The verdict is the same by rule 1 — the retailer is not
publishing artwork — but the older formula is written out here, because a
retailer panel is what a shopper is most likely to have read before scanning.

| UPC | Product | What Target still shows | Stored (current deck) |
|---|---|---|---|
| `050000427949` | Fancy Feast Flaked — Chicken & Tuna Feast, 3 oz | 78% max moisture | 74% (D690021) |
| `050000001248` | Fancy Feast Flaked — Tuna Feast, 3 oz | soy protein concentrate, artificial flavor, added color, **sodium nitrite**; 78% moisture, 3.5% ash | none of those; 74% and 3.25% (D690521) |
| `050000426942` | Fancy Feast Chunky — Chunky Chicken Feast, 3 oz | soy protein concentrate, added color | neither; glycine and magnesium proteinate instead (E665022) |
| `050000032648` | Fancy Feast Sliced — Sliced Chicken Feast in Gravy, 3 oz | turkey, soy protein concentrate, artificial flavor, added color | none of those; glycine added (D700222) |
| `052742453408` | Hill's Science Diet Adult — Savory Chicken Entrée, 5.5 oz | *(Chewy)* older sequence omitting Hydrolyzed Chicken Flavor; 181 kcal/can | complete sequence; 182 kcal/can |

**The sodium nitrite is the one to notice.** It is a curing salt, and somebody
who avoids it would want to know it left rather than to find it absent and
assume they misremembered. It is also the only ingredient in this file whose
removal a reader might not believe without being told.

**The moisture row is here on its own merits, not as a rounding.** Four points
of water is not a transcription slip, and moisture is the divisor for every
dry-matter figure the consumer app derives: at 78% the dry matter is 22% of the
tin and at 74% it is 26%, so a 10% protein guarantee reads as 45% dry-matter
protein on the retailer's number and 38% on the deck's — about 18% apart, off a
difference that looks like nothing. A figure that only *looks* like a small
difference is
worth an entry precisely because it will not look worth one next time.

**Where this came from:** batch 014.

### B13. A maker disagreeing with itself by one kilocalorie (5)

The signature conflict of the first Hill's batch, and a kind Purina never
produced: Hill's own product page and Hill's own back-label image state the
same kcal/kg and a **different kcal/can**, always by exactly one.

| UPC | Product | Page | Label | kcal/kg × 0.156 kg |
|---|---|---|---|---|
| `052742661001` | Science Diet Adult — Liver & Chicken Entrée | 156 | **157** | 156.6 |
| `052742453606` | Science Diet Adult — Savory Salmon Entrée | 171 | **172** | 171.8 |
| `052742177908` | Science Diet Adult 7+ — Tender Tuna Dinner | 146 | **147** | 146.6 |
| `052742462806` | Prescription Diet i/d — Chicken Pâté | 171 | **172** | 171.6 |
| `052742177601` | Science Diet Adult 7+ — Tender Chicken Dinner | 167 | **168** | 167.9 |

**Rule 4 settles all five in the same direction, which is what makes them one
entry rather than five.** Every page figure is the true value truncated; every
label figure is it rounded. That is not two sources disagreeing about a fact —
it is one fact and two rounding conventions, and the web renderer is the one
throwing the fraction away.

**Stored: the label.** By rule 1, but here rule 4 agrees independently, which
is worth more than the precedence rule on its own.

**Worth recognising on sight next time.** A one-kcal gap on an identical
kcal/kg is not evidence of a reformulation and does not need investigating as
one. Multiply the kcal/kg by the net weight: if the page is the floor and the
label is the round, it is this, and there is nothing to decide.

### B14. A maker's own renderer mangling its own list (2)

Not a disagreement about ingredients — a disagreement about typography, from
one source that cannot be read literally.

| UPC | Product | What Hill's HTML does |
|---|---|---|
| `052742617404` | Science Diet Kitten — Savory Turkey Entrée | collapses spaces inside names: "SoyProtein Isolate", "ChickenLiver Flavor" |
| `050000428748` | *(Purina, see B9)* | substitutes Vegetable Glycerin for the deck's Vegetable Oil |

**Stored: the label transcription, spaces restored.** A missing space is not a
spelling a maker chose, and copying it through would put a word in the catalog
that appears on no can — findable by nobody searching for either real word.

Filed beside the Purina glycerin case on purpose. Both are the *manufacturer's
own website* misrepresenting the manufacturer's own deck, which is the failure
mode rule 1 is least intuitive about: the instinct is that a maker's site is
authoritative because it is the maker's. It is authoritative about the product
and unreliable about the string.

### B16. A maker's own page reordering its own list (1)

| UPC | Product | Hill's page text | Back label + flat graphic |
|---|---|---|---|
| `052742068138` | Prescription Diet c/d Multicare Stress — with Chicken | **Brewers Rice**, then Chicken; "Corn Protein Meal" | **Chicken**, then Brewers Rice; "Corn Gluten Meal" |

**Stored: the label.** Two independent assets on Hill's own page — the printed
back label and a flat ingredient graphic — agree with each other against the
page's running text.

**The order is the fact here, not a presentation choice.** American labels are
printed in descending weight, so chicken-first and rice-first are two different
statements about what the tin mostly is, and it is the whole question somebody
scanning a prescription food is asking. This is the same website that produced
B14's collapsed spaces and B13's truncated calories: three distinct ways for
one renderer to be wrong about a deck it links to on the same page.

**Where this came from:** batch 016.

### B17. Dry food — the colour reformulation, again (13 barcodes, 4 products)

The Fancy Feast dry range repeated exactly what the Friskies Indoor wet range
did in B10: retailer panels still carry a coloured formula with corn *gluten*
meal, while Purina's current page links an October 2024 deck with corn *protein*
meal and no colours.

| Product | Current deck | What retailers still show | Barcodes |
|---|---|---|---|
| Fancy Feast Gourmet Dry — Savory Farm-Raised Chicken & Turkey | G650024 | corn gluten meal, artificial colors | `050000462896` `050000463008` `050000463114` `050000576227` |
| Fancy Feast Gourmet Dry — Filet Mignon Flavor With Real Seafood & Shrimp | G650124 | corn gluten meal, Yellow and Red dyes | `050000572908` `050000572830` `050000572854` `050000576241` |
| Fancy Feast Gourmet Dry — Ocean Fish & Salmon with Garden Greens | G650224 | corn gluten meal, Blue/Yellow/Red dyes | `050000467150` `050000463916` `050000580743` |
| Fancy Feast Kitten — Savory Chicken & Turkey | B512723 | A512722: chicken by-product meal, corn gluten meal, beef fat | `050000660681` `050000660667` |

**Stored: the decks.**

**"Corn gluten meal" → "corn protein meal" is a rename, not a reformulation.**
Same ingredient, and Purina has been relabelling it across ranges. It is listed
here because it appears in the same diff as the colour removal and it would be
easy to read the pair as one change; a reader comparing an old panel to ours
should know that only one of the two differences is about what is in the bag.

**Where this came from:** batch 017.

### B18. Purina's ingredient tiles against Purina's own deck (20 barcodes)

Every Friskies dry product in batch 017 carries this. Purina's shop pages render
the ingredient list as a grid of tiles, and the tiles are in a different order
from the deck the same page links — on Surfin' & Turfin' it is phosphoric acid
and calcium carbonate that move; on Seafood Sensations it is several at once.

| Product | Deck | Barcodes |
|---|---|---|
| Seafood Sensations — Salmon, Tuna, Shrimp & Seaweed | K600323 | `050000015474` `050000575770` `050000168866` `050000290833` `050000963584` |
| Surfin' & Turfin' Favorites — Chicken, Ocean Whitefish, Salmon & Filet Mignon | N600123 | `050000100347` `050000576692` `050000294701` `050000290215` |
| Tender & Crunchy Combo — Chicken, Beef, Carrots & Green Beans | J600425 | `050000084500` `050000575787` |
| Indoor Delights — Chicken, Salmon, Peas & Carrots | J600224 | `050000051472` `050000376407` |
| Land & Sea Adventures — Chicken & Ocean Fish | A508223 | `050000259373` |

**Stored: the deck.** On Seafood Sensations and Surfin' & Turfin' a Target label
panel independently agrees with the deck against the tiles, which is what makes
this settled rather than a coin toss. On Land & Sea the tiles drop corn protein
meal near the START of the list and flatten the premix blocks — an omission
high up, where position carries the most weight.

**Order is the whole content of an American ingredient list** — descending
weight — so a reordered list is a different claim about the food, even with the
identical set of words. This is B16 at scale: the same renderer, the same fault,
across twenty barcodes instead of one.

Two of these carry a second, separate note:

| UPC | Product | The other disagreement |
|---|---|---|
| `050000168866` | Seafood Sensations, 17.6 lb | that size's retailer panel is a legacy formula with **crab meal**; Purina still lists the size and links current deck K600323 |
| `050000290833` | Seafood Sensations, 22 lb | ShopRite's panel is an older generation of the same range |

And one is a formula fork rather than an ordering:

| UPC | Product | Tiles | Linked deck J600224 *(stored)* |
|---|---|---|---|
| `050000051472` `050000376407` | Indoor Delights | materially different order and composition; 3382 kcal/kg, 365 kcal/cup | 3410 kcal/kg, 368 kcal/cup |

**Where this came from:** batch 017.

### B19. A size only the maker disagrees about (1)

| UPC | Product | Purina's size selector | Five retailers *(stored)* |
|---|---|---|---|
| `050000084500` | Friskies Tender & Crunchy Combo | 3.5 lb | **3.15 lb** |

Rakuten, Petco, Kroger, Chewy and Walmart all identify this barcode as 3.15 lb.

**This is the one place a retailer outranks the maker in this file, and the
reason is not a rule but a count.** Rule 1 ranks sources by how close they sit
to the printed pack, and a size selector on a shop page is not a printed pack at
all — it is the same HTML layer that produced B18's reordered tiles on the same
site. Against it are five independent listings that agree to two decimal places.

Rule 4 cannot help: the calorie statement is per cup, so there is no arithmetic
tying kcal to the weight of a bag. See D6.

**Where this came from:** batch 017.

### B20. Treats — an abbreviated declaration (7 barcodes)

Both Friskies Party Mix products, across all seven barcodes. Purina's tiles
abbreviate and re-case printed terms — "Dried Yeast" among them — where the
linked deck gives the full declaration. Several retailer panels for Beachside
are older still, carrying corn gluten meal or premixes that are not grouped.

| Product | Deck | Pouches | Canisters |
|---|---|---|---|
| Party Mix Original Crunch | I619223 | `050000238910` `050000575848` | `050000963089` `050000500413` |
| Party Mix Beachside Crunch | I619023 | `050000574438` `050000576999` | `050000963102` |

**Stored: the decks**, and for Party Mix that means *two* decks per product —
see E5, which is about the pouch and the canister printing the same recipe
differently.

**Where this came from:** batch 017.

### B21. Hill's page rounding, twice more (2)

B13 again, on two more products, and by now it is a habit rather than a fault
worth investigating each time.

| UPC | Product | Page | Label *(stored)* |
|---|---|---|---|
| `052742176901` | Science Diet Kitten — Tender Chicken Dinner, 5.5 oz | 1095 kcal/kg · 170 kcal/can | **1133 kcal/kg · 177 kcal/can** |
| `052742007175` | Science Diet Kitten Healthy Cuisine — Tender Chicken & Rice Medley | 70 kcal/can | **71 kcal/can**, same 898 kcal/kg |

The second is the ordinary one-kcal truncation from B13. **The first is not**,
and is the reason this is a separate entry: the two sources disagree on
kcal/**kg** as well, 1095 against 1133, which no rounding produces. That is two
formulas or two generations of one, and the label is stored because the same
image carries the current ingredient deck and SKU 1769.

**Where this came from:** batch 018.

### B22. A guaranteed-analysis graphic missing the life stage (2)

| UPC | Product | The fault |
|---|---|---|
| `052742041483` `052742041568` | Science Diet Adult 7+ Perfect Digestion — Chicken & Barley, 6 lb and 3.5 lb | the GA image embedded on the Adult 7+ page omits "7+" from its own heading |

Everything else on that page — metadata, item name, ingredient statement,
back-bag image, sizes and SKUs — identifies the Adult 7+ product, so the panel
is read as belonging to the page that embeds it and nothing else.

**Worth an entry because of what it would cost to be wrong.** Adult and Adult 7+
Perfect Digestion are different decks sold beside each other, and a panel
borrowed from the wrong one would put an adult formula's numbers on a senior
product with nothing on the page looking odd. The rule applied — *a panel means
what the page embedding it means, and is not evidence about any other page* —
is worth having written down before the next graphic arrives unlabelled.

**Where this came from:** batch 018.

### B15. A maker's own stale marketing asset (1)

| UPC | Product | Gallery graphic | Can-back label (code 6111) |
|---|---|---|---|
| `052742611105` | Hill's Science Diet Adult Indoor — Ocean Fish Entrée, 5.5 oz | fat **min 3.5%**, fibre **max 2.0%** | fat **min 2.0%**, fibre **max 4.5%** |

A standalone guaranteed-analysis image still linked from Hill's own product
gallery, against the current can-back panel on the same page — whose ingredient
deck matches the live list, which is what identifies it as the current one.

**Stored: the can-back label.**

**This one is not a rounding and not a transcription slip.** The two figures
essentially swap places, and a fat minimum moving 3.5 → 2.0 while fibre moves
2.0 → 4.5 is a reformulated food, not a mistyped one. The gallery image is an
older pack's panel that nobody unlinked.

Worth its own entry because of where it was found: not on a retailer's site and
not in the page's text, but in an *image* on the correct page, which is the
last place a check would look and the first place a person would trust.

**Where this came from:** batch 015.

---

## C. Barcodes that belong to something else (10)

**The list lives in [`data/wrong-barcodes.ts`](../data/wrong-barcodes.ts)**, not
in this file and no longer in a test. Three things read it: the test that
refuses to file any of them as a package, `scripts/check-batch.mjs` which warns
before a batch is typed in at all, and this section for a person.

It moved there because of a gap the checker found on its first real use. The
list had been sitting inside `lib/known-import.test.ts`, so the batch checker
looked at `050000962648` — a code that had been on that list for three
batches — and said "ok". **A check that knows less than the repository does is
a check somebody will trust and should not.**

Every code in it passes its own UPC-A check digit and appears in real listings.
Nothing about the number says it is wrong.

Three are confirmed cases. Seven arrived labelled "case candidate" by the source
and are unconfirmed; they stay off the single tin either way, because an
unconfirmed case code is still not evidence that it IS the tin.

### A code can leave the list

`050000962648` sat there as "the White Meat Chicken Primavera **Paté** — do not
file it against the silky-broth version". That was right about what the code
was and wrong about what to do with it. The paté is a real product; when its
deck arrived in batch 011 it was seeded like any other.

What survives is the warning that the two are different tins, and it is now
stronger than a ban: **both are seeded**, and a test asserts both exist and that
their ingredient lists differ. `CONFUSABLE_PAIRS` in the same file is where that
kind of hazard goes — not a code to avoid, two codes to keep apart.

| Pair | Why they are confusable |
|---|---|
| `050000574582` / `050000962648` | Fancy Feast Medleys White Meat Chicken Primavera exists twice: a silky broth with tender pieces, and a paté. Same flavour name, different texture, different formula. |
| `050000292615` / `050000434640` | **Chicken Hearts & Liver Feast in Gravy** exists twice, with the same name to the letter: once in Gravy Lovers as chunks, once in Sliced as slices. Different decks, different guarantees — 9% protein against 11%. The only thing telling them apart is the range. |

A case code attached to a single tin gives the right ingredients under the wrong
barcode. A **sibling product** code gives the wrong ingredients under a
plausible barcode, and nothing on the page looks odd. The second is the one to
be afraid of.

---

## D. Data the model could not hold — closed in batch 018

**All four gaps below are now stored.** `GuaranteedAnalysis` gained an `extras`
list — `{ nutrient, basis, value, unit }`, as printed — in both repositories,
and the fifty-two products that print something the eight named fields could not
hold now carry it. The panel shows each with its own unit, and the report's
model is given them.

The entries are kept rather than deleted because each is the argument for the
shape, and because the shape is the thing to defend next time: the tempting fix
each time was a new named column, and four named columns would have been four
rounds of coordinated change across two repos to hold figures that are never
compared, converted or derived from. What stays named is what IS derived from —
`moistureMax` divides every dry-matter figure, `ashMax` makes carbohydrate
possible.

One thing did NOT change: none of these figures is converted to a dry-matter
basis, and the panel shows no dry-matter column for them. A vitamin E minimum in
IU/kg is not a share of the pack, so dividing it by dry matter would produce a
number with no referent.


### D1. Calcium guarantee — 3 products, STORED in batch 018

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
"kitten" | "adult" | "senior" | "all"` now exists on `KnownProduct`. It is
optional and absent means the deck stated none; reading "adult" out of silence
would turn an absence into a claim.

The two cases that made a field necessary rather than a naming convention:
Gourmet Naturals sells a kitten paté inside an otherwise adult range, and
Friskies Shreds Whitefish & Sardines (`050000579907`) is approved for kitten
growth *and* adult maintenance in a range where everything else is adult.

**`senior` was added in batch 014 and is a different kind of value.** AAFCO
recognises growth, maintenance and all-life-stages — there is no senior
category, and a Senior 7+ tin states *maintenance* on its own panel. So the
field is recording the range printed on the front, not a nutritional claim
anybody made. That is worth having: a shopper looking at a Senior 7+ can is
choosing it for the age on the label. But it is the one value here not backed by
an AAFCO statement, so a test pins it to the range that prints it.

### D3. Vitamin E in IU/kg — 2 products, STORED in batch 018

Two Senior 7+ decks guarantee **Vitamin E (min) 40 IU/kg** and it is not stored:

- `050000503827` Fancy Feast Senior 7+ — Chicken Feast Classic Pâté
- `050000503841` Fancy Feast Senior 7+ — Beef Feast Classic Pâté

The same shape as D1 and the same two-repo fix, with one extra problem that D1
does not have: **the unit is not a percentage.** `GuaranteedAnalysis` holds six
figures that are all percentages of the tin, and every consumer of it — the
dry-matter conversion, the panel, the comparison — assumes that. 40 IU/kg is a
count of activity units per kilogram, and there is no conversion to a percentage
that does not invent an assumption, because IU is defined against a reference
compound rather than a mass.

So adding it is not adding a seventh percentage. It needs a field that carries
its own unit, and the dry-matter column has to leave it alone rather than divide
it by 0.26 — which is exactly the sort of thing that happens quietly if the
figure is stored as a bare number next to six that behave differently.

**Worth doing anyway, together with D1.** Both are guarantees on packs sold for
a life stage: calcium on kitten food, vitamin E on senior food. They are the
figures a buyer chose that pack for, and dropping them silently is worse on
these two ranges than anywhere else in the catalog.

Hill's adds a third product to this one — `052742454108` Science Diet Adult 7+
Savory Chicken, at 15 IU/kg — and an ascorbic-acid minimum printed in **ppm**,
which is a third unit again.

### D4. Ash and taurine — every Hill's product, and not a gap in the research

`052742068473` and the other nineteen Hill's cans state **no ash guarantee and
no taurine guarantee**. All twenty. This is not something the research missed;
it is what Hill's prints.

It is recorded here because of what it costs, which is invisible from the data:

- **No carbohydrate figure on any Hill's product.** Carbohydrate is derived by
  difference and needs all five of protein, fat, fibre, moisture and ash. The
  consumer app already refuses to guess without ash, which is right — but the
  result is that a reader comparing a Hill's can against a Fancy Feast one gets
  a carbohydrate row on one and not the other, with nothing on the page saying
  why.
- **No taurine row either**, on cat food, where an absent taurine guarantee is
  itself treated as a signal elsewhere in the report.

**Nothing to fix in the model** — `GuaranteedAnalysis` already allows null for
both, and `ga()` was widened in batch 015 to accept a null ash. The open
question is a *presentation* one: whether the panel should say "the label does
not state this" where a maker prints nothing, rather than leaving a row out and
letting absence read as an oversight.

**Do not be tempted to fill these in.** A plausible ash would make the
carbohydrate row appear, and that row would then be a number derived from an
invention, presented identically to a hundred and sixty derived from labels.

### D5. Fibre stated as a MINIMUM — STORED in batch 018

`052742453101` Hill's Science Diet Adult Hairball Control guarantees **Crude
Fiber (min) 2.0%** — in addition to the maximum every other product states.

`GuaranteedAnalysis` has `crudeFiberMax` and no minimum, which is the right
default: fibre is bulk, and a maximum is what nearly every maker prints. But on
a hairball formula the *minimum* is the point of the product — it is the reason
somebody buys that can rather than the ordinary one — and it is the figure the
catalog cannot hold.

Same two-repo change as D1 and D3. Lower priority than either, on one product
so far, but it will recur on every hairball and weight range we seed.

---

### D6. Everything a bag prints that a tin does not — STORED in batch 018

Dry food arrived in batch 017 and brought a panel several times richer than any
can's. What the model holds is protein, fat, fibre, moisture, ash, taurine and
calories. What a Friskies bag prints, beyond those:

- **Linoleic acid** and **arachidonic acid** minima (percent) — on all 20
- **Calcium** and **phosphorus** minima (percent) — on all 20, which is D1's
  field again, now wanted by twenty more products
- **Zinc** and **selenium** in **mg/kg**, **Vitamin A** and **Vitamin E** in
  **IU/kg** — a third and fourth unit, as in D3
- **DHA** on the Fancy Feast Kitten bags — the figure that range is sold on

And two that are their own problem:

**A printed carbohydrate.** `050000618958` / `050000619832` Friskies Party
Pack'd states **Total Carbohydrate (calculated) max 47%** on the bag. Everywhere
else in this catalog carbohydrate is something we derive and label as a ceiling.
Here the maker prints their own, and we have nowhere to put it — so the product
shows no carbohydrate at all, because it also states no ash and the derivation
needs one. The one product that publishes the figure is the one that displays
none.

**A whole second column in grams per cup.** The same two bags print every
guarantee twice: 34.8 g protein per cup beside 30% protein, 1.16 g calcium per
cup, and so on. That is the caloric-basis idea the consumer app already
implements from kcal — the maker has done the arithmetic and printed it, and it
is discarded on read.

**This is the entry that became the fix.** Guarantees are now a list of
(nutrient, basis, value, unit) beside the named fields — `extras` — rather than
a seventh, eighth and ninth named column. The seven-field shape had been the
wrong shape four times (D1, D3, D5, D6) before anybody added it up, and dry food
is where it stopped being a small gap.

Stored from these bags: linoleic and arachidonic acid, calcium, phosphorus,
zinc and selenium in mg/kg, vitamins A and E in IU/kg, DHA, and Party Pack'd's
printed carbohydrate. **Not** stored: the per-cup column, which is the same
guarantee measured against a serving — one number twice is not two figures.

### D8. Omega-6 and omega-3 — STORED in batch 018

Fifteen products in batch 018 print **Omega-6 Fatty Acids (min)** and eight of
them **Omega-3 Fatty Acids (min)** as ordinary percentages, beside the six
figures the model holds.

Different from the rest of section D in one way that matters: these are already
percentages of the pack, so they need no new unit — they are the plainest
possible case for the (nutrient, basis, value, unit) list D6 argues for, and the
cheapest to add if that ever happens.

Worth noticing where they turn up: Sensitive Stomach & Skin and Healthy Cuisine,
which are ranges sold *on* coat and skin condition. As with the hairball fibre
minimum in D5, the figure the catalog drops is the one the product is bought
for.

### D7. Crude fibre, absent — still absent, and correctly so

`050000618958` / `050000619832` Party Pack'd print a **Dietary Fiber** maximum
of 12.5% and no crude fibre figure at all. Stored as null.

Worth its own line because the tempting move is obvious and wrong: there is a
fibre number right there on the bag. Dietary fibre counts soluble fractions that
the crude method destroys, so 12.5% dietary sits beside 2–3% crude on other bags
of similar food. Copying it into `crudeFiberMax` would make this product read as
five times more fibrous than its siblings, on a comparison the reader would have
no way to know was between two different measurements.

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

### E5. One product, two decks, because two packages — batch 017

Friskies Party Mix is sold in a foil pouch and a screw-top canister, and the two
print the same recipe differently:

```
pouch     …, niacin (Vitamin B-3), …, L-ascorbyl-2-polyphosphate (Vitamin C), …
canister  …, niacin,               …, L-ascorbyl-2-polyphosphate,             …
```

Same substances, same order, same count. Only the parenthetical glosses differ,
and the source states outright that the declaration is package-format-specific.

**Both are stored, each against its own barcodes** — §4's rule is copy, do not
tidy, and picking one gloss for all four codes would be writing a label for two
packages that print another.

**What this cost, which is the part worth recording.** The test asserting that
every pack size of a product carries one composition had just been written, one
batch earlier, on the assumption that a recipe has one string. It does not. The
test now strips parentheticals from both sides before comparing, which asks the
question that actually matters — *is this the same food* — and stripping is the
safe direction: it can only make two lists look more alike, so a pass may be a
notation difference but a failure is always a real one.

### E6. Hill's pouches carry "(Pouch)" in the variant — batch 018

A Hill's 5.5 oz can and a 2.8 oz pouch under the **same flavour name** hold
different formulas:

| Product | Can | Pouch |
|---|---|---|
| Adult 7+ Tender Tuna Dinner | 7.5% protein, 2.5% fat, 940 kcal/kg | 7.0%, 2.2%, 903 kcal/kg |
| Adult 7+ Tender Chicken Dinner | 7.5%, 2.5%, 1076 kcal/kg | 6.5%, 3.0%, 968 kcal/kg |
| Adult Tender Ocean Fish Dinner | 7.8%, 2.5%, 1060 kcal/kg | 7.5%, 2.0%, 921 kcal/kg |
| Adult Tender Tuna Dinner | 8.0%, 2.5%, 1040 kcal/kg | 7.0%, 2.5%, 934 kcal/kg |
| Kitten Tender Chicken Dinner | 8.0%, 3.0%, 1133 kcal/kg — **Soy Protein Isolate** | 8.0%, 3.0%, 901 kcal/kg — **Modified Rice Starch** |

Five independent signals disagree, and on the Kitten pair an ingredient is
substituted outright. **Two products by rule 2**, not one recipe in two
packages.

Our identity is brand + line + variant, so the two need different variants, and
the only thing that distinguishes them is the package. Hence "(Pouch)" — a
parenthesised description, not a claim about the maker's wording.

**Applied to all thirteen pouches, not only the six that collide today.** Six
of these pouches share a name with a can we already hold; the other seven have
no canned sibling yet. Suffixing only the six would be a rule with an exception
somebody has to look up, and the first new can would silently create a seventh
collision — the failure mode being avoided rather than a hypothetical one.

**Revisitable, and here is what would change it:** if Hill's turns out to print
a distinguishing word of its own on the pouch, that word replaces this one. The
research found none — Hill's product names are identical, letter for letter.

### E7. One variant that is a pack format, not a flavour — batch 018

`052742010229` Science Diet Adult Urinary Hairball Control, 5.5 oz, is stored
with the variant **"Canned"**.

That is not a flavour, and it is not satisfying. The product genuinely has no
flavour name: Hill's calls it "Science Diet Adult Urinary Hairball Control Cat
Food" and nothing more, and distinguishes it on its own site only by the URL
ending `-canned`. The range already holds two 2.9 oz stews with real flavour
names, so "Canned" does not even separate it from its siblings well.

**Stored as the source gave it rather than as something invented.** The
alternatives were to make up a flavour from the ingredient list — the deck opens
Water, Chicken — or to leave the variant empty, and the first writes a label
nobody printed while the second breaks the identity the catalog is keyed on.

**What settles it:** the physical can. This is the only entry in section E that
wants a shop trip.

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
