# Catalog Scanner

An admin-only, mobile-first capture tool for building the **verified pet-food
catalog** behind [ingredients.help](https://ingredients.help). Walk a pet store,
scan barcodes and snap label photos fast, then process the batch on wifi — each
product's exact ingredient list is read by Claude vision and written into the
**same Supabase** the consumer app reads, so a shopper who scans any of those
bags gets our real, off-the-label composition instantly.

Built to the spec in `ingredients.help/docs/catalog-scanner-spec.md`.

## How it works

- **Barcode = the key.** Decoded on-device (native `BarcodeDetector`, ZXing
  fallback). We store only the digits, never the barcode photo.
- **Composition = ours.** Captured from a photo of the real label and stored as
  source `verified` (top trust) — not from the open databases.
- **One recipe → many barcodes.** Add every pack-size code under one product;
  each gets its own verified row sharing the same ingredients.
- **Capture now, extract later.** At the shelf you only scan + snap (offline,
  queued in IndexedDB). "Process all" does the reading at home on good wifi.

## Setup

1. `npm install`
2. Copy `.env.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — **the same
     Supabase project ingredients.help uses** (not a new one).
   - `ANTHROPIC_API_KEY` — the same key used for reports.
   - `ADMIN_TOKEN` — a shared secret gating the whole tool.
3. `npm run dev` and open on your phone (HTTPS/localhost is required for the
   camera). Enter the admin token.

No database migration is needed — the scanner writes into the existing
`public.barcode_cache` table (see `supabase/shared-barcode_cache.reference.sql`).

## The flow

**In store (per product, ~10–15s):**

1. Scan a barcode → beep + green frame. Tap **Add another barcode** for each
   other pack size.
2. Snap the **Brand / name** photo (narrow band, full name incl. variant).
3. Snap the **Ingredients** photo (larger frame, quick & rough).
4. Tap **Done** → counter +1, ready for the next.

**At home (wifi):** tap **Process all**. For each queued product Claude vision
reads the ingredients (+ brand) photo, one `verified` row is written per
barcode, the photos are deleted, and anything that didn't read cleanly is listed
so you re-shoot only those.

## Architecture

| Piece | Where |
|---|---|
| Barcode camera | `components/BarcodeScanner.tsx` (copied from ingredients.help) |
| Framed photo capture + crop/compress | `components/PhotoCapture.tsx`, `lib/image.ts` |
| Offline queue (photos live here only) | `lib/queue.ts` (IndexedDB) |
| Barcode key/trust rules | `lib/barcode.ts` (copied verbatim — must match the app) |
| Label reading (Claude vision) | `lib/extract.ts`, `app/api/process/route.ts` |
| Verified write (service role) | `app/api/process/route.ts`, `lib/supabase/admin.ts` |
| Admin gate | `components/AdminGate.tsx`, `app/api/admin/verify/route.ts` |

## Scripts

- `npm run dev` / `build` / `start`
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint`
- `npm test` — unit tests (barcode key/trust parity with ingredients.help)

## Security

- `ADMIN_TOKEN` gates the capture page and every write (sent as `x-admin-token`).
- The Supabase **service-role key** and `ANTHROPIC_API_KEY` are used only in
  server routes — never shipped to the browser.
- Photos never touch the database; they live in the phone's IndexedDB until
  their text is extracted, then they're deleted. The catalog is text-only.
