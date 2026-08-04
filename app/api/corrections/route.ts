import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { compositionKey } from "@/lib/composition-key";
import { allReportCacheKeys } from "@/lib/report-cache-key";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";

/**
 * The correction review queue.
 *
 * Users can't change a verified entry — a reading that disagrees with one is
 * filed as a proposal by the consumer app instead. This is where those are
 * decided, and approving is the only route from a shopper's photo into the
 * catalog.
 *
 * GET  — proposals awaiting a decision, most-reported first: several people
 *        reporting the same change is the strongest sign a recipe really moved.
 * POST — { id, action: "approve" | "reject" }.
 *
 * Reads the shared database directly, like the rest of this tool, rather than
 * calling the consumer app. Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

const LIMIT = 50;

export async function GET(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  const { data, error } = await admin
    .from("catalog_corrections")
    .select(
      "id, code, mode, current_text, proposed_text, product_name, verdict, verdict_note, reports, created_at"
    )
    .eq("status", "pending")
    .order("reports", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  if (error) {
    return Response.json(
      { error: "query_failed", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({ pending: data ?? [] });
}

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: { id?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  const action =
    body.action === "approve"
      ? "approve"
      : body.action === "reject"
        ? "reject"
        : null;
  if (!id || !action) {
    return Response.json({ error: "invalid_input" }, { status: 400 });
  }

  const { data: row, error: readErr } = await admin
    .from("catalog_corrections")
    .select("id, code, proposed_text, status")
    .eq("id", id)
    .maybeSingle();
  if (readErr || !row) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  if (row.status !== "pending") {
    return Response.json({ error: "already_reviewed" }, { status: 409 });
  }

  let corrected: string[] = [];

  if (action === "approve") {
    const code = row.code as string;
    const proposed = row.proposed_text as string;

    // ── Every pack size, not just the one somebody photographed ────────────
    //
    // A recipe sold in three bag sizes has three codes. A reformulation
    // changes all three at once — the maker does not reformulate the 6 lb and
    // leave the 15 lb alone — but this used to correct the single code the
    // report arrived under. The others went on serving the old list, so two
    // people holding the same food in different bags were told different
    // things about it.
    //
    // `recipe_id` is only set where a person confirmed two codes are one
    // recipe, so this widens the correction exactly as far as somebody
    // vouched for and no further.
    const { data: self } = await admin
      .from("barcode_cache")
      .select("recipe_id, brands")
      .eq("code", code)
      .maybeSingle();
    const recipeId = (self as { recipe_id?: string | null } | null)?.recipe_id ?? null;
    const brands = (self as { brands?: string | null } | null)?.brands ?? null;

    if (recipeId) {
      const { data: family } = await admin
        .from("barcode_cache")
        .select("code")
        .eq("recipe_id", recipeId)
        .eq("source", "verified");
      corrected = (family ?? []).map((r) => r.code as string);
    }
    if (corrected.length === 0) corrected = [code];

    const { error: writeErr } = await admin
      .from("barcode_cache")
      .update({
        ingredients_text: proposed,
        // The composition changed, so its fingerprint has to change with it.
        // Leaving the old one would have this recipe keep matching what it
        // used to be, and stop matching what it now is.
        composition_key: compositionKey(brands, proposed),
        created_at: new Date().toISOString(),
      })
      .in("code", corrected)
      .eq("source", "verified");
    if (writeErr) {
      return Response.json(
        { error: "write_failed", message: writeErr.message },
        { status: 500 }
      );
    }

    // The stored reports describe the OLD composition and live under separate
    // keys, so they survive the update unless dropped here — for every size.
    try {
      await admin
        .from("report_cache")
        .delete()
        .in("cache_key", corrected.flatMap((c) => allReportCacheKeys(c)));
    } catch {
      /* best-effort — the composition is corrected either way */
    }
  }

  const { error: markErr } = await admin
    .from("catalog_corrections")
    .update({
      status: action === "approve" ? "approved" : "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (markErr) {
    return Response.json(
      { error: "update_failed", message: markErr.message },
      { status: 500 }
    );
  }

  return Response.json({
    ok: true,
    action,
    code: row.code,
    // Which codes actually moved — one for an unlinked product, all its pack
    // sizes for a recipe somebody grouped.
    corrected,
  });
}
