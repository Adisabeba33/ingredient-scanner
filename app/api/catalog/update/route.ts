import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { allReportCacheKeys } from "@/lib/report-cache-key";
import { isUsableIngredients } from "@/lib/ingredients-text";
import { isPetSpecies } from "@/lib/pet-species";
import { isFoodForm } from "@/lib/food-form";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { isScanMode } from "@/lib/capture-mode";
import { sourceAfterEdit } from "@/lib/catalog-edit";

/**
 * Edit a catalog row by hand.
 *
 * Some gaps aren't worth another trip to the shelf: a composition that failed
 * to read can be typed or pasted in, and a product that landed unnamed can be
 * named. This is the counterpart to the gap filters — see what's missing, then
 * fill it.
 *
 * ANY row we hold is editable, not only our own captures. A product the open
 * databases know but barely describe — right ingredients, no name, no brand —
 * is worth ten minutes of typing and not worth a second trip to the shelf. An
 * edited row is relabelled `community` (lib/catalog-edit.ts) so the correction
 * outranks the database it came from and survives the next scan; a row that was
 * already `verified` stays verified.
 *
 * Changing the ingredients invalidates the generated report, which was written
 * from the old text and lives under a separate key — so it's dropped here too,
 * exactly as a re-capture does.
 *
 * Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
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
    foodForm?: unknown;
    mode?: unknown;
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

  const patch: Record<string, string | boolean | number | null> = {};
  // Any of these invalidates the stored report: it was written from the old
  // composition, FOR the old animal, read as the old form, for the old audience.
  let ingredientsChanged = false;
  let speciesChanged = false;
  let formChanged = false;
  let modeChanged = false;

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
  // Dry vs wet decides how the ingredient ORDER is read, so a hand-set form is
  // worth as much as a confirmed one — a person looking at the tin is the most
  // reliable signal we have.
  if (isFoodForm(body.foodForm)) {
    patch.food_form = body.foodForm;
    patch.food_form_confirmed = body.foodForm !== "unknown";
    const { data: before } = await admin
      .from("barcode_cache")
      .select("food_form")
      .eq("code", key)
      .maybeSingle();
    formChanged = (before?.food_form ?? null) !== body.foodForm;
  }
  // What kind of product this is. The capture picker is sticky, so before the
  // pack was allowed to overrule it (lib/capture-mode.ts) a forgetful afternoon
  // filed human food as pet food — and the only cure was deleting the row and
  // walking back to the shelf. The model gets it right nearly always now, but
  // "nearly" is why this is here: a person looking at the tin is the last word.
  //
  // Placed after species and food_form deliberately, so leaving pet mode clears
  // them even if the editor submitted its stale values in the same request.
  if (isScanMode(body.mode)) {
    const { data: before } = await admin
      .from("barcode_cache")
      .select("mode")
      .eq("code", key)
      .maybeSingle();
    modeChanged = (before?.mode ?? null) !== body.mode;
    patch.mode = body.mode;
    if (body.mode !== "pet") {
      // These describe an animal's food and mean nothing on a cereal box. Left
      // behind, they'd have the consumer app reading a human product's
      // ingredient order as if water content mattered, and printing a
      // Guaranteed Analysis panel that belongs to a different product entirely.
      patch.species = null;
      patch.food_form = null;
      patch.food_form_confirmed = null;
      patch.moisture_percent = null;
      patch.guaranteed_analysis = null;
    }
  }

  if (Object.keys(patch).length === 0) {
    return Response.json({ error: "nothing_to_update" }, { status: 400 });
  }

  // Any row we hold, not only our own captures.
  //
  // The case that forced this: a product the open databases know but barely
  // describe — a barcode, a correct ingredient list, no name, no brand. The
  // ingredients are the expensive part and they are already right; sending
  // somebody back to the shelf to photograph a label we can already read would
  // be absurd. So the descriptive gaps get filled in by hand.
  //
  // The row's source moves with the edit (lib/catalog-edit.ts). It has to: a
  // correction that stayed labelled `openfoodfacts` would be overwritten by the
  // next scan of that code, since the consumer app treats an open-database row
  // as replaceable by a fresh open-database result.
  const { data: current } = await admin
    .from("barcode_cache")
    .select("source")
    .eq("code", key)
    .maybeSingle();
  if (!current) {
    return Response.json(
      {
        error: "not_found",
        message: "Nothing stored under that barcode — capture it first.",
      },
      { status: 404 }
    );
  }
  patch.source = sourceAfterEdit((current as { source?: string }).source ?? null);

  const { data, error } = await admin
    .from("barcode_cache")
    .update(patch)
    .eq("code", key)
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
        message: "That row disappeared while it was being edited.",
      },
      { status: 404 }
    );
  }

  // The stored report describes the OLD ingredients, written for the OLD
  // animal, read as the OLD form; drop it so the next reader regenerates. Only
  // when one of those actually changed — renaming a product doesn't invalidate
  // its analysis.
  let reportsCleared = 0;
  if (ingredientsChanged || speciesChanged || formChanged || modeChanged) {
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
