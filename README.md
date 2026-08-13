# Catalog Scanner

An admin-only, mobile-first capture tool for building the **verified pet-food
catalog** behind [ingredients.help](https://ingredients.help). Walk a pet store,
scan barcodes and snap label photos fast, then process the batch on wifi — each
product's exact ingredient list is read by Claude vision and written into the
**same Supabase** the consumer app reads, so a shopper who scans any of those
bags gets our real, off-the-label composition instantly.

Built to the spec in `ingredients.help/docs/catalog-scanner-spec.md`.

## Why this exists

The consumer app can already look a barcode up in Open Food / Beauty / Pet Food
Facts. Those records are open, and often incomplete, stale, or missing outright
— which is exactly where a shopper standing in the aisle needs an answer most.

A row this tool writes is marked `verified`: read by us, off the real pack. It
outranks every open-database record, and it is the only kind of row a user's
photo can never silently overwrite.

## How it works

- **Barcode = the key.** Decoded on-device (native `BarcodeDetector`, ZXing
  fallback). We store only the digits, never the barcode photo.
- **Composition = ours.** Captured from a photo of the real label and stored as
  source `verified` (top trust) — not from the open databases.
- **One recipe → many barcodes.** Add every pack-size code under one product;
  each gets its own verified row sharing the same ingredients.
- **Capture now, extract later.** At the shelf you only scan + snap (offline,
  queued in IndexedDB). "Process all" does the reading at home on good wifi.
- **Already ours?** The moment a code is read it's checked against the catalog
  (`/api/check-barcode`), so two people scanning in parallel don't both
  re-capture the same product.

### What gets read off the pack

Beyond the ingredient text, processing establishes two facts the consumer app's
report depends on, and neither is trusted on a single reading:

- **Species** — cat or dog (`lib/pet-species.ts`). A cat is an obligate
  carnivore and a dog isn't, so the same recipe earns different verdicts.
- **Dry or wet** (`lib/food-form.ts`) — confirmed from the pack *and*,
  separately, from the composition, plus a measured moisture percentage when
  the nutrition panel is photographed. The two readers are deliberately blind
  to each other's evidence: `detectFormFromText` never looks at the product
  name, because the model reading the pack already does — one phrase counted
  twice is not two confirmations.

Both show in the UI with their confirmation state (`Cat`, `Wet ?`) and both are
editable by hand when the pack simply doesn't say.

## Setup

1. `npm install`
2. Copy `.env.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — **the same
     Supabase project ingredients.help uses** (not a new one).
   - `ANTHROPIC_API_KEY` — the same key used for reports.
   - `ADMIN_TOKEN` — a shared secret gating the whole tool.
3. `npm run dev` and open on your phone (HTTPS/localhost is required for the
   camera). Enter the admin token.

The scanner writes into the existing `public.barcode_cache` table (see
`supabase/shared-barcode_cache.reference.sql`). It needs migrations `0009`
(corrections), `0010` (species) and `0011` (food form) applied **in the
consumer app's repo** — the columns live in the shared database, so a missing
one shows as a banner here rather than an empty screen.

## The flow

**In store (per product, ~10–15s):**

1. Scan a barcode → beep + green frame. Tap **Add another barcode** for each
   other pack size.
2. Snap the **Brand / name** photo (narrow band, full name incl. variant).
3. Snap the **Ingredients** photo (larger frame, quick & rough).
4. Optionally snap the **Nutrition** panel — that's where the moisture
   percentage that settles dry-vs-wet lives.
5. Tap **Done** → counter +1, ready for the next.

**At home (wifi):** tap **Process all**. For each queued product Claude vision
reads the ingredients (+ brand) photo, one `verified` row is written per
barcode, the photos are deleted, and anything that didn't read cleanly is listed
so you re-shoot only those.

**Afterwards:** the **Catalog** section below the capture flow lists what actually landed — every verified
row with its stored ingredient text, its species and form, editable in place.
Capture used to be write-only, which meant a row that looked wrong in the
consumer app left you guessing whether a correction had landed, gone to a
different barcode, or never run.

## Corrections

Users can't change a verified row — a shopper's photo that disagrees with one is
filed as a *proposal* by the consumer app (`catalog_corrections`, migration
`0009`), pre-screened by a cheap model so only plausible reformulations reach a
human. The **Corrections** section is where they're decided, most-reported first,
and approving one is the only route from a shopper's photo into the catalog.

A bad capture that already made it in is withdrawn with **delete** — which
touches `verified` rows only. An open-database row isn't ours to remove, and
deleting it would just make the app re-fetch it.

## Architecture

| Piece | Where |
|---|---|
| Barcode camera | `components/BarcodeScanner.tsx` (copied from ingredients.help) |
| Framed photo capture + crop/compress | `components/PhotoCapture.tsx`, `lib/image.ts` |
| Offline queue (photos live here only) | `lib/queue.ts` (IndexedDB) |
| Barcode key/trust rules | `lib/barcode.ts` (trimmed copy — must agree with the app) |
| Species / dry-wet readers | `lib/pet-species.ts`, `lib/food-form.ts` (byte-identical copies) |
| Report-cache key | `lib/report-cache-key.ts` (mirrors the app's `/api/report` formula) |
| Label reading (Claude vision) | `lib/extract.ts`, `app/api/process/route.ts` |
| Verified write (service role) | `app/api/process/route.ts`, `lib/supabase/admin.ts` |
| Catalog browse / edit / delete | `components/CatalogBrowser.tsx`, `app/api/catalog/*`, `app/api/delete-barcode` |
| Correction queue | `components/CorrectionsReview.tsx`, `app/api/corrections` |
| Duplicate guard | `app/api/check-barcode`, `components/DuplicateProductDialog.tsx` |
| Admin gate | `components/AdminGate.tsx`, `app/api/admin/verify/route.ts` |

**Four things must agree across the two repos**, or the app and the scanner
disagree about what a row even *is*:

- `lib/pet-species.ts` and `lib/food-form.ts` — byte-identical copies. Diff
  them; they should produce no output.
- `lib/barcode.ts` — not a full copy. The scanner carries only the three
  helpers that decide identity and trust (`sanitizeBarcode`,
  `canonicalBarcode`, `SOURCE_RANK`); the app's file additionally does the
  open-database lookups the scanner never performs. The shared helpers must
  behave identically — that is what `lib/barcode.test.ts` checks. Write a row
  under a different canonical key and the app will simply never find it.
- `lib/report-cache-key.ts` — mirrors the formula that lives inline in the
  app's `app/api/report/route.ts`: `sha256("barcode:v2:{mode}:{code}")`. The
  report cache is independent of `barcode_cache`, so correcting a product's
  ingredients does **not** invalidate the report built from the old ones. The
  scanner clears that key itself; if the formula drifts, it clears nothing and
  the stale analysis is served forever.

## Seeding products from label data

Most of the catalog did not come from a shop. 120 products were typed in from
Purina label decks, checked by arithmetic, and written as `community` rows that
a photograph of the real pack still outranks.

- **[docs/SEEDING-A-BATCH.md](docs/SEEDING-A-BATCH.md)** — the whole process,
  written so it can be picked up cold: what to verify before typing anything,
  how identity and composition are split across two files, when to extend the
  controlled vocabularies and when not to, and what to tell the operator at the
  end.
- **[docs/CATALOG-CONFLICTS.md](docs/CATALOG-CONFLICTS.md)** — every place two
  sources describe one barcode differently, which one is stored, and what would
  change the answer.

## Scripts

- `npm run dev` / `build` / `start`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint`
- `npm test` — unit tests (barcode key/trust parity with ingredients.help)
- `node scripts/check-batch.mjs batch.tsv` — pre-flight a seed batch: UPC-A
  check digits, GS1 prefix, collisions, and whether each calorie statement
  agrees with its own net weight

## Security

- `ADMIN_TOKEN` gates the capture page and every write (sent as `x-admin-token`).
  Every destructive action — deleting a row, clearing a list, editing the shared
  catalog — asks for it again at the point of use.
- The Supabase **service-role key** and `ANTHROPIC_API_KEY` are used only in
  server routes — never shipped to the browser.
- Photos never touch the database; they live in the phone's IndexedDB until
  their text is extracted, then they're deleted. The catalog is text-only.
