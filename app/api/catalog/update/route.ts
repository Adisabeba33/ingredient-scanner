import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allReportCacheKeys } from "@/lib/report-cache-key";

/**
 * Edit a catalog row by hand.
 *
 * Some gaps aren't worth another trip to the shelf: a composition that failed
 * to read can be typed or pasted in, and a product that landed unnamed can be
 * named. This is the counterpart to the gap filters — see what's missing, then
 * fill it.
 *
 * Only VERIFIED rows are editable: those are ours. Edits are still `verified`,
 * so the trust ranking is unchanged.
 *
 * Changing the ingredients invalidates the generated report, which was written
 * from the old text and lives under a separate key — so it's dropped here too,
 * exactly as a re-capture does.
 *
 * Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

/** Shorter than this isn't a composition — refuse rather than store a stub. */
const MIN_INGREDIENTS = 12;

export async function POST(req: Request) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return Response.json({ error: "admin_not_configured" }, { status: 501 });
  }
  if ((req.headers.get("x-admin-token") ?? "") !== adminToken) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: {
    code?: unknown;
    ingredientsText?: unknown;
    productName?: unknown;
    brands?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const clean = sanitizeBarcode(typeof body.code === "string" ? body.code : "");
  if (!clean) {
    return Response.json({ error: "bad-barcode" }, { status: 422 });
  }
  const key = canonicalBarcode(clean);

  const patch: Record<string, string | null> = {};
  let ingredientsChanged = false;

  if (typeof body.ingredientsText === "string") {
    const text = body.ingredientsText.replace(/\s+/g, " ").trim();
    // Empty means "leave the composition alone" — otherwise fixing just the
    // brand on a row that has no ingredients yet would be impossible. Clearing
    // a composition isn't an edit anyone wants; deleting the row is.
    if (text.length > 0) {
      if (text.length < MIN_INGREDIENTS) {
        return Response.json(
          {
            error: "ingredients_too_short",
            message: `Needs at least ${MIN_INGREDIENTS} characters — paste the whole list.`,
          },
          { status: 422 }
        );
      }
      patch.ingredients_text = text;
      ingredientsChanged = true;
    }
  }
  if (typeof body.productName === "string") {
    patch.product_name = body.productName.trim() || null;
  }
  if (typeof body.brands === "string") {
    patch.brands = body.brands.trim() || null;
  }
  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "nothing_to_update" }, { status: 400 });
  }

  // Scope the update to our own rows: an open-database row isn't ours to edit.
  const { data, error } = await admin
    .from("barcode_cache")
    .update(patch)
    .eq("code", key)
    .eq("source", "verified")
    .select("code");
  if (error) {
    return Response.json(
      { error: "update_failed", message: error.message },
      { status: 500 }
    );
  }
  if (!data || data.length === 0) {
    return Response.json(
      {
        error: "not_found",
        message: "No verified row for that barcode — capture it first.",
      },
      { status: 404 }
    );
  }

  // The stored report describes the OLD ingredients; drop it so the next reader
  // regenerates. Only when the composition actually changed — renaming a
  // product doesn't invalidate its analysis.
  let reportsCleared = 0;
  if (ingredientsChanged) {
    try {
      const { data: cleared } = await admin
        .from("report_cache")
        .delete()
        .in("cache_key", allReportCacheKeys(key))
        .select("cache_key");
      reportsCleared = cleared?.length ?? 0;
    } catch {
      /* best-effort */
    }
  }

  return Response.json({ code: key, updated: true, reportsCleared });
}
