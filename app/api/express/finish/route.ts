import { sanitizeBarcode, canonicalBarcode } from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { isUsableIngredients } from "@/lib/ingredients-text";
import { allReportCacheKeys } from "@/lib/report-cache-key";
import { isPetSpecies } from "@/lib/pet-species";
import { isFoodForm } from "@/lib/food-form";
import { isScanMode } from "@/lib/capture-mode";
import { compositionKey } from "@/lib/composition-key";
import { readGuaranteedAnalysis, hasAnyFigure } from "@/lib/guaranteed-analysis";
import { isNutritionRole } from "@/lib/nutrition-role";
import {
  columnsWithout,
  isUndefinedColumn,
  withoutColumns,
} from "@/lib/optional-columns";

/**
 * Finish an express capture: type in what the shop trip couldn't, and let the
 * product graduate.
 *
 * The row MOVES. It is written into `barcode_cache` as an ordinary verified
 * product and deleted from `express_capture` — not copied, not flagged, not
 * left behind with a `done` column. A worklist whose finished rows stay on it
 * stops being a worklist within a week.
 *
 * The photograph goes with it, into `image_url` — a column the consumer app
 * already renders in its report. Nothing over there needs changing for our own
 * pictures to start appearing.
 *
 * Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

const BUCKET = "product-photos";

/** Added by ingredients.help migration 0024. See lib/optional-columns.ts. */
const NEW_CATALOG_COLUMNS = ["nutrition_role", "requires_vet"];

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: {
    /** Every pack-size code that shares this composition. */
    codes?: unknown;
    code?: unknown;
    ingredientsText?: unknown;
    productName?: unknown;
    brands?: unknown;
    mode?: unknown;
    species?: unknown;
    foodForm?: unknown;
    guaranteedAnalysis?: unknown;
    nutritionRole?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  // Several codes when the product is sold in several pack sizes: one
  // composition typed once, a catalog row per code — which is what the shelf
  // has. `code` alone is still accepted so nothing older breaks.
  const rawCodes = Array.isArray(body.codes)
    ? body.codes
    : typeof body.code === "string"
      ? [body.code]
      : [];
  const codes: string[] = [];
  for (const raw of rawCodes) {
    const clean = sanitizeBarcode(typeof raw === "string" ? raw : "");
    if (!clean) continue;
    const key = canonicalBarcode(clean);
    if (!codes.includes(key)) codes.push(key);
  }
  if (codes.length === 0) {
    return Response.json({ error: "bad-barcode" }, { status: 422 });
  }
  const code = codes[0];

  // The composition is the whole point of the second visit. Everything else on
  // the form can stay empty; this cannot.
  const ingredients =
    typeof body.ingredientsText === "string"
      ? body.ingredientsText.replace(/\s+/g, " ").trim()
      : "";
  if (!isUsableIngredients(ingredients)) {
    return Response.json(
      {
        error: "ingredients_too_short",
        message:
          "That doesn't look like an ingredient list — type it as printed on the pack.",
      },
      { status: 422 }
    );
  }

  const WORKLIST_COLUMNS =
    "code, mode, brands, product_name, product_line, variant, species, food_form, nutrition_role, requires_vet, photo_path";
  const readWorklist = (columns: string) =>
    admin.from("express_capture").select(columns).eq("code", code).maybeSingle();

  let { data: rowData, error: readError } = await readWorklist(WORKLIST_COLUMNS);
  // Not yet migrated. Finish the product without the newest fields rather than
  // refusing to finish it at all — see lib/optional-columns.ts.
  if (readError && isUndefinedColumn(readError)) {
    const retry = await readWorklist(
      columnsWithout(WORKLIST_COLUMNS, NEW_CATALOG_COLUMNS)
    );
    if (!retry.error) {
      rowData = retry.data;
      readError = null;
    }
  }
  if (readError) {
    return Response.json(
      { error: "read_failed", message: readError.message },
      { status: 500 }
    );
  }
  if (!rowData) {
    return Response.json(
      {
        error: "not_found",
        message: "No express capture under that barcode — it may already be finished.",
      },
      { status: 404 }
    );
  }
  const row = rowData as unknown as {
    mode: string | null;
    brands: string | null;
    product_name: string | null;
    product_line: string | null;
    variant: string | null;
    species: string | null;
    food_form: string | null;
    nutrition_role: string | null;
    requires_vet: boolean | null;
    photo_path: string | null;
  };

  // The form's values win where it supplied them; the shop trip's reading
  // stands where it didn't.
  const mode = isScanMode(body.mode)
    ? body.mode
    : isScanMode(row.mode)
      ? row.mode
      : "pet";
  const brands =
    typeof body.brands === "string" && body.brands.trim()
      ? body.brands.trim()
      : row.brands;
  // The variant is what tells two barcodes of one product line apart, so it
  // belongs in the name the catalog stores rather than being dropped here.
  // Range, name, flavour — the three the shelf uses to tell packs apart, joined
  // in the order they are printed. Dropping the range would merge Friskies
  // Shreds with Friskies Pate, which are different products.
  const nameParts = [
    row.product_line,
    typeof body.productName === "string" && body.productName.trim()
      ? body.productName.trim()
      : row.product_name,
    row.variant,
  ].filter((p): p is string => !!p);
  const productName = nameParts.length > 0 ? nameParts.join(" ") : null;

  // The desk's answer wins; the front of the pack stands where the desk left it
  // alone. Reading it in the shop was the point — it should not have to be
  // re-entered to survive.
  const species =
    mode !== "pet"
      ? null
      : isPetSpecies(body.species) && body.species !== "unknown"
        ? body.species
        : isPetSpecies(row.species)
          ? row.species
          : null;
  const foodForm =
    mode !== "pet"
      ? null
      : isFoodForm(body.foodForm) && body.foodForm !== "unknown"
        ? body.foodForm
        : isFoodForm(row.food_form)
          ? row.food_form
          : null;
  const analysis =
    mode === "pet" ? readGuaranteedAnalysis(body.guaranteedAnalysis) : null;

  // Meal, topper or treat. The desk's answer wins — it has the photograph of
  // the pack in front of it and can read the feeding statement the shop trip
  // couldn't. Otherwise the shop trip's reading stands, and "unknown" survives
  // as unknown rather than being talked into "complete": unknown keeps the
  // everyday standard, and inventing a role is how a real food gets excused.
  const nutritionRole = isNutritionRole(body.nutritionRole)
    ? body.nutritionRole
    : isNutritionRole(row.nutrition_role)
      ? row.nutrition_role
      : "unknown";

  const imageUrl = row.photo_path
    ? admin.storage.from(BUCKET).getPublicUrl(row.photo_path).data.publicUrl
    : null;

  const catalogRows = codes.map((c) => ({
      code: c,
      found: true,
      source: "verified",
      mode,
      brands,
      product_name: productName,
      ingredients_text: ingredients,
      species,
      food_form: foodForm,
      food_form_confirmed: foodForm ? foodForm !== "unknown" : null,
      nutrition_role: mode === "pet" ? nutritionRole : null,
      requires_vet: mode === "pet" ? row.requires_vet ?? false : null,
      moisture_percent: analysis?.moistureMax ?? null,
      guaranteed_analysis:
        analysis && hasAnyFigure(analysis) ? analysis : null,
      image_url: imageUrl,
      reason: null,
      created_at: new Date().toISOString(),
      composition_key: compositionKey(brands, ingredients),
  }));

  let { error: writeError } = await admin
    .from("barcode_cache")
    .upsert(catalogRows, { onConflict: "code" });
  if (writeError && isUndefinedColumn(writeError)) {
    const retry = await admin
      .from("barcode_cache")
      .upsert(withoutColumns(catalogRows, NEW_CATALOG_COLUMNS), {
        onConflict: "code",
      });
    if (!retry.error) writeError = null;
  }
  if (writeError) {
    return Response.json(
      { error: "write_failed", message: writeError.message },
      { status: 500 }
    );
  }

  // Any report stored for this code was written before we had a composition —
  // in every mode, since the mode may have been corrected on the way through.
  let reportsCleared = 0;
  try {
    const { data: cleared } = await admin
      .from("report_cache")
      .delete()
      .in("cache_key", codes.flatMap((c) => allReportCacheKeys(c)))
      .select("cache_key");
    reportsCleared = cleared?.length ?? 0;
  } catch {
    /* best-effort — the product is written either way */
  }

  // Off the worklist. Last, so a failure anywhere above leaves the row to be
  // tried again rather than losing it.
  const { error: deleteError } = await admin
    .from("express_capture")
    .delete()
    .in("code", codes);

  return Response.json({
    ok: true,
    code,
    codes,
    productName,
    imageStored: imageUrl !== null,
    reportsCleared,
    // Worth saying out loud: the product IS in the catalog, it just also still
    // shows on the worklist until this is fixed.
    stillOnWorklist: deleteError ? deleteError.message : null,
  });
}
