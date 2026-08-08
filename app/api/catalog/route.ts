import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import { reportCacheKey, type ReportMode } from "@/lib/report-cache-key";
import { isUsableIngredients } from "@/lib/ingredients-text";
import { adminRefusal, checkAdmin } from "@/lib/admin-auth";
import { canonicalBarcode } from "@/lib/barcode";

/**
 * Browse what's actually in the shared catalog, and find its gaps.
 *
 * The capture flow is write-only, so when a row looks wrong in the consumer app
 * there's no way to tell whether a correction landed, went to a different
 * barcode, or never ran — you end up guessing. This lists the verified rows with
 * their stored ingredient text, so the truth is visible on the phone.
 *
 * It also answers "what still needs work": how many products have no ingredient
 * text, and how many have no generated report yet — each filterable, so the
 * incomplete ones can be worked through rather than hunted for.
 *
 * Searches by product name / brand, or by barcode digits. Gated by ADMIN_TOKEN.
 */

export const runtime = "nodejs";

const LIMIT = 25;

/**
 * Upper bound on rows scanned when computing stats. The report check can't be
 * done in SQL (the key is a hash we compute here), so it walks the rows — this
 * keeps that bounded. `truncated` is reported so the number is never silently
 * wrong once the catalog outgrows it.
 */
const STATS_SCAN_CAP = 2000;

/** report_cache keys per request, so `in()` doesn't build a huge query. */
const KEY_CHUNK = 200;

const MODES: ReportMode[] = ["human", "pet", "cosmetics"];
function asMode(value: unknown): ReportMode {
  return MODES.includes(value as ReportMode) ? (value as ReportMode) : "pet";
}

/**
 * Which of these barcodes have NO generated report. The consumer app caches a
 * report under a hash of (mode, canonical code), so membership is checked by
 * building each key and asking report_cache which ones exist.
 */
async function codesMissingReport(
  admin: SupabaseClient,
  rows: { code: string; mode: unknown }[]
): Promise<Set<string>> {
  const keyToCode = new Map<string, string>();
  for (const row of rows) {
    keyToCode.set(reportCacheKey(row.code, asMode(row.mode)), row.code);
  }
  const keys = [...keyToCode.keys()];
  const present = new Set<string>();
  for (let i = 0; i < keys.length; i += KEY_CHUNK) {
    const { data } = await admin
      .from("report_cache")
      .select("cache_key")
      .in("cache_key", keys.slice(i, i + KEY_CHUNK));
    for (const row of data ?? []) present.add(row.cache_key as string);
  }
  const missing = new Set<string>();
  for (const [key, code] of keyToCode) {
    if (!present.has(key)) missing.add(code);
  }
  return missing;
}

export async function POST(req: Request) {
  const auth = checkAdmin(req);
  if (!auth.ok) return adminRefusal(auth);
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return Response.json({ error: "store_not_configured" }, { status: 501 });
  }

  let body: {
    q?: unknown;
    countOnly?: unknown;
    stats?: unknown;
    filter?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const filter =
    body.filter === "no-ingredients" ||
    body.filter === "no-report" ||
    body.filter === "no-name"
      ? body.filter
      : null;

  /** Every verified row, light columns only, for the gap counts. */
  const scanAll = async () => {
    const { data } = await admin
      .from("barcode_cache")
      .select("code, mode, ingredients_text, product_name")
      .eq("source", "verified")
      .order("created_at", { ascending: false })
      .limit(STATS_SCAN_CAP + 1);
    const rows = data ?? [];
    return {
      rows: rows.slice(0, STATS_SCAN_CAP),
      truncated: rows.length > STATS_SCAN_CAP,
    };
  };

  /** How many verified rows we hold, without transferring any of them. */
  const countVerified = async () => {
    const { count } = await admin
      .from("barcode_cache")
      .select("code", { count: "exact", head: true })
      .eq("source", "verified");
    return count ?? 0;
  };

  // The panel shows the catalog size before it's opened, so support asking for
  // just the number rather than pulling 25 rows of ingredient text for it.
  if (body.countOnly === true) {
    return Response.json({ totalCodes: await countVerified(), results: [] });
  }

  // "What still needs work" — the two gaps worth chasing.
  if (body.stats === true) {
    const { rows, truncated } = await scanAll();
    const noIngredients = rows.filter(
      (r) =>
        !isUsableIngredients(r.ingredients_text as string | null)
    ).length;
    // No product name means the brand photo never read — the composition is
    // usable but the product is unnamed in search and reports.
    const noName = rows.filter(
      (r) => !r.product_name || !String(r.product_name).trim()
    ).length;
    const missingReport = await codesMissingReport(admin, rows);
    return Response.json({
      totalCodes: rows.length,
      noIngredients,
      noName,
      noReport: missingReport.size,
      truncated,
      results: [],
    });
  }

  const raw = typeof body.q === "string" ? body.q.trim() : "";
  // PostgREST's or= grammar is comma/paren delimited and ilike treats % and _
  // as wildcards — strip both so a query can't break out or match everything.
  const q = raw.replace(/[,()'"\\%_]/g, " ").replace(/\s+/g, " ").trim();

  // Listing the incomplete ones. "no-report" can't be expressed in SQL (the key
  // is a hash computed here), so narrow to those codes first and let the normal
  // query below fetch their full rows.
  let restrictToCodes: string[] | null = null;
  if (filter) {
    const { rows } = await scanAll();
    if (filter === "no-ingredients") {
      restrictToCodes = rows
        .filter((r) => !isUsableIngredients(r.ingredients_text as string | null))
        .map((r) => r.code as string);
    } else if (filter === "no-name") {
      restrictToCodes = rows
        .filter((r) => !r.product_name || !String(r.product_name).trim())
        .map((r) => r.code as string);
    } else {
      restrictToCodes = [...(await codesMissingReport(admin, rows))];
    }
    if (restrictToCodes.length === 0) {
      return Response.json({ totalCodes: await countVerified(), results: [] });
    }
  }

  // The columns added after the first release (species, food_form…) only exist
  // once the matching migration has been run in Supabase. Code ships by pushing
  // and migrations are applied by hand, so there is always a window where the
  // deployment asks for a column the database doesn't have yet — and asking for
  // one missing column fails the WHOLE select, which showed up as an empty
  // catalog. Fall back to the columns that have always existed, and say so,
  // rather than reporting "nothing here" about a database full of products.
  const FULL_COLUMNS =
    "code, product_name, brands, ingredients_text, mode, species, food_form, food_form_confirmed, source, created_at";
  const BASE_COLUMNS =
    "code, product_name, brands, ingredients_text, mode, source, created_at";

  const runQuery = async (columns: string) => {
    let query = admin
      .from("barcode_cache")
      .select(columns)
      .eq("source", "verified")
      .order("created_at", { ascending: false })
      .limit(LIMIT);

    if (restrictToCodes) query = query.in("code", restrictToCodes.slice(0, 500));

    if (q.length >= 2) {
      const digits = q.replace(/\D+/g, "");
      query =
        digits.length >= 4
          ? query.ilike("code", `%${digits}%`)
          : query.or(`product_name.ilike.%${q}%,brands.ilike.%${q}%`);
    }
    return query;
  };

  /**
   * Looking up one exact barcode, ignoring who supplied it.
   *
   * The browse list and every count on this screen are about OUR catalog, and
   * should stay that way — the open databases hold millions of rows and none of
   * them are our work. But a product somebody scanned that came back from Open
   * Food Facts with the right ingredients and no name at all is still sitting in
   * the same table, and it is exactly the row worth fixing by hand. Typing its
   * barcode should find it rather than reporting nothing.
   */
  const lookupAnySource = async (columns: string, code: string) =>
    admin.from("barcode_cache").select(columns).eq("code", code).limit(1);

  let { data, error } = await runQuery(FULL_COLUMNS);
  // Nothing of ours under that exact code — try the table at large before
  // saying there is nothing.
  const exactCode = q.replace(/\D+/g, "");
  if (!error && (data ?? []).length === 0 && exactCode.length >= 8) {
    const wide = await lookupAnySource(FULL_COLUMNS, canonicalBarcode(exactCode));
    if (!wide.error && (wide.data ?? []).length > 0) data = wide.data;
  }
  let missingColumns = false;
  if (error) {
    // 42703 = undefined_column. Anything else is a real failure worth reporting.
    const retry = await runQuery(BASE_COLUMNS);
    if (!retry.error) {
      data = retry.data;
      error = null;
      missingColumns = true;
    }
  }
  if (error) {
    return Response.json(
      { error: "list_failed", message: error.message },
      { status: 500 }
    );
  }

  // The catalog size, independent of the current search. Counts BARCODES,
  // which is what a row is — one recipe legitimately has several (6/15/30 lb
  // bags), so it isn't the same as a count of distinct products.
  return Response.json({
    totalCodes: await countVerified(),
    // The panel says this out loud: a catalog missing its species/form chips
    // because a migration hasn't been run should look unfinished, not normal.
    missingColumns,
    results: ((data ?? []) as unknown as Record<string, unknown>[]).map(
      (row) => ({
        code: row.code as string,
        productName: (row.product_name as string | null) ?? null,
        brands: (row.brands as string | null) ?? null,
        mode: (row.mode as string | null) ?? null,
        species: (row.species as string | null) ?? null,
        foodForm: (row.food_form as string | null) ?? null,
        foodFormConfirmed: (row.food_form_confirmed as boolean | null) ?? null,
        ingredientsText: (row.ingredients_text as string | null) ?? null,
        // Who supplied this. The browser badges anything that isn't ours, and
        // warns that saving will claim it.
        source: (row.source as string | null) ?? null,
      })
    ),
  });
}
