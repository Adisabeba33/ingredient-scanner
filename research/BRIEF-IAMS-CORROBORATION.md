# Assignment: Iams, third campaign — the second witness

This is the shortest campaign of the three and the one that finishes the brand.
You are **not** researching barcodes and **not** hunting new formulas. Both are
done. You are getting **one more independent page** for each recipe that
currently rests on a single retailer, so those records can be promoted to
`source_verified`.

`research/AGENTS.md` §6 (evidence priority) and §10 (status gates) are the two
sections this lives inside. `research/BRIEF-IAMS-FORMULAS.md` is the campaign
that produced the panels; its §3 (a panel is taken whole, from one page) and §4
(reading a panel that is an image) still hold word for word.

---

## 1. Where the brand stands

```bash
node scripts/formula-worklist.mjs research/deep-research-iams.json > research/WORKLIST-IAMS.md
node scripts/check-ledger.mjs research/deep-research-iams.json
```

The ledger is merged, the checker exits **0**, and there are no incoming files
left to merge. The numbers:

| | |
|---|---:|
| Records | **133** |
| With a complete panel — ingredients, analysis and calories | **114** |
| Distinct recipes behind them | **63** |
| Recipes with a complete panel | **47** |
| **Of those, corroborated by two or more shops** | **11** |
| **Of those, resting on a single shop** | **36** |
| `source_verified` | **0** |

**The worklist has a section for each of those two.** "Needs a second witness"
is the whole assignment; "Corroborated" is ready to promote once you have
checked the two panels actually match.

Regenerate before you start and trust the file over these numbers — they are
correct the day this was written and wrong the day somebody captures a page.

---

## 2. Why there are zero source_verified, and why that is a mistake to fix

The formula campaign wrote this into 114 records:

> US Chewy product page: complete ingredient statement, guaranteed analysis,
> and calorie panel captured as one retailer panel. **Single-retailer panel
> remains needs_physical_label** pending an independent source.

That is a stricter gate than any other campaign in this repository has used,
and it is worth seeing how much stricter. Every ledger here, counted:

| Brand | Records | With a label deck code | `source_verified` |
|---|---:|---:|---:|
| Royal Canin (dogs) | 180 | **0** | **180** |
| Weruva | 133 | **0** | **133** |
| I and love and you | 189 | **0** | 186 |
| Blue Buffalo | 291 | **0** | 133 |
| Orijen | 90 | **0** | 89 |
| Sheba | 20 | **0** | 20 |
| Pedigree | 20 | **0** | 17 |
| Hill's | 82 | 82 | 82 |
| Pro Plan | 18 | 18 | 18 |
| Purina ONE | 20 | 20 | 20 |

Two things follow, and both matter.

**A label deck code is not required.** Seven brands hold zero of them and are
`source_verified` anyway; three of those are 100% verified. A deck code exists
only where the maker publishes label-deck PDFs, which is Purina and Hill's and
nobody else here. Mars does not, so Iams has none to find and the campaign that
found none did not fail — `AGENTS.md` §8 says "label/deck code **when
present**" and §10 says "captured **when printed**". Both conditional. Do not
spend an hour looking.

**And a retailer panel is accepted evidence.** Of Blue Buffalo's 133
`source_verified` records, **124 name a retailer as the formula source**. One
of them reads, in full:

> Current 3 oz retail label transcription from State Line Pet Supply,
> corroborated by current Chewy; exact UPC/size identity is anchored by
> Blue Buffalo's current official qualifying-products list.

One transcription plus one corroborating retailer. That is the bar this
repository has actually used, and the Iams records sit one page short of it.

---

## 3. What you are doing

For each recipe under **"Needs a second witness"** in the worklist:

1. **Open a second, independent retail page** for the same recipe.
   Chewy is usually the one already held, so go to **Petco**, **Target** or
   **PetSmart**. `research/PETCO-BRANDS.md` surveyed Petco on 2026-09-21 and
   found **at least 35 Iams foods** — 15 dry dog, 13 dry cat, 7 wet cat, and
   wet dog present. The pages exist.
2. **Compare the panel to what is stored**, field by field: ingredient order,
   every printed guarantee, the calorie figure and its basis.
3. **If they agree** — record the second URL in `source_urls`, say in
   `verification_notes` that two independent retailers carry the same panel
   character for character, and promote the record to **`source_verified`**.
4. **If they differ** — that is a finding, not an obstacle. Record both in
   `conflicts`, leave the record at `needs_physical_label`, and say which is
   more likely current and why. The formula campaign already found real
   reformulation drift on Perfect Portions Chicken between two Target
   snapshots, so expect this to happen and do not smooth it away.
5. Promote **per record**, not per recipe: a recipe's six bag sizes each need
   their own UPC still proven, and §10 is a per-record gate.

### What does not count as the second witness

- **`iams.com`.** It is in nearly every record already, but its nutrition
  panels are images and it was used for identity, not formula. If you
  transcribe one per §4 of the formula brief, that *is* a manufacturer source
  and it outranks both retailers — say plainly that you read it from an image.
- **`admc.us`.** A distributor price list. It binds a UPC to a size and prints
  no formula.
- **The Mars UPC exhibits** (`snippdocs`, `terms.snipp`). Barcodes and sizes,
  no panels.
- **Canadian or European pages.** `BRIEF-IAMS.md` §3. Still forbidden.
- **The same retailer twice**, or an aggregator republishing it. Independent
  means a different company's own page.

---

## 4. The five things to settle while you are in there

The checker exits 0 but leaves **16 warnings**, and these are the ones with a
real question behind them.

**4.1 — Adult and Kitten share one deck.** `019014802296` (Perfect Portions
Healthy Adult Pâté Chicken) and `019014802333` (Healthy Kitten Pâté Chicken)
carry byte-identical ingredient lists under differing guaranteed analyses. The
formula campaign kept both and documented the reasoning. That is defensible,
and it is still the single least likely pair in the ledger — a kitten food and
an adult food with the same deck. **This is the first record to get a second
witness**, and capture both from the second retailer separately.

**4.2 and 4.3 — Two more shared decks, probably renames.**
`019014712625 / 019014712618 / 019014611874` file as both "Healthy Senior with
Chicken" and "Healthy Senior"; `019014806805 / 806768 / 806782 / 806812 /
830053` as both "Skin & Coat Chicken & Salmon" and "Skin & Coat". These look
like one product under two printed names, which is fine — but the checker asks
for it to be stated. Put the rename in `conflicts` on each record.

**4.4 — Three multipacks carry ingredient lists.** `019014802371`,
`019014802364`, `019014802708`. A box has no composition; the field is at best
unused and at worst one member's deck standing in for the carton. Clear them,
and keep the member recipes' panels where they belong — on the members.

**4.5 — Four records have `kcal_per_unit` with no `kcal_per_kg`.** The four
Perfect Portions pâtés. If the second source prints a per-kg figure, add it and
run the arithmetic cross-check per `docs/SEEDING-A-BATCH.md` §2.2. If it does
not, say so.

---

## 5. Batches of ten recipes

Ten recipes, then report. The worklist is ordered by how many barcodes each
recipe answers — the top six answer 26 records between them, the bottom
fourteen answer one each. Work down it, so a campaign cut short still leaves
the most codes promoted.

---

## 6. The handoff

Append to `research/IAMS-HANDOFF.md`:

1. **Capabilities** — web, shell, images. First sentence.
2. **How many records reached `source_verified`**, out of 125 non-rejected.
   This is the number the campaign is judged on.
3. **Per second source** — how many recipes were corroborated from Petco,
   Target, PetSmart, or a transcribed manufacturer image.
4. **Every disagreement found**, and what you did with it.
5. **Which of §4.1–4.5 are settled.**
6. **The checker's real exit code**, from a real run.

---

## 7. Done

- `node scripts/check-ledger.mjs research/deep-research-iams.json` exits **0**.
- Every recipe with a complete panel either has two independent sources and is
  promoted, or has a stated reason it does not.
- No barcode added, changed or removed.
- The eight `rejected` records are still rejected, and nobody has "fixed" a
  check digit.

Then the brand is ready for `docs/SEEDING-A-BATCH.md` — which is a separate
request, and still nobody's job until the operator asks.
