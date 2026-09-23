# Assignment: Cesar

**One brand: Cesar** (Mars Petcare US, dog). Brand #6 in `docs/CURATION-QUEUE.md`.

This brief was written *with* the campaign, not before it: the session that
ran it had web access and a shell, so it could try the sources first and write
down what actually worked. It is also the template for the next four Mars
brands in the queue — Temptations, Greenies, Whiskas and Sheba all sit on the
same Mars site build.

`research/AGENTS.md` is the binding contract.

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
A.  The maker's own surface — a cesar.com product page — its label-panel
    image for the composition, its structured data for the barcode.
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

> §1 is `BRIEF-ALPO.md` §1 verbatim, with one substitution: route A names
> cesar.com instead of purina.com. Copy it forward unchanged.

---

## 2. Route A for a Mars brand, and why it is one campaign, not two

The handoff of 2026-09-23 predicted two campaigns for any Mars brand, because
Mars publishes no readable label decks. That turned out to be half right.
There are no decks, **but every cesar.com product page carries the whole
answer**, and none of it is where a text scrape looks:

| What | Where on the maker's own page |
|---|---|
| **Barcode** | the `sku` of the Product JSON-LD. Sixteen pages print 11 digits: a number-typed field dropped the leading `0` of `023100`. Restore that zero **only if the UPC-A check digit then validates**, and write that you did. No other digit is ever touched. |
| **Range** | the `dataLayer` taxonomy's **"Sub brand"** — the maker's own word for it |
| **Size** | the page's size selector (`pdp-hero__size-list`). Where it lists several sizes under one sku, the size of THIS barcode is not established: step 2 stops. |
| **Package** | the taxonomy's **"Format"** — Flexible Tray, Pouch, Bag |
| **Composition** | an **image**: `<img alt="… guaranteed analysis image">`, sometimes `"… ingredients image"`. The panel is in one of the two; the other is often a marketing graphic, and the alt text does not reliably say which. |

`scripts/harvest-maker-pages.mjs` collects all of it. It needs Chromium: plain
`curl` and `WebFetch` both get a 403 or a summary that says "the panel is an
image and cannot be read".

### The composition is transcribed twice, and kept only where the two agree

An image cannot be diffed against a PDF, so the check is a second, independent
reading. Every panel went to two transcribers on different models, each told
only to copy: keep the printed capitalisation, keep typos, never expand, never
reorder. **A record reaches source_verified only if the two readings match on
ingredients, guarantees and calories.** Whitespace aside, 41 of 42 dual-read
panels matched to the character, and the 42nd differed by one space.

Proof the readers did not tidy: Classic Loaf Filet Mignon prints **"Natrual
Flavor"** and both kept it; its Top Sirloin sibling prints "Natural Flavor",
which is also the evidence that the two are separate images.

### Two integrity checks added to step 3

Route A trusts the maker's page, so it has to catch the maker's page being
wrong:

1. **A panel shown on a different flavour's page is not about this barcode.**
   cesar.com shows the Wood-Grilled Chicken Mini-Pouch panel, byte for byte,
   on the Filet Mignon & Chicken Mini-Pouch page. If two products' ingredient
   lists match to the letter, step 3 stops for both, with a conflict. (Seven
   families here share a base recipe and differ only in the flavour line —
   that is normal and passes; identical lists do not.)
2. **The calorie line must work at the printed size**, within 3% or 2 kcal.
   A tray states calories per tray, so this witness is available on almost
   every wet record.

### What the maker's site cannot give you

- **18 panel images return HTTP 403 from cesar.com itself**, including from
  inside the rendered product page. Not a block on us — other images on the
  same pages load. Those records stop at step 2.
- **8 panels stop before the calorie line** (Warm Bowls, the Mini-Pouches, the
  Simply Crafted pouches, the dry bags). Step 2.
- **Variety packs**: 41 of them, no composition by definition.

Those are route B (two retailers) or a photograph. Chewy answered 429, and Petco and
purina.com 403, from this environment; Target rendered in
Chromium. Route B for the 29 remaining Cesar records is the next piece of work.

---

## 3. What the catalog got from it

See `research/CESAR-HANDOFF.md`. In short: 54 barcodes seeded, 29 with a
composition, all route A; 45 more records in the ledger.

## 4. Two things that are not obvious

- **Simply Crafted is a meal complement.** The page says so ("a simple and
  tasty meal complement … add to any complete and balanced meal as a healthy
  topper") and the panels agree: 0.1–0.5% fat. `lib/nutrition-role.ts` now
  reads the range as complementary under Cesar only, and one of them prints
  three ingredients in total — "Chicken, Carrots & Green Beans" — which is real.
- **"Loaf & Topper in Sauce" is a complete food.** The topper is the garnish
  on the loaf. `lib/nutrition-role.ts` already documents that trap; do not
  file it with Simply Crafted.
