import {
  sanitizeBarcode,
  canonicalBarcode,
  type ScanMode,
} from "@/lib/barcode";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { compositionKey } from "@/lib/composition-key";
import { extractLabel } from "@/lib/extract";
import {
  isScanMode,
  resolveCaptureMode,
  wasReclassified,
} from "@/lib/capture-mode";
import {
  hasAnyFigure,
  type GuaranteedAnalysis,
} from "@/lib/guaranteed-analysis";
import { allReportCacheKeys } from "@/lib/report-cache-key";
import { isUsableIngredients } from "@/lib/ingredients-text";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { detectNutritionRole } from "@/lib/nutrition-role";
import { isVeterinaryDiet } from "@/lib/vet-diet";
import { isUndefinedColumn, withoutColumns } from "@/lib/optional-columns";
import {
  detectFormFromName,
  detectFormFromText,
  reconcileFoodForm,
} from "@/lib/food-form";

/**
 * Process ONE captured product: read its label photos with Claude vision and
 * write the composition into the SHARED catalog (spec §6).
 *
 * The browser drives "Process all" by POSTing pending products here one at a
 * time (photos as data URLs). For each product we:
 *   1. Send the ingredients photo (+ brand photo) to Claude vision → the exact
 *      `ingredients_text`, plus product_name / brands.
 *   2. If the ingredients photo didn't read cleanly, return a FAILURE so the
 *      owner re-shoots only that one — we never write a partial/invented list.
 *   3. Otherwise write ONE `verified` row per barcode (all pack sizes of the
 *      recipe) under `canonicalBarcode(code)`, upserting on `code`.
 *
 * On a 200 { ok: true } the browser deletes the product's photos from its
 * queue. Photos are never stored server-side — they exist only in the request.
 *
 * Gated by ADMIN_TOKEN (x-admin-token), same as ingredients.help's admin routes.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

interface VerifiedRow {
  code: string;
  found: true;
  source: "verified";
  mode: ScanMode;
  /** Pet products: which animal it's for, so the report addresses only that one. */
  species: string | null;
  /** Dry / wet — decides how the ingredient order is to be read. */
  food_form: string | null;
  /** Whether two independent signals agreed on the form. */
  food_form_confirmed: boolean | null;
  /**
   * Meal, topper, treat — from the AAFCO feeding statement beside the panel.
   * "unknown" keeps the everyday standard; see lib/nutrition-role.ts.
   */
  nutrition_role: string | null;
  /** A vet-channel therapeutic diet, which the everyday standard misjudges. */
  requires_vet: boolean | null;
  /** Moisture % off the guaranteed analysis, when it was legible. */
  moisture_percent: number | null;
  /** The whole Guaranteed Analysis panel as printed — null when none was read. */
  guaranteed_analysis: GuaranteedAnalysis | null;
  ingredients_text: string;
  product_name: string | null;
  brands: string | null;
  image_url: null;
  reason: null;
  created_at: string;
  /**
   * Fingerprint of the brand and the list, so a later capture of the SAME
   * recipe under a different pack-size barcode can be spotted. Null when the
   * composition is too thin to fingerprint — see lib/composition-key.ts.
   */
  composition_key: string | null;
}

export async function POST(req: Request) {
  // Catch anything the inner handler doesn't, so the UI shows the real error
  // text instead of a bare 500 ("Server error — check Vercel logs").
  try {
    return await handle(req);
  } catch (err) {
    const message =
      err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    return Response.json({ ok: false, reason: "crash", message }, { status: 500 });
  }
}

async function handle(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "extractor_not_configured" }, { status: 501 });
  }
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: {
    barcodes?: unknown;
    mode?: unknown;
    photos?: { brand?: unknown; ingredients?: unknown; nutrition?: unknown };
    /** Deliberate replacement of an entry the catalog already holds. */
    allowOverwrite?: unknown;
    /**
     * "No, that other code is a different product" — write this capture as its
     * own recipe rather than asking about the composition match again.
     */
    allowSeparate?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  // Canonicalize + dedupe the barcodes. Each valid code becomes one verified row.
  const rawCodes = Array.isArray(body.barcodes) ? body.barcodes : [];
  const bad: string[] = [];
  const codes: string[] = [];
  const seen = new Set<string>();
  for (const raw of rawCodes) {
    const clean = sanitizeBarcode(typeof raw === "string" ? raw : "");
    if (!clean) {
      bad.push(String(raw ?? ""));
      continue;
    }
    const key = canonicalBarcode(clean);
    if (!seen.has(key)) {
      seen.add(key);
      codes.push(key);
    }
  }
  if (codes.length === 0) {
    return Response.json(
      { ok: false, reason: "no-valid-barcode", bad },
      { status: 422 }
    );
  }

  const ingredientsImage =
    typeof body.photos?.ingredients === "string" ? body.photos.ingredients : "";
  if (!ingredientsImage) {
    return Response.json(
      { ok: false, reason: "no-ingredients-photo" },
      { status: 422 }
    );
  }
  const brandImage =
    typeof body.photos?.brand === "string" ? body.photos.brand : null;
  // Optional, and worth having: the Guaranteed Analysis carries the moisture
  // figure, which settles dry vs wet outright instead of by inference.
  const nutritionImage =
    typeof body.photos?.nutrition === "string" ? body.photos.nutrition : null;

  const picked: ScanMode = isScanMode(body.mode) ? body.mode : "pet";

  const model = process.env.EXTRACT_MODEL || "claude-haiku-4-5";

  // ── Read the label ────────────────────────────────────────────────────────
  let extraction;
  let usage;
  try {
    const result = await extractLabel({
      apiKey,
      model,
      ingredientsImage,
      brandImage,
      nutritionImage,
    });
    extraction = result.extraction;
    usage = result.usage;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ ok: false, reason: "llm_error", message }, { status: 502 });
  }

  // The ingredients photo didn't read cleanly → report it, write nothing.
  if (
    !extraction.ingredients_readable ||
    !isUsableIngredients(extraction.ingredients_text)
  ) {
    return Response.json({
      ok: false,
      reason: "unreadable-ingredients",
      product_name: extraction.product_name,
      language: extraction.language,
      usage,
    });
  }

  // What the pack says it is beats what was left selected on the picker. The
  // mode governs every field below it, so this has to be settled before any of
  // them are computed — see lib/capture-mode.ts.
  const verdict = resolveCaptureMode(picked, extraction.category);
  const mode = verdict.mode;

  // Multi-language packaging: photographing the French/Spanish column instead of
  // the English one yields a list our catalog can't read a single word of. Never
  // store that as verified — send it back to be re-shot.
  // Match loosely: the model may answer "English", "en", "English (US)" or
  // "English/French" for a bilingual pack. Only refuse when the answer names no
  // English at all — a strict equality check here would reject good captures.
  if (!/\benglish\b|^en$/i.test(extraction.language.trim())) {
    return Response.json({
      ok: false,
      reason: "wrong-language",
      product_name: extraction.product_name,
      language: extraction.language,
      usage,
    });
  }

  // ── Never quietly replace what's already catalogued ──────────────────────
  // Two people working the same aisle will scan the same product, and the
  // second capture must not undo the first. Codes the catalog already holds are
  // left alone unless the replacement was chosen deliberately (allowOverwrite),
  // which only the duplicate dialog and the catalog re-shoot set — and both ask
  // for the password first.
  const allowOverwrite = body.allowOverwrite === true;
  let skipped: string[] = [];
  let writable = codes;

  // ── A box is never a product, and allowOverwrite doesn't change that ─────
  // Checked before and separately from the verified check below, because a
  // multipack row carries no source and would slip past it — and because the
  // duplicate dialog's "yes, replace it" is an answer about a product, not
  // permission to turn a carton into one. Writing a composition here is the
  // exact mistake the marking exists to prevent, and nothing downstream can
  // catch it: the back of such a box reads as a perfectly ordinary list.
  {
    const { data: boxes, error: boxErr } = await admin
      .from("barcode_cache")
      .select("code")
      .in("code", codes)
      .eq("reason", "multipack");
    if (boxErr) {
      return Response.json(
        { ok: false, reason: "lookup_failed", message: boxErr.message },
        { status: 500 }
      );
    }
    const marked = new Set((boxes ?? []).map((r) => r.code as string));
    if (marked.size > 0) {
      writable = writable.filter((c) => !marked.has(c));
      if (writable.length === 0) {
        return Response.json({
          ok: false,
          reason: "multipack",
          codes: [...marked],
          usage,
        });
      }
    }
  }

  if (!allowOverwrite) {
    const { data: existing, error: existingErr } = await admin
      .from("barcode_cache")
      .select("code")
      .in("code", codes)
      .eq("source", "verified");
    if (existingErr) {
      return Response.json(
        { ok: false, reason: "lookup_failed", message: existingErr.message },
        { status: 500 }
      );
    }
    const taken = new Set((existing ?? []).map((r) => r.code as string));
    skipped = codes.filter((c) => taken.has(c));
    // A product can legitimately gain a new pack size, so write the codes that
    // are new and skip only the ones already held, rather than refusing wholesale.
    // Narrows `writable` rather than rebuilding it from `codes`: the multipack
    // check above has already removed the cartons, and starting over would put
    // them back.
    writable = writable.filter((c) => !taken.has(c));

    if (writable.length === 0) {
      return Response.json({
        ok: false,
        reason: "already-in-catalog",
        codes: skipped,
        product_name: extraction.product_name,
        usage,
      });
    }
  }

  // ── Dry or wet, decided by two independent readings ──────────────────────
  // One is the model looking at the PACK (a tin vs a bag, the words on it); the
  // other is these rules reading the COMPOSITION (water and broth vs rendered
  // meals). They can't fail the same way, which is the point: a form guessed
  // wrong makes the report read the ingredient order backwards. When they
  // disagree the verdict is "unknown" and the operator is told to set it.
  // The pack signal is everything printed on the pack — which includes the
  // product name the model just transcribed. Asking the model to name the form
  // works when the container is in frame, but it stays silent surprisingly
  // often on a pack that says "Pâté" and "Hydrating Purée" in its own title.
  // Reading those words ourselves costs nothing and doesn't weaken the check:
  // the composition signal is blind to the name, so these are still two
  // separate pieces of evidence.
  const fromPack =
    extraction.food_form !== "unknown"
      ? extraction.food_form
      : detectFormFromName(extraction.product_name);

  const formVerdict =
    mode === "pet"
      ? reconcileFoodForm({
          fromPack,
          // The COMPOSITION only. The model already saw the product name, so
          // feeding it here too would count one phrase as two confirmations.
          fromText: detectFormFromText(extraction.ingredients_text),
          moisturePercent: extraction.moisture_percent,
        })
      : null;

  // ── Has this recipe already arrived under a different barcode? ───────────
  //
  // The case this exists for: a food sold in three bag sizes has three codes.
  // Somebody captures the small bag in one shop and meets the large one a week
  // later in another, by which time nobody remembers. Nothing here knew they
  // were the same food, so the catalog gained a second, unlinked row.
  //
  // The composition is what gives it away — same maker, same list. That is a
  // reason to ASK, never to merge: one brand's Adult and Senior recipes can
  // carry a word-for-word identical list and differ only in the guaranteed
  // analysis. So this refuses the write and hands back who it looks like,
  // and a person decides.
  const composition = compositionKey(
    extraction.brands,
    extraction.ingredients_text
  );
  const allowSeparate = body.allowSeparate === true;

  if (composition && !allowSeparate) {
    const { data: siblings } = await admin
      .from("barcode_cache")
      .select("code, product_name, brands")
      .eq("composition_key", composition)
      .eq("source", "verified")
      .not("code", "in", `(${writable.join(",")})`)
      .limit(3);

    if (siblings && siblings.length > 0) {
      return Response.json({
        ok: false,
        reason: "same-recipe",
        codes: writable,
        product_name: extraction.product_name,
        brands: extraction.brands,
        // Everything the operator needs to recognise it without opening
        // anything: which codes already carry this exact list, and what they
        // are called.
        siblings: siblings.map((s) => ({
          code: s.code as string,
          productName: (s.product_name as string | null) ?? null,
          brands: (s.brands as string | null) ?? null,
        })),
        usage,
      });
    }
  }

  // ── One verified row per pack-size code ──────────────────────────────────
  const nutritionRole = detectNutritionRole({
    claims: extraction.feeding_statement ? [extraction.feeding_statement] : [],
    parts: [extraction.brands, extraction.product_name],
  });
  const requiresVet = isVeterinaryDiet(extraction.brands, extraction.product_name);
  const now = new Date().toISOString();
  const rows: VerifiedRow[] = writable.map((code) => ({
    code,
    found: true,
    source: "verified",
    mode,
    ingredients_text: extraction.ingredients_text,
    product_name: extraction.product_name,
    brands: extraction.brands,
    // Only meaningful for pet food; human/cosmetic products have no species.
    species: mode === "pet" ? extraction.species : null,
    food_form: formVerdict ? formVerdict.form : null,
    food_form_confirmed: formVerdict ? formVerdict.confirmed : null,
    // Is it dinner? The feeding statement is printed beside the guaranteed
    // analysis, which is in the photograph we already took, so this costs
    // nothing extra to know — and without it a bag of treats is judged for not
    // being a balanced diet, which no treat has ever claimed to be.
    nutrition_role: mode === "pet" ? nutritionRole : null,
    requires_vet: mode === "pet" ? requiresVet : null,
    moisture_percent: mode === "pet" ? extraction.moisture_percent : null,
    // Pet food only: the Guaranteed Analysis is an AAFCO panel and human packs
    // carry a different one, read elsewhere. Null rather than an object of
    // nulls, so "we have no panel for this" is one check and not nine.
    guaranteed_analysis:
      mode === "pet" && hasAnyFigure(extraction.guaranteed_analysis)
        ? extraction.guaranteed_analysis
        : null,
    image_url: null,
    reason: null,
    created_at: now,
    composition_key: composition,
  }));

  // Upsert rather than insert: with allowOverwrite the row is meant to be
  // replaced, and without it `writable` contains only codes that don't exist.
  // Select the rows back so "written" reflects what the database actually
  // holds, rather than merely "the call didn't error".
  let { data: written, error } = await admin
    .from("barcode_cache")
    .upsert(rows, { onConflict: "code" })
    .select("code");
  // The columns from ingredients.help migration 0024, on a database that hasn't
  // had it run yet. Store the product without them rather than losing a capture
  // that has already been photographed, uploaded and paid for — see
  // lib/optional-columns.ts.
  if (error && isUndefinedColumn(error)) {
    const retry = await admin
      .from("barcode_cache")
      .upsert(withoutColumns(rows, ["nutrition_role", "requires_vet"]), {
        onConflict: "code",
      })
      .select("code");
    if (!retry.error) {
      written = retry.data;
      error = null;
    }
  }
  if (error) {
    return Response.json(
      { ok: false, reason: "write_failed", message: error.message },
      { status: 500 }
    );
  }
  if (!written || written.length === 0) {
    return Response.json(
      {
        ok: false,
        reason: "write_failed",
        message: "The upsert reported no rows — nothing was stored.",
      },
      { status: 500 }
    );
  }

  // The consumer app caches a generated report per barcode, INDEPENDENTLY of
  // the ingredients. Re-capturing a product to correct it would otherwise keep
  // serving the report built from the old (wrong) text forever, so drop it and
  // let the next reader regenerate from what we just wrote.
  //
  // Every mode's key, not just this one's. A product filed as pet food and
  // re-captured as human food has a report sitting under the OLD mode's key,
  // and clearing only the new one would leave that stale analysis serving
  // forever. Now that the pack can move a row between modes on its own, that
  // stopped being a hypothetical.
  let reportsCleared = 0;
  try {
    const keys = writable.flatMap((c) => allReportCacheKeys(c));
    const { data: cleared } = await admin
      .from("report_cache")
      .delete()
      .in("cache_key", keys)
      .select("cache_key");
    reportsCleared = cleared?.length ?? 0;
  } catch {
    /* best-effort — the ingredients are written either way */
  }

  return Response.json({
    ok: true,
    codes,
    reports_cleared: reportsCleared,
    mode,
    // Only when the pack overruled the picker. The operator should see that it
    // happened — silently refiling somebody's capture is how you end up not
    // trusting the tool — but a mode that simply matched needs no announcement.
    reclassified_from: wasReclassified(verdict) ? verdict.picked : null,
    product_name: extraction.product_name,
    brands: extraction.brands,
    species: mode === "pet" ? extraction.species : null,
    food_form: formVerdict ? formVerdict.form : null,
    food_form_confirmed: formVerdict ? formVerdict.confirmed : null,
    food_form_note: formVerdict ? formVerdict.why : null,
    moisture_percent: mode === "pet" ? extraction.moisture_percent : null,
    guaranteed_analysis:
      mode === "pet" && hasAnyFigure(extraction.guaranteed_analysis)
        ? extraction.guaranteed_analysis
        : null,
    ingredients_text: extraction.ingredients_text,
    usage,
  });
}
