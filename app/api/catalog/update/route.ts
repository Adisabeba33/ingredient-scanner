import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allReportCacheKeys } from "@/lib/report-cache-key";
import { isUsableIngredients } from "@/lib/ingredients-text";
import { isPetSpecies } from "@/lib/pet-species";

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
    species?: unknown;
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
  // Both of these invalidate the stored report: it was written from the old
  // composition, FOR the old animal.
  let ingredientsChanged = false;
  let speciesChanged = false;

  if (typeof body.ingredientsText === "string") {
    const text = body.ingredientsText.replace(/\s+/g, " ").trim();
    // Empty means "leave the composition alone" — otherwise fixing just the
    // brand on a row that has no ingredients yet would be impossible. Clearing
    // a composition isn't an edit anyone wants; deleting the row is.
    if (text.length > 0) {
      if (!isUsableIngredients(text)) {
        return Response.json(
          {
            error: "ingredients_too_short",
            message:
              "That doesn't look like an ingredient list — paste it as printed.",
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
  // Which animal it's for decides how the report is written, so a wrong reading
  // here is worth correcting by hand like any other field.
  if (isPetSpecies(body.species)) {
    patch.species = body.species;
    // Compare against what's stored: the editor always submits the current
    // species, and re-generating a report because someone fixed a typo in the
    // brand would be an expensive no-op.
    const { data: before } = await admin
      .from("barcode_cache")
      .select("species")
      .eq("code", key)
      .maybeSingle();
    speciesChanged = (before?.species ?? null) !== body.species;
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

  // The stored report describes the OLD ingredients, written for the OLD
  // animal; drop it so the next reader regenerates. Only when one of those
  // actually changed — renaming a product doesn't invalidate its analysis.
  let reportsCleared = 0;
  if (ingredientsChanged || speciesChanged) {
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
