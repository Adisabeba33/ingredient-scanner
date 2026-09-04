import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Reading and deleting by a LIST of keys, in pieces.
 *
 * ── The bug this exists to make impossible ────────────────────────────────
 *
 * PostgREST returns at most a configured number of rows per request — 1000 by
 * default on Supabase — and it does so SILENTLY. There is no error, no flag on
 * the response, nothing: you ask about 1037 barcodes, you get 1000 rows back,
 * and the 37 the server dropped look exactly like barcodes that are not in the
 * table.
 *
 * That is what happened to the seed import. `decide()` asked `barcode_cache`
 * about every seeded barcode at once, and the day the catalog passed a thousand
 * products the overflow started reading as "not there yet". Every one of those
 * rows got the verdict `write`, so the desk showed "Write 37 to the catalog",
 * the operator pressed it, the rows were written — again, over rows that
 * already held them — and the button came back saying 37. Pressing it more did
 * not help and neither did reloading, because the miscount was on the server.
 *
 * The count in the button WAS the diagnosis: 1037 codes minus a 1000-row cap is
 * exactly 37.
 *
 * ── Why it was worse than a stuck button ──────────────────────────────────
 *
 * `importVerdict` protects our own photographs by seeing that the stored row is
 * `source = "verified"` and answering "ours-is-better". A row the server never
 * returned cannot be seen, so those products lost that protection: the import
 * called them `write` and upserted a manufacturer record over a capture
 * somebody had photographed. Silently, and on every press.
 *
 * Which rows fell off is not even stable — the query has no ORDER BY, so
 * PostgREST returns whichever thousand it likes.
 *
 * ── The rule ─────────────────────────────────────────────────────────────
 *
 * Never put an unbounded list in one `.in(...)`. `app/api/catalog/route.ts` had
 * already learned this and chunked its key lookups; the lesson lived as a loop
 * inside one function, where the next caller could not find it. Now it is here,
 * so "the list might be long" has one answer in one place.
 *
 * Chunking fixes a second problem in the same stroke: `.in()` is sent in the
 * query STRING, and a thousand fourteen-digit codes is a fifteen-kilobyte URL,
 * past what many proxies will pass.
 */

/**
 * Values per request.
 *
 * Well under the row cap on purpose. The cap is what bites, but a chunk that
 * merely fits it would be one configuration change away from biting again, and
 * the cost of a smaller chunk is a few more round trips on an admin route
 * nobody is waiting on.
 */
export const IN_CHUNK = 200;

export function chunk<T>(items: readonly T[], size: number = IN_CHUNK): T[][] {
  if (size < 1) throw new Error("chunk size must be at least 1");
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * `select(columns).in(column, values)`, in pieces, with the rows concatenated.
 *
 * Returns the first error rather than throwing, matching how the routes here
 * already handle a failed read — and reporting it rather than returning a short
 * list, because a short list is the failure this module is about.
 */
export async function selectIn<Row>(
  admin: SupabaseClient,
  table: string,
  columns: string,
  column: string,
  values: readonly string[],
  size: number = IN_CHUNK
): Promise<{ rows: Row[]; error: string | null }> {
  const rows: Row[] = [];
  for (const piece of chunk(values, size)) {
    const { data, error } = await admin.from(table).select(columns).in(column, piece);
    if (error) return { rows, error: error.message };
    rows.push(...((data ?? []) as unknown as Row[]));
  }
  return { rows, error: null };
}

/**
 * `delete().in(column, values).select(column)`, in pieces.
 *
 * The returned count is what was actually deleted, summed — which for a report
 * cache is normally far smaller than the number of keys asked about, since only
 * reports somebody opened exist at all.
 */
export async function deleteIn(
  admin: SupabaseClient,
  table: string,
  column: string,
  values: readonly string[],
  size: number = IN_CHUNK
): Promise<{ deleted: number; error: string | null }> {
  let deleted = 0;
  for (const piece of chunk(values, size)) {
    const { data, error } = await admin.from(table).delete().in(column, piece).select(column);
    if (error) return { deleted, error: error.message };
    deleted += data?.length ?? 0;
  }
  return { deleted, error: null };
}
