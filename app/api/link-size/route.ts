import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";

/**
 * "Yes — that is the same food, in a different bag."
 *
 * The answer to what /api/process asks when a capture's composition matches a
 * barcode the catalog already holds. A food sold in three bag sizes has three
 * codes and one recipe, and until this existed each size arrived as a separate,
 * unlinked product.
 *
 * ── Why this is its own route, and a cheap one ────────────────────────────
 *
 * The composition already matched, exactly, so the sibling's stored reading IS
 * this pack's reading. There is nothing left to read: no photographs are sent,
 * no model is called, nothing is extracted. It copies what is known to be true
 * and records that the two codes are one recipe.
 *
 * That matters because the alternative — re-running the whole capture with a
 * flag — would pay for a model call to arrive at a list we are already holding.
 *
 * ── What it will not do ───────────────────────────────────────────────────
 *
 * It refuses to overwrite a code the catalog already holds. Linking is for a
 * code that is new; a code that exists is either already this recipe (nothing
 * to do) or a different product, and neither is fixed by copying over it.
 */

/** The sibling row this pack size is copied from. */
interface SourceRow {
  mode: string | null;
  species: string | null;
  food_form: string | null;
  food_form_confirmed: boolean | null;
  moisture_percent: number | null;
  ingredients_text: string | null;
  product_name: string | null;
  brands: string | null;
  composition_key: string | null;
  recipe_id: string | null;
  nutrition: unknown;
  nutrition_basis: string | null;
  source: string | null;
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: { code?: unknown; siblingCode?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const rawCode = sanitizeBarcode(typeof body.code === "string" ? body.code : "");
  const rawSibling = sanitizeBarcode(
    typeof body.siblingCode === "string" ? body.siblingCode : ""
  );
  if (!rawCode || !rawSibling) {
    return Response.json({ ok: false, reason: "no-valid-barcode" }, { status: 422 });
  }
  const code = canonicalBarcode(rawCode);
  const sibling = canonicalBarcode(rawSibling);

  if (!code || !sibling) {
    return Response.json({ ok: false, reason: "no-valid-barcode" }, { status: 422 });
  }
  if (code === sibling) {
    return Response.json({ ok: false, reason: "same-code" }, { status: 422 });
  }

  // The row being copied FROM. It has to be ours: linking a new size onto an
  // Open Food Facts record would spread a reading nobody checked.
  const { data, error: sourceErr } = await admin
    .from("barcode_cache")
    .select(
      "mode, species, food_form, food_form_confirmed, moisture_percent, " +
        "ingredients_text, product_name, brands, composition_key, recipe_id, " +
        "nutrition, nutrition_basis, source"
    )
    .eq("code", sibling)
    .maybeSingle();
  const source = data as SourceRow | null;

  if (sourceErr) {
    return Response.json(
      { ok: false, reason: "lookup_failed", message: sourceErr.message },
      { status: 500 }
    );
  }
  if (!source || source.source !== "verified") {
    return Response.json({ ok: false, reason: "sibling-not-verified" }, { status: 422 });
  }

  // A code that already exists is not a new pack size. Say so rather than
  // writing over whatever is there.
  const { data: taken } = await admin
    .from("barcode_cache")
    .select("code")
    .eq("code", code)
    .maybeSingle();
  if (taken) {
    return Response.json({ ok: false, reason: "already-in-catalog", code }, { status: 409 });
  }

  const { error: writeErr } = await admin.from("barcode_cache").insert({
    code,
    found: true,
    source: "verified",
    mode: source.mode,
    species: source.species,
    food_form: source.food_form,
    food_form_confirmed: source.food_form_confirmed,
    moisture_percent: source.moisture_percent,
    ingredients_text: source.ingredients_text,
    product_name: source.product_name,
    brands: source.brands,
    composition_key: source.composition_key,
    // The panel is printed per 100 g, so it is the recipe's rather than the
    // bag's and copies across. The NET WEIGHT deliberately does not: it is the
    // one thing that actually differs between sizes, and guessing it from the
    // sibling would be inventing the number that distinguishes them.
    nutrition: source.nutrition,
    nutrition_basis: source.nutrition_basis,
    image_url: null,
    reason: null,
    created_at: new Date().toISOString(),
  });

  if (writeErr) {
    return Response.json(
      { ok: false, reason: "write_failed", message: writeErr.message },
      { status: 500 }
    );
  }

  // Record that a person said these are one recipe. The function handles the
  // awkward case of both codes already belonging to different groups.
  const { data: recipeId, error: linkErr } = await admin.rpc("link_recipe", {
    p_code_a: code,
    p_code_b: sibling,
  });

  return Response.json({
    ok: true,
    code,
    siblingCode: sibling,
    productName: (source.product_name as string | null) ?? null,
    recipeId: linkErr ? null : (recipeId as string | null),
    // The row is written either way; a failed link is worth knowing about but
    // is not worth losing the pack size over.
    linked: !linkErr,
  });
}
