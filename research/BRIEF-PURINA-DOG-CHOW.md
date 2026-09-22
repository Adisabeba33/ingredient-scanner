# Assignment: Purina Dog Chow

You are researching **one brand: Purina Dog Chow.** Nothing else.

`research/AGENTS.md` is the binding contract. Read it first.
**`research/BRIEF-PURINA-CAT-CHOW.md` is the sibling of this assignment and
most of it applies unchanged** — same maker, same supermarket shelf, same
label-deck source, same eight-row brand family. Read it, and treat the
sections below as what is different rather than as the whole job.

This is brand **#3** in `docs/CURATION-QUEUE.md`, and like #2 it is **one
campaign, not three**: Purina publishes readable label decks, so the formula
rides along with the barcode.

---

## 0. What carries over from the Cat Chow brief

Read these there; they are not repeated here.

| Section | What it says |
|---|---|
| §0 | Web access and shell, and the `research/incoming/` fallback when you cannot commit a whole ledger |
| §4 | **The promotion gate, in numbers.** A current Purina label deck is sufficient on its own. No second witness. Read this one twice. |
| §5 | Where the decks live, the URL shape, and why this is one pass |
| §7 | The 13 vitamin-block constants, and running `scripts/match-vitamins.mjs` instead of eyeballing |
| §8 | The four Purina prefixes, and why knowing three tells you nothing about the fourth |
| §9–§10 | Where things go; batches of twenty |

`research/BRIEF-PURINA-ONE.md` §4 (size ladders) and §6 (calories per cup)
apply word for word.

---

## 1. The two commands

```bash
node scripts/brand-inventory.mjs "Purina Dog Chow" > research/INVENTORY-PURINA-DOG-CHOW.md
node scripts/check-ledger.mjs research/deep-research-purina-dog-chow.json
```

The checker must exit 0.

---

## 2. What the catalog holds, and the one thing it already knows

**Nothing for Dog Chow.** Zero products, five named ranges — Complete Adult,
Healthy Weight, High Protein, Puppy, Little Bites — all empty.

But `lib/brand-key.test.ts` already carries a test about this brand,
written before a single product was seeded:

> *"Purina ONE and Pro Plan both start with the parent name and both are real
> brands in their own right — the exact match has to win before containment
> ever gets a chance."*

and it asserts that `Purina ONE`, `Purina Pro Plan`, `Purina Dog Chow` and
`Purina` resolve to **four different keys**. The brand entry also carries
`aliases: ["dog chow"]`, so a pack that prints only DOG CHOW resolves here.

That is settled. Do not reopen it, and store what a shopper would name.

---

## 3. The worked example you should copy

`research/deep-research-pro-plan.json` holds **18 dog records and every one of
them is the shape you are about to produce**: all dry, all calories per cup,
all with a `label_deck_code`, all under one prefix.

Read five of them before you write your first record. It is the same maker,
the same species, the same food form and the same evidence path, and matching
its shape is worth more than any amount of care applied differently.

The one thing not to copy: its prefix is `038100`. See §5.

---

## 4. The boundary, and the trap that is sharper here than for cats

Same eight Purina rows as the Cat Chow brief's §3. The dog-side neighbours:

| Brand | Seeded | Why it is not Dog Chow |
|---|---:|---|
| **Pro Plan** | 5 | Prefix `038100`, premium shelf |
| **Purina ONE** | 6 | Both species, prefix `017800` |
| **Beneful** | 0 | Brand #4 in the queue. Not yours. |
| **Alpo** | 0 | Brand #5. Not yours. |
| **Beyond** | 0 | Purina's natural line |
| **Merrick** | 58 | Purina-owned, keeps prefix `022808` |
| **Pedigree** | 6 | **Mars**, not Purina at all — the value bag next to this one |

### `Puppy Chow` versus Dog Chow's own `Puppy` range

The Cat Chow brief warns that `Kitten Chow` is a `line` of the brand `Purina`
rather than of Cat Chow. **The dog version of that trap is worse**, because
this brand has a puppy range of its own:

```ts
{ name: "Purina",          lines: [..., "Puppy Chow", "Kitten Chow"] }
{ name: "Purina Dog Chow", lines: ["Complete Adult", "Healthy Weight",
                                   "High Protein", "Puppy", "Little Bites"] }
```

So a puppy bag can legitimately be either, and the two are different brand
rows. **Read the front of the pack:**

- prints **DOG CHOW**, range Puppy → yours. `line: "Puppy"`,
  `life_stage: "puppy"`.
- prints **PUPPY CHOW** as the brand → not yours. Name it in the handoff and
  leave it; it belongs to the `Purina` umbrella row.

Get this wrong in either direction and a whole shelf lands under the wrong
brand on the coverage page. Count both in the handoff.

---

## 5. The prefix: three are known and none of them is an answer

`data/gs1-prefixes.ts` holds `050000` (Fancy Feast, Friskies), `017800`
(Purina ONE, Alpo), `038100` (Pro Plan) and `022808` (Merrick). Its own
comment is explicit:

> *"A maker this size runs its prefixes by business unit, and knowing two of
> them tells you nothing about the third."*

Pro Plan's `038100` went into its brief as an **unconfirmed lead** and was then
proved on 18 packages. Do the same: read Dog Chow's prefix off your own proven
barcodes, say which of the four it is and on how many packs — or, if it is a
fifth, say that. **Add nothing to the data file yourself**; that is a
recommendation in the handoff.

---

## 6. Dry bags, and bags that go very large

This is a supermarket value brand, so expect a longer size ladder than Cat
Chow's and bags well past 40 lb. The rules, restated because both mistakes are
easy:

1. **One recipe in several bag sizes is ONE product with several barcodes.**
   `packages` takes them all. Purina's bags are the clean case — five sizes,
   one recipe — unlike Hill's, which sells one flavour name in two formats with
   genuinely different formulas.
2. **Two packs of one flavour are not automatically one product.** Compare the
   panels before merging. The test suite catches a wrong merge; **nothing
   catches a wrong split.**
3. **Calories are per CUP.** A cup is a volume and there is nothing for the
   arithmetic to check, so the cross-check in `scripts/check-batch.mjs` is
   unavailable. Record `kcal_per_kg` and the per-cup figure with
   `unit_name: "cup"`. **Never manufacture a per-bag number**, and say in the
   handoff that the dry rows went in without the arithmetic witness.
4. **Panel bounds are per food form.** Dry is moisture 5–20%, protein ≤50%, as
   fed. Do not adjust data to fit a bound.

`Little Bites` is a kibble size sold as a range, which is the opposite of what
the Iams campaign found for "Minichunks" — there it was a size masquerading as
a range and was deleted from the seed file. Check the pack: if DOG CHOW LITTLE
BITES is printed as the range on the front, it is a range and the seed file is
right. If it turns out to be a size inside Complete Adult, say so and
recommend the deletion rather than making it.

---

## 7. Where things go

| What | Where |
|---|---|
| Every record | `research/deep-research-purina-dog-chow.json` |
| A batch too large to commit whole | `research/incoming/purina-dog-chow-batch-NN.json` — `AGENTS.md` §3a |
| The regenerated inventory | `research/INVENTORY-PURINA-DOG-CHOW.md` |
| Source disagreements | `conflicts` on the record |
| Range, prefix and vocabulary recommendations | the **handoff** |
| `data/known-products.ts`, `data/known-formulas.ts` | **not you.** `AGENTS.md` §14 |

`catalog_number` stays `null`. Branch:
`claude/brand-curation-database-geiqse`. Never commit research to `main`.

---

## 8. Batches of twenty

Twenty records, then report. Make the first batch **two ranges, both dry,
several sizes each** — that settles the prefix, the range names and the size
ladder in one pass, on the part of the shelf that is most of the brand.

Leave the Puppy range out of batch 1. Settle the ordinary adult shelf first,
so that when you meet the Puppy/Puppy Chow question in batch 2 you already
know what a Dog Chow pack looks like.

---

## 9. The handoff

`research/PURINA-DOG-CHOW-HANDOFF.md`, carrying `AGENTS.md` §15 plus:

1. **Capabilities** — web, shell. First sentence, before any count.
2. **`source_verified` count**, out of the total. The number the campaign is
   judged on. If it is low, §4 of the Cat Chow brief asks you to say why in a
   sentence that does not amount to "a retailer is not proof".
3. **Decks** — how many products had a current label-deck PDF and how many did
   not.
4. **The prefix** — which of the four, on how many packs, or a fifth.
5. **Puppy Chow** — how many packs you took as Dog Chow Puppy and how many you
   left because the brand on the front was PUPPY CHOW.
6. **Little Bites** — range or kibble size, on the evidence of the pack.
7. **The checker's real exit code**, from a real run.

And every decision where you did something other than what this brief says,
with the reason.

---

## 10. Done

- The checker exits **0** and every WARN has an answer.
- The inventory was regenerated, not edited.
- Every record whose deck you read is `source_verified` — §4 of the Cat Chow
  brief, which is the section this family of campaigns keeps failing on.
- The prefix question is settled or explicitly open with its evidence.
- The handoff answers all seven questions above.
