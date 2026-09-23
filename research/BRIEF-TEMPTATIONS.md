# Assignment: Temptations

**One brand: Temptations** (Mars Petcare US, cat). Brand #7 in `docs/CURATION-QUEUE.md`.

`research/AGENTS.md` is the binding contract. This campaign follows the Mars route-A method established in `research/BRIEF-CESAR.md`.

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
`needs_physical_label`.

### Step 3 — where did the composition come from?

Exactly one of these two, or the record is not verified:

```
A.  The maker's own surface — a temptationstreats.com product page — its
    label-panel image for the composition, its structured data for the barcode.
    → ONE such source is enough. No second retailer witness needed.

B.  TWO INDEPENDENT RETAILERS, each showing the same panel, agreeing
    word for word on the ingredient ORDER.
    → Independent means two different companies' own pages.
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

| Status | What happens to it |
|---|---|
| `source_verified` | The composition goes into the catalog |
| `needs_physical_label` | The barcode goes in as identity; somebody photographs the pack to finish it |
| `candidate` | A lead you could not finish — not seeded at all |
| `rejected` | Bad code or wrong product. Kept as evidence so nobody finds it again |

**A record that stops at step 2 or 3 has not failed.** Its barcode is still
seeded and still useful.

> §1 carries the Alpo decision table forward, with the route-A maker surface
> changed to temptationstreats.com as required by the Mars template.

---

## 2. Route A — Mars product pages

Use:

```bash
node scripts/harvest-maker-pages.mjs https://www.temptationstreats.com <dir>
```

The current public treats index shows 64 visible results, while the next-agent
brief records 85 product pages. Do not treat the visible UI count as the page
inventory: retain direct/seasonal/older product URLs found by the harvester and
sitemap discovery and report both counts.

For each maker page:

- barcode: Product JSON-LD `sku`;
- range: Mars `dataLayer` taxonomy `Sub brand`;
- size: page size selector; if one sku is not tied to one exact size, step 2 stops;
- package: Mars taxonomy `Format`;
- composition: maker label-panel image;
- `species: "cat"`;
- treat products: `food_form: "treat"`.

If a number-typed Mars sku drops the leading zero, restore **only** that leading
zero and only where the resulting 12-digit UPC-A check digit validates. Record
the normalization. Never change another digit.

### Image transcription rule

A maker label image must be transcribed twice independently. Preserve printed
capitalization, spelling, punctuation and ingredient order. A record reaches
`source_verified` only where the two readings agree on ingredients,
guarantees and calories (whitespace aside). If genuine independent dual reading
is not available, do **not** claim it happened; use route B or stop at
`needs_physical_label`.

### Integrity checks

1. A panel reused on a different flavor page is not evidence for either flavor.
   Record the conflict and stop at step 3.
2. When both kcal/kg and kcal/unit plus package mass are printed, arithmetic
   must agree within 3% or 2 kcal.
3. A variety pack carries no composition of its own. Record identity and
   members only; do not attach one member's ingredient list to the carton.

---

## 3. Campaign files

```
research/deep-research-temptations.json
research/INVENTORY-TEMPTATIONS.md
research/TEMPTATIONS-HANDOFF.md
```

Before seeding:

```bash
node scripts/check-ledger.mjs research/deep-research-temptations.json
```

The checker must exit 0.

Verify `lib/nutrition-role.ts` resolves every Temptations treat correctly.
Do not judge a treat by an everyday-meal nutrition standard merely because the
maker also describes some Classic treats as complete and balanced.

---

## 4. Done

- Every discovered sellable identity is accounted for in the ledger or
  candidates evidence.
- Every barcode is a quoted exact code with a valid check digit or is rejected.
- Every `source_verified` row passed steps 1–4.
- No URL appears in `ingredients_verbatim`.
- Variety packs carry no composition.
- The handoff reports per-batch and total step tallies, route A/B counts,
  conflicts, ranges, treat count, page counts, and the real checker exit code.
- Before push, run:
  `npm run typecheck && npm run lint && npm test && npm run build`.
- After deploy, the operator still has to press **Write N to the catalog**;
  nothing reaches the database before that action.
