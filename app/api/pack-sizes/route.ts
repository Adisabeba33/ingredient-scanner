import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { compositionKey } from "@/lib/composition-key";

/**
 * Finding the pack sizes that were catalogued before we could recognise them.
 *
 * `composition_key` arrived with migration 0020, so every row written before it
 * has none — which means the detector in /api/process compares each new capture
 * against a catalog with no fingerprints in it, and never matches anything. The
 * feature works on products captured from that day forward and is blind to
 * everything already there.
 *
 * POST fills the gap, a batch at a time. GET reports what the filled-in keys
 * turned up: codes that carry the same list and nobody has grouped.
 *
 * ── Why the groups are shown rather than merged ───────────────────────────
 *
 * The same reason /api/process asks instead of merging: one brand's Adult and
 * Senior recipes can carry a word-for-word identical ingredient list and differ
 * only in the guaranteed analysis. Doing this in bulk makes that worse, not
 * better — a hundred silent merges is a hundred chances to be wrong at once.
 * So this proposes, and /api/link-group records what a person decided.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

/** Rows per POST. Small enough to stay well inside the timeout on any plan. */
const BATCH = 200;

/** Ceiling on how much of the catalog GET will pull in to group. */
const SCAN_CAP = 5000;
const PAGE = 1000;

interface KeyRow {
  code: string;
  brands: string | null;
  ingredients_text: string | null;
}

/**
 * Compute and store the fingerprint for a batch of rows that have none.
 *
 * Resumable by design: it always takes the next N rows with a null key, so
 * calling it repeatedly walks the catalog, and an interrupted run loses nothing
 * but the batch it was in.
 */
export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  const { data, error } = await admin
    .from("barcode_cache")
    .select("code, brands, ingredients_text")
    .is("composition_key", null)
    .not("ingredients_text", "is", null)
    .limit(BATCH);

  if (error) {
    return Response.json(
      { ok: false, reason: "query_failed", message: error.message },
      { status: 500 }
    );
  }

  const rows = (data ?? []) as KeyRow[];
  let written = 0;
  // Rows whose composition is too thin to fingerprint — "Water" is shared by
  // hundreds of unrelated products, so it gets no key. Counted separately from
  // failures, because it is the right answer rather than a problem.
  let tooThin = 0;

  for (const row of rows) {
    const key = compositionKey(row.brands, row.ingredients_text);
    if (!key) {
      tooThin++;
      continue;
    }
    const { error: writeErr } = await admin
      .from("barcode_cache")
      .update({ composition_key: key })
      .eq("code", row.code);
    if (!writeErr) written++;
  }

  // What is left AFTER this batch, so the caller knows whether to go again.
  // The thin rows are still null and would be picked up forever, so they are
  // subtracted out — otherwise "remaining" never reaches zero.
  const { count } = await admin
    .from("barcode_cache")
    .select("code", { count: "exact", head: true })
    .is("composition_key", null)
    .not("ingredients_text", "is", null);

  return Response.json({
    ok: true,
    scanned: rows.length,
    written,
    tooThin,
    remaining: Math.max(0, (count ?? 0) - tooThin),
    // True when a further call would do nothing: either nothing is left, or
    // everything left is too thin to fingerprint.
    done: rows.length === 0 || written === 0,
  });
}

interface GroupRow {
  code: string;
  composition_key: string | null;
  recipe_id: string | null;
  product_name: string | null;
  brands: string | null;
  net_weight_g: number | null;
  source: string | null;
}

export interface PackSizeGroup {
  compositionKey: string;
  members: {
    code: string;
    productName: string | null;
    brands: string | null;
    netWeightG: number | null;
    recipeId: string | null;
  }[];
}

/** Codes that share a composition and have not been grouped by anybody. */
export async function GET(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  const rows: GroupRow[] = [];
  for (let from = 0; from < SCAN_CAP; from += PAGE) {
    const { data, error } = await admin
      .from("barcode_cache")
      .select("code, composition_key, recipe_id, product_name, brands, net_weight_g, source")
      .not("composition_key", "is", null)
      .range(from, from + PAGE - 1);
    if (error) {
      return Response.json(
        { error: "query_failed", message: error.message },
        { status: 500 }
      );
    }
    const page = (data ?? []) as GroupRow[];
    rows.push(...page);
    if (page.length < PAGE) break;
  }

  const byKey = new Map<string, GroupRow[]>();
  for (const row of rows) {
    if (!row.composition_key) continue;
    const bucket = byKey.get(row.composition_key);
    if (bucket) bucket.push(row);
    else byKey.set(row.composition_key, [row]);
  }

  const groups: PackSizeGroup[] = [];
  for (const [key, members] of byKey) {
    if (members.length < 2) continue;
    // Already settled: everyone in this group shares one recipe, so there is
    // nothing left to ask. A group where SOME share one is still open — the
    // odd one out has not been vouched for.
    const recipes = new Set(members.map((m) => m.recipe_id));
    if (recipes.size === 1 && !recipes.has(null)) continue;

    groups.push({
      compositionKey: key,
      members: members.map((m) => ({
        code: m.code,
        productName: m.product_name,
        brands: m.brands,
        netWeightG:
          typeof m.net_weight_g === "number" && m.net_weight_g > 0
            ? m.net_weight_g
            : null,
        recipeId: m.recipe_id,
      })),
    });
  }

  // Biggest first: a recipe found under four codes is worth more of somebody's
  // attention than one found under two.
  groups.sort((a, b) => b.members.length - a.members.length);

  const { count: unkeyed } = await admin
    .from("barcode_cache")
    .select("code", { count: "exact", head: true })
    .is("composition_key", null)
    .not("ingredients_text", "is", null);

  return Response.json({
    groups,
    scanned: rows.length,
    // Non-zero means the backfill has not finished, so these groups are only
    // what the fingerprinted part of the catalog has revealed so far.
    awaitingBackfill: unkeyed ?? 0,
    truncated: rows.length >= SCAN_CAP,
  });
}
