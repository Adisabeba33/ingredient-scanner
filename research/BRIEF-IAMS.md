# Assignment: Iams

You are researching **one brand: Iams.** Nothing else. Mars owns at least
eleven brands in this catalog, two of them already seeded, and this assignment
covers exactly one — §2 is the boundary.

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply here unchanged — read that too rather than having it
repeated here. `research/BRIEF-PURINA-ONE.md` §4 (size ladders, the two
opposite mistakes) and §6 (calories per cup) apply word for word: Iams is the
same shape of business as Purina ONE, a national mid-market brand sold mostly
as dry bags up a ladder of sizes. `research/BRIEF-PEDIGREE.md` §8A is the
Mars-manufacturer task, and it is yours too — §9 below.

This is brand **#1** in `docs/CURATION-QUEUE.md`. Nineteen brands are behind it
and several of them are Mars, so what you settle about this maker is not spent
on one campaign.

---

## 0. Which kind of session you are, and what that changes

Two capabilities decide how this campaign runs, and you have to know which ones
you have **before** you start, not when you are trying to commit 350 KB.

**Web access.** You need to open manufacturer and retailer *pages*, not just
see search results. Search returning titles is not web access. If you cannot
read a product page, `source_verified` is unreachable by definition
(`AGENTS.md` §10) and a ledger of `candidate` rows is a day the seeding step
throws away — that is what happened to the Pedigree batch-1 campaign, 14
records, zero seedable. `docs/RESEARCH-EGRESS.md` is the full story and the
host list. If you have a shell, this is the test:

```bash
for h in www.iams.com www.mars.com www.walmart.com www.petsmart.com www.fda.gov web.archive.org; do
  printf '%-22s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$h/")"
done
```

**A shell.** With one, you run the two commands in §1 yourself, merge into the
ledger and commit normally. **Without one** — working through a GitHub
connector, able only to write a file whole — you hit the limit `AGENTS.md` §3a
exists for. A ledger grows ~6 KB per record, so a finished batch becomes a file
you cannot commit. Do not fight it, and above all do not build a temporary
Actions runner to work around it: that has been tried three times here and cost
more than any research mistake in this repository.

Instead, write **only the new records** as a bare JSON array — no ledger
wrapper, no `schema_version` — to:

```
research/incoming/iams-batch-NN.json
```

Split further if needed (`-batch-NN-a.json`, `-batch-NN-b.json`), say so, and
stop. A shell-enabled pass merges them, runs the checker, regenerates the
inventory and deletes the file. That directory is invisible to both scripts on
purpose; a batch file left directly in `research/` would be read as a second
ledger and every barcode in it would come back `already claimed`.

The Pro Plan campaign (PR #14) was the mirror image of Pedigree's: web access
but no shell, so its inventory was hand-reconstructed and its checker run
simulated. Both were disclosed honestly in the handoff and both were later run
for real. **Disclose the same way.** Say in your handoff which of the two
capabilities you had.

---

## 1. The two commands

Regenerate the inventory before you research anything:

```bash
node scripts/brand-inventory.mjs "Iams" > research/INVENTORY-IAMS.md
```

Run the checker before every commit:

```bash
node scripts/check-ledger.mjs research/deep-research-iams.json
```

ERROR blocks seeding and exits 1. WARN is a question to answer in `conflicts`
or `verification_notes`. A batch is not finished until the checker exits 0 and
every warning has been read.

---

## 2. What the catalog holds: nothing, and no engine knowledge either

Checked file by file before this brief was written:

| File | Iams rows |
|---|---|
| `data/known-products.ts` | 0 |
| `data/known-formulas.ts` | 0 |
| `data/known-multipacks.ts` | 0 |
| `data/wrong-barcodes.ts` | 0 |
| `data/gs1-prefixes.ts` | **no prefix entry** |
| `research/deep-research-*.json` | no ledger exists |
| `docs/CATALOG-CONFLICTS.md` | 0 |

Unlike Pedigree — where `lib/presentation.ts` and `lib/nutrition-role.ts` had
already been taught two textures and a range *before* a single product was
seeded — **nothing in the engine knows this brand.** There is no Iams spelling
to respect and no Iams-shaped decision already made. The one exception is the
brand entry itself:

```ts
{ name: "Iams", owner: "Mars", species: "both",
  lines: ["ProActive Health", "Minichunks", "Healthy Naturals",
          "Perfect Portions", "Advanced Health", "Grain Free Naturals"] }
```

Six ranges, all empty, **all written from shelf memory** — the header of
`data/us-pet-brands.ts` says so of the whole file. Treat that list as a claim
to check, not a specification. §5 is about one entry in it that is probably
wrong.

---

## 3. The brand boundary

Iams sits inside the largest brand house in this catalog, and two of its
siblings are already seeded — one of them to 198 products.

| Brand | Why it is not Iams |
|---|---|
| **Eukanuba** | Mars, separate row in `data/us-pet-brands.ts`, separate shelf position. The closest sibling and the easiest mistake: Eukanuba and Iams were one P&G business and the packs still rhyme. |
| **Royal Canin** | Mars, **198 products seeded**, prefix `030111`. |
| **Pedigree** | Mars, 6 products seeded, its own brief and ledger. |
| **Cesar**, **Temptations**, **Greenies**, **Whiskas**, **Nutro** | Mars, each its own row, each queued separately in `docs/CURATION-QUEUE.md`. |
| **Orijen / Acana** | Mars (Champion), 47 products seeded, prefix `064992` — registered to Champion, not to Mars. |
| **Sheba** | Mars, prefix `023100`, 19 boxes seeded. |

**The rule is the pack, not the parent.** A product belongs in this ledger when
the front of the package says IAMS. Mars ownership proves nothing about which
row a barcode goes in — `data/gs1-prefixes.ts` already documents three separate
cases (Merrick under Purina, Champion under Mars, Royal Canin beside Mars
Petcare) where a maker's prefix does not follow its parent.

### The boundary that will actually cost you time: Iams is two companies

Mars bought the Iams business from Procter & Gamble in 2014 — but **not all of
it.** North America went to Mars; the European rights went elsewhere, and
European Iams has been a separate business with separate formulas since.

This matters concretely:

- A **13-digit EAN** on an Iams pack is a signal, not proof, that you are
  looking at a European product. This catalog is US shelf.
- A European ingredient list is written to EU labelling rules — percentages in
  the ingredient names, "composition" rather than "ingredients", analytical
  constituents rather than a US guaranteed analysis. If a list you are reading
  looks like that, you are on the wrong pack, and no amount of care with the
  rest of the record repairs it.
- The AAFCO nutritional-adequacy statement is the cleanest single tell: a
  European pack has none.

**Record any pack you rejected for this reason** in `verification_notes` of the
nearest record, or in the handoff. The next agent will meet the same pages.

---

## 4. The GS1 prefix is not in the file, and it is not Mars's

`data/gs1-prefixes.ts` has no Iams entry. Until one exists,
`scripts/check-batch.mjs` will call **every row in your batch a failure** — the
twenty-false-failures problem that file's own header documents at length.

Do not reach for `023100` (Mars Petcare US). Three entries in that file say why
not: Merrick keeps `022808` under Nestlé Purina, Champion keeps `064992` under
Mars, Royal Canin sits under `030111` rather than beside Sheba. **A maker this
size runs its prefixes by business unit**, and Iams was a separate company
until 2014 — the prefix it registered then is the prefix its packs still carry
unless something changed them.

So: **read the prefix off your own proven barcodes.** When you have eight or
ten independently bound single-unit UPCs across two or more ranges, the first
six digits will agree, and that agreement is your evidence. Add the entry with
a comment saying it was **observed on N packs, not GEPIR-confirmed** — that is
exactly how `013189` and `856361` are recorded for TheraDiet, and exactly how
`038100` entered the Pro Plan brief before the campaign proved it on 18
packages.

If `gepir.gs1.org` is reachable, settle it there and say so. If it is not,
observed-on-N-packs is an honest entry and a guess is not.

---

## 5. One range in the brand entry is probably not a range

`Minichunks` is listed as one of the six ranges. On the US shelf, **MiniChunks
is a kibble size inside ProActive Health**, not a range of its own — the bag
reads "IAMS ProActive Health Adult MiniChunks". If that is what you find, then:

- the product's `line` is `ProActive Health`;
- "MiniChunks" belongs in `variant`, where the rest of the printed name goes;
- and the brand entry needs `Minichunks` removed, which is a **recommendation
  in your handoff**, not an edit you make silently.

This is the same shape as `research/BRIEF-PURINA-ONE.md` §3 — a range the brand
entry names wrongly — and it is worth ten minutes before you file twenty
products under a heading that is not on any bag.

The mirror risk is larger. Iams has been renaming its US line-up, and ranges on
today's shelf may not be in the six at all — anything the packs show that the
entry does not name must be **added** to `data/us-pet-brands.ts` before it is
used, or `docs/SEEDING-A-BATCH.md` §3 says the products are filed under "Other"
and a whole shelf goes missing from the coverage page. The Orijen campaign
found seven such ranges on real packs and eighteen of its first forty barcodes
sat under them.

**Read the range off the deck and the deck's own filename in the source URL**,
not off a retailer's category heading. Batch 017 filed twenty barcodes as
"Dry Cat Food" because that is what the ledger said, and the real range names
were in the product name all along.

---

## 6. This is a dry-bag brand, and the bags go up a ladder

Most of Iams is kibble, which means `research/BRIEF-PURINA-ONE.md` §4 governs
the whole campaign. The two opposite mistakes, restated because both are easy:

1. **One recipe, several bag sizes, is ONE product with several barcodes.**
   `packages` takes them all. Do not file a 7 lb bag and a 30 lb bag as two
   products. `KNOWN_FORMULAS` is still keyed per barcode and a test checks the
   sizes agree on the recipe.
2. **Two packs of one flavour are not automatically one product.** Hill's sells
   a can and a pouch of the same flavour name with genuinely different
   formulas. Compare the panels before merging. The test suite catches a wrong
   merge; **nothing catches a wrong split**, so this one is on you.

And the calorie rule that follows from it:

3. **Dry calories are printed per CUP**, and a cup is a volume. The arithmetic
   cross-check in `scripts/check-batch.mjs` is simply unavailable — leave the
   kcal columns as `-` rather than inventing a per-bag figure, and **say out
   loud in the handoff that the dry rows went in without the arithmetic
   witness.** `kcal_per_kg` plus `kcal_per_unit: null` with
   `unit_name: "cup"` is the honest record; a per-cup figure in
   `kcal_per_unit` with `unit_name: "cup"` is also fine — what is not fine is a
   manufactured per-bag number.
4. **Panel bounds are per food form.** Dry is moisture 5–20%, protein ≤50%, as
   fed. A 34% protein bag is real. Do not adjust data to fit a bound.

---

## 7. Perfect Portions is the one range that is not a bag, and it has a trap

`Perfect Portions` is Iams's cat wet range, and it is sold as a **twin tray
that snaps in half** — two servings moulded as one unit, opened one at a time.

That is the Fancy Feast Petites case, which this repository has already been
burnt by and written down in `docs/SEEDING-A-BATCH.md` §2.1:

> **`oz` is the weight the calorie figure is about, not always the pack.** A
> Fancy Feast Petites tub is 2.8 oz and states calories per 1.4 oz serving.

So for every Perfect Portions record, settle three separate numbers and do not
let them blur:

- the **printed package size** — what `size` holds, as printed;
- the **serving** the calorie statement is about — that is what you pass to the
  checker as `oz`;
- the **barcode scope** — is the code on the twin tray, on an outer carton of
  several trays, or on a multipack? `AGENTS.md` §7 wants this stated honestly,
  and a carton code filed as a unit UPC is the single most common defect in
  this repository's history.

`unit_name` for these is `"serving"` unless the deck says otherwise, exactly as
Petites uses. `container: "tray"` already exists in the vocabulary.

For `texture` and `presentation`, read `lib/presentation.ts` and use the values
that are there. Iams wet is mostly a paté and mostly a cuts-in-gravy — both
have values already. **Do not invent a near-synonym**;
`docs/SEEDING-A-BATCH.md` §3 has the test for when a new vocabulary value is
justified (does it predict something different?) and three worked refusals.

---

## 8. Treats, and the one module that decides whether the report is fair

Iams sells biscuits and dental chews alongside the food.
`lib/nutrition-role.ts` holds `KNOWN_TREAT_LINES`, and **no Iams range is in
it.** Temptations, Greenies, DentaStix, Milk-Bone and Party Mix are; nothing of
Iams is.

If your research turns up an Iams treat range, that is a **handoff
recommendation**: the range name has to reach that module, or the consumer
report judges a bag of biscuits for not being a balanced diet.
`docs/SEEDING-A-BATCH.md` §2.4 rule 4 is the statement of it — the ledger
writes `food_form: "treat"`, the model stores `foodForm: "dry"`, and the range
name is what carries the distinction.

And the Friskies warning applies here in its own form: **watch for two ranges
one word apart**, where only one of them should be excused from the everyday
standard. A "dental" treat and a "dental care" complete food are not the same
object.

Iams sells no vet-channel diet, so `lib/vet-diet.ts` is not your problem. If
you find one, stop and say so — that is the single worst error available in
this repository.

---

## 9. Two things the other repository is missing

Both go in the handoff as recommendations for `Ingredients.help`. **You do not
edit that repository and you do not edit those files.**

**A. There is no Mars manufacturer entry at all.**
`Ingredients.help/data/manufacturers.ts` holds Nestlé Purina, Hill's, Royal
Canin, Post and others — and **no Mars Petcare**. The header of that file
forbids inheriting an answer from a parent: ownership is not inherited, and
Merrick is documented as deliberately not being given Purina's answers for
exactly this reason.

So an **Iams brand page is blocked** until a Mars Petcare entry exists with its
own five criteria and its own sources — and so are Cesar, Temptations, Greenies
and Whiskas behind it. `docs/RESEARCH-EGRESS.md` names `mars.com` and
`marspetcare.com` as where that material has to come from.

If your research turns up primary Mars material on the five criteria — staff
nutritionist, feeding trials, owns its plants, quality programme, publishes
research — capture it with URLs and a checked-at date, in the shape that file's
entries use. **It is not the main job.** It is a by-product worth minutes that
unblocks five brand pages. This is the same task `research/BRIEF-PEDIGREE.md`
§8A set; if that campaign already gathered it, say so and do not redo it.

**B. Recalls.** `data/recalls.ts` holds Hill's, For All Tails and Royal Canin.
Do not go hunting. If a primary FDA notice for an Iams product crosses your
path, record it the way §8B of the Pedigree brief describes — lot codes and
best-by dates as printed, UPCs if the notice carries them, and the disagreement
between secondary sources settled from the primary page or left open and
labelled. **A recall entry that is confidently wrong about which bag is worse
than no entry.**

---

## 10. Where things go

| What | Where |
|---|---|
| Every record you research | `research/deep-research-iams.json` — one ledger, appended |
| A batch too large to write whole | `research/incoming/iams-batch-NN.json`, a bare JSON array — `AGENTS.md` §3a |
| The regenerated inventory | `research/INVENTORY-IAMS.md` |
| Source disagreements | `conflicts` on the record, and `docs/CATALOG-CONFLICTS.md` when it reaches the catalog |
| A case or sibling code you rejected | the handoff, and `data/wrong-barcodes.ts` only at seeding time |
| Range corrections, prefix entry, treat-line additions, Mars material | the **handoff**, as recommendations |
| The catalog itself | **not you.** `AGENTS.md` §14 — research is staging, seeding is a separate explicit request |

`catalog_number` stays `null`. No range has been reserved for this campaign and
`AGENTS.md` §5 forbids inferring the next number while other agents may be
working.

Branch: `claude/brand-curation-database-geiqse`, which is where this brief was
written. Do not commit research to `main`.

---

## 11. Batches of twenty

Twenty records, then stop and report. Not because twenty is special, but
because the failure this repository keeps meeting is a campaign that researched
for hours and delivered nothing, and a batch that lands is worth more than a
batch that is nearly ready.

Order the batches so the first one is **maximally diagnostic**:

- **Batch 1: two ranges, both dry, several sizes each.** That settles the GS1
  prefix (§4), the range-name question (§5) and the size-ladder rule (§6) in
  one pass, on the part of the shelf that is most of the brand.
- **Batch 2: Perfect Portions**, once you know how the deck states servings
  (§7).
- Everything after that is more of the same.

Do **not** open with the wet range. Its scope questions are the ones most
likely to produce records you later have to re-examine, and you want the
prefix settled first.

---

## 12. The handoff

`research/IAMS-HANDOFF.md`, in the shape of `research/PEDIGREE-HANDOFF.md`, and
it must carry everything `AGENTS.md` §15 requires plus the four questions this
brief opened:

1. **Capabilities** — did you have web access to real product pages, and did
   you have a shell? State this first, in a sentence, before the counts, and
   name anything you simulated or reconstructed by hand.
2. **The prefix** — what the first six digits are, on how many independently
   bound packs, across how many ranges, and whether GS1 confirmed it.
3. **The ranges** — what the packs actually print; which of the six the brand
   entry names are real; whether `Minichunks` survived; what must be added.
4. **Europe** — how many pages you rejected as non-US, and what the tell was.

Plus the standing items: records added and total, UPCs, counts by
`research_status`, unresolved conflicts, anything a physical pack would settle,
commit SHA, and the confirmation that you fetched the remote file back, parsed
it, and matched it against what you intended to write.

**And every decision where you did something other than what this brief says,
with the reason.** Those are the ones worth finding again.

---

## 13. Done

A campaign is finished when:

- `node scripts/check-ledger.mjs research/deep-research-iams.json` exits **0**;
- every WARN has an answer in `conflicts` or `verification_notes`;
- `research/INVENTORY-IAMS.md` was regenerated from the live seed, not edited;
- the GS1 prefix question is settled or explicitly left open with its evidence;
- the handoff answers all four questions above;
- and the ledger's `source_verified` count is a number you would defend to
  somebody holding the bag.

Zero `source_verified` records with an honest explanation is a **better**
outcome than twenty that a blocked proxy produced. Say which one you have.
