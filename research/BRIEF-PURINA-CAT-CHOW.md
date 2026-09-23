# Assignment: Purina Cat Chow

You are researching **one brand: Purina Cat Chow.** Nothing else. Nestlé
Purina owns at least eight brands in this catalog, three of them seeded to 217
products between them, and this assignment covers exactly one — §3 is the
boundary and it is the part of this job most likely to go wrong.

`research/AGENTS.md` is the binding contract. Read it first. §7–§11 of
`research/BRIEF-REVEAL.md` (vocabularies, guarantee format, identity rules,
multipack rules) apply unchanged. `research/BRIEF-PURINA-ONE.md` §4 (size
ladders, the two opposite mistakes) and §6 (calories per cup) apply word for
word: this is the same maker, the same shelf and the same shape of product.

This is brand **#2** in `docs/CURATION-QUEUE.md`.

**This brief covers barcodes AND formulas in one pass.** That is unusual here
and §5 is why.

---

## 0. Which kind of session you are

**Web access** means opening manufacturer and retailer *pages*, not seeing
search results. If you have a shell:

```bash
for h in www.purina.com www.chewy.com www.walmart.com www.target.com; do
  printf '%-20s %s\n' "$h" "$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$h/")"
done
```

**A shell** lets you run the two commands in §1 and commit the ledger
normally. Without one, a finished batch becomes a file you cannot write —
`AGENTS.md` §3a. Write only the new records, as a bare JSON array, to
`research/incoming/purina-cat-chow-batch-NN.json`, say so, and stop. Do not
build a temporary Actions runner; that has been tried three times here and
cost more than any research mistake in this repository.

Say in your handoff which of the two you had.

---

## 1. The two commands

```bash
node scripts/brand-inventory.mjs "Purina Cat Chow" > research/INVENTORY-PURINA-CAT-CHOW.md
node scripts/check-ledger.mjs research/deep-research-purina-cat-chow.json
```

The checker must exit 0. ERROR blocks seeding; WARN is a question to answer in
`conflicts` or `verification_notes`.

---

## 2. What the catalog holds

**Nothing for Cat Chow.** Zero products, zero barcodes, five named ranges —
Complete, Indoor, Naturals, Gentle, Hairball — all empty.

But this is the most-travelled maker in the repository, and almost everything
that made the last brand expensive is already solved here:

| | Iams (the last campaign) | Purina Cat Chow |
|---|---|---|
| Ingredient panels | rendered as IMAGES | **published as label-deck PDFs, in text** |
| GS1 prefix | none on file, derived from packs | `050000` and `017800` both proven |
| Vitamin blocks | written from scratch | **13 constants already in `data/known-formulas.ts`** |
| Ranges in the seed file | one deleted, one added | five already named |
| Maker entry in the app repo | **missing entirely** | Nestlé Purina present |

Fourteen of this catalog's first batches were Purina. The engine knows this
maker.

---

## 3. The brand boundary, which is the whole risk

Nestlé Purina is **eight separate rows** in `data/us-pet-brands.ts`, and three
are already seeded:

| Brand | Seeded | Why it is not Cat Chow |
|---|---:|---|
| **Fancy Feast** | 142 | Cat, wet, prefix `050000` |
| **Friskies** | 70 | Cat, prefix `050000` |
| **Purina ONE** | 6 | Cat and dog, prefix `017800` |
| **Pro Plan** | 5 | Prefix `038100` |
| **Beyond** | 0 | Purina's natural line, Petco-legal |
| **Purina Dog Chow** | 0 | Brand #3 in the queue. Not yours. |
| **Alpo** | 0 | Brand #5 in the queue |
| **Merrick** | 58 | Purina-owned, keeps prefix `022808` |

**The rule is the pack, not the parent.** A product belongs in this ledger
when the front of the bag says CAT CHOW.

### The trap that will actually catch you

**`Kitten Chow` is a `line` of the brand `Purina`, not of Cat Chow.**

```ts
{ name: "Purina", ..., lines: ["Moist & Meaty", "Kit & Kaboodle", "Puppy Chow", "Kitten Chow"] }
```

That is a modelling decision this repository already made, and it is the one
place where the shelf and the seed file disagree in a way you can walk into
without noticing: a bag of Purina Kitten Chow looks exactly like a bag of Cat
Chow for kittens, and it is a different brand row.

If you find a kitten product whose bag prints **CAT CHOW**, it is yours, and
`lifeStage: "kitten"` is the field for it. If the bag prints **KITTEN CHOW**,
it is not yours — name it in the handoff and leave it.

---

## 4. The gate: a manufacturer deck is enough, on its own

**Read this section before you research anything, because the last campaign
lost a day to not having it.**

The Iams campaign captured 114 complete panels and then promoted **zero** of
them, holding every one at `needs_physical_label` because a single retailer's
panel "is not proof". No other campaign in this repository has used that bar,
and the numbers say so:

- **124 of Blue Buffalo's 133 `source_verified` records name a RETAILER** as
  the formula source. One of them reads, in full: *"Current 3 oz retail label
  transcription from State Line Pet Supply, corroborated by current Chewy."*
- **Seven of the seventeen ledgers here hold ZERO label deck codes** and are
  `source_verified` anyway — Royal Canin's dogs 180 of 180, Weruva 133 of 133,
  Sheba 20 of 20.

So, concretely, for this brand:

**A current Purina label-deck PDF for the exact product is sufficient evidence
for `source_verified`.** It is a manufacturer source under `AGENTS.md` §6
priority 2, it carries the complete ingredient statement, the complete
guaranteed analysis, the calorie statement and the AAFCO adequacy statement,
and it is the same evidence the first fourteen batches of this catalog were
built on. **You do not need a second witness for it.** Pair it with a retailer
or distributor page that binds the exact UPC to the exact printed size, and the
record is finished.

What still forces `needs_physical_label`:

- no deck for that exact product, only a retailer's transcription of one;
- two sources that disagree on the ingredient ORDER (see §6 of
  `docs/CATALOG-CONFLICTS.md` — two differing lists are two formulas);
- an individual-unit UPC you could not prove;
- anything illegible.

`candidate` is for a lead you could not finish.

**Do not invent a stricter gate than this section — and do not read that as
licence to promote without the evidence.** They are different failures and
this repository has now made both. The Iams campaign captured 114 complete
panels and promoted zero, which cost two extra passes. The Beneful campaign
promoted 85 of 89 records, 42 of which had no ingredient list, no guaranteed
analysis or no calories captured at all — and ten of which had the deck's URL
sitting in the ingredients field. That cost a correction pass and ten rejected
barcodes.

The gate is not a judgement call. §10 lists what must be **captured**, and a
record either has those fields filled from a source you read or it does not.
Promote every record that has them. Leave `needs_physical_label` on every
record that does not, however good the lead looks. If you think §10 itself is
wrong, say so in the handoff — do not settle it by moving a status.

---

## 5. Where the decks are, and why this is one pass instead of three

Purina publishes its label decks as PDFs at a stable path:

```
https://www.purina.com/sites/default/files/product-label-deck-file/<YYYY-MM>/<code>_<slug>_ga<n>.pdf
```

Two real examples already cited in this repository's ledgers:

```
.../2024-09/6081_i608123_friskies_indoor_chunky_chicken_turkey_casserole_..._ga4.pdf
.../2024-09/6087_j608723_friskies_indoor_meaty_bits_saucy_seafood_bake_..._ga5_1.pdf
```

**94 such URLs are already cited** across `research/deep-research-barcodes.json`,
`deep-research-pro-plan.json` and `deep-research-purina-one.json`. Read a few
before you start so you know what one looks like.

The deck carries the formula. It does **not** carry the UPC, so the barcode
still comes from a retailer or distributor page that clearly represents one
sellable unit and size. That is the only place a second source is needed, and
it is about identity rather than composition.

This is why the previous brand needed three campaigns and this one needs one:
there, the maker published nothing readable and every panel had to be
corroborated between shops. Here the maker publishes the panel itself.

**The deck filename usually carries the product code**, which is worth
capturing in `label_deck_code` — this maker is one of only two here that print
one, and it is how a future pass tells two generations apart.

---

## 6. Dry bags, size ladders, calories per cup

Cat Chow is almost entirely kibble, so `BRIEF-PURINA-ONE.md` §4 governs. The
two opposite mistakes, restated because both are easy:

1. **One recipe in several bag sizes is ONE product with several barcodes.**
   `packages` takes them all. Purina's bags are the clean case: five sizes, one
   recipe.
2. **Two packs of one flavour are not automatically one product.** Compare the
   panels before merging. The test suite catches a wrong merge; **nothing
   catches a wrong split.**
3. **Calories are printed per CUP**, and a cup is a volume, so the arithmetic
   cross-check in `scripts/check-batch.mjs` is unavailable. Record
   `kcal_per_kg` and the per-cup figure with `unit_name: "cup"`. **Never
   manufacture a per-bag number.** Say in the handoff that the dry rows went in
   without the arithmetic witness.
4. **Panel bounds are per food form.** Dry is moisture 5–20%, protein ≤50%, as
   fed. A 32% protein bag is real; do not adjust data to fit a bound.

If you meet a wet Cat Chow product, its calories are per can and the arithmetic
check is available — use it.

---

## 7. The vitamin block: run the script, do not eyeball it

`data/known-formulas.ts` holds **13 vitamin-block constants** — `V`,
`V_PATE`, `V_E_FIRST`, `V_E_FIRST_A_MID`, `V_NIACIN_FIRST`, `V_NO_K`,
`V_PLAIN`, `V_GEMS`, `V_MEDLEYS`, `V_PATE_SHORT`, `V_SHORT`, `V_PLAIN_K`,
`V_FLAKED_FISH`. That looks absurd for one premix until you notice no two are
the same document: each is an ordering or a notation observed on a real deck.

```bash
node scripts/match-vitamins.mjs "thiamine mononitrate, Vitamin E Supplement, …"
```

It prints EXACT MATCH and the constant to reuse, or the three nearest with the
differing entries named. **Reusing one that is nearly right is worse than
adding one**: nearly right is a label nobody printed.

Two worked examples are in `docs/SEEDING-A-BATCH.md` §4, and the second is why
the script exists: a hand-typed comparison reported five differences where the
real answer was one, because the regex behind it had silently examined eleven
constants while claiming twelve.

This is a seeding-time concern rather than a ledger concern — your job is to
copy the deck verbatim — but capture the block exactly as printed so the
seeding pass can match it.

---

## 8. The prefix is already known, and that is not the same as settled

`data/gs1-prefixes.ts` holds **four** Purina prefixes:

```
050000  Nestlé Purina            (Fancy Feast, Friskies)
017800  Nestlé Purina            (Purina ONE, Alpo)
038100  Nestlé Purina (Pro Plan)
022808  Merrick (Nestlé Purina)
```

The file's own comment says what that means: *"A maker this size runs its
prefixes by business unit, and knowing two of them tells you nothing about the
third."* Pro Plan's `038100` went into its brief as an unconfirmed lead and was
then proved on 18 packages.

So **read Cat Chow's prefix off your own proven barcodes** rather than assuming
`050000`. If all your codes agree on one of the four, say which and on how many
packs. If they land on a fifth, that is a finding: add nothing to the data file
yourself, name it in the handoff.

---

## 9. Where things go

| What | Where |
|---|---|
| Every record | `research/deep-research-purina-cat-chow.json` |
| A batch too large to write whole | `research/incoming/purina-cat-chow-batch-NN.json` — `AGENTS.md` §3a |
| The regenerated inventory | `research/INVENTORY-PURINA-CAT-CHOW.md` |
| Source disagreements | `conflicts` on the record |
| Range, prefix and vocabulary recommendations | the **handoff** — not the data files |
| `data/known-products.ts`, `data/known-formulas.ts` | **not you.** `AGENTS.md` §14 |

`catalog_number` stays `null`. Branch: `claude/brand-curation-database-geiqse`.
Never commit research to `main`.

---

## 10. Batches of twenty

Twenty records, then stop and report.

Order the first batch to be **maximally diagnostic**: two ranges, both dry,
several sizes each. That settles the prefix (§8), the range names, and the
size-ladder rule (§6) in one pass, on the part of the shelf that is most of the
brand.

---

## 11. The handoff

`research/PURINA-CAT-CHOW-HANDOFF.md`, in the shape of
`research/PEDIGREE-HANDOFF.md`, carrying `AGENTS.md` §15 plus:

1. **Capabilities** — web, shell. First sentence, before any count.
2. **`source_verified` count**, out of the total. This is the number the
   campaign is judged on. If it is low, §4 asks you to say why in a sentence
   that does not amount to "a retailer is not proof".
3. **Decks** — how many products had a current label-deck PDF, and how many did
   not.
4. **The prefix** — which of the four, on how many packs, or a fifth.
5. **Kitten Chow** — how many products you left alone because the bag said
   KITTEN CHOW rather than CAT CHOW.
6. **The checker's real exit code**, from a real run.

And every decision where you did something other than what this brief says,
with the reason.

---

## 12. Done

- The checker exits **0** and every WARN has an answer.
- `research/INVENTORY-PURINA-CAT-CHOW.md` was regenerated, not edited.
- Every record whose deck you read is `source_verified`, per §4.
- The prefix question is settled or explicitly open with its evidence.
- The handoff answers all six questions above.

A campaign that returns twenty `source_verified` records with decks behind them
is finished. A campaign that returns twenty `needs_physical_label` records with
the same decks behind them has done the same work and delivered nothing — read
§4 again before you conclude that is the honest outcome.
