# Brief for the next agent (full network access)

Written 2026-09-23 after batches 041 (Alpo) and 042 (Cesar). Short on purpose:
it points at the documents that hold the detail.

## Where things are

| What | Where |
|---|---|
| State of the whole effort, and the lessons that cost days | `docs/SESSION-HANDOFF-2026-09-23.md` — read §3 first |
| Brand running order and status | `docs/CURATION-QUEUE.md` |
| Record contract, vocabularies (§9), status gates | `research/AGENTS.md` |
| **The status decision table — copy verbatim into every brief** | `research/BRIEF-ALPO.md` §1 |
| **Method for Mars brand sites** (barcode from JSON-LD, panel from image, read twice) | `research/BRIEF-CESAR.md` §2 |
| Latest handoffs | `research/CESAR-HANDOFF.md`, and the batch 041 commit message for Alpo |
| How a ledger becomes seed | `docs/SEEDING-A-BATCH.md` |
| Source disagreements (a test requires every `conflict` barcode here) | `docs/CATALOG-CONFLICTS.md` |
| Ledgers | `research/deep-research-<brand>.json` |
| Seed | `data/known-products.ts`, `data/known-formulas.ts`, `data/us-pet-brands.ts`, `data/gs1-prefixes.ts` |
| Tools | `scripts/check-ledger.mjs` (must exit 0), `scripts/brand-inventory.mjs`, `scripts/harvest-maker-pages.mjs`, `scripts/formula-worklist.mjs`, `scripts/match-vitamins.mjs` |
| Maker records for the consumer app | `Ingredients.help/data/manufacturers.ts` |

Branch `claude/brand-curation-database-geiqse`. Push every batch to it **and**
to `main`, because the app reads the seed from `main`.

## What works from a cloud container (tested 2026-09-23)

- **Chromium via Playwright** (`/opt/pw-browsers/chromium`, the global npm
  `playwright`) gets past bot protection that plain `curl` and `WebFetch` do
  not. This is how cesar.com was read.
- Open: cesar.com, temptationstreats.com, target.com (in Chromium),
  upcitemdb.com, the greenies.com and pedigree.com home pages.
- Blocked: purina.com and petco.com (403), chewy.com (429), whiskas.com and
  iams.com (403). The sitemaps of greenies.com and pedigree.com also return
  403.
- If Chromium starts failing with `ERR_CERT_AUTHORITY_INVALID` while `curl`
  works, the agent proxy has rotated its CA since `~/.pki/nssdb` was written
  (it happened mid-session on 2026-09-23). Import the CCR certificates from
  `/root/.ccr/ca-bundle.crt` with `certutil` (`apt-get install libnss3-tools`).
  Never switch TLS verification off instead.
- temptationstreats.com started refusing its sitemap and `/products` (403)
  while product pages kept loading; the harvester crawls instead.
- A 403 on a single image is often **the maker's own broken link**, not a
  block. Check it from inside the rendered page before you retry for an hour.

## To do, in order

1. **Temptations (queue #7): done, batch 043.** See
   `research/TEMPTATIONS-HANDOFF.md`, and read its §2 before any Mars site:
   every size on a page has its own barcode and its own label images.
   Remaining: 20 sizes whose panel images 403 and 44 with no calorie line.
2. **Sheba: single packs started, batch 044.** 29 barcodes, 1 composition;
   most panels on sheba.com stop before the calorie line or 403. Route B or
   photographs. See SHEBA-HANDOFF, batch 044 section.
3. **Cesar route B.** Of the 68 individual units in the ledger, 25 are
   `needs_physical_label`, most because cesar.com serves their panel image as
   403. Get two independent retailers agreeing on the ingredient order
   (BRIEF-ALPO §1 step 3). Target opens in Chromium; a second retailer is the
   open question. Four pages that never loaded are listed in the handoff.
4. **Greenies: done, batch 045** (GREENIES-HANDOFF). Remaining: the dog
   dental range (no panel on the site) and 16 supplements with no container.
   **Pedigree and Whiskas** refuse even the browser from this environment:
   sitemap, catalogue and most product pages return 403. Retailers or
   photographs only. `data/us-pet-brands.ts` still has `lines: []` for
   Whiskas.
5. **Alpo: 42 identity-only barcodes and 38 unseeded ledger records.**
   purina.com is blocked, so these need retailers or photographs. One can
   photo also settles whether the wet cans dropped from 13.2 to 13 oz (see the
   batch 041 section of CATALOG-CONFLICTS).
6. `docs/SEED-GAP-PETCO.md`: 15 brands missing from `data/us-pet-brands.ts`,
   with five modelling decisions still to make.

## Done since this brief was first written

Meow Mix (batch 046, text on the page — no images), Nutro and Crave (047).
See their handoffs in research/. Next candidates whose sites load but were
not yet checked down to a product page: Kibbles 'n Bits (panel as text, no
barcode in markup), Milk-Bone, Rachael Ray Nutrish, Nature's Recipe, Taste
of the Wild, Instinct, Tiki Cat, Freshpet.

## Rules that are not negotiable

- Never repair a barcode. The one allowed normalisation is restoring a
  dropped leading zero, and only when the check digit then validates; say so
  in `verification_notes`.
- `ingredients_verbatim` is the printed list, copied with its typos and never
  a URL. Order is the data.
- Two readings of an image that disagree mean `needs_physical_label`, not a
  pick. The same list shown on two flavours' pages means the image was reused,
  so neither record is verified.
- Before every push, run the checker to exit 0 and then
  `npm run typecheck && npm run lint && npm test && npm run build`.
- A variety pack carries no composition.
- The operator presses **Write N to the catalog** after a redeploy. Nothing
  reaches the database until then; say so in the report.
