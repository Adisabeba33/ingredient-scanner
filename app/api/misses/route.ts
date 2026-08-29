import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { classifyMiss, MISS_ORDER, type MissVerdict } from "@/lib/miss-verdict";

/**
 * What shoppers looked for and did not get.
 *
 * ── Why this route did not exist until somebody stood in a shop ───────────
 *
 * The data has been there the whole time. A failed lookup writes a
 * `barcode_cache` row with `found = false`, and `hits` counts every later
 * person who scanned the same code and walked away with nothing. What was
 * missing is anything that reads it: `/api/coverage` skips those rows in one
 * line, correctly, because coverage is about what we hold.
 *
 * The result was that the single most useful list in the database — real
 * products, reached for by real people, ranked by how many wanted them — was
 * the one nothing printed.
 *
 * ── Every row carries a verdict, because the counts mean opposite things ──
 *
 * The seed lives in git and the catalog is a database, and nothing crosses
 * between them until somebody presses "Write N to the catalog". So a product
 * we researched last week and never imported is invisible to a shopper in
 * exactly the way a product nobody has ever researched is — and one of those
 * costs a button press while the other costs a week. `lib/miss-verdict.ts`
 * tells them apart from files alone.
 *
 * Read-only, and gated by ADMIN_TOKEN like every other desk route.
 */

export const runtime = "nodejs";

/** Only pet-mode rows, matching the coverage route's own filter. */
const PET_ONLY = "mode.eq.pet,mode.is.null";

/**
 * How many misses to bring back at most.
 *
 * Ordered by `hits` descending, so the cap keeps the products the most people
 * wanted rather than an arbitrary slice. A miss scanned once is real and worth
 * counting; a miss scanned forty times is the next thing to research.
 */
const CAP = 400;

interface MissRow {
  code: string;
  hits: number | null;
  reason: string | null;
  product_name: string | null;
  brands: string | null;
  created_at: string | null;
  last_hit_at: string | null;
}

export async function GET(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  const FULL =
    "code, hits, reason, product_name, brands, created_at, last_hit_at";
  // `last_hit_at` and `hits` arrived with later migrations, and asking for one
  // missing column fails the WHOLE select — the same trap /api/coverage
  // documents. Come back with less rather than reporting nothing.
  const BASE = "code, reason, product_name, brands, created_at";

  let rows: MissRow[] = [];
  let thin = false;
  const read = async (columns: string, order: string) =>
    admin
      .from("barcode_cache")
      .select(columns)
      .eq("found", false)
      .or(PET_ONLY)
      .order(order, { ascending: false })
      .limit(CAP);

  let { data, error } = await read(FULL, "hits");
  if (error) {
    const retry = await read(BASE, "created_at");
    data = retry.data;
    error = retry.error;
    thin = !error;
  }
  if (error) {
    return Response.json({ error: "list_failed", message: error.message }, { status: 500 });
  }
  rows = (data ?? []) as unknown as MissRow[];

  // A row we ourselves marked as a box is not a miss anybody suffered — the
  // app answered "that's the case, scan a tin inside", which is the right
  // answer. Counting it here would put our own correct behaviour at the top of
  // a queue of things to fix.
  const misses = rows.filter((r) => r.reason !== "multipack");

  const classified = misses.map((r) => ({
    code: r.code,
    searches: r.hits ?? 1,
    // Some miss rows carry a name — Open Food Facts had the product but no
    // ingredient list, which is a miss to a reader and a lead to us.
    name: r.product_name,
    brands: r.brands,
    firstSeen: r.created_at,
    lastSeen: r.last_hit_at ?? null,
    ...classifyMiss(r.code),
  }));

  const counts = Object.fromEntries(
    MISS_ORDER.map((v) => [v, classified.filter((c) => c.verdict === v).length])
  ) as Record<MissVerdict, number>;

  return Response.json({
    total: classified.length,
    truncated: classified.length >= CAP,
    // Ordered by what is worth doing first, then by how many people wanted it.
    // The first bucket is the free one: products we already hold a composition
    // for, which need no research at all.
    verdicts: counts,
    // How many shoppers, not how many barcodes — the difference between "three
    // rows" and "three rows somebody hit ninety times" is the whole reason to
    // look at this list.
    searchesByVerdict: Object.fromEntries(
      MISS_ORDER.map((v) => [
        v,
        classified.filter((c) => c.verdict === v).reduce((n, c) => n + c.searches, 0),
      ])
    ) as Record<MissVerdict, number>,
    // Said out loud: without `hits` the ordering is by age, not by demand.
    ordering: thin ? "newest first — this catalog has no hit counter" : "most searched first",
    misses: classified.sort(
      (a, b) =>
        MISS_ORDER.indexOf(a.verdict) - MISS_ORDER.indexOf(b.verdict) ||
        b.searches - a.searches
    ),
  });
}
