/**
 * Express Mode: a product captured in two seconds, finished at a desk.
 *
 * The shape of the thing, and the small decisions that go with it. The argument
 * for why express captures live in their own table rather than in the catalog
 * is in supabase/express_capture.sql and app/api/express/route.ts.
 */

export interface ExpressRow {
  code: string;
  /** Which capture this row came from. Pack sizes of one product share it. */
  captureGroup?: string | null;
  mode: string | null;
  brands: string | null;
  productName: string | null;
  variant: string | null;
  netWeight: string | null;
  container: string | null;
  /** Path inside the bucket, or null when the upload failed. */
  photoPath: string | null;
  /** What the model couldn't read, or what went wrong storing the photo. */
  readError: string | null;
  capturedAt: string | null;
}

/**
 * Where a product's photograph lives in the bucket.
 *
 * Keyed by the barcode, with no timestamp or random suffix: one product, one
 * picture. A re-capture is meant to REPLACE what was there, and a unique name
 * per upload would quietly accumulate every rejected attempt with nothing
 * pointing at them.
 */
export function photoPathFor(code: string, extension: string): string {
  return `express/${code}.${extension}`;
}

/**
 * Split a `data:image/jpeg;base64,…` URL into what an upload needs.
 *
 * Returns null rather than throwing: a photo that won't decode costs the row
 * its picture, and the identity read off it is still worth keeping.
 */
export function decodeDataUrl(dataUrl: string): {
  bytes: Buffer;
  contentType: string;
  extension: string;
} | null {
  const match = /^data:(image\/([a-zA-Z0-9.+-]+));base64,(.+)$/s.exec(
    dataUrl.trim()
  );
  if (!match) return null;
  const subtype = match[2].toLowerCase();
  return {
    bytes: Buffer.from(match[3], "base64"),
    contentType: match[1],
    // jpeg → jpg, so the paths look like paths people write by hand.
    extension: subtype === "jpeg" ? "jpg" : subtype,
  };
}

/**
 * What a row is still missing before it can become a catalog product.
 *
 * A composition is the only hard requirement — that is the whole reason the
 * product is on this list. The rest is worth chasing but not worth blocking on:
 * a real product with a right ingredient list and no net weight is a better
 * catalog entry than no entry at all.
 */
export function missingForFinish(row: {
  ingredientsText: string;
}): string[] {
  const missing: string[] = [];
  if (!row.ingredientsText.trim()) missing.push("the ingredient list");
  return missing;
}

/**
 * Rows gathered into the captures they came from.
 *
 * One recipe sold as a 3 kg bag and a 12 kg bag is two barcodes, two catalog
 * rows and ONE composition. Listing them separately would mean typing the same
 * ingredient list twice and inviting the two copies to differ — so the desk
 * works on a group and writes a row per code.
 *
 * Order is preserved: the worklist arrives oldest first and stays that way.
 */
export function groupCaptures<T extends ExpressRow>(rows: T[]): T[][] {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = row.captureGroup ?? row.code;
    const existing = groups.get(key);
    if (existing) existing.push(row);
    else groups.set(key, [row]);
  }
  return [...groups.values()];
}

/** A one-line description of a row, for a list somebody scans down. */
export function expressTitle(row: ExpressRow): string {
  const parts = [row.brands, row.productName, row.variant].filter(
    (p): p is string => !!p && p.trim().length > 0
  );
  return parts.length > 0 ? parts.join(" · ") : row.code;
}
