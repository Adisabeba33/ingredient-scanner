# Assignment: Beneful

You are researching **one brand: Beneful.** Nothing else.

`research/AGENTS.md` is the binding contract. Read it first.
**`research/BRIEF-PURINA-CAT-CHOW.md` and `research/BRIEF-PURINA-DOG-CHOW.md`
are the siblings of this assignment** — same maker, same label-deck source,
same eight-row brand family, same prefix question. Read both, and treat the
sections below as what is different.

This is brand **#4** in `docs/CURATION-QUEUE.md`, and like #2 and #3 it is
**one campaign, not three.**

---

## 0. What carries over, unchanged

| Where | What it says |
|---|---|
| Cat Chow §0 | Web access and shell; the `research/incoming/` fallback when you cannot commit a whole ledger |
| **Cat Chow §4** | **The promotion gate, in numbers. A current Purina label deck is sufficient on its own — no second witness. Read this twice.** |
| Cat Chow §5 | Where the decks live, the URL shape, and why this is one pass |
| Cat Chow §7 | The 13 vitamin-block constants and `scripts/match-vitamins.mjs` |
| Cat Chow §8 | The four Purina prefixes, and why knowing three tells you nothing about the fourth |
| Dog Chow §6 | Size ladders, one recipe in many bags, calories per cup |
| Cat Chow §9–§10 | Where things go; batches of twenty |

`research/AGENTS.md` §9 now carries **both controlled vocabularies written out
in full** — 26 textures, 10 presentations. Two campaigns in a row wrote
`presentation: "gravy"` where the value is `in_gravy`, and both were caught
only by a later shell pass. Look the value up; do not translate from English.
That matters more here than for either Chow — see §3.

---

## 1. The two commands

```bash
node scripts/brand-inventory.mjs "Beneful" > research/INVENTORY-BENEFUL.md
node scripts/check-ledger.mjs research/deep-research-beneful.json
```

The checker must exit 0.

---

## 2. What the catalog holds

**Nothing.** Zero products, seven named ranges, all empty:

```
Originals   Healthy Weight   IncrediBites   Grain Free
Prepared Meals   Simple Goodness   Superfood Blend
```

Seven is more than either Chow had, and they were written from shelf memory
like everything else in that file. Expect some to be gone and some current
range to be missing — Cat Chow gained `Healthy Aging` and Iams lost
`Minichunks`. Report both directions; **edit neither file yourself.**

---

## 3. What is actually different: this brand is half wet

Cat Chow was dry throughout. Dog Chow was 26 bags and 6 cans. **Beneful is the
first of the three where wet is a serious part of the shelf** — `Prepared
Meals` and `Simple Goodness` are tubs and trays, not bags — and that changes
three things at once.

1. **`texture` and `presentation` stop being `kibble` + `plain`.** They become
   the fields they exist for, and they are where the last two campaigns put a
   defect. The lists are in `AGENTS.md` §9. Texture is what the meat is CUT or
   SHAPED into; presentation is what it is SUSPENDED IN. A stew of chunks in
   gravy is `chunks` + `in_gravy`, never `stew` + `gravy`.
2. **The calorie arithmetic comes back.** A tub states calories per container,
   so `scripts/check-batch.mjs` can check them against the printed net weight
   — unlike a bag, where a per-cup figure is a volume and there is nothing to
   check. Use it on every wet record and **say in the handoff which rows had
   the arithmetic witness and which did not.**
   `docs/SEEDING-A-BATCH.md` §2.2 has three worked cases where a failing
   calorie check meant something real rather than a typo. Read it before
   deciding a mismatch is your error.
3. **`package_type` is a real question.** `tub`, `tray`, `can` and `pouch` are
   different things and the vocabulary holds all four. Beneful Prepared Meals
   is a plastic tub with a peel lid; do not write `can` because the food is
   wet.

**Do not open with the wet range.** Start with `Originals`, which is bags, and
settle the prefix and the range names on the simplest part of the shelf first
— the same order the two Chow campaigns used.

---

## 4. The boundary

The same eight Purina rows. Beneful's neighbours on the dog shelf:

| Brand | Seeded | Why it is not Beneful |
|---|---:|---|
| **Purina Dog Chow** | 32 | Batch 039, prefix `017800` |
| **Purina ONE** | 6 | Both species, prefix `017800` |
| **Pro Plan** | 5 | Prefix `038100` |
| **Alpo** | 0 | Brand #5 in the queue. Not yours. |
| **Beyond** | 0 | Purina's natural line |
| **Merrick** | 58 | Purina-owned, keeps `022808` |
| **Pedigree** | 6 | **Mars**, not Purina at all |

**The rule is the pack, not the parent.** A product belongs here when the
front says BENEFUL.

There is no Kitten-Chow-shaped trap on this brand — Beneful is a standalone
name with no umbrella sibling sharing its words. What there IS: `IncrediBites`
is for small dogs and `Healthy Weight` is a range, and **neither is a life
stage**. `lifeStage` is a separate field and most adult bags state nothing on
the front; reading "adult" out of silence turns an absence into a claim.

---

## 5. The prefix

Four Purina prefixes are on file. `017800` now has three brands behind it —
Purina ONE, Cat Chow, Dog Chow — which makes it the likely answer and **not a
safe assumption**. `data/gs1-prefixes.ts` says in its own comment that this
maker runs prefixes by business unit and knowing three tells you nothing about
the fourth.

Read it off your own proven barcodes. Say which, and on how many packs. If it
is a fifth, that is a finding for the handoff, not an edit.

---

## 6. Treats

`lib/nutrition-role.ts` holds `KNOWN_TREAT_LINES` and **no Beneful range is in
it.** If you find a Beneful treat — biscuits, dental chews, "Baked Delights" —
that is a handoff recommendation: the range name has to reach that module, or
the consumer report judges a bag of snacks for not being a balanced diet.

The ledger writes `food_form: "treat"`; the seeding pass stores
`foodForm: "dry"` and lets that module decide. Do not file a treat as a meal.

---

## 7. Where things go

| What | Where |
|---|---|
| Every record | `research/deep-research-beneful.json` |
| A batch too large to commit whole | `research/incoming/beneful-batch-NN.json` — `AGENTS.md` §3a |
| Leads that do not reach the ledger bar | `research/BENEFUL-CANDIDATES.json`, a bare JSON array or object — **not** a `{records: […]}` wrapper, which would make both scripts read it as a second ledger |
| The regenerated inventory | `research/INVENTORY-BENEFUL.md` |
| Range, prefix, treat-line and vocabulary recommendations | the **handoff** |
| `data/known-products.ts`, `data/known-formulas.ts`, `data/us-pet-brands.ts` | **not you.** `AGENTS.md` §14 |

The parking-lot file is a good habit both Chow campaigns invented
independently. Keep it — and keep it a bare array, for the reason above.

---

## 8. Batches of twenty

Twenty records, then report. First batch: **two dry ranges, several sizes
each.** Prefix, range names and the size ladder settle together, and the wet
shelf waits for batch 2 when you already know what a Beneful pack looks like.

---

## 9. The handoff

`research/BENEFUL-HANDOFF.md`, carrying `AGENTS.md` §15 plus:

1. **Capabilities** — web, shell. First sentence, before any count.
2. **`source_verified` count** out of the total. The number the campaign is
   judged on. If it is low, Cat Chow §4 asks you to say why in a sentence that
   does not amount to "a retailer is not proof".
3. **Decks** — how many products had a current label-deck PDF and how many did
   not.
4. **The prefix** — which, on how many packs, or a fifth.
5. **Wet** — how many wet records, their `package_type` values, and **which
   rows had the calorie arithmetic witness**.
6. **Ranges** — which of the seven you proved, which you never met, and any
   current range the seed file does not name.
7. **Treats** — any found, and whether the range reaches
   `lib/nutrition-role.ts`.
8. **The checker's real exit code**, from a real run.

---

## 10. Done

- The checker exits **0** and every WARN has an answer.
- The inventory was regenerated, not edited.
- Every record whose deck you read is `source_verified` — Cat Chow §4.
- Every `texture` and `presentation` is a value from the lists in §9 of the
  contract, looked up rather than translated.
- The prefix question is settled or explicitly open with its evidence.
- The handoff answers all eight questions above.
