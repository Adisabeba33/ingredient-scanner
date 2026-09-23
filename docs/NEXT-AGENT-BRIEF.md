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
- A 403 on a single image is often **the maker's own broken link**, not a
  block. Check it from inside the rendered page before you retry for an hour.

## To do, in order

1. **Temptations (queue #7).** Its site has the same structure as cesar.com:
   85 product pages, each with the barcode in its structured data, the
   label-panel image and Mars' taxonomy. Run `scripts/harvest-maker-pages.mjs
   https://www.temptationstreats.com <dir>` and follow BRIEF-CESAR §2: two
   independent transcriptions per panel, `source_verified` only where they
   match. They are treats, so write `food_form: "treat"`, and check that
   `lib/nutrition-role.ts` resolves them.
2. **Sheba.** sheba.com has 63 product pages in its sitemap, but the first
   page tried showed no barcode and no label-panel image. Find out whether it
   is a different page build or a block before you brief the brand.
   `research/BRIEF-SHEBA.md` exists (Perfect Portions twin-tray trap).
3. **Cesar route B.** Of the 58 individual units in the ledger, 29 are
   `needs_physical_label`, most because cesar.com serves their panel image as
   403. Get two independent retailers agreeing on the ingredient order
   (BRIEF-ALPO §1 step 3). Target opens in Chromium; a second retailer is the
   open question. Four pages that never loaded are listed in the handoff.
4. **Greenies, Pedigree, Whiskas.** Their home pages load but the sitemaps do
   not, so find the product URLs another way (category pages in Chromium).
   Whiskas is fully 403 and is retailer-only. `data/us-pet-brands.ts` has
   `lines: []` for Whiskas, which must be filled before seeding.
5. **Alpo: 42 identity-only barcodes and 38 unseeded ledger records.**
   purina.com is blocked, so these need retailers or photographs. One can
   photo also settles whether the wet cans dropped from 13.2 to 13 oz (see the
   batch 041 section of CATALOG-CONFLICTS).
6. `docs/SEED-GAP-PETCO.md`: 15 brands missing from `data/us-pet-brands.ts`,
   with five modelling decisions still to make.

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
