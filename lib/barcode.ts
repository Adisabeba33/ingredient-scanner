/**
 * Barcode helpers — COPIED VERBATIM from ingredients.help (`lib/barcode.ts`).
 *
 * The scanner and the consumer app MUST agree on these three things or a row
 * the scanner writes won't be found when the app looks it up:
 *   - `sanitizeBarcode`   — which digit-lengths are real barcodes
 *   - `canonicalBarcode`  — the storage key (UPC-A / EAN-13 / GTIN-14 collapse)
 *   - `SOURCE_RANK`       — trust ordering, so a write never buries better data
 *
 * Keep this file in sync if ingredients.help ever changes them. It is a small,
 * stable surface — acceptable duplication for a separate repo (see the spec,
 * §7 "What to reuse / copy").
 */

export type ScanMode = "human" | "pet" | "cosmetics";

export type BarcodeSource =
  | "openfoodfacts"
  | "openbeautyfacts"
  | "openpetfoodfacts"
  | "community"
  | "verified";

/** Trust ranking: a write must never replace a row with a lower-ranked source.
 *  verified (our curated catalog) > community (our users' readings) > the open
 *  databases. Unknown sources rank 0. */
export const SOURCE_RANK: Record<string, number> = {
  verified: 3,
  community: 2,
  openfoodfacts: 1,
  openbeautyfacts: 1,
  openpetfoodfacts: 1,
};

export function sourceRank(source: string | null | undefined): number {
  return (source && SOURCE_RANK[source]) || 0;
}

/**
 * Keep only digits and accept the real barcode lengths: EAN-8, UPC-A (12),
 * EAN-13, and GTIN-14. Anything else (a QR payload, a partial read) is
 * rejected so we never fire a write on garbage.
 */
export function sanitizeBarcode(raw: string): string | null {
  const digits = (raw ?? "").replace(/\D+/g, "");
  if (
    digits.length !== 8 &&
    digits.length !== 12 &&
    digits.length !== 13 &&
    digits.length !== 14
  ) {
    return null;
  }
  return digits;
}

/**
 * Canonical key for our OWN barcode storage. A UPC-A (12 digits), its EAN-13
 * form (the same digits with a leading 0), and GTIN-14 all identify the SAME
 * physical product — and scanners (especially ZXing on iOS) report the same
 * symbol as 12 or 13 digits unpredictably. Left-pad codes of length ≥ 12 to
 * GTIN-14 so every form maps to one key, so a reading saved after a 12-digit
 * read is still found on a 13-digit read. (EAN-8 stays as-is — a genuinely
 * different, shorter code.)
 *
 * Store under `canonicalBarcode(code)`; the app looks up under the same.
 */
export function canonicalBarcode(code: string): string {
  const digits = (code ?? "").replace(/\D+/g, "");
  return digits.length >= 12 ? digits.padStart(14, "0") : digits;
}
