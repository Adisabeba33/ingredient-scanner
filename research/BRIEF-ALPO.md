# Assignment: Alpo

You are researching **one brand: Alpo.** Nothing else.

`research/AGENTS.md` is the binding contract. `research/BRIEF-PURINA-CAT-CHOW.md`
and `research/BRIEF-PURINA-DOG-CHOW.md` are the siblings of this assignment —
same maker, same decks, same eight-row brand family. Read them.

This is brand **#5** in `docs/CURATION-QUEUE.md`. One campaign, not three.

---

## 1. `research_status` — the decision table

**Read this before anything else. Do not paraphrase it, do not reason around
it, and do not decide a record's status any other way.**

Two campaigns before yours got this wrong in opposite directions. One captured
114 complete panels and promoted **zero**. The next promoted **85 of 89**, of
which 42 had no ingredient list and ten had a PDF's web address sitting in the
ingredients field. Both cost a correction pass. So the status is no longer
something to weigh up — it is a lookup.

### Step 1 — is the barcode real?

```
UPC-A check digit fails, or the code is not 12 digits   →  rejected. STOP.
```

Do not repair a check digit. Patching one invents a barcode. Write in
`verification_notes` exactly what the source printed so nobody re-derives it.

### Step 2 — are all six fields actually captured?

```
ingredients_verbatim      the ingredient list AS PRINTED, in order
crude_protein_min_percent
crude_fat_min_percent
moisture_max_percent
kcal_per_kg  OR  kcal_per_unit
the exact printed package size
```

**Any one of them missing or empty → `needs_physical_label`. STOP.**

`ingredients_verbatim` is the list itself. **It is not a URL.** If what you
have is a link to a deck, you have a citation and not a composition — put the
link in `source_urls`, leave `ingredients_verbatim` null, and stop at
`needs_physical_label`. Ten records in the last campaign failed exactly here.

### Step 3 — where did the composition come from?

Exactly one of these two, or the record is not verified:

```
A.  The maker's own surface — a purina.com label-deck PDF, or the current
    Alpo product page on purina.com.
    → ONE such source is enough. No second witness needed.

B.  TWO INDEPENDENT RETAILERS, each showing the same panel, agreeing
    word for word on the ingredient ORDER.
    → Independent means two different companies' own pages. Chewy and
      Petco are two. Chewy and a site republishing Chewy are one.
```

```
Neither A nor B                     →  needs_physical_label
The two retailers DISAGREE          →  needs_physical_label, and record
                                       BOTH readings in `conflicts`
```

A disagreement between two retailers is a **finding**, not an obstacle. On an
American label the ingredient order is descending weight, so two different
orders are two different foods. Write both down; do not pick one.

### Step 4 — only now

```
Steps 1–3 all passed  →  source_verified
```

### What each status means to the person reading it later

| Status | What happens to it |
|---|---|
| `source_verified` | The composition goes into the catalog |
| `needs_physical_label` | The barcode goes in as identity; **somebody photographs the pack** to finish it |
| `candidate` | A lead you could not finish — not seeded at all |
| `rejected` | Bad code or wrong product. Kept as evidence so nobody finds it again |

**A record that stops at step 2 or 3 has not failed.** Its barcode is still
seeded and still useful; it becomes a photograph somebody takes. Marking it
`source_verified` anyway does not make the catalog better — it puts a list in
front of a shopper that nobody read.

---

## 2. The two commands

```bash
node scripts/brand-inventory.mjs "Alpo" > research/INVENTORY-ALPO.md
node scripts/check-ledger.mjs research/deep-research-alpo.json
```

The checker must exit 0. It now refuses a URL in `ingredients_verbatim`, an
object where a string belongs, and a `source_verified` missing any of step 2's
fields — so it will catch most of §1 for you if you can run it. If you cannot,
§1 is the whole of your quality control.

---

## 3. What carries over from the siblings

| Where | What |
|---|---|
| Cat Chow §0 | Web access and shell; the `research/incoming/` fallback |
| Cat Chow §5 | Where the decks live and the URL shape |
| Cat Chow §7 | The 13 vitamin-block constants; run `scripts/match-vitamins.mjs` |
| Dog Chow §6 | Size ladders, one recipe in many bags, calories per cup |
| **AGENTS.md §9** | **Both controlled vocabularies, written out in full.** Look values up; do not translate from English. Three campaigns have now written the plain word for a prefixed term. |

---

## 4. What the catalog holds: nothing, and a prefix already proven

Zero Alpo products. Five named ranges, all empty: `Chop House`, `Prime Cuts`,
`Come & Get It`, `Variety Snaps`, `T-Bonz`.

Two things are settled before you start:

**The prefix.** `data/gs1-prefixes.ts` names `017800` and its comment says
outright that **Purina ONE and Alpo** carry it. Confirm it on your own packs
and say on how many; if a pack lands elsewhere, that is a finding.

**Two of the five ranges are treats, and the engine already knows.**
`lib/nutrition-role.ts` holds `"t bonz"` and `"variety snaps"`. Write
`food_form: "treat"` on those records and the seeding pass does the rest. Do
not file a treat as a meal, and do not judge one by an everyday standard.

---

## 5. What is different about this brand

Alpo is the **value end** of Purina's dog shelf — supermarket wet food in cans
and pouches, plus dry bags and two treat ranges. Expect:

- **Wet is most of it.** `Chop House` and `Prime Cuts` are cans; `Come & Get
  It` is dry. So `texture` and `presentation` are real questions on most rows,
  not `kibble` + `plain`. A gravy is `in_gravy`, never `gravy`.
- **The calorie arithmetic is available on every can.** A can states calories
  per can, so `scripts/check-batch.mjs` can test them against the printed net
  weight. Use it, and say in the handoff which rows had the witness.
- **Variety packs.** A value brand sells a lot of them. A box is
  `barcode_scope: "multipack"` and **carries no ingredient list of its own** —
  a carton has no composition. Put the members' barcodes in `contains` where
  the pack prints them.

Start with a dry range. Settle the prefix and the range names on the simplest
part of the shelf before meeting the wet cans, the way all three Purina
campaigns before you did.

---

## 6. Where things go

| What | Where |
|---|---|
| Every record | `research/deep-research-alpo.json` |
| A batch too large to commit whole | `research/incoming/alpo-batch-NN.json` — `AGENTS.md` §3a |
| Leads below the step-2 bar | `research/ALPO-CANDIDATES.json`, a **bare JSON array** — never `{records: […]}`, which both scripts would read as a second ledger |
| The regenerated inventory | `research/INVENTORY-ALPO.md` |
| Range, prefix and vocabulary recommendations | the **handoff** |
| `data/known-products.ts`, `data/known-formulas.ts`, `data/us-pet-brands.ts`, `lib/nutrition-role.ts` | **not you.** `AGENTS.md` §14 |

Branch: `claude/brand-curation-database-geiqse`. Never commit research to
`main`. `catalog_number` stays `null`.

---

## 7. Batches of twenty

Twenty records, then stop and report. **Report the step-1-to-4 tally for each
batch** — how many rejected, how many stopped at step 2, how many at step 3,
how many reached source_verified. If that tally drifts across batches, say so;
the last campaign's did, from 19-of-19 complete to 0-of-8, and nobody noticed
until a shell pass counted.

---

## 8. The handoff

`research/ALPO-HANDOFF.md`, carrying `AGENTS.md` §15 plus:

1. **Capabilities** — web, shell. First sentence, before any count.
2. **The step tally**, for the whole campaign and per batch.
3. **Of the source_verified records: how many by route A** (maker's own
   surface) **and how many by route B** (two independent retailers). Name the
   two retailers for each B record.
4. **Disagreements** — every recipe where two retailers differed, with both
   readings.
5. **The prefix** — confirmed on how many packs.
6. **Ranges** — which of the five you proved, which you never met, any current
   range the seed file does not name.
7. **Treats** — which records are `food_form: "treat"`.
8. **The checker's real exit code**, from a real run. If you had no shell, say
   that and claim nothing.

---

## 9. Done

- The checker exits **0**.
- **Every `source_verified` record passed all four steps of §1**, and the
  handoff's route A / route B counts add up to the total.
- No `ingredients_verbatim` holds a URL.
- No barcode was repaired; bad ones are `rejected` with what the source
  printed.
- Every `texture` and `presentation` is a value from AGENTS.md §9, looked up.

A campaign that returns 20 source_verified and 40 needs_physical_label has
done its job. So has one that returns 5 and 55. **What it must not return is a
status that is not true** — that is the only outcome here that costs somebody
else a day.
